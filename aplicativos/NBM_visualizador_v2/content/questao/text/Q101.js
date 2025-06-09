// NBM_visualizador_v8/questao/text/Q101.js
registerQuestionBlock({
    id: "Q101",
    content: `
        <div class="question-block">
            <h2>Questão Q101 - Reconhecimento de Sons (DO/FA)</h2>
            <p><strong>Ano:</strong> 1 | <strong>Tipo:</strong> Auditiva | <strong>Método:</strong> Kodály</p>
            
            <div class="audio-resources">
                <button class="playAudioButton" data-audio-path="../../audio/DO.mp3">Tocar Áudio DO</button>
                <button class="playAudioButton" data-audio-path="../../audio/FA.mp3">Tocar Áudio FA</button>
            </div>
            
            <div class="question-text">
                <p>Qual dos dois sons é mais grave? Escreva sua resposta ou grave sua voz indicando a nota.</p>
                <p><i>(Dica: preste atenção à altura de cada som.)</i></p>
            </div>
            <div class="answer-section">
                <label for="resposta-q101">Sua resposta:</label>
                <input type="text" id="resposta-q101" placeholder="Ex: DO">
                <button onclick="alert('Funcionalidade de verificação de resposta aqui!')">Verificar</button>
            </div>
        </div>
    `
});