// ============================================================
// CONFIGURAÇÃO
// ============================================================
const CONFIG = {
    baseUrl: 'tutorials/',
    indexFile: 'index.json'
};

// ============================================================
// ESTADO GLOBAL
// ============================================================
let lessons = [];
let currentLesson = null;
let currentSynth = null;
let isPlaying = false;
let visualObjs = {}; // Guarda os visualObj de cada bloco ABC

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    await loadLessonIndex();
});

async function loadLessonIndex() {
    try {
        const response = await fetch(CONFIG.baseUrl + CONFIG.indexFile);
        if (!response.ok) throw new Error('Não foi possível carregar o índice');
        lessons = await response.json();
        renderNavigation();
        if (lessons.length > 0) {
            loadLesson(lessons[0].file);
        }
    } catch (error) {
        document.getElementById('lesson-content').innerHTML =
            `<div class="error">Erro ao carregar índice: ${error.message}<br>
            Verifique se o arquivo <code>${CONFIG.indexFile}</code> existe em <code>${CONFIG.baseUrl}</code></div>`;
    }
}

function renderNavigation() {
    const nav = document.getElementById('lesson-nav');
    nav.innerHTML = '';
    lessons.forEach((lesson, index) => {
        const btn = document.createElement('button');
        btn.textContent = `${index + 1}. ${lesson.title}`;
        btn.onclick = () => loadLesson(lesson.file);
        btn.dataset.file = lesson.file;
        nav.appendChild(btn);
    });
}

async function loadLesson(fileName) {
    const content = document.getElementById('lesson-content');
    content.innerHTML = '<p class="loading">Carregando lição...</p>';

    document.querySelectorAll('#lesson-nav button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.file === fileName);
    });

    try {
        const response = await fetch(CONFIG.baseUrl + fileName);
        if (!response.ok) throw new Error('Lição não encontrada');
        const text = await response.text();
        visualObjs = {}; // Limpa visualObjs anteriores
        renderLesson(text);
    } catch (error) {
        content.innerHTML = `<div class="error">Erro: ${error.message}</div>`;
    }
}

// ============================================================
// PARSER
// ============================================================
function renderLesson(text) {
    const content = document.getElementById('lesson-content');
    content.innerHTML = '';

    const abcRegex = /\[ABC\]([\s\S]*?)\[\/ABC\]/g;
    let lastIndex = 0;
    let match;
    let blockCounter = 0;

    while ((match = abcRegex.exec(text)) !== null) {
        const textBefore = text.substring(lastIndex, match.index);
        if (textBefore.trim()) {
            content.appendChild(parseText(textBefore));
        }

        const abcCode = match[1];
        content.appendChild(createAbcBlock(abcCode, blockCounter));
        blockCounter++;

        lastIndex = match.index + match[0].length;
    }

    const textAfter = text.substring(lastIndex);
    if (textAfter.trim()) {
        content.appendChild(parseText(textAfter));
    }
}

function parseText(text) {
    const container = document.createElement('div');
    container.className = 'text-content';
    container.innerHTML = text;
    return container;
}

function createAbcBlock(abcCode, blockId) {
    const block = document.createElement('div');
    block.className = 'abc-block';

    const hasPlay = /%%play\b/.test(abcCode);
    const cleanCode = abcCode.replace(/%%play\s*/g, '').trim();

    // Container da partitura
    const sheetContainer = document.createElement('div');
    sheetContainer.className = 'abc-sheet';
    sheetContainer.id = `abc-sheet-${blockId}`;
    block.appendChild(sheetContainer);

    // Renderiza a partitura E guarda o visualObj para tocar depois
    try {
        const renderResult = ABCJS.renderAbc(sheetContainer, cleanCode, {
            responsive: 'resize',
            scale: 0.75,
            staffwidth: 700,
            paddingtop: 10,
            paddingbottom: 10,
            add_classes: true
        });
        
        // Guarda o visualObj para usar no play
        if (renderResult && renderResult[0]) {
            visualObjs[blockId] = renderResult[0];
        }
    } catch (error) {
        sheetContainer.innerHTML = `<div class="error">Erro ao renderizar: ${error.message}</div>`;
    }

    // Controles de reprodução (apenas se %%play estiver presente)
    if (hasPlay) {
        const controls = document.createElement('div');
        controls.className = 'abc-controls';

        const btnPlay = document.createElement('button');
        btnPlay.className = 'btn-play';
        btnPlay.innerHTML = '▶ Tocar';
        btnPlay.onclick = () => playAbc(cleanCode, btnPlay, blockId);

        const btnStop = document.createElement('button');
        btnStop.className = 'btn-stop';
        btnStop.innerHTML = '■ Parar';
        btnStop.style.display = 'none';
        btnStop.onclick = () => stopAbc(btnPlay, btnStop);

        controls.appendChild(btnPlay);
        controls.appendChild(btnStop);
        block.appendChild(controls);
    }

    // Mostra o código ABC
    const codeView = document.createElement('pre');
    codeView.className = 'abc-code';
    codeView.textContent = cleanCode;
    block.appendChild(codeView);

    return block;
}

// ============================================================
// REPRODUTOR DE ÁUDIO (CORRIGIDO)
// ============================================================
let audioContext = null;
let playTimeout = null;

async function playAbc(abcCode, btnPlay, blockId) {
    if (isPlaying) return;

    const btnStop = btnPlay.nextElementSibling;

    try {
        // 1. Verifica se o navegador suporta áudio WebAudio
        if (!ABCJS.synth.supportsAudio()) {
            throw new Error('Seu navegador não suporta reprodução de áudio WebAudio.');
        }

        // 2. Cria ou ativa o AudioContext dentro do clique do usuário
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        // Para qualquer reprodução anterior
        stopAbc(btnPlay, btnStop);

        // Pega o visualObj já renderizado
        let visualObj = visualObjs[blockId];
        if (!visualObj) {
            const parsed = ABCJS.parseOnly(abcCode);
            if (!parsed || parsed.length === 0) {
                throw new Error('Código ABC inválido');
            }
            visualObj = parsed[0];
        }

        // Atualiza UI
        btnPlay.disabled = true;
        btnPlay.innerHTML = '⏳ Carregando timbres...';
        btnStop.style.display = 'inline-block';
        isPlaying = true;

        // 3. Cria e inicializa o sintetizador passando o audioContext
        currentSynth = new ABCJS.synth.CreateSynth();
        
        await currentSynth.init({
            visualObj: visualObj,
            audioContext: audioContext,
            millisecondsPerMeasure: visualObj.millisecondsPerMeasure()
        });

        // Prepara os buffers de áudio (baixa o soundfont do instrumento)
        await currentSynth.prime();

        btnPlay.innerHTML = '🔊 Tocando...';

        // Inicia o áudio
        currentSynth.start();

        // 4. Calcula a duração real em milissegundos usando getTotalTime()
        const durationSeconds = typeof visualObj.getTotalTime === 'function' 
            ? visualObj.getTotalTime() 
            : 10;

        playTimeout = setTimeout(() => {
            if (isPlaying) {
                resetPlayUI(btnPlay, btnStop);
            }
        }, (durationSeconds * 1000) + 500);

    } catch (error) {
        console.error('Erro ao tocar:', error);
        alert('Erro ao reproduzir áudio: ' + error.message);
        resetPlayUI(btnPlay, btnStop);
    }
}

function stopAbc(btnPlay, btnStop) {
    if (playTimeout) {
        clearTimeout(playTimeout);
        playTimeout = null;
    }
    if (currentSynth) {
        currentSynth.stop();
        currentSynth = null;
    }
    resetPlayUI(btnPlay, btnStop);
}

function resetPlayUI(btnPlay, btnStop) {
    isPlaying = false;
    btnPlay.disabled = false;
    btnPlay.innerHTML = '▶ Tocar';
    btnStop.style.display = 'none';
}