// =============================================
// CONFIGURAÇÕES GLOBAIS (modificado para carregamento dinâmico)
// =============================================
const globalRenderParams = { selectTypes: false };
const globalSynthOptions = {};
const musicControllers = {};

// =============================================
// FUNÇÕES DE CRIAÇÃO DE ELEMENTOS (mesmo do original)
// =============================================
function createMusicSection(song) {
  const section = document.createElement('section');
  section.id = song.id;
  section.className = 'input';
  
  section.innerHTML = `
    <fieldset>
      <legend>Parâmetros: ${song.title}</legend>
      <label>Visual:
        <input class="visual-transpose" type="number" min="-24" max="24" step="1" value="0">
      </label>
      <label>Audio:
        <input class="audio-transpose" type="number" min="-24" max="24" step="1" value="0">
      </label>
      <label>BPM:
        <input class="bpm-value" type="number" min="40" max="240" step="1" value="120">
      </label>
      <div class="espaco-maior"></div>
      <div class="playback-controls">
        <button class="play-chords">Play Chords</button>
        <button class="play-melodies">Play Melodies</button>
        <button class="play-harmony">Play Harmony</button>
        <button class="play-melody">Play Melody</button>
        <button class="play-all">Play All</button>
        <button class="stop-audio" style="display:none;">Stop Audio</button>
      </div>
      <div class="espaco-maior"></div>
      <div id="${song.id}-audio"></div>
      <div class='audio-error' style="display:none;">Audio is not supported in this browser.</div>
    </fieldset>
  `;
  
  const outputSection = document.createElement('section');
  outputSection.className = 'output';
  outputSection.innerHTML = `<div id="${song.id}-paper" class="visible-background"></div>`;
  
  return { inputSection: section, outputSection };
}

/// =============================================
// CONTROLADOR DE MÚSICA (ABCJS + Synth)
// =============================================
class MusicController {
  constructor(musicId, baseAbc) {
    this.musicId = musicId;
    this.baseAbc = baseAbc;
    this.synthControl = null;
    this.visualObj = null;
    this.synth = null;
    this.midiBuffer = null;
    this.currentRenderParams = { ...globalRenderParams };
    this.currentSynthOptions = { ...globalSynthOptions };
    this.currentPlayOptions = {}; // Armazena as opções de reprodução atuais
    
    this.initElements();
    this.setupEventListeners();
    this.render();
  }
  
  initElements() {
    this.visualTransposeEl = document.querySelector(`#${this.musicId} .visual-transpose`);
    this.audioTransposeEl = document.querySelector(`#${this.musicId} .audio-transpose`);
    this.bpmInput = document.querySelector(`#${this.musicId} .bpm-value`);
    this.playChordsButton = document.querySelector(`#${this.musicId} .play-chords`);
    this.playMelodiesButton = document.querySelector(`#${this.musicId} .play-melodies`);
    this.playHarmonyButton = document.querySelector(`#${this.musicId} .play-harmony`);
    this.playMelodyButton = document.querySelector(`#${this.musicId} .play-melody`);
    this.playAllButton = document.querySelector(`#${this.musicId} .play-all`);
    this.stopAudioButton = document.querySelector(`#${this.musicId} .stop-audio`);
    this.audioError = document.querySelector(`#${this.musicId} .audio-error`);
  }
  
  setupEventListeners() {
    const handleChange = () => this.paramChanged();
    
    if (this.visualTransposeEl) this.visualTransposeEl.addEventListener("change", handleChange);
    if (this.audioTransposeEl) this.audioTransposeEl.addEventListener("change", handleChange);
    if (this.bpmInput) this.bpmInput.addEventListener("change", handleChange);
    
    // Playback controls
    if (this.playChordsButton) {
      this.playChordsButton.addEventListener("click", () => {
        this.currentPlayOptions = {voicesOff: true};
        this.play(this.currentPlayOptions);
      });
    }
    if (this.playMelodiesButton) {
      this.playMelodiesButton.addEventListener("click", () => {
        this.currentPlayOptions = {chordsOff: true};
        this.play(this.currentPlayOptions);
      });
    }
    if (this.playHarmonyButton) {
      this.playHarmonyButton.addEventListener("click", () => {
        this.currentPlayOptions = {chordsOff: true, voicesOff: [1]};
        this.play(this.currentPlayOptions);
      });
    }
    if (this.playMelodyButton) {
      this.playMelodyButton.addEventListener("click", () => {
        this.currentPlayOptions = {chordsOff: true, voicesOff: [0]};
        this.play(this.currentPlayOptions);
      });
    }
    if (this.playAllButton) {
      this.playAllButton.addEventListener("click", () => {
        this.currentPlayOptions = {};
        this.play(this.currentPlayOptions);
      });
    }
    if (this.stopAudioButton) {
      this.stopAudioButton.addEventListener("click", () => this.stopAudio());
    }
  }
  
  paramChanged() {
    this.currentRenderParams.visualTranspose = parseInt(this.visualTransposeEl.value) || 0;
    this.currentSynthOptions.midiTranspose = parseInt(this.audioTransposeEl.value) || 0;
    
    // Se estiver tocando, reinicia a reprodução com as novas configurações
    if (this.midiBuffer) {
      this.stopAudio();
      this.play(this.currentPlayOptions);
    } else {
      this.render();
    }
  }
  
  prepareAbc() {
    const bpm = parseInt(this.bpmInput.value) || 120;
    const bpmTag = `Q:1/4=${bpm}`;
    
    let abcContent = this.baseAbc.trim();
    
    if (!abcContent.startsWith('X:')) {
      abcContent = 'X:1\n' + abcContent;
    }
    
    if (abcContent.includes("Q:")) {
      return abcContent.replace(/Q:[^\n]*/, bpmTag);
    } else {
      const keyIndex = abcContent.indexOf("K:");
      if (keyIndex !== -1) {
        return abcContent.substring(0, keyIndex) + bpmTag + '\n' + abcContent.substring(keyIndex);
      }
      return abcContent + '\n' + bpmTag;
    }
  }
  
  render() {
    const abcWithParams = this.prepareAbc();
    const paperElement = document.getElementById(`${this.musicId}-paper`);
    
    if (paperElement) {
      this.visualObj = ABCJS.renderAbc(paperElement, abcWithParams, this.currentRenderParams)[0];
    }
    
    this.setupAudio();
  }
  
  setupAudio() {
    if (!ABCJS.synth.supportsAudio()) {
      console.warn("Audio not supported");
      return;
    }
  
    const audioDivId = `${this.musicId}-audio`;
    const audioDiv = document.getElementById(audioDivId);
  
    if (audioDiv) audioDiv.innerHTML = '';
  
    this.synth = new ABCJS.synth.CreateSynth();
    this.synthControl = new ABCJS.synth.SynthController();
  
    this.synthControl.load(`#${audioDivId}`, null, {
      displayLoop: true,
      displayRestart: true,
      displayPlay: true,
      displayProgress: true,
      displayWarp: true
    });
  
    this.synth.init({
      visualObj: this.visualObj,
      options: this.currentSynthOptions
    }).then(() => {
      return this.synthControl.setTune(this.visualObj, false, this.currentSynthOptions);
    }).catch(error => {
      console.error("Error initializing synth:", error);
    });
  }
  
  play(options) {
    this.togglePlayButtons(false);
    
    if (ABCJS.synth.supportsAudio()) {
      window.AudioContext = window.AudioContext ||
        window.webkitAudioContext ||
        navigator.mozAudioContext ||
        navigator.msAudioContext;
      
      const audioContext = new window.AudioContext();
      audioContext.resume().then(() => {
        this.midiBuffer = new ABCJS.synth.CreateSynth();
        
        // Combina as opções de reprodução com as opções de transposição
        const playOptions = {
          ...options,
          midiTranspose: this.currentSynthOptions.midiTranspose || 0
        };
        
        return this.midiBuffer.init({
          visualObj: this.visualObj,
          audioContext: audioContext,
          millisecondsPerMeasure: this.visualObj.millisecondsPerMeasure(),
          options: playOptions
        }).then(() => {
          return this.midiBuffer.prime();
        }).then(() => {
          return this.midiBuffer.start();
        }).catch(error => {
          if (error.status === "NotSupported") {
            this.togglePlayButtons(true);
            if (this.audioError) this.audioError.style.display = '';
          } else {
            console.warn("synth error", error);
          }
        });
      });
    } else {
      if (this.audioError) this.audioError.style.display = '';
    }
  }
  
  stopAudio() {
    this.togglePlayButtons(true);
    
    if (this.midiBuffer) {
      this.midiBuffer.stop();
      this.midiBuffer = null;
    }
  }
  
  togglePlayButtons(show) {
    const buttons = [
      this.playChordsButton, 
      this.playMelodiesButton, 
      this.playHarmonyButton,
      this.playMelodyButton, 
      this.playAllButton
    ];
    
    buttons.forEach(btn => {
      if (btn) btn.style.display = show ? '' : 'none';
    });
    
    if (this.stopAudioButton) this.stopAudioButton.style.display = show ? 'none' : '';
  }
}

// =============================================
// INICIALIZAÇÃO DA PÁGINA
// =============================================
function initializePage() {
  const container = document.getElementById('music-container');
  if (!container) return;

  elementsToRender.forEach(element => {
    try {
      if (element.type === 'song') {
        const { inputSection, outputSection } = createMusicSection(element.data);
        container.appendChild(inputSection);
        container.appendChild(outputSection);
        musicControllers[element.data.id] = new MusicController(element.data.id, element.data.abc);
      } else if (element.type === 'text') {
        addTextBlock(element.data.content);
      }
    } catch (error) {
      console.error(`Error rendering element ${element.data.id}:`, error);
    }
  });
}


document.addEventListener('DOMContentLoaded', initializePage);

let currentSynth = null; // Synth atual
  let arpejoTimeouts = []; // Guardar os timeouts
  let currentButton = null; // Botão atualmente tocando

  // Função para tocar as notas em arpejo
  async function tocarArpejo(notas) {
    await Tone.start(); // Libera o áudio
    currentSynth = new Tone.PolySynth(Tone.Synth).toDestination();
    
    let tempoEntreNotas = 0.50; // segundos
    let agora = Tone.now();

    notas.forEach((nota, index) => {
      let timeoutId = setTimeout(() => {
        currentSynth.triggerAttackRelease(nota, "8n");
      }, index * tempoEntreNotas * 1000);
      arpejoTimeouts.push(timeoutId);
    });
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

  // Controla os botões - adicionado após o carregamento do DOM
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.playButton').forEach(button => {
      button.addEventListener('click', async () => {
        const notas = button.parentElement.getAttribute('data-notas').split(' ');

        if (currentButton && currentButton !== button) {
          // Se clicar em outro botão, para o anterior
          pararArpejo();
          currentButton.textContent = "Tocar";
          currentButton.classList.remove('playing');
          currentButton = null;
        }

        if (currentButton === button) {
          // Se clicar no mesmo botão, para
          pararArpejo();
          button.textContent = "Tocar";
          button.classList.remove('playing');
          currentButton = null;
        } else {
          // Se não estiver tocando, toca
          await tocarArpejo(notas);
          button.textContent = "Parar";
          button.classList.add('playing');
          currentButton = button;
        }
      });
    });
  });

// Exporta funções para serem usadas no HTML
window.createMusicSection = createMusicSection;
window.MusicController = MusicController;
window.musicControllers = musicControllers;