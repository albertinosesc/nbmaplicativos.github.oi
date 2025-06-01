//====================
// text1.js
// Atualização: 23-05-05 (integrado com transposição)
//====================

// Objeto global para armazenar textos carregados
const registeredTexts = {};

// Variáveis para controle do play
let currentSynth = null;
let arpejoTimeouts = [];
let currentButton = null;
let audioInicializado = false;

// Função para tocar arpejo
async function tocarArpejo(notas) {
    try {
        if (!audioInicializado) {
            await Tone.start();
            audioInicializado = true;
        }

        currentSynth = new Tone.PolySynth(Tone.Synth).toDestination();
        currentSynth.volume.value = -8;

        const tempoEntreNotas = 0.50; // segundos
        notas.forEach((nota, index) => {
            const timeoutId = setTimeout(() => {
                currentSynth.triggerAttackRelease(nota, "8n");
            }, index * tempoEntreNotas * 1000);
            arpejoTimeouts.push(timeoutId);
        });
    } catch (error) {
        console.error("Erro ao tocar acorde:", error);
    }
}

// Função para parar o arpejo
function pararArpejo() {
    if (currentSynth) {
        currentSynth.releaseAll();
        currentSynth.dispose();
        currentSynth = null;
    }
    arpejoTimeouts.forEach(id => clearTimeout(id));
    arpejoTimeouts = [];
}

// Configura os botões play
function configurarBotoesPlay() {
    document.querySelectorAll('.playButton').forEach(button => {
        button.addEventListener('click', async function () {
            const notas = this.closest('.acorde').getAttribute('data-notas').split(' ');

            if (currentButton && currentButton !== this) {
                pararArpejo();
                currentButton.textContent = "Tocar";
                currentButton.classList.remove('playing');
                currentButton = null;
            }

            if (currentButton === this) {
                pararArpejo();
                this.textContent = "Tocar";
                this.classList.remove('playing');
                currentButton = null;
            } else {
                await tocarArpejo(notas);
                this.textContent = "Parar";
                this.classList.add('playing');
                currentButton = this;
            }
        });
    });
}

// Função para exibir um texto na tela
function showText(textId) {
    const container = document.getElementById('music-container');
    if (registeredTexts[textId]) {
        container.innerHTML = registeredTexts[textId];
        if (container.querySelector('.playButton')) {
            configurarBotoesPlay();
        }
        // Inicializa transposição, se houver controles
        inicializarControleTransposicao();
    } else {
        container.innerHTML = `<p>Texto não encontrado: ${textId}</p>`;
    }
}

// Função para carregar dinamicamente scripts (arquivos .js)
function loadScript(folder, id) {
    const script = document.createElement('script');
    script.src = `../../abordagem/${folder}/${id}.js`;  // Ajustado para usar o parâmetro 'folder' direto
    script.onload = () => {
        console.log(`Script ${id} da pasta ${folder} carregado.`);
        if (registeredTexts[id]) {
            showText(id);
        }
    };
    script.onerror = () => {
        console.error(`Erro ao carregar script: ../../${folder}/${id}.js`);
    };
    document.body.appendChild(script);
}

// Evento executado quando a página termina de carregar
window.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash) {
        const textId = window.location.hash.substring(1);
        if (registeredTexts[textId]) {
            showText(textId);
        } else {
            loadScript('text', textId);
            loadScript('chord', textId);
        }
    }
});

// Função para registrar blocos de texto vindo dos arquivos carregados
function registerAbordagem({ id, content }) {
    registeredTexts[id] = content;
}

