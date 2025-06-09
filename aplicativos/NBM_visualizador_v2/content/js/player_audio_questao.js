let currentAudio = null; // Controla o áudio atual
let audioContext = null; // Contexto de áudio

// Configura os botões de áudio
// Função essencial para configurar os botões de áudio
function configureAudioButtons() {
    const audioButtons = document.querySelectorAll('.audio-btn');
    
    audioButtons.forEach(button => {
        button.addEventListener('click', function() {
            const audioFile = this.getAttribute('data-audio');
            if (audioFile) {
                try {
                    const audio = new Audio(audioFile);
                    audio.play().catch(error => {
                        console.error('Erro ao reproduzir áudio:', error);
                    });
                } catch (e) {
                    console.error('Erro ao criar objeto de áudio:', e);
                }
            }
        });
    });
}

// Versão alternativa mais robusta
window.audioPlayer = {
    init: function() {
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('audio-btn')) {
                const audioSrc = e.target.dataset.audio;
                if (audioSrc) {
                    const audio = new Audio(audioSrc);
                    audio.play().catch(err => {
                        console.error('Falha na reprodução:', err);
                    });
                }
            }
        });
    }
};


// Inicializa automaticamente quando o script carrega
window.audioPlayer.init();

// Handler para o clique nos botões de áudio
async function handleAudioButtonClick() {
    const audioPath = this.getAttribute('data-audio-path');
    
    try {
        // Se já está tocando, para a reprodução
        if (this.classList.contains('playing')) {
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                currentAudio = null;
            }
            this.textContent = "Tocar";
            this.classList.remove('playing');
            return;
        }

        // Para qualquer áudio que esteja tocando atualmente
        stopAllAudio();

        // Inicializa o contexto de áudio se necessário
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Cria um novo elemento de áudio
        currentAudio = new Audio(audioPath);
        
        // Configura os eventos
        currentAudio.onended = () => {
            this.textContent = "Tocar";
            this.classList.remove('playing');
            currentAudio = null;
        };

        currentAudio.onerror = (error) => {
            console.error("Erro no áudio:", error);
            this.textContent = "Erro - Tocar";
            this.classList.remove('playing');
            currentAudio = null;
        };

        // Inicia a reprodução
        await currentAudio.play();
        this.textContent = "Parar";
        this.classList.add('playing');

    } catch (error) {
        console.error("Erro ao tocar áudio:", error);
        this.textContent = "Erro - Tocar";
        this.classList.remove('playing');
        currentAudio = null;
    }
}

// Para todos os áudios em reprodução
function stopAllAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    document.querySelectorAll('.playAudioButton.playing').forEach(button => {
        button.textContent = "Tocar";
        button.classList.remove('playing');
    });
}

// Exporta as funções para uso global
window.configureAudioButtons = configureAudioButtons;
window.stopAllAudio = stopAllAudio;
