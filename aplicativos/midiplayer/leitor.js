// leitormidi.js

// --- Configuração inicial do Tone.js ---
Tone.context.latencyHint = 'playback';

// --- Variáveis de Estado Globais ---
let midiData = null; // Armazena o objeto MIDI carregado
let samplers = {}; // Armazena os samplers de áudio do Tone.js para cada faixa
let volumeNodes = {}; // Armazena os nós de volume para controle individual de faixas
let progressInterval = null; // Intervalo para atualização da barra de progresso
let transpose = 0; // Valor da transposição em semitons
let playbackRate = 1; // Velocidade de reprodução (1 = 100%)
let isPlaying = false; // Flag para indicar se a reprodução está ativa
let loopStartTime = 0; // Início do loop em segundos
let loopEndTime = 0; // Fim do loop em segundos
let midiDuration = 0; // Duração total do MIDI em segundos
let scheduled = []; // Array para armazenar IDs de eventos agendados (para Tone.Transport.clear)

// --- Variáveis de Estado de Navegação e UI ---
let currentPath = ""; // Caminho atual na estrutura de categorias (ex: "Gêneros Musicais/Jazz")
let selectedMidiItem = null; // Referência ao item MIDI selecionado na lista (para estilização)

// --- Mapeamento de Bateria (MIDI Channel 9) ---
const DRUM_MAPPING = {
    36: ["C1", "kick.wav"],
    38: ["D1", "snare.wav"],
    42: ["F#1", "hihat.wav"],
    46: ["A#1", "openhat.wav"],
    49: ["C#2", "crash.wav"]
};

function getDrumNoteName(midiNote) {
    return DRUM_MAPPING[midiNote]?.[0] || "C1";
}

function loadDrumSampler(index) {
    if (samplers[index]) return samplers[index];

    const urls = {};
    for (const [midiNote, [noteName, file]] of Object.entries(DRUM_MAPPING)) {
        urls[noteName] = file;
    }

    const sampler = new Tone.Sampler({
        urls,
        baseUrl: "sons/bateria/", // Caminho base para os arquivos de bateria
        release: 0.2,
    });

    const vol = new Tone.Volume(0).toDestination(); // Volume inicial 0dB
    sampler.connect(vol);

    samplers[index] = sampler;
    volumeNodes[index] = vol;

    return sampler;
}

function loadSampler(track, index) {
    if (samplers[index]) return samplers[index];

    const urls = {};
    // Pega todas as notas únicas da faixa para carregar os samples necessários
    const uniqueNotes = new Set(track.notes.map(note => note.name));
    uniqueNotes.forEach(noteName => {
        // Converte C# para Cs, D# para Ds, etc. para corresponder aos nomes dos arquivos (se necessário)
        const fileNameNote = noteName.replace("#", "s");
        urls[noteName] = `${fileNameNote}.mp3`;
    });

    // Determina a pasta base dos sons com base no nome da faixa
    const baseFolder = track.name?.toLowerCase().includes("guitar") ? "guitarra"
                        : track.name?.toLowerCase().includes("bass") || track.name?.toLowerCase().includes("baixo") ? "baixo"
                        : "piano"; // Padrão para piano

    const sampler = new Tone.Sampler({
        urls,
        baseUrl: `sons/${baseFolder}/`, // Caminho base para os arquivos de instrumento
        release: 1, // Duração da liberação da nota
    });

    const vol = new Tone.Volume(0).toDestination(); // Volume inicial 0dB
    sampler.connect(vol);

    samplers[index] = sampler;
    volumeNodes[index] = vol;

    return sampler;
}

function getTransposedNote(note, semitones) {
    if (semitones === 0) return note; // Não transpõe se o valor for 0

    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    let [name, octaveStr] = note.split(/(\d+)/); // Separa nome da nota e oitava
    let octave = parseInt(octaveStr);

    let index = noteNames.indexOf(name);
    if (index === -1) return note; // Retorna a nota original se não for reconhecida

    index += semitones; // Aplica a transposição

    // Ajusta oitava se a nota sair do limite de 0-11
    while (index < 0) {
        index += 12;
        octave--;
    }
    while (index >= 12) {
        index -= 12;
        octave++;
    }

    return noteNames[index] + octave;
}

function restartPlayback() {
    if (!midiData) return; // Não faz nada se não houver MIDI carregado

    const wasPlaying = Tone.Transport.state === "started";
    const position = Tone.Transport.seconds; // Salva a posição atual da reprodução

    Tone.Transport.stop(); // Para o transporte
    Tone.Transport.cancel(); // Limpa todos os eventos agendados
    clearInterval(progressInterval); // Limpa o intervalo da barra de progresso
    scheduled = []; // Reseta o array de eventos agendados

    scheduleTracks(); // Agenda as faixas novamente com as novas configurações
    Tone.Transport.seconds = position; // Restaura a posição de reprodução

    if (wasPlaying) {
        Tone.Transport.start(); // Reinicia a reprodução se estava tocando
        progressInterval = setInterval(updateProgressBar, 50);
    }
}

function scheduleTracks() {
    // Garante que não haja eventos duplicados
    Tone.Transport.cancel();
    scheduled = [];

    const selectedTracks = Array.from(
        document.querySelectorAll('#trackList input[type="checkbox"]:checked')
    ).map(el => parseInt(el.dataset.track));

    for (let i of selectedTracks) {
        const track = midiData.tracks[i];
        // Determina se é uma faixa de bateria (canal 9) ou um instrumento normal
        const sampler = track.channel === 9 ? loadDrumSampler(i) : loadSampler(track, i);

        track.notes.forEach(note => {
            const scheduledTime = note.time / playbackRate; // Ajusta o tempo da nota pela velocidade de reprodução
            const id = Tone.Transport.schedule(time => {
                try {
                    let noteName;
                    if (track.channel === 9) {
                        noteName = getDrumNoteName(note.midi); // Pega o nome da nota da bateria
                    } else {
                        noteName = transpose !== 0 ? getTransposedNote(note.name, transpose) : note.name;
                    }
                    // Dispara a nota no sampler
                    sampler.triggerAttackRelease(noteName, note.duration / playbackRate, time, note.velocity);
                } catch (err) {
                    console.warn("Erro ao tocar nota:", err, "Nota:", note, "Faixa:", track.name);
                }
            }, scheduledTime);
            scheduled.push(id); // Armazena o ID do evento agendado
        });
    }

    const loopToggle = document.getElementById("loopToggle");
    Tone.Transport.loop = loopToggle.checked;
    if (loopToggle.checked) {
        // Assegura que loopStart e loopEnd são escalados pela velocidade
        Tone.Transport.loopStart = loopStartTime;
        Tone.Transport.loopEnd = loopEndTime;
    } else {
        // Define o loop para a duração total do MIDI se o loop estiver desativado
        Tone.Transport.loopStart = 0;
        Tone.Transport.loopEnd = midiDuration / playbackRate;
    }
    Tone.Transport.playbackRate = playbackRate;
}

function updateProgressBar() {
    if (!midiData) return;

    const totalDuration = Tone.Transport.loop ? Tone.Transport.loopEnd : midiDuration / playbackRate;
    const currentSeconds = Tone.Transport.seconds;
    let percent = (currentSeconds / totalDuration) * 100;

    const progressBar = document.getElementById("progress");
    const progressIndicator = document.getElementById("progressIndicator");

    progressBar.style.width = `${Math.min(percent, 100)}%`;
    progressIndicator.style.left = `${Math.min(percent, 100)}%`;

    // Verifica se a reprodução terminou (apenas se não estiver em loop)
    if (currentSeconds >= totalDuration && !Tone.Transport.loop && Tone.Transport.state !== "stopped") {
        if (Math.abs(currentSeconds - totalDuration) < 0.05 || currentSeconds > totalDuration) {
            clearInterval(progressInterval);
            document.getElementById("status").textContent = "Reprodução concluída. Clique em Tocar para reiniciar.";
            isPlaying = false;
            Tone.Transport.stop();
            Tone.Transport.cancel();
            Tone.Transport.seconds = 0; // Reseta a posição para o início
            progressBar.style.width = "0%";
            progressIndicator.style.left = "0%";
        }
    }
}

function updateLoopMarkers() {
    const loopStartMarker = document.getElementById("loopStartMarker");
    const loopEndMarker = document.getElementById("loopEndMarker");
    const loopRange = document.getElementById("loopRange");

    if (!midiData) {
        // Esconde os marcadores se não houver MIDI
        loopStartMarker.style.display = "none";
        loopEndMarker.style.display = "none";
        loopRange.style.display = "none";
        return;
    }

    const durationEffective = midiDuration / playbackRate;
    if (durationEffective === 0) { // Evita divisão por zero
        loopStartMarker.style.display = "none";
        loopEndMarker.style.display = "none";
        loopRange.style.display = "none";
        return;
    }

    const loopToggle = document.getElementById("loopToggle");
    if (loopToggle.checked) {
        // Mostra e posiciona os marcadores se o loop estiver ativo
        loopStartMarker.style.display = "block";
        loopEndMarker.style.display = "block";
        loopRange.style.display = "block";

        const startPercent = (loopStartTime / durationEffective) * 100;
        const endPercent = (loopEndTime / durationEffective) * 100;

        loopStartMarker.style.left = `${startPercent}%`;
        loopEndMarker.style.left = `${endPercent}%`;
        loopRange.style.left = `${startPercent}%`;
        loopRange.style.width = `${endPercent - startPercent}%`;
    } else {
        // Esconde os marcadores se o loop estiver desativado
        loopStartMarker.style.display = "none";
        loopEndMarker.style.display = "none";
        loopRange.style.display = "none";
    }
}

// --- Funções de Navegação e Carregamento de MIDI (EXISTENTES E FUNCIONAIS) ---
async function loadMidiFile(path) {
    console.log("Tentando carregar MIDI da URL:", path);
    document.getElementById('status').textContent = "Carregando MIDI...";

    Tone.Transport.stop(); // Para qualquer reprodução anterior
    Tone.Transport.cancel(); // Limpa eventos agendados
    clearInterval(progressInterval); // Para a atualização da barra
    isPlaying = false;
    samplers = {}; // Limpa samplers antigos
    volumeNodes = {}; // Limpa nós de volume antigos
    scheduled = []; // Limpa agendamentos

    try {
        // A URL completa é construída aqui para garantir que fetch funcione corretamente
        // Especialmente útil se 'path' for './midi/file.mid' e a página estiver em uma subpasta
        const fullPath = new URL(path, window.location.href).href;
        console.log("URL completa para fetch:", fullPath);
        const response = await fetch(fullPath);

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        midiData = new Midi(arrayBuffer);
        midiDuration = midiData.duration; // Define a duração do MIDI
        document.getElementById('status').textContent = "MIDI carregado com sucesso! Clique em Tocar.";

        // Agora, configure a interface do usuário do player
        processMidiFile(arrayBuffer, path.split('/').pop()); // Passa o nome do arquivo

    } catch (error) {
        console.error("Falha ao carregar MIDI:", error);
        document.getElementById('status').textContent = `Erro ao carregar MIDI: ${error.message}. Verifique o console.`;
        midiData = null; // Garante que o player não tente tocar um MIDI inválido
        // Limpa a lista de faixas em caso de erro
        document.getElementById('trackList').innerHTML = "";
        if (selectedMidiItem) {
            selectedMidiItem.classList.remove('active');
            selectedMidiItem = null;
        }
    }
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    document.getElementById('status').textContent = `Carregando ${file.name}...`;

    Tone.Transport.stop();
    Tone.Transport.cancel();
    clearInterval(progressInterval);
    isPlaying = false;
    samplers = {};
    volumeNodes = {};
    scheduled = [];

    try {
        const arrayBuffer = await file.arrayBuffer();
        midiData = new Midi(arrayBuffer);
        midiDuration = midiData.duration; // Define a duração do MIDI
        document.getElementById('status').textContent = `${file.name} carregado com sucesso! Clique em Tocar.`;

        // Processa o MIDI carregado para configurar a UI do player
        processMidiFile(arrayBuffer, file.name);

        // Remove seleção de itens da lista se o MIDI foi carregado via upload
        if (selectedMidiItem) {
            selectedMidiItem.classList.remove('active');
            selectedMidiItem = null;
        }

    } catch (error) {
        console.error("Erro ao processar arquivo:", error);
        document.getElementById('status').textContent = `Erro ao carregar ${file.name}: ${error.message}`;
        midiData = null;
        document.getElementById('trackList').innerHTML = "";
    }
}

async function processMidiFile(arrayBuffer, fileName = "Arquivo MIDI") {
    // Esta função agora foca em configurar a UI de faixas e sliders
    // O carregamento do MIDI em si já foi feito por loadMidiFile ou handleFileUpload

    const trackList = document.getElementById("trackList");
    trackList.innerHTML = "<h3>🎚️ Faixas:</h3>";

    midiData.tracks.forEach((track, i) => {
        const name = track.name || `Faixa ${i + 1}`;
        const instrumentName = track.instrument?.name || "Desconhecido";
        const trackDiv = document.createElement('div');
        trackDiv.className = 'track-control';
        trackDiv.innerHTML = `
            <div class="track-name-section">
                <label>
                    <input type="checkbox" data-track="${i}" checked>
                    <strong>${name}</strong> (${instrumentName})
                </label>
            </div>
            <div class="track-volume-section">
                <label>
                    Volume: <span id="volLabel${i}">0</span> dB
                    <input type="range" data-volume-track="${i}" min="-60" max="6" value="0">
                </label>
            </div>
        `;
        trackList.appendChild(trackDiv);
    });

    // Adiciona listeners para os novos checkboxes e sliders de volume
    trackList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener("change", restartPlayback); // Reinicia ao mudar seleção de faixa
    });
    trackList.querySelectorAll('input[type="range"]').forEach(slider => {
        slider.addEventListener("input", (e) => {
            const index = parseInt(e.target.dataset.volumeTrack);
            const db = parseInt(e.target.value);
            if (volumeNodes[index]) {
                volumeNodes[index].volume.value = db; // Atualiza o volume do nó Tone.js
            }
            document.getElementById(`volLabel${index}`).textContent = db;
        });
    });

    // Configura os sliders de loop e seus valores
    const loopStartSlider = document.getElementById("loopStartSlider");
    const loopEndSlider = document.getElementById("loopEndSlider");
    const durationEffective = midiDuration / playbackRate;

    loopStartSlider.max = durationEffective;
    loopEndSlider.max = durationEffective;
    loopEndSlider.value = durationEffective; // Loop End padrão é a duração total

    loopStartTime = 0;
    loopEndTime = durationEffective;
    document.getElementById("loopStartValue").textContent = loopStartTime.toFixed(2);
    document.getElementById("loopEndValue").textContent = loopEndTime.toFixed(2);

    // Reseta a barra de progresso visual
    document.getElementById("progress").style.width = "0%";
    document.getElementById("progressIndicator").style.left = "0%";

    updateLoopMarkers(); // Atualiza a exibição dos marcadores de loop
}


// --- Funções de Navegação de Categorias (EXISTENTES E FUNCIONAIS) ---
function loadMidiList(path = "") {
    currentPath = path;
    const categoryContainer = document.getElementById('categoryContainer');
    const midiListContainer = document.getElementById('midiListContainer');

    // Limpa containers
    categoryContainer.innerHTML = '';
    midiListContainer.innerHTML = '';

    // Carrega dados da categoria atual
    const currentCategory = getCurrentCategory(path);

    // Renderiza subcategorias
    if (currentCategory.categories) {
        currentCategory.categories.forEach(categoryName => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-item';
            categoryElement.textContent = midiDatabase[categoryName]?.name || categoryName; // Usa o nome amigável se disponível
            categoryElement.addEventListener('click', () => {
                loadMidiList(path ? `${path}/${categoryName}` : categoryName);
            });
            categoryContainer.appendChild(categoryElement);
        });
    }

    // Renderiza itens MIDI
    if (currentCategory.midis) {
        currentCategory.midis.forEach(midi => {
            const midiElement = document.createElement('div');
            midiElement.className = 'midi-list-item';
            midiElement.textContent = midi.name;
            midiElement.addEventListener('click', () => {
                if (selectedMidiItem) {
                    selectedMidiItem.classList.remove('active');
                }
                midiElement.classList.add('active');
                selectedMidiItem = midiElement;
                loadMidiFile(midi.path); // Carrega o MIDI ao clicar
            });
            midiListContainer.appendChild(midiElement);
        });
    }

    updateBreadcrumb();
}

function getCurrentCategory(path) {
    if (!path) return midiDatabase[""];

    const parts = path.split('/').filter(p => p); // Filtra partes vazias
    let current = midiDatabase[""]; // Começa na raiz

    for (const part of parts) {
        // Verifica se a categoria existe tanto na lista de categorias do pai
        // quanto como uma chave de objeto no midiDatabase
        if (current.categories && current.categories.includes(part) && midiDatabase[part]) {
            current = midiDatabase[part];
        } else {
            console.warn(`[getCurrentCategory] Categoria '${part}' não encontrada ou não é subcategoria válida. Retornando raiz.`);
            return midiDatabase[""]; // Retorna a raiz como fallback seguro
        }
    }
    return current;
}

function updateBreadcrumb() {
    const breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.innerHTML = ''; // Limpa o breadcrumb

    // Item raiz "Todos os MIDIs"
    const rootItem = document.createElement('span');
    rootItem.className = 'breadcrumb-item root';
    rootItem.textContent = 'Todos os MIDIs';
    rootItem.addEventListener('click', () => {
        loadMidiList(""); // Volta para a raiz
    });
    breadcrumb.appendChild(rootItem);

    if (!currentPath) return; // Não adiciona mais nada se estiver na raiz

    const parts = currentPath.split('/').filter(p => p);
    let accumulatedPath = "";

    parts.forEach(part => {
        if (!part) return;

        accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;

        const separator = document.createElement('span');
        separator.className = 'breadcrumb-separator';
        separator.textContent = '›';
        breadcrumb.appendChild(separator);

        const item = document.createElement('span');
        item.className = 'breadcrumb-item';
        // Tenta usar o nome amigável da categoria, senão usa a parte do caminho
        item.textContent = midiDatabase[part]?.name || part;
        item.addEventListener('click', () => {
            loadMidiList(accumulatedPath); // Navega para o caminho acumulado
        });
        breadcrumb.appendChild(item);
    });
}

// --- Funções de Busca (EXISTENTES E FUNCIONAIS) ---
function handleSearch() {
    const query = document.getElementById('midiSearch').value.toLowerCase().trim();
    if (!query) {
        loadMidiList(currentPath); // Se a busca está vazia, volta para a categoria atual
        document.getElementById('status').textContent = "Busca vazia. Exibindo categoria atual.";
        return;
    }
    const results = [];
    const visitedPaths = new Set(); // Para evitar duplicatas

    function searchInCategory(categoryObj) {
        if (!categoryObj) return;

        // Adiciona MIDIs
        if (categoryObj.midis) {
            categoryObj.midis.forEach(midi => {
                if (midi.name.toLowerCase().includes(query) && !visitedPaths.has(midi.path)) {
                    results.push(midi);
                    visitedPaths.add(midi.path);
                }
            });
        }

        // Recursivamente busca em subcategorias
        if (categoryObj.categories) {
            categoryObj.categories.forEach(catName => {
                if (midiDatabase[catName]) { // Verifica se a categoria existe como chave
                    searchInCategory(midiDatabase[catName]);
                }
            });
        }
    }

    searchInCategory(midiDatabase[""]); // Começa a busca pela raiz
    displaySearchResults(results, query);
}

function displaySearchResults(results, query) {
    const container = document.getElementById('midiListContainer');
    const categoryContainer = document.getElementById('categoryContainer');
    container.innerHTML = ''; // Limpa resultados anteriores
    categoryContainer.innerHTML = ''; // Limpa as categorias na visualização de busca

    // Adiciona um botão para limpar a busca
    const clearSearchBtn = document.createElement('button');
    clearSearchBtn.textContent = 'Limpar Busca';
    clearSearchBtn.className = 'clear-search-button';
    clearSearchBtn.addEventListener('click', () => {
        document.getElementById('midiSearch').value = '';
        loadMidiList(currentPath); // Retorna à navegação normal
    });
    categoryContainer.appendChild(clearSearchBtn);


    if (results.length === 0) {
        container.innerHTML = `<div class="empty-state">Nenhum resultado encontrado para "${query}".</div>`;
        document.getElementById('status').textContent = `Nenhum resultado encontrado para "${query}".`;
        return;
    }

    results.forEach(midi => {
        const element = document.createElement('div');
        element.className = 'midi-list-item';
        element.textContent = midi.name;
        element.addEventListener('click', () => {
            if (selectedMidiItem) {
                selectedMidiItem.classList.remove('active');
            }
            element.classList.add('active');
            selectedMidiItem = element;
            loadMidiFile(midi.path);
        });
        container.appendChild(element);
    });
    document.getElementById('status').textContent = `Encontrados ${results.length} resultados para "${query}".`;
}


// --- Inicialização e Event Listeners (UNIFICADOS) ---
document.addEventListener('DOMContentLoaded', function() {
    loadMidiList(); // Carrega a lista inicial de MIDIs (raiz)

    // Event Listeners para a UI do player e navegação
    document.getElementById('btnSearch').addEventListener('click', handleSearch);
    document.getElementById('midiSearch').addEventListener('keypress', (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    });
    document.getElementById('midiFile').addEventListener('change', handleFileUpload);

    // Botões de controle do Player
    document.getElementById('btnPlay').addEventListener('click', async () => {
        if (!midiData) {
            document.getElementById("status").textContent = "Nenhum MIDI carregado. Carregue um arquivo.";
            return;
        }
        try {
            await Tone.start(); // Garante que o contexto de áudio do Tone.js está ativo

            // Se o transporte está parado ou no início, agenda as faixas
            if (Tone.Transport.state === "stopped" || Tone.Transport.seconds === 0) {
                Tone.Transport.seconds = 0; // Reinicia para o começo se estiver parado
                scheduleTracks(); // Agenda as faixas apenas se estiver parado
            }
            Tone.Transport.start();
            isPlaying = true;
            document.getElementById("status").textContent = "Tocando...";
            clearInterval(progressInterval);
            progressInterval = setInterval(updateProgressBar, 50);
        } catch (err) {
            console.error("Erro ao iniciar reprodução:", err);
            document.getElementById("status").textContent = "Erro ao iniciar reprodução. Verifique o console.";
        }
    });

    document.getElementById('btnPause').addEventListener('click', () => {
        if (Tone.Transport.state === "started") {
            Tone.Transport.pause();
            clearInterval(progressInterval);
            document.getElementById("status").textContent = "Pausado";
        } else if (Tone.Transport.state === "paused") {
            Tone.Transport.start();
            progressInterval = setInterval(updateProgressBar, 50);
            document.getElementById("status").textContent = "Tocando...";
        }
    });

    document.getElementById('btnStop').addEventListener('click', () => {
        Tone.Transport.stop();
        Tone.Transport.cancel();
        clearInterval(progressInterval);
        document.getElementById("progress").style.width = "0%";
        document.getElementById("progressIndicator").style.left = "0%";
        document.getElementById("status").textContent = "Parado";
        isPlaying = false;
        updateLoopMarkers();
    });

    // Sliders de controle
    document.getElementById("sliderSpeed").addEventListener("input", e => {
        playbackRate = parseInt(e.target.value) / 100;
        document.getElementById("speedValue").textContent = Math.round(playbackRate * 100);
        if (midiData) {
            const newDurationEffective = midiDuration / playbackRate;
            document.getElementById("loopStartSlider").max = newDurationEffective;
            document.getElementById("loopEndSlider").max = newDurationEffective;
            if (loopEndTime > newDurationEffective) {
                loopEndTime = newDurationEffective;
                document.getElementById("loopEndSlider").value = loopEndTime;
                document.getElementById("loopEndValue").textContent = loopEndTime.toFixed(2);
            }
            if (loopStartTime > loopEndTime) {
                loopStartTime = loopEndTime;
                document.getElementById("loopStartSlider").value = loopStartTime;
                document.getElementById("loopStartValue").textContent = loopStartTime.toFixed(2);
            }
        }
        restartPlayback();
        updateLoopMarkers();
    });

    document.getElementById("sliderTranspose").addEventListener("input", e => {
        transpose = parseInt(e.target.value);
        document.getElementById("transposeValue").textContent = transpose;
        restartPlayback();
    });

    document.getElementById("loopStartSlider").addEventListener("input", e => {
        loopStartTime = parseFloat(e.target.value);
        document.getElementById("loopStartValue").textContent = loopStartTime.toFixed(2);
        if (loopEndTime < loopStartTime) {
            loopEndTime = loopStartTime;
            document.getElementById("loopEndSlider").value = loopEndTime;
            document.getElementById("loopEndValue").textContent = loopEndTime.toFixed(2);
        }
        if (isPlaying) restartPlayback();
        updateLoopMarkers();
    });

    document.getElementById("loopEndSlider").addEventListener("input", e => {
        loopEndTime = parseFloat(e.target.value);
        document.getElementById("loopEndValue").textContent = loopEndTime.toFixed(2);
        if (loopStartTime > loopEndTime) {
            loopStartTime = loopEndTime;
            document.getElementById("loopStartSlider").value = loopStartTime;
            document.getElementById("loopStartValue").textContent = loopStartTime.toFixed(2);
        }
        if (isPlaying) restartPlayback();
        updateLoopMarkers();
    });

    document.getElementById("loopToggle").addEventListener("change", (e) => {
        const loopControls = document.getElementById("loopControls");
        loopControls.style.display = e.target.checked ? "block" : "none";
        updateLoopMarkers();
        if (isPlaying) restartPlayback();
    });

    // Clique na barra de progresso para pular para uma posição
    document.getElementById("progressBar").addEventListener("click", (e) => {
        if (!midiData) return;
        const progressBar = e.currentTarget;
        const clickX = e.clientX - progressBar.getBoundingClientRect().left;
        const progressBarWidth = progressBar.offsetWidth;
        const clickPercent = clickX / progressBarWidth;

        const totalDuration = midiDuration / playbackRate;
        const newPosition = totalDuration * clickPercent;

        Tone.Transport.seconds = newPosition;
        document.getElementById("progress").style.width = `${clickPercent * 100}%`;
        document.getElementById("progressIndicator").style.left = `${clickPercent * 100}%`;

        if (!isPlaying && Tone.Transport.state !== "started") {
            document.getElementById("status").textContent = `Posição ajustada para ${newPosition.toFixed(2)}s. Pressione Tocar para iniciar.`;
        }
    });

    // Evento para o botão de voltar ao topo do breadcrumb (se existir no HTML)
    document.getElementById('breadcrumb').addEventListener('click', (e) => {
        if (e.target.classList.contains('root')) {
            loadMidiList(""); // Volta para a raiz
        }
    });
});

async function showComposerSummary(composerKey) {
    const composerData = midiDatabase[composerKey];
    const summaryBox = document.getElementById('composerSummaryBox');
    const nameElement = document.getElementById('summaryComposerName');
    const textElement = document.getElementById('summaryComposerText');
    const closeButton = document.getElementById('closeSummaryBox');
    const midiListContainer = document.getElementById('midiListContainer');

    if (!composerData) {
        console.warn(`Dados não encontrados para o compositor: ${composerKey}`);
        summaryBox.style.display = 'none';
        return;
    }

    // Mostra o nome do compositor
    nameElement.textContent = composerData.name || composerKey;
    
    // Carrega o resumo se existir
    if (composerData.resumePath) {
        textElement.textContent = "Carregando resumo...";
        try {
            const response = await fetch(composerData.resumePath);
            if (!response.ok) throw new Error(`Erro ${response.status}`);
            const summaryText = await response.text();
            textElement.textContent = summaryText;
        } catch (error) {
            console.error("Erro ao carregar resumo:", error);
            textElement.textContent = "Erro ao carregar o resumo.";
        }
    } else {
        textElement.textContent = "Resumo não disponível.";
    }

    // Limpa e preenche a lista de músicas do compositor
    midiListContainer.innerHTML = '';
    if (composerData.midis && composerData.midis.length > 0) {
        composerData.midis.forEach(midi => {
            const midiElement = document.createElement('div');
            midiElement.className = 'midi-list-item';
            midiElement.textContent = midi.name;
            midiElement.addEventListener('click', () => {
                if (selectedMidiItem) selectedMidiItem.classList.remove('active');
                midiElement.classList.add('active');
                selectedMidiItem = midiElement;
                loadMidiFile(midi.path);
            });
            midiListContainer.appendChild(midiElement);
        });
    } else {
        midiListContainer.innerHTML = '<div class="empty-state">Nenhuma música disponível para este compositor.</div>';
    }

    summaryBox.style.display = 'block';
    
    closeButton.onclick = () => {
        summaryBox.style.display = 'none';
    };
}

function loadMidiList(path = "") {
    currentPath = path;
    const categoryContainer = document.getElementById('categoryContainer');
    const midiListContainer = document.getElementById('midiListContainer');
    const summaryBox = document.getElementById('composerSummaryBox');

    // Limpa containers
    categoryContainer.innerHTML = '';
    midiListContainer.innerHTML = '';
    summaryBox.style.display = 'none';

    // Carrega dados da categoria atual
    const currentCategory = getCurrentCategory(path);

    // Renderiza subcategorias
    if (currentCategory.categories) {
        currentCategory.categories.forEach(categoryName => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-item';
            categoryElement.textContent = midiDatabase[categoryName]?.name || categoryName;

            // Verifica se é um compositor (tem resumePath) dentro da categoria Compositores
            if (path === "Compositores" && midiDatabase[categoryName]?.resumePath) {
                categoryElement.addEventListener('click', () => {
                    showComposerSummary(categoryName);
                });
            } else {
                // Comportamento normal de navegação
                categoryElement.addEventListener('click', () => {
                    loadMidiList(path ? `${path}/${categoryName}` : categoryName);
                });
            }
            categoryContainer.appendChild(categoryElement);
        });
    }

    // Renderiza itens MIDI da categoria atual (se não for um compositor)
    if (currentCategory.midis && !(path.startsWith("Compositores") && path !== "Compositores")) {
        currentCategory.midis.forEach(midi => {
            const midiElement = document.createElement('div');
            midiElement.className = 'midi-list-item';
            midiElement.textContent = midi.name;
            midiElement.addEventListener('click', () => {
                if (selectedMidiItem) selectedMidiItem.classList.remove('active');
                midiElement.classList.add('active');
                selectedMidiItem = midiElement;
                loadMidiFile(midi.path);
            });
            midiListContainer.appendChild(midiElement);
        });
    }

    updateBreadcrumb();
}

// ... (o restante do código permanece o mesmo) ...
//
//
 async function loadMidiFile(path, name) {
    try {
      document.getElementById("status").textContent = `Carregando ${name}...`;
      const response = await fetch(path);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      processMidiFile(arrayBuffer, name);
    } catch (err) {
      console.error("Erro ao carregar MIDI:", err);
      document.getElementById("status").textContent = `Erro ao carregar ${name}`;
      
      // Remove a seleção em caso de erro
      if (selectedMidiItem) {
        selectedMidiItem.classList.remove('active');
        selectedMidiItem = null;
      }
    }
  }

  function filterMidiList() {
    const searchTerm = document.getElementById("midiSearch").value.toLowerCase();
    const items = document.querySelectorAll('.midi-list-item');
    
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(searchTerm) ? '' : 'none';
    });
  }

  async function processMidiFile(arrayBuffer, fileName = "Arquivo MIDI") {
    try {
      midiData = new Midi(arrayBuffer);
      midiDuration = midiData.duration;

      const trackList = document.getElementById("trackList");
      trackList.innerHTML = "<h3>🎚️ Faixas:</h3>";
      samplers = {};
      volumeNodes = {};

      midiData.tracks.forEach((track, i) => {
        const name = track.name || `Track ${i + 1}`;
        const trackDiv = document.createElement('div');
        trackDiv.className = 'track-control';
        trackDiv.innerHTML = `
          <div class="track-name-section">
            <label>
              <input type="checkbox" data-track="${i}" checked>
              <strong>${name}</strong> (${track.instrument.name})
            </label>
          </div>
          <div class="track-volume-section">
            <label>
              Volume: <span id="volLabel${i}">0</span> dB
              <input type="range" data-volume-track="${i}" min="-60" max="6" value="0">
            </label>
          </div>
        `;
        trackList.appendChild(trackDiv);
      });

      const loopStartSlider = document.getElementById("loopStartSlider");
      const loopEndSlider = document.getElementById("loopEndSlider");
      const durationEffective = midiDuration / playbackRate;

      loopStartSlider.max = durationEffective;
      loopEndSlider.max = durationEffective;
      loopEndSlider.value = durationEffective;

      loopStartTime = 0;
      loopEndTime = durationEffective;
      document.getElementById("loopStartValue").textContent = loopStartTime.toFixed(2);
      document.getElementById("loopEndValue").textContent = loopEndTime.toFixed(2);

      document.getElementById("progress").style.width = "0%";
      clearInterval(progressInterval);

      updateLoopMarkers();
      document.getElementById("status").textContent = `${fileName} carregado com sucesso!`;
    } catch (err) {
      console.error("Erro ao processar MIDI:", err);
      document.getElementById("status").textContent = "Erro ao processar arquivo MIDI";
    }
  }

  // Event listeners
  document.getElementById("sliderSpeed").addEventListener("input", e => {
    playbackRate = parseInt(e.target.value) / 100;
    document.getElementById("speedValue").textContent = Math.round(playbackRate * 100);
    
    if (midiData) {
        const newDurationEffective = midiDuration / playbackRate;
        document.getElementById("loopStartSlider").max = newDurationEffective;
        document.getElementById("loopEndSlider").max = newDurationEffective;
        
        if (loopEndTime > newDurationEffective) {
            loopEndTime = newDurationEffective;
            document.getElementById("loopEndSlider").value = loopEndTime;
            document.getElementById("loopEndValue").textContent = loopEndTime.toFixed(2);
        }
        if (loopStartTime > loopEndTime) {
            loopStartTime = loopEndTime;
            document.getElementById("loopStartSlider").value = loopStartTime;
            document.getElementById("loopStartValue").textContent = loopStartTime.toFixed(2);
        }
    }
    
    if (isPlaying) {
      restartPlayback();
    }
    updateLoopMarkers();
  });

  document.getElementById("sliderTranspose").addEventListener("input", e => {
    transpose = parseInt(e.target.value);
    document.getElementById("transposeValue").textContent = transpose;
    
    if (isPlaying) {
      restartPlayback();
    }
  });

  document.getElementById("midiFile").addEventListener("change", async (e) => {
    document.getElementById("status").textContent = "Carregando...";
    try {
      const arrayBuffer = await e.target.files[0].arrayBuffer();
      processMidiFile(arrayBuffer, e.target.files[0].name);
      
      // Remove a seleção da lista de MIDIs se houver
      if (selectedMidiItem) {
        selectedMidiItem.classList.remove('active');
        selectedMidiItem = null;
      }
    } catch (err) {
      console.error("Erro ao carregar MIDI:", err);
      document.getElementById("status").textContent = "Erro ao carregar arquivo MIDI";
    }
  });

  document.addEventListener("input", e => {
    if (e.target.matches('input[data-volume-track]')) {
      const index = parseInt(e.target.dataset.volumeTrack);
      const db = parseInt(e.target.value);
      if (volumeNodes[index]) {
        volumeNodes[index].volume.value = db;
      }
      document.getElementById(`volLabel${index}`).textContent = db;
    } else if (e.target.id === "loopStartSlider") {
        loopStartTime = parseFloat(e.target.value);
        document.getElementById("loopStartValue").textContent = loopStartTime.toFixed(2);
        if (loopEndTime < loopStartTime) {
            loopEndTime = loopStartTime;
            document.getElementById("loopEndSlider").value = loopEndTime;
            document.getElementById("loopEndValue").textContent = loopEndTime.toFixed(2);
        }
        if (isPlaying) {
            restartPlayback();
        }
        updateLoopMarkers();
    } else if (e.target.id === "loopEndSlider") {
        loopEndTime = parseFloat(e.target.value);
        document.getElementById("loopEndValue").textContent = loopEndTime.toFixed(2);
        if (loopStartTime > loopEndTime) {
            loopStartTime = loopEndTime;
            document.getElementById("loopStartSlider").value = loopStartTime;
            document.getElementById("loopStartValue").textContent = loopStartTime.toFixed(2);
        }
        if (isPlaying) {
            restartPlayback();
        }
        updateLoopMarkers();
    }
  });

  document.getElementById("loopToggle").addEventListener("change", (e) => {
      const loopControls = document.getElementById("loopControls");
      loopControls.style.display = e.target.checked ? "block" : "none";
      updateLoopMarkers();
      if (isPlaying) {
          restartPlayback();
      }
  });

  document.getElementById("btnPlay").addEventListener("click", async () => {
    if (!midiData) {
      document.getElementById("status").textContent = "Carregue um MIDI.";
      return;
    }

    try {
      await Tone.start();
      scheduleTracks();
      Tone.Transport.start();
      isPlaying = true;
      document.getElementById("status").textContent = "Tocando...";

      clearInterval(progressInterval);
      progressInterval = setInterval(updateProgressBar, 50);
    } catch (err) {
      console.error("Erro ao iniciar reprodução:", err);
      document.getElementById("status").textContent = "Erro ao iniciar reprodução";
    }
  });

  document.getElementById("btnPause").addEventListener("click", () => {
    if (Tone.Transport.state === "started") {
      Tone.Transport.pause();
      clearInterval(progressInterval);
      document.getElementById("status").textContent = "Pausado";
    } else {
      Tone.Transport.start();
      progressInterval = setInterval(updateProgressBar, 50);
      document.getElementById("status").textContent = "Tocando...";
    }
  });

  document.getElementById("btnStop").addEventListener("click", () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    clearInterval(progressInterval);
    document.getElementById("progress").style.width = "0%";
    document.getElementById("progressIndicator").style.left = "0%";
    document.getElementById("status").textContent = "Parado";
    isPlaying = false;
    updateLoopMarkers();
  });

  document.getElementById("progressBar").addEventListener("click", (e) => {
    if (!midiData) return;

    const progressBar = e.currentTarget;
    const clickX = e.clientX - progressBar.getBoundingClientRect().left;
    const progressBarWidth = progressBar.offsetWidth;
    const clickPercent = clickX / progressBarWidth;
    
    const newPosition = (midiDuration / playbackRate) * clickPercent;

    Tone.Transport.seconds = newPosition;
    document.getElementById("progress").style.width = `${clickPercent * 100}%`;
    document.getElementById("progressIndicator").style.left = `${clickPercent * 100}%`;

    if (!isPlaying && Tone.Transport.state !== "started") {
        document.getElementById("status").textContent = `Posição ajustada para ${newPosition.toFixed(2)}s. Pressione Tocar para iniciar.`;
    }
  });

  // Event listeners para a lista de MIDIs
  document.getElementById("btnRefreshList").addEventListener("click", loadMidiList);
  document.getElementById("midiSearch").addEventListener("input", filterMidiList);

  // Carrega a lista quando a página é aberta
  window.addEventListener('DOMContentLoaded', () => {
    loadMidiList();
    
    // Adiciona listener para tecla Enter na busca
    document.getElementById("midiSearch").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        filterMidiList();
      }
    });
  });
