// ============================================================
// CONFIGURAÇÃO - Altere aqui para apontar para sua pasta no GitHub
// ============================================================
const CONFIG = {
    // URL base dos arquivos de tutorial (pode ser GitHub raw ou GitHub Pages)
    // Exemplo GitHub raw: 'https://raw.githubusercontent.com/USUARIO/REPO/main/tutorials/'
    // Exemplo GitHub Pages: 'tutorials/' (se estiver na mesma estrutura)
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

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    await loadLessonIndex();
});

// Carrega o índice de lições
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

// Renderiza a navegação
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

// Carrega uma lição específica
async function loadLesson(fileName) {
    const content = document.getElementById('lesson-content');
    content.innerHTML = '<p class="loading">Carregando lição...</p>';

    // Atualiza navegação ativa
    document.querySelectorAll('#lesson-nav button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.file === fileName);
    });

    try {
        const response = await fetch(CONFIG.baseUrl + fileName);
        if (!response.ok) throw new Error('Lição não encontrada');
        const text = await response.text();
        renderLesson(text);
    } catch (error) {
        content.innerHTML = `<div class="error">Erro: ${error.message}</div>`;
    }
}

// ============================================================
// PARSER - Converte texto da lição em HTML
// ============================================================
function renderLesson(text) {
    const content = document.getElementById('lesson-content');
    content.innerHTML = '';

    // Regex para encontrar blocos [ABC]...[/ABC]
    const abcRegex = /\[ABC\]([\s\S]*?)\[\/ABC\]/g;
    let lastIndex = 0;
    let match;
    let blockCounter = 0;

    while ((match = abcRegex.exec(text)) !== null) {
        // Texto explicativo ANTES do bloco ABC
        const textBefore = text.substring(lastIndex, match.index);
        if (textBefore.trim()) {
            content.appendChild(parseText(textBefore));
        }

        // Bloco ABC
        const abcCode = match[1];
        content.appendChild(createAbcBlock(abcCode, blockCounter));
        blockCounter++;

        lastIndex = match.index + match[0].length;
    }

    // Texto restante após o último bloco
    const textAfter = text.substring(lastIndex);
    if (textAfter.trim()) {
        content.appendChild(parseText(textAfter));
    }
}

// Parser simples de texto (suporta HTML puro + algumas tags simples)
function parseText(text) {
    const container = document.createElement('div');
    container.className = 'text-content';

    // Permite HTML direto nos arquivos .txt
    // Se quiser Markdown, pode substituir por uma lib como marked.js
    container.innerHTML = text;

    return container;
}

// Cria um bloco ABC com partitura renderizada
function createAbcBlock(abcCode, blockId) {
    const block = document.createElement('div');
    block.className = 'abc-block';

    // Verifica se há flag %%play no código
    const hasPlay = /%%play\b/.test(abcCode);

    // Remove a flag %%play do código antes de renderizar
    const cleanCode = abcCode.replace(/%%play\s*/g, '').trim();

    // Container da partitura
    const sheetContainer = document.createElement('div');
    sheetContainer.className = 'abc-sheet';
    sheetContainer.id = `abc-sheet-${blockId}`;
    block.appendChild(sheetContainer);

    // Renderiza a partitura com abcjs
    try {
        ABCJS.renderAbc(sheetContainer, cleanCode, {
            responsive: 'resize',
            scale: 0.75,
            staffwidth: 700,
            paddingtop: 10,
            paddingbottom: 10,
            add_classes: true
        });
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

    // Mostra o código ABC abaixo da partitura (opcional, para fins didáticos)
    const codeView = document.createElement('pre');
    codeView.className = 'abc-code';
    codeView.textContent = cleanCode;
    block.appendChild(codeView);

    return block;
}

// ============================================================
// REPRODUTOR DE ÁUDIO (abcjs synth)
// ============================================================
async function playAbc(abcCode, btnPlay, blockId) {
    if (isPlaying) return;

    try {
        // Para qualquer reprodução anterior
        if (currentSynth) {
            currentSynth.stop();
        }

        // Parseia o ABC
        const visualObj = ABCJS.renderAbc('temp-' + blockId, abcCode, {
            responsive: 'resize',
            scale: 0.75,
            generateDownload: false
        })[0];

        if (!visualObj) throw new Error('Não foi possível processar a partitura');

        // Inicializa o sintetizador
        currentSynth = new ABCJS.synth.CreateSynth();
        await currentSynth.init({ visualObj: visualObj });

        // Atualiza UI
        btnPlay.disabled = true;
        btnPlay.innerHTML = '⏳ Carregando...';
        const btnStop = btnPlay.nextElementSibling;
        btnStop.style.display = 'inline-block';
        isPlaying = true;

        // Toca
        await currentSynth.prime();
        currentSynth.start();

        btnPlay.innerHTML = '🔊 Tocando...';

        // Quando terminar, restaura UI
        const duration = visualObj.duration * 1000;
        setTimeout(() => {
            if (isPlaying) {
                resetPlayUI(btnPlay, btnStop);
            }
        }, duration + 500);

    } catch (error) {
        console.error('Erro ao tocar:', error);
        alert('Erro ao reproduzir áudio: ' + error.message);
        resetPlayUI(btnPlay, btnPlay.nextElementSibling);
    }
}

function stopAbc(btnPlay, btnStop) {
    if (currentSynth) {
        currentSynth.stop();
    }
    resetPlayUI(btnPlay, btnStop);
}

function resetPlayUI(btnPlay, btnStop) {
    isPlaying = false;
    btnPlay.disabled = false;
    btnPlay.innerHTML = '▶ Tocar';
    btnStop.style.display = 'none';
}