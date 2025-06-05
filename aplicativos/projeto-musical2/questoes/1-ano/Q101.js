export const questao = {
    id: "Q101",
    ano: 1,
    tipo: "auditiva",
    enunciado: "Qual som é mais grave: sino ou tambor?",
    recursos: [
        { tipo: "audio", path: "./assets/audios/sino.mp3" }, // Caminho relativo ao index.html
        { tipo: "audio", path: "./assets/audios/tambor.mp3" }
    ],
    resposta: {
        tipo: "texto",
        valor: "Tambor"
    },
    metodo: "Kodály", // Ou 'metodoPedagogico', dependendo do seu padrão
    habilidadeBNCC: "EF15AR05" // Se for usar, inclua aqui
};