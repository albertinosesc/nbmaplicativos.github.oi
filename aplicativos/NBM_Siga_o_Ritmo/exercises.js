export let currentNumber = 1;
export const numbers = document.querySelectorAll('.number');
export const imageSets = {
    1: {
        1: 'images/palmas.png',
        2: 'images/pe.png',
        3: 'images/palmas.png',
        4: 'images/pe.png'
    },
    2: {
        1: 'images/pe.png',
        2: 'images/pe.png',
        3: 'images/palmas.png',
        4: 'images/palmas.png'
    }
};
export let currentImageSet = 1;
let intervalId;

export const startButton = document.getElementById('startButton');
export const stopButton = document.getElementById('stopButton');
export const exerciseSelectorElement = document.getElementById('exerciseSelector');

let tempo = 60; // Default tempo
let volume = 0.5; // Default volume

// Create audio context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Metronome click sound
function playClick() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime); // Frequency of the click
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime); // Set volume

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05); // Duration of the click
}

function activateLight(number) {
    numbers.forEach(num => {
        num.querySelector('.image').classList.remove('active');
    });
    const currentNumberElement = Array.from(numbers).find(el => el.dataset.index == number);
    const imageElement = currentNumberElement.querySelector('.image');
    imageElement.src = imageSets[currentImageSet][number];
    imageElement.classList.add('active');
}

function updateNumber() {
    activateLight(currentNumber);
    playClick(); // Play metronome click
    currentNumber = (currentNumber % 4) + 1;
}

export function startGame() {
    const interval = 60000 / tempo; // Interval in milliseconds
    intervalId = setInterval(updateNumber, interval);
    startButton.disabled = true;
    stopButton.disabled = false;
    console.log('Start button disabled:', startButton.disabled);
    console.log('Stop button disabled:', stopButton.disabled);
}

export function stopGame() {
    clearInterval(intervalId);
    startButton.disabled = false;
    stopButton.disabled = true;

    numbers.forEach(num => {
        num.querySelector('.image').classList.remove('active');
    });
    currentNumber = 1;
}

export function exerciseSelector() {
    currentImageSet = parseInt(exerciseSelectorElement.value);
    stopGame();
    numbers.forEach(num => {
        num.querySelector('.image').classList.remove('active');
        num.querySelector('.image').src = 'images/placeholder.png';
    });
}

export function setTempo(newTempo) {
    tempo = newTempo;
    if (intervalId) {
        stopGame();
        startGame();
    }
}

export function setVolume(newVolume) {
    volume = newVolume;
}