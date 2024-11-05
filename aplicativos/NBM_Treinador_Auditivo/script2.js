let generateCounter = 0;
let keyOneCounter = 0;
let countingMode = false;
let melodyVisible = true;
let currentMelody = [];
let autoGenerateInterval = null;
let currentRepeatCount = 0;
let countingInterval = null;
const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
let score = 0;
let totalQuestions = 20;
let results = {};
const availableNotesInput = document.getElementById('availableNotes');
const noteButtons = document.querySelectorAll('.note-button');
const minOctaveSelect = document.getElementById('minOctave');
const maxOctaveSelect = document.getElementById('maxOctave');
const playbackSpeedInput = document.getElementById('playbackSpeed');
const autoGenerateButton = document.getElementById('autoGenerateButton');
const autoGenerateIntervalInput = document.getElementById('autoGenerateInterval');
const repeatCountInput = document.getElementById('repeatCount');
const initialCountInput = document.getElementById('initialCountInput');

noteButtons.forEach(button => {
    button.addEventListener('click', () => {
        button.classList.toggle('selected');
        updateAvailableNotes();
    });
});

function updateAvailableNotes() {
    const selectedNotes = Array.from(document.querySelectorAll('.note-button.selected'))
        .map(button => button.dataset.note);
    availableNotesInput.value = selectedNotes.join(',');
}

function generateMelody() {
    const noteCount = parseInt(document.getElementById('noteCount').value);
    const availableNotes = availableNotesInput.value.split(',').map(note => note.trim().toUpperCase());
    const minOctave = parseInt(minOctaveSelect.value);
    const maxOctave = parseInt(maxOctaveSelect.value);

    if (availableNotes.length === 0) {
        alert('Por favor, selecione pelo menos uma nota.');
        return;
    }

    if (minOctave > maxOctave) {
        alert('A oitava mínima não pode ser maior que a oitava máxima.');
        return;
    }

    currentMelody = [];
    for (let i = 0; i < noteCount; i++) {
        const randomNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];
        const randomOctave = Math.floor(Math.random() * (maxOctave - minOctave + 1)) + minOctave;
        currentMelody.push(`${randomNote}${randomOctave}`);
    }

    document.getElementById('melody').innerText = currentMelody.join(' - ');

    playMelody(currentMelody);
    currentRepeatCount = 0;

    if (countingMode) {
        generateCounter--;
    } else {
        generateCounter++;
    }
    document.getElementById('generateCounter').innerText = generateCounter;

    updateDifference();
}

function playMelody(melody) {
    const synth = new Tone.Synth().toDestination();
    const now = Tone.now();
    const speed = parseFloat(playbackSpeedInput.value);
    melody.forEach((note, index) => {
        synth.triggerAttackRelease(note, "8n", now + index * (0.5 / speed));
    });
}

function repeatMelody() {
    if (currentMelody.length > 0) {
        playMelody(currentMelody);
    } else {
        alert('Nenhuma melodia foi gerada ainda. Por favor, gere uma melodia primeiro.');
    }
}

function toggleAutoGenerate() {
    if (autoGenerateInterval) {
        clearInterval(autoGenerateInterval);
        autoGenerateInterval = null;
        autoGenerateButton.textContent = "Gerar Nota Automático";
        autoGenerateButton.style.backgroundColor = "#e74c3c";
    } else {
        const interval = parseInt(autoGenerateIntervalInput.value) * 1000;
        autoGenerateInterval = setInterval(autoGenerateStep, interval);
        autoGenerateButton.textContent = "Parar Geração Automática";
        autoGenerateButton.style.backgroundColor = "#27ae60";
    }
}

function autoGenerateStep() {
    const maxRepeats = parseInt(repeatCountInput.value);
    if (maxRepeats === 0 || currentRepeatCount >= maxRepeats) {
        generateMelody();
        currentRepeatCount = 0;
    } else {
        repeatMelody();
        currentRepeatCount++;
    }
}

function toggleMelodyVisibility() {
    const melodyDiv = document.getElementById('melody');
    melodyVisible = !melodyVisible;
    melodyDiv.style.display = melodyVisible ? 'block' : 'none';
    document.getElementById('toggleMelodyButton').innerText = melodyVisible ? 'Ocultar Melodia' : 'Mostrar Melodia';
}

function toggleCountingMode() {
    countingMode = !countingMode;
    document.getElementById('initialCountInput').style.display = countingMode ? 'block' : 'none';
    document.getElementById('countingModeButton').innerText = countingMode ? 'Contagem Crescente' : 'Contagem Decrescente';

    if (countingMode) {
        generateCounter = parseInt(initialCountInput.value) || 0;
        document.getElementById('generateCounter').innerText = generateCounter;
    } else {
        clearInterval(countingInterval);
        document.getElementById('generateCounter').innerText = '0';
    }

    if (!countingMode) {
        countingInterval = setInterval(() => {
            if (generateCounter > 0) {
                generateCounter--;
                document.getElementById('generateCounter').innerText = generateCounter;
                updateDifference();
            } else {
                clearInterval(countingInterval);
            }
        }, 1000);
    }
}

document.getElementById('initialCountInput').addEventListener('input', function() {
    if (countingMode) {
        generateCounter = parseInt(this.value) || 0;
        document.getElementById('generateCounter').innerText = generateCounter;
    }
});

function updateDifference() {
    if (generateCounter > 0) {
        const difference = generateCounter - keyOneCounter;
        const percentageDifference = (difference / generateCounter) * 100;
        document.getElementById('differenceValue').innerText = difference;
        document.getElementById('percentageDifference').innerText = percentageDifference.toFixed(2) + '%';
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        generateMelody();
    } else if (event.key === 'Insert') {
        event.preventDefault();
        repeatMelody();
    } else if (event.key === 'Alt') {
        event.preventDefault();
        toggleMelodyVisibility();
    } else if (event.key === 'End') {
        keyOneCounter++;
        document.getElementById('keyOneCounter').innerText = keyOneCounter;
        updateDifference();
    } else if (event.key === 'Home') {
        event.preventDefault();
        submitAnswer();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.ctrlKey) {
        event.preventDefault();
        resetCounters();
    }
});

function resetCounters() {
    generateCounter = 0;
    keyOneCounter = 0;
    document.getElementById('generateCounter').innerText = generateCounter;
    document.getElementById('keyOneCounter').innerText = keyOneCounter;
    document.getElementById('differenceValue').innerText = 0;
    document.getElementById('percentageDifference').innerText = "0%";
}

const keyToNaturalNote = {
    'r': 'C',
    't': 'D',
    'y': 'E',
    'u': 'F',
    'i': 'G',
    'o': 'A',
    'p': 'B'
};

const keyToSharpNote = {
    'h': 'C#',
    'j': 'D#',
    'k': 'F#',
    'l': 'G#',
    'ç': 'A#'
};

document.addEventListener('keydown', function(event) {
    const naturalNote = keyToNaturalNote[event.key.toLowerCase()];
    const sharpNote = keyToSharpNote[event.key.toLowerCase()];

    if (naturalNote) {
        toggleNoteButton(naturalNote);
    } else if (sharpNote) {
        toggleNoteButton(sharpNote);
    }
});

function toggleNoteButton(note) {
    const button = Array.from(document.querySelectorAll('.note-button')).find(btn => btn.dataset.note === note);
    if (button) {
        button.classList.toggle('selected');
        updateAvailableNotes();
    }
}

function submitAnswer() {
    const userAnswer = document.getElementById("userAnswer").value.toUpperCase().split(',').map(note => note.trim());
    const resultsTable = document.getElementById("resultsTable");
    const row = resultsTable.insertRow();

    row.insertCell(0).innerText = resultsTable.rows.length;
    row.insertCell(1).innerText = currentMelody.join(' - ');
    row.insertCell(2).innerText = userAnswer.join(' - ');
    const isCorrect = userAnswer.join(' - ') === currentMelody.join(' - ');
    row.insertCell(3).innerText = isCorrect ? '✔' : '✘';

    if (!isCorrect) {
        keyOneCounter++;
        document.getElementById('keyOneCounter').innerText = keyOneCounter;
    }
    if (!results[currentMelody]) {
        results[currentMelody] = { correct: 0, total: 0 };
    }
    results[currentMelody].total++;
    if (isCorrect) {
        score++;
        results[currentMelody].correct++;
    }

    document.getElementById("userAnswer").value = "";
    if (resultsTable.rows.length >= totalQuestions) {
        const finalScoreText = `Pontuação Final: ${score} de ${totalQuestions} (${(score / totalQuestions * 100).toFixed(2)}%)`;
        document.getElementById("finalScore").innerText = finalScoreText;
        generateReport();
        disableInputs();
    } else {
        generateMelody();
    }
}

function generateReport() {
    const reportDiv = document.getElementById("report");
    let strongNotes = [];
    let weakNotes = [];

    for (const note of notes) {
        const correctAnswers = results[note] ? results[note].correct : 0;
        const totalAnswers = results[note] ? results[note].total : 0;

        if (totalAnswers > 0) {
            const accuracy = (correctAnswers / totalAnswers) * 100;
            if (accuracy < 50) {
                weakNotes.push(`${note} (${accuracy.toFixed(2)}%)`);
            } else {
                strongNotes.push(`${note} (${accuracy.toFixed(2)}%)`);
            }
        }
    }

    reportDiv.innerHTML = `
        <h2>Relatório de Resultados</h2>
        <h3>Notas Fortes:</h3>
        <p>${strongNotes.length > 0 ? strongNotes.join(', ') : 'Nenhuma nota forte.'}</p>
        <h3>Notas Fracas:</h3>
        <p>${weakNotes.length > 0 ? weakNotes.join(', ') : 'Nenhuma nota fraca.'}</p>
        <h3>Contador:</h3>
        <p>${generateCounter}</p>
        <h3>Erro:</h3>
        <p>${keyOneCounter}</p>
        <h3>Diferença Numérica:</h3>
        <p>${document.getElementById('differenceValue').innerText}</p>
        <h3>Diferença Percentual:</h3>
        <p>${document.getElementById('percentageDifference').innerText}</p>
    `;
    return { strongNotes, weakNotes };
}

function disableInputs() {
    document.querySelector("button[onclick='generateMelody()']").disabled = true;
    document.querySelector("button[onclick='submitAnswer()']").disabled = true;
}

function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year.slice(2)}`;
}

function getFileName() {
    const studentName = document.getElementById("studentName").value || "Aluno";
    const date = formatDate(document.getElementById("date").value) || formatDate(new Date().toISOString().split('T')[0]);

    const nameParts = studentName.split(' ');
    const firstName = nameParts[0];
    const secondName = nameParts[1] || '';

    return `${firstName} ${secondName}_${date}`;
}

function downloadResults() {
    const finalScoreText = `Pontuação Final: ${score} de ${totalQuestions} (${(score / totalQuestions * 100).toFixed(2)}%)`;
    const { strongNotes, weakNotes } = generateReport();

    let resultsText = `Nome do Aluno: ${document.getElementById("studentName").value || "Aluno Desconhecido"}\nData: ${formatDate(document.getElementById("date").value) || formatDate(new Date().toISOString().split('T')[0])}\n\n${finalScoreText}\n\n`;
    resultsText += 'Nº | Notas Apresentadas | Resposta do Participante | Correta (✔) / Incorreta (✘)\n';
    const resultsTable = document.getElementById("resultsTable");

    for (let i = 0; i < resultsTable.rows.length; i++) {
        const row = resultsTable.rows[i];
        resultsText += `${row.cells[0].innerText} | ${row.cells[1].innerText} | ${row.cells[2].innerText} | ${row.cells[3].innerText}\n`;
    }

    resultsText += `\nRelatório de Resultados:\nNotas Fortes: ${strongNotes.length > 0 ? strongNotes.join(', ') : 'Nenhuma nota forte.'}\n`;
    resultsText += `Notas Fracas: ${weakNotes.length > 0 ? weakNotes.join(', ') : 'Nenhuma nota fraca.'}\n`;
    resultsText += `Contador: ${generateCounter}\n`;
    resultsText += `Erro: ${keyOneCounter}\n`;
    resultsText += `Diferença Numérica: ${document.getElementById('differenceValue').innerText}\n`;
    resultsText += `Diferença Percentual: ${document.getElementById('percentageDifference').innerText}\n`;

    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${getFileName()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

generateMelody();

