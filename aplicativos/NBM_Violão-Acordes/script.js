let currentCardIndex = 0;
let stage = 1;
let repetitions = 1;
let isPaused = false;
let timeoutId;

let cards = [];

function showCard() {
    if (currentCardIndex >= cards.length) {
        currentCardIndex = 0;
        repetitions++;
        if (repetitions > document.getElementById('repeticao').value) {
            document.getElementById('message').textContent = 'Nível finalizado!';
            stage++;
            repetitions = 1;
            document.getElementById('nivel').value = stage;
            document.getElementById('startButton').disabled = false;
            return;
        }
    }

    const card = cards[currentCardIndex];
    document.getElementById('cardImage').src = card.image;
    const cardAudio = document.getElementById('cardAudio');
    cardAudio.src = card.audio;
    document.getElementById('card').style.display = 'block';
    cardAudio.play();

    timeoutId = setTimeout(() => {
        document.getElementById('card').style.display = 'none';
        currentCardIndex++;
        showCard();
    }, document.getElementById('velocidade').value * 1000 / repetitions);
}

document.getElementById('startButton').addEventListener('click', () => {
    document.getElementById('startButton').disabled = true;
    document.getElementById('message').textContent = '';
    cards = window[`nivel${document.getElementById('nivel').value}`];
    showCard();
});

document.getElementById('pauseButton').addEventListener('click', () => {
    const cardAudio = document.getElementById('cardAudio');
    if (isPaused) {
        cardAudio.play();
        timeoutId = setTimeout(() => {
            document.getElementById('card').style.display = 'none';
            currentCardIndex++;
            showCard();
        }, document.getElementById('velocidade').value * 1000 / repetitions);
        isPaused = false;
        document.getElementById('pauseButton').textContent = 'Pausar';
    } else {
        cardAudio.pause();
        clearTimeout(timeoutId);
        isPaused = true;
        document.getElementById('pauseButton').textContent = 'Retomar';
    }
});