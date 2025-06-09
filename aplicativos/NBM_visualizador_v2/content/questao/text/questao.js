// NBM_visualizador_v8/questao/text/questao.js
// Esta é a lista completa de questões com seus metadados.
// Ela será usada tanto pelo buscador rápido quanto pelo sistema de filtros.
// O conteúdo HTML detalhado de cada questão reside em arquivos QXXX.js separados.
const questoesData = [
    {
        id: "Q101",
        ano: 1,
        tipo: "auditiva",
        metodo: "Kodály",
        titulo: "Questão 101 - Reconhecimento de Sons (DO)",
        enunciadoCurto: "Ouça os dois sons e identifique qual deles é mais grave.",
        recursos: ["../../audio/DO.mp3", "../../audio/FA.mp3"], // Caminhos para os arquivos de áudio
        nivelDificuldade: "Fácil",
        dataCriacao: "2024-01-01",
        tags: ["percepção", "auditiva", "básico", "intervalos"],
        autor: "Prof. Xavier"
    },

    {
        id: "Q301",
        ano: 3,
        tipo: "composição",
        metodo: "Gordon",
        titulo: "Questão 301 - Criação de Melodia Simples",
        enunciadoCurto: "Componha uma melodia de 4 compassos sobre uma harmonia dada.",
        recursos: ["../../assets/partituras/Q301_harmonia.png"],
        nivelDificuldade: "Difícil",
        dataCriacao: "2024-04-01",
        tags: ["composição", "harmonia", "melodia", "criação"],
        autor: "Prof. Felipe"
    }
    // Adicione mais questões aqui com seus metadados
];