let currentNumber = 1;
const numbers = document.querySelectorAll('.number');
let tempo = 60;
let volume = 0.5;
let intervalId;
let currentImageSet = 1; // Nível inicial
let currentExercise = 1; // Exercício inicial

// Define as combinações de imagens para os exercícios
const imageCombinations = {
    1: [1, 1, 1, 1], // Exercício 1: 1111
    2: [2, 2, 2, 2], // Exercício 2: 2222
    3: [1, 1, 1, 2], // Exercício 3: 1112
    4: [2, 2, 2, 1], // Exercício 4: 2221
    5: [1, 1, 2, 1], // Exercício 5: 1121
    6: [2, 2, 1, 2], // Exercício 6: 2122
    7: [1, 2, 1, 1], // Exercício 7: 1211
    8: [2, 1, 2, 2], // Exercício 8: 1212
    9: [2, 1, 1, 1], // Exercício 9: 2111
    10: [1, 2, 2, 2], // Exercício 10: 1222
    11: [2, 1, 1, 2], // Exercício 11: 2112
    12: [1, 2, 2, 1], // Exercício 12: 1221
    13: [1, 1, 2, 2], // Exercício 13: 1122
    14: [2, 2, 1, 1], // Exercício 14: 2211
    15: [1, 2, 1, 2], // Exercício 15: 1212
    16: [2, 1, 2, 1], // Exercício 16: 2121
};

// Define os conjuntos de imagens para os diferentes níveis
const imageSets = {
    1: { // Nível 1: partes do corpo
        1: 'images/pe.png',  // Pé
        2: 'images/palmas.png' // Palmas
    },
    
    2: { // Nível 2: figuras geomêtricas
        1: 'images/triangulo.png',  // Triângulo
        2: 'images/x.png' // X
    },
    3: { // Nível 3: figuras musicais
        1: 'images/seminima.png',  // Semínima
        2: 'images/pausa_seminima.png' // Pausa semínima
    }
};

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Função para reproduzir o clique
function playClick() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime); // Usando volume atualizado
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
}

// Função para ativar a luz na imagem correspondente
function activateLight(number) {
    numbers.forEach(num => num.querySelector('.image').classList.remove('active'));
    const imageElement = numbers[number - 1].querySelector('.image');
    
    // Seleciona a imagem correta com base no conjunto e no exercício atual
    const selectedImage = imageSets[currentImageSet][imageCombinations[currentExercise][number - 1]];
    
    // Atualiza a imagem com o caminho correto
    imageElement.src = selectedImage;
    imageElement.classList.add('active');
}

// Atualiza a imagem de acordo com o número atual
function updateNumber() {
    activateLight(currentNumber);
    playClick(); // Reproduz o som com o volume atualizado
    currentNumber = (currentNumber % 4) + 1;
}

// Atualizar volume dinamicamente com o controle de volume
document.getElementById('volume').addEventListener('input', (event) => {
    volume = event.target.value; // Atualizando o valor do volume
});

// Atualizar o exercício selecionado
document.getElementById('exerciseSelector').addEventListener('change', (event) => {
    currentExercise = parseInt(event.target.value); // Alterando o exercício selecionado
    currentNumber = 1; // Reiniciar a numeração para o novo exercício
});

// Atualizar o nível selecionado
document.getElementById('levelSelector').addEventListener('change', (event) => {
    currentImageSet = parseInt(event.target.value); // Atualiza o nível atual
    currentNumber = 1; // Reiniciar a numeração para o novo nível
});

// Atualizar tempo dinamicamente com o controle de rolamento
const tempoInput = document.getElementById('tempo');
const tempoValueDisplay = document.getElementById('tempoValue');

tempoInput.addEventListener('input', (event) => {
    tempo = event.target.value; // Atualiza o valor do tempo conforme o controle de rolamento
    tempoValueDisplay.textContent = tempo; // Atualiza o display do tempo (BPM)
    if (intervalId) {
        clearInterval(intervalId); // Limpa o intervalo atual
        intervalId = setInterval(updateNumber, 60000 / tempo); // Reinicia o intervalo com o novo tempo
    }
});

// Start button functionality
document.getElementById('startButton').addEventListener('click', () => {
    tempo = tempoInput.value; // Atualizar o tempo
    intervalId = setInterval(updateNumber, 60000 / tempo);
    document.getElementById('startButton').disabled = true;
    document.getElementById('stopButton').disabled = false;
});

// Stop button functionality
document.getElementById('stopButton').addEventListener('click', () => {
    clearInterval(intervalId);
    document.getElementById('stopButton').disabled = true;
    document.getElementById('startButton').disabled = false;
});

// Função para detectar o gamepad (controle do PS4)
function detectGamepad() {
    const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
        const gamepad = gamepads[0];
        console.log('Controle detectado: ', gamepad);

        // Verifica se o botão X está pressionado (botão 0 no PS4)
        if (gamepad.buttons[0].pressed) {
            console.log('Botão X pressionado');
            // Exemplo de ação para o botão X
            currentNumber = (currentNumber % 4) + 1;
            activateLight(currentNumber);
            playClick();
        }

        // Outras interações podem ser mapeadas aqui
    }
}

// Atualiza o status do gamepad a cada frame
function updateGamepadStatus() {
    detectGamepad();
    requestAnimationFrame(updateGamepadStatus);  // Continuar chamando
}

// Inicia a verificação do gamepad
updateGamepadStatus();

// Detecção de teclas no teclado
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        // Ação para subir
        currentNumber = (currentNumber % 4) + 1;
        activateLight(currentNumber);
        playClick();
    } else if (event.key === 'ArrowDown') {
        // Ação para descer
        currentNumber = (currentNumber % 4) + 1;
        activateLight(currentNumber);
        playClick();
    } else if (event.key === 'Enter') {
        // Ação para iniciar
        currentNumber = 1;
        activateLight(currentNumber);
        playClick();
    }
});

// Iniciar a verificação de gamepad e teclas no navegador
updateGamepadStatus();
