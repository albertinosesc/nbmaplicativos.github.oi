   // Objetos globais necessários
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
                
                let tempoEntreNotas = 0.50; // segundos
                notas.forEach((nota, index) => {
                    let timeoutId = setTimeout(() => {
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
                button.addEventListener('click', async function() {
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

        // Função para registrar blocos de texto
        function registerTextBlock({ id, content }) {
            registeredTexts[id] = content;
            
            const container = document.getElementById('music-container');
            if (container) {
                const contentDiv = document.createElement('div');
                contentDiv.id = id;
                contentDiv.className = 'text-section';
                contentDiv.innerHTML = content;
                container.appendChild(contentDiv);
                
                // Configura botões play se existirem
                if (contentDiv.querySelector('.playButton')) {
                    configurarBotoesPlay();
                }
            }
            
            if (window.location.hash === `#${id}`) {
                showText(id);
            }
        }
        
        // Função para exibir um texto específico
        function showText(textId) {
            const container = document.getElementById('music-container');
            if (registeredTexts[textId]) {
                container.innerHTML = registeredTexts[textId];
                // Configura botões play após carregar o conteúdo
                if (container.querySelector('.playButton')) {
                    configurarBotoesPlay();
                }
            } else {
                container.innerHTML = `<p>Texto não encontrado: ${textId}</p>`;
            }
        }
        
        // Verifica o hash ao carregar a página
        window.addEventListener('DOMContentLoaded', () => {
            if (window.location.hash) {
                const textId = window.location.hash.substring(1);
                if (registeredTexts[textId]) {
                    showText(textId);
                } else {
                    loadTextScript(textId);
                }
            }
        });
        
        // Função para carregar um script de texto específico
        function loadTextScript(textId) {
            const script = document.createElement('script');
            script.src = `../../text/${textId}.js`;
            document.body.appendChild(script);
        }