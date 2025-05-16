


// text.js
document.addEventListener('DOMContentLoaded', function () {
    const musicContainer = document.getElementById('music-container');

    // Criar seções de textos
    textData.forEach(item => {
        const textSection = document.createElement('div');
        textSection.id = item.id;
        textSection.className = 'text-section';

        const title = document.createElement('h3');
        title.textContent = item.title;
        textSection.appendChild(title);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'text-content';
        contentDiv.id = item.id + '-content';
        textSection.appendChild(contentDiv);

        musicContainer.appendChild(textSection);

        // Pega o conteúdo do texto registrado
        const content = registeredTexts[item.id];
        if (content) {
            contentDiv.innerHTML = content;
        } else {
            contentDiv.textContent = 'Conteúdo não disponível.';
            console.error('Texto não encontrado:', item.id);
        }
    });

    // Rolar até item com hash
    function scrollToTarget() {
        if (window.location.hash) {
            const targetId = window.location.hash.substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                setTimeout(() => {
                    window.scrollTo({
                        top: target.offsetTop - 20,
                        behavior: 'smooth'
                    });
                }, 300);
            }
        }
    }

    scrollToTarget();
    setTimeout(scrollToTarget, 500);
});


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