
  let midiData = null;
  let scheduled = [];
  let samplers = {};
  let volumeNodes = {};
  let progressInterval = null;
  let transpose = 0;
  let playbackRate = 1;
  let isPlaying = false;
  let loopStartTime = 0; 
  let loopEndTime = 0;   
  let midiDuration = 0;
  let selectedMidiItem = null;

  // Lista de MIDIs pré-definidos - ADICIONE SEUS PRÓPRIOS ARQUIVOS AQUI


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
      baseUrl: "sons/bateria/",
      release: 0.2,
    });

    const vol = new Tone.Volume(0).toDestination();
    sampler.connect(vol);

    samplers[index] = sampler;
    volumeNodes[index] = vol;

    return sampler;
  }

  function loadSampler(track, index) {
    if (samplers[index]) return samplers[index];

    const urls = {};
    track.notes.forEach(note => {
      const noteName = note.name.replace("#", "s");
      urls[note.name] = `${noteName}.mp3`;
    });

    const baseFolder = track.name?.toLowerCase().includes("guitar") ? "guitarra"
                      : track.name?.toLowerCase().includes("bass") ? "baixo"
                      : "piano";

    const sampler = new Tone.Sampler({
      urls,
      baseUrl: `sons/${baseFolder}/`,
      release: 1,
    });

    const vol = new Tone.Volume(0).toDestination();
    sampler.connect(vol);

    samplers[index] = sampler;
    volumeNodes[index] = vol;

    return sampler;
  }

  function getTransposedNote(note, semitones) {
    if (semitones === 0) return note;
    
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    let [name, octave] = note.split(/(\d+)/);
    octave = parseInt(octave);
    
    let index = noteNames.indexOf(name);
    if (index === -1) return note;
    
    index += semitones;
    
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
    if (!isPlaying) return;
    
    const wasPlaying = Tone.Transport.state === "started";
    const position = Tone.Transport.seconds;
    
    Tone.Transport.cancel();
    clearInterval(progressInterval);
    scheduleTracks();
    Tone.Transport.seconds = position;
    
    if (wasPlaying) {
      Tone.Transport.start();
      progressInterval = setInterval(updateProgressBar, 50);
    }
  }

  function scheduleTracks() {
    scheduled.forEach(id => Tone.Transport.clear(id));
    scheduled = [];

    const selectedTracks = Array.from(
      document.querySelectorAll('#trackList input[type="checkbox"]:checked')
    ).map(el => parseInt(el.dataset.track));

    for (let i of selectedTracks) {
      const track = midiData.tracks[i];
      const sampler = track.channel === 9 ? loadDrumSampler(i) : loadSampler(track, i);

      track.notes.forEach(note => {
        const id = Tone.Transport.schedule(time => {
          try {
            let noteName;
            if (track.channel === 9) {
              noteName = getDrumNoteName(note.midi);
            } else {
              noteName = transpose !== 0 ? getTransposedNote(note.name, transpose) : note.name;
            }
            sampler.triggerAttackRelease(noteName, note.duration, time, note.velocity);
          } catch (err) {
            console.warn("Erro ao tocar nota:", err);
          }
        }, note.time / playbackRate);
        scheduled.push(id);
      });
    }

    const loopToggle = document.getElementById("loopToggle");
    Tone.Transport.loop = loopToggle.checked;
    if (loopToggle.checked) {
        Tone.Transport.loopStart = loopStartTime;
        Tone.Transport.loopEnd = loopEndTime;
    } else {
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

  document.getElementById("progress").style.width = Math.min(percent, 100) + "%";
  
  const indicator = document.getElementById("progressIndicator");
  indicator.style.left = `${Math.min(percent, 100)}%`;

  if (currentSeconds >= totalDuration && !Tone.Transport.loop) {
      clearInterval(progressInterval);
      document.getElementById("status").textContent = "Reprodução concluída. Clique em Tocar para reiniciar.";
      isPlaying = false;
      // Reseta a posição de reprodução para o início
      Tone.Transport.seconds = 0;
      // Para o transporte (equivalente a clicar em Stop)
      Tone.Transport.stop();
      Tone.Transport.cancel();
  }
}

document.getElementById("btnPlay").addEventListener("click", async () => {
  if (!midiData) {
    document.getElementById("status").textContent = "Carregue um MIDI.";
    return;
  }

  try {
    await Tone.start();
    
    // Se o transporte já tiver terminado, reinicia do início
    if (Tone.Transport.state === "stopped") {
      Tone.Transport.seconds = 0;
      scheduleTracks();
    }
    
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

  function updateLoopMarkers() {
    const loopStartMarker = document.getElementById("loopStartMarker");
    const loopEndMarker = document.getElementById("loopEndMarker");
    const loopRange = document.getElementById("loopRange");

    if (!midiData) {
        loopStartMarker.style.display = "none";
        loopEndMarker.style.display = "none";
        loopRange.style.display = "none";
        return;
    }

    const durationEffective = midiDuration / playbackRate;
    if (durationEffective === 0) return;

    const loopToggle = document.getElementById("loopToggle");
    if (loopToggle.checked) {
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
        loopStartMarker.style.display = "none";
        loopEndMarker.style.display = "none";
        loopRange.style.display = "none";
    }
  }

  // Funções para a lista de MIDIs
  function loadMidiList() {
    document.getElementById("status").textContent = "Carregando lista de MIDIs...";
    const midiListContainer = document.getElementById("midiListContainer");
    midiListContainer.innerHTML = '';
    
    if (availableMidis.length === 0) {
      midiListContainer.innerHTML = '<div class="midi-list-item">Nenhum arquivo MIDI encontrado</div>';
      document.getElementById("status").textContent = "Nenhum MIDI disponível";
      return;
    }
    
    availableMidis.forEach(midi => {
      const item = document.createElement('div');
      item.className = 'midi-list-item';
      item.textContent = midi.name;
      item.dataset.path = midi.path;
      
      item.addEventListener('click', () => {
        // Remove a seleção anterior
        if (selectedMidiItem) {
          selectedMidiItem.classList.remove('active');
        }
        
        // Adiciona seleção ao item clicado
        item.classList.add('active');
        selectedMidiItem = item;
        
        // Carrega o MIDI imediatamente
        loadMidiFile(midi.path, midi.name);
      });
      
      midiListContainer.appendChild(item);
    });
    
    document.getElementById("status").textContent = "Clique em um MIDI para carregar";
  }

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
