let generateCounter = 0;
let keyOneCounter = 0;
let countingMode = false;
let melodyVisible = true;
let currentMelody = [];
let autoGenerateInterval = null;
let currentRepeatCount = 0;
let countingInterval = null;
let currentPlayingAudio = null; // Variável para armazenar a instância de áudio atual

// Notas para o relatório de avaliação (naturais)
const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

let score = 0;
let totalQuestions = 20; // Definir um limite para as questões da avaliação
let results = {}; // Para armazenar resultados por melodia/nota

// Variáveis para a funcionalidade de timbre (integradas do Projeto 1)
let audioBase = "./acoustic_grand_piano-mp3/"; // Caminho base para os arquivos MP3
const useMp3Player = true; // Define se a reprodução usará MP3s ou Tone.js

// Referências aos elementos HTML
const availableNotesInput = document.getElementById('availableNotes');
const noteButtons = document.querySelectorAll('.note-button');
const minOctaveSelect = document.getElementById('minOctave');
const maxOctaveSelect = document.getElementById('maxOctave');
const playbackSpeedInput = document.getElementById('playbackSpeed');
const autoGenerateButton = document.getElementById('autoGenerateButton');
const autoGenerateIntervalInput = document.getElementById('autoGenerateInterval');
const repeatCountInput = document.getElementById('repeatCount');
const initialCountInput = document.getElementById('initialCountInput');
const instrumentSelect = document.getElementById('instrument'); // Novo

// --- Funções de seleção de notas e oitavas ---
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

// --- Função para mudar o timbre (integrada do Projeto 1) ---
function changeInstrument() {
    const selected = instrumentSelect.value;
    audioBase = `./${selected}/`;
    console.log(`Timbre alterado para: ${selected}`);
}

// --- Gerar e tocar melodia ---
function generateMelody() {
    const noteCount = parseInt(document.getElementById('noteCount').value);
    const availableNotesText = availableNotesInput.value;
    let availableNotes = [];

    // Lida com o caso de não haver notas selecionadas ou valor inicial
    if (availableNotesText && availableNotesText.trim() !== '') {
        availableNotes = availableNotesText.split(',').map(note => note.trim().toUpperCase());
    } else {
        // Se nenhuma nota for selecionada, usa todas as notas naturais e sustenidos padrão
        availableNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        console.warn('Nenhuma nota selecionada. Usando todas as notas naturais e sustenidos como padrão.');
    }

    const minOctave = parseInt(minOctaveSelect.value);
    const maxOctave = parseInt(maxOctaveSelect.value);

    if (availableNotes.length === 0) {
        alert('Por favor, selecione pelo menos uma nota ou as notas padrão serão usadas.');
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

// --- Reprodução da melodia (modificada para MP3) ---
function playMelody(melody) {
    const speed = parseFloat(playbackSpeedInput.value);
    const delayBetweenNotes = 0.5 / speed; // Ajusta o delay com base na velocidade

    // Limpa qualquer áudio anterior em reprodução para garantir que apenas uma nota toque por vez
    if (currentPlayingAudio) {
        currentPlayingAudio.pause();
        currentPlayingAudio.currentTime = 0; // Reinicia para o início
        currentPlayingAudio = null;
    }

    if (useMp3Player) {
        let currentTime = 0;
        melody.forEach((noteWithOctave, index) => {
            const fileName = `${audioBase}${noteWithOctave}.mp3`;
            
            setTimeout(() => {
                // Ao tocar uma nova nota, paramos a anterior novamente para a sequência
                if (currentPlayingAudio) {
                    currentPlayingAudio.pause();
                    currentPlayingAudio.currentTime = 0;
                }
                const audio = new Audio(fileName);
                audio.volume = 0.7; // Ajuste o volume se necessário
                audio.play().then(() => {
                    currentPlayingAudio = audio; // Armazena a referência do áudio que está tocando
                }).catch(e => {
                    console.error(`Erro ao tocar ${fileName}:`, e);
                });
            }, currentTime * 1000); // currentTime em milissegundos

            currentTime += delayBetweenNotes;
        });

    } else {
        // Reprodução usando Tone.js (mantido caso queira alternar)
        // Para Tone.js, a lógica de "parar a anterior" é diferente,
        // já que é um sintetizador. O Tone.js gerencia isso melhor,
        // mas para garantir, você pode liberar o synth anterior se estiver usando-o para notas individuais.
        // Se você sempre criar um novo synth por melodia, como no seu código, não é um problema grave aqui.
        const synth = new Tone.Synth().toDestination();
        const now = Tone.now();
        melody.forEach((note, index) => {
            synth.triggerAttackRelease(note, "8n", now + index * delayBetweenNotes);
        });
    }
}
// Função auxiliar para tocar nota com Tone.js (pode ser útil para fallback ou debug)
function playNoteWithToneJs(note) {
    const synth = new Tone.Synth().toDestination();
    synth.triggerAttackRelease(note, "8n");
}


// --- Repetição da melodia ---
function repeatMelody() {
    if (currentMelody.length > 0) {
        playMelody(currentMelody);
    } else {
        alert('Nenhuma melodia foi gerada ainda. Por favor, gere uma melodia primeiro.');
    }
}

// --- Geração automática ---
function toggleAutoGenerate() {
    if (autoGenerateInterval) {
        // Se já está ativo, parar
        clearInterval(autoGenerateInterval);
        autoGenerateInterval = null;
        autoGenerateButton.textContent = "Gerar Nota Automático";
        autoGenerateButton.style.backgroundColor = "#007bff"; // Azul (cor original)
    } else {
        // Se não está ativo, iniciar
        const interval = parseInt(autoGenerateIntervalInput.value) * 1000;
        if (interval <= 0) {
            alert("O intervalo para geração automática deve ser maior que zero.");
            return;
        }
        autoGenerateInterval = setInterval(autoGenerateStep, interval);
        autoGenerateButton.textContent = "Parar Geração Automática";
        autoGenerateButton.style.backgroundColor = "#e74c3c"; // Vermelho (cor de parada)
        // Opcional: Gerar a primeira melodia imediatamente ao ativar
        autoGenerateStep(); 
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

// --- Visibilidade da melodia ---
function toggleMelodyVisibility() {
    const melodyDiv = document.getElementById('melody');
    melodyVisible = !melodyVisible;
    melodyDiv.style.display = melodyVisible ? 'block' : 'none';
    document.getElementById('toggleMelodyButton').innerText = melodyVisible ? 'Ocultar Notas' : 'Mostrar Notas';
}

// --- Modo de contagem ---
function toggleCountingMode() {
    countingMode = !countingMode;
    document.getElementById('initialCountInput').style.display = countingMode ? 'block' : 'none';
    document.getElementById('countingModeButton').innerText = countingMode ? 'Contagem Decrescente' : 'Contagem Crescente';

    if (countingMode) {
        generateCounter = parseInt(initialCountInput.value) || 0;
        document.getElementById('generateCounter').innerText = generateCounter;
        // Inicia o intervalo de contagem regressiva se estiver no modo decrescente
        clearInterval(countingInterval); // Garante que não há múltiplos intervalos
        countingInterval = setInterval(() => {
            if (generateCounter > 0) {
                generateCounter--;
                document.getElementById('generateCounter').innerText = generateCounter;
                updateDifference();
            } else {
                clearInterval(countingInterval);
            }
        }, 1000);
    } else {
        clearInterval(countingInterval); // Para o intervalo se voltar ao modo crescente
        document.getElementById('generateCounter').innerText = '0'; // Reseta ao sair do modo decrescente
        generateCounter = 0; // Garante que a contagem crescente comece do zero
        updateDifference();
    }
}

document.getElementById('initialCountInput').addEventListener('input', function() {
    if (countingMode) {
        generateCounter = parseInt(this.value) || 0;
        document.getElementById('generateCounter').innerText = generateCounter;
        updateDifference();
    }
});

function updateDifference() {
    // A diferença é sempre gerada a partir do contador total e do contador de erros
    const difference = generateCounter - keyOneCounter;
    let percentageDifference = 0;
    if (generateCounter > 0) {
        percentageDifference = (difference / generateCounter) * 100;
    }
    
    document.getElementById('differenceValue').innerText = difference;
    document.getElementById('percentageDifference').innerText = percentageDifference.toFixed(2) + '%';
}


// --- Atajos de teclado ---
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
    } else if (event.key === 'Shift') {
        event.preventDefault();
        toggleAutoGenerate();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'Control') { // Verifica se Ctrl foi pressionado sozinho
        event.preventDefault();
        resetCounters();
    }
});

// --- Resetar contadores ---
function resetCounters() {
    generateCounter = 0;
    keyOneCounter = 0;
    document.getElementById('generateCounter').innerText = generateCounter;
    document.getElementById('keyOneCounter').innerText = keyOneCounter;
    document.getElementById('differenceValue').innerText = 0;
    document.getElementById('percentageDifference').innerText = "0%";
    
    // IMPORTANTE: Parar a geração automática e o intervalo de contagem regressiva
    clearInterval(autoGenerateInterval); 
    autoGenerateInterval = null;
    autoGenerateButton.textContent = "Gerar Nota Automático";
    autoGenerateButton.style.backgroundColor = "#007bff"; // Voltar para a cor padrão
    
    clearInterval(countingInterval); // Garante que o intervalo de contagem regressiva seja limpo
    // Reseta o modo de contagem para o padrão se desejar
    if (countingMode) {
        toggleCountingMode(); // Volta para contagem crescente
    }
}

// --- Atajos de teclado para seleção de notas ---
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

// --- Funcionalidade de avaliação ---
function submitAnswer() {
    const userAnswer = document.getElementById("userAnswer").value.toUpperCase().split(',').map(note => note.trim());
    const resultsTable = document.getElementById("resultsTable");
    const row = resultsTable.insertRow();

    row.insertCell(0).innerText = resultsTable.rows.length;
    row.insertCell(1).innerText = currentMelody.join(' - ');
    row.insertCell(2).innerText = userAnswer.join(' - ');
    
    // Compara a melodia atual com a resposta do usuário
    // É importante comparar as notas na mesma ordem e formato (ex: C4 === C4)
    const isCorrect = userAnswer.join(' - ') === currentMelody.join(' - ');
    row.insertCell(3).innerText = isCorrect ? '✔' : '✘';

    if (!isCorrect) {
        // Se a resposta estiver incorreta, incrementa o contador de erros
        keyOneCounter++;
        document.getElementById('keyOneCounter').innerText = keyOneCounter;
    }
    
    // Armazenar resultados para cada melodia tocada
    // Se você quiser analisar por nota individual, a lógica aqui precisaria ser mais complexa
    const melodyKey = currentMelody.join(' - ');
    if (!results[melodyKey]) {
        results[melodyKey] = { correct: 0, total: 0 };
    }
    results[melodyKey].total++;
    if (isCorrect) {
        score++;
        results[melodyKey].correct++;
    }

    document.getElementById("userAnswer").value = ""; // Limpa o campo de resposta
    updateDifference(); // Atualiza a diferença após cada resposta

    if (resultsTable.rows.length >= totalQuestions) {
        const finalScoreText = `Pontuação Final: ${score} de ${totalQuestions} (${(score / totalQuestions * 100).toFixed(2)}%)`;
        document.getElementById("finalScore").innerText = finalScoreText;
        generateReport();
        disableInputs();
    } else {
        generateMelody(); // Gera a próxima melodia
    }
}

function generateReport() {
    const reportDiv = document.getElementById("report");
    let strongNotes = [];
    let weakNotes = [];

    // Esta parte do relatório está focada em notas INDIVIDUAIS,
    // mas a avaliação 'submitAnswer' avalia a MELODIA inteira.
    // Para um relatório mais preciso por nota individual, você precisaria
    // registrar os acertos/erros para C, C#, D, D# etc., independente da oitava ou sequência.
    // O código atual `results` armazena por `melodyKey` (ex: "C4 - D4").
    // Adaptei para tentar extrair acertos/erros por nota básica.

    // Reinicie o objeto results para acumular estatísticas por nota base
    let noteStats = {};
    for (const melodyKey in results) {
        const melodyParts = melodyKey.split(' - ');
        const isCorrectMelody = results[melodyKey].correct > 0; // Se a melodia foi acertada pelo menos uma vez

        melodyParts.forEach(fullNote => {
            // Extrai a parte da nota (ex: "C", "C#")
            const noteMatch = fullNote.match(/([A-G]#?b?)([0-9]+)/);
            if (noteMatch) {
                const baseNote = noteMatch[1];
                if (!noteStats[baseNote]) {
                    noteStats[baseNote] = { correct: 0, total: 0 };
                }
                noteStats[baseNote].total++;
                if (isCorrectMelody) { // Se a melodia inteira foi correta, considera a nota como correta nessa melodia
                    noteStats[baseNote].correct++;
                }
            }
        });
    }

    for (const baseNote in noteStats) {
        const correctAnswers = noteStats[baseNote].correct;
        const totalAnswers = noteStats[baseNote].total;

        if (totalAnswers > 0) {
            const accuracy = (correctAnswers / totalAnswers) * 100;
            if (accuracy < 50) {
                weakNotes.push(`${baseNote} (${accuracy.toFixed(2)}%)`);
            } else {
                strongNotes.push(`${baseNote} (${accuracy.toFixed(2)}%)`);
            }
        }
    }


    reportDiv.innerHTML = `
        <h2>Relatório de Resultados</h2>
        <h3>Notas Fortes:</h3>
        <p>${strongNotes.length > 0 ? strongNotes.join(', ') : 'Nenhuma nota forte identificada.'}</p>
        <h3>Notas Fracas:</h3>
        <p>${weakNotes.length > 0 ? weakNotes.join(', ') : 'Nenhuma nota fraca identificada.'}</p>
        <h3>Estatísticas de Contagem:</h3>
        <p>Contador (Geradas): ${generateCounter}</p>
        <p>Erro (Cliques no botão ou Respostas Incorretas): ${keyOneCounter}</p>
        <p>Diferença Numérica: ${document.getElementById('differenceValue').innerText}</p>
        <p>Diferença Percentual: ${document.getElementById('percentageDifference').innerText}</p>
    `;
    return { strongNotes, weakNotes };
}


function disableInputs() {
    document.querySelector("button[onclick='generateMelody()']").disabled = true;
    document.querySelector("button[onclick='submitAnswer()']").disabled = true;
    document.getElementById('userAnswer').disabled = true;
    document.getElementById('generateButton').disabled = true; // Botão de gerar notas
}

function formatDate(dateString) {
    if (!dateString) return "Data_Desconhecida";
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year.slice(2)}`;
}

function getFileName() {
    const studentName = document.getElementById("studentName").value || "Aluno";
    const dateInput = document.getElementById("date").value;
    const date = formatDate(dateInput);

    const nameParts = studentName.split(' ');
    const firstName = nameParts[0];
    const secondName = nameParts.length > 1 ? nameParts[1] : '';

    return `${firstName.replace(/\s/g, '_')}${secondName ? `_${secondName.replace(/\s/g, '_')}` : ''}_${date}`;
}


function downloadResults() {
    const finalScoreText = `Pontuação Final: ${score} de ${totalQuestions} (${(score / totalQuestions * 100).toFixed(2)}%)`;
    const { strongNotes, weakNotes } = generateReport(); // Gera o relatório para inclusão no arquivo

    let resultsText = `Nome do Aluno: ${document.getElementById("studentName").value || "Aluno Desconhecido"}\nData: ${formatDate(document.getElementById("date").value) || formatDate(new Date().toISOString().split('T')[0])}\n\n${finalScoreText}\n\n`;
    
    resultsText += 'Nº | Notas Apresentadas | Resposta do Participante | Correta (✔) / Incorreta (✘)\n';
    resultsText += '---|--------------------|--------------------------|-----------------------------\n'; // Separador para a tabela
    const resultsTable = document.getElementById("resultsTable");

    for (let i = 0; i < resultsTable.rows.length; i++) {
        const row = resultsTable.rows[i];
        resultsText += `${row.cells[0].innerText} | ${row.cells[1].innerText} | ${row.cells[2].innerText} | ${row.cells[3].innerText}\n`;
    }

    resultsText += `\n--- Relatório de Resultados ---\n`;
    resultsText += `Notas Fortes: ${strongNotes.length > 0 ? strongNotes.join(', ') : 'Nenhuma nota forte identificada.'}\n`;
    resultsText += `Notas Fracas: ${weakNotes.length > 0 ? weakNotes.join(', ') : 'Nenhuma nota fraca identificada.'}\n`;
    resultsText += `Contador (Geradas): ${generateCounter}\n`;
    resultsText += `Erro (Cliques no botão ou Respostas Incorretas): ${keyOneCounter}\n`;
    resultsText += `Diferença Numérica: ${document.getElementById('differenceValue').innerText}\n`;
    resultsText += `Diferença Percentual: ${document.getElementById('percentageDifference').innerText}\n`;

    const blob = new Blob([resultsText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${getFileName()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
    // Definir a data atual no input de data ao carregar a página
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("date").value = today;

    // Garante que o timbre inicial seja carregado
    changeInstrument(); 
    
    // Inicia uma melodia ao carregar a página
    generateMelody();
});
