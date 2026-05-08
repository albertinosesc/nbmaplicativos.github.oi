// ============================================
// 400 AÇÕES
// ============================================

const CATEGORIAS = ['Percepção', 'Leitura', 'Execução', 'Teoria', 'Composição', 'Memória', 'Coordenação', 'Expressão', 'Tecnologia', 'Metacognição', 'Social', 'Ludicidade'];

function gerarAcoes() {
    const acoes = [];
    for (let i = 1; i <= 400; i++) {
        let categoria;
        if (i <= 60) categoria = 'Percepção';
        else if (i <= 120) categoria = 'Leitura';
        else if (i <= 180) categoria = 'Execução';
        else if (i <= 220) categoria = 'Teoria';
        else if (i <= 250) categoria = 'Composição';
        else if (i <= 270) categoria = 'Memória';
        else if (i <= 300) categoria = 'Coordenação';
        else if (i <= 330) categoria = 'Expressão';
        else if (i <= 360) categoria = 'Tecnologia';
        else if (i <= 380) categoria = 'Metacognição';
        else if (i <= 395) categoria = 'Social';
        else categoria = 'Ludicidade';
        
        let nivel;
        if (i <= 70) nivel = 1;
        else if (i <= 145) nivel = 2;
        else if (i <= 275) nivel = 3;
        else if (i <= 340) nivel = 4;
        else nivel = 5;
        
        const textosBase = {
            1: "Escrever a nota na pauta",
            2: "Tocar a nota no instrumento",
            12: "Ouvir a nota em silêncio",
            13: "Cantar a nota",
            20: "Decorar o nome da nota",
            55: "Compor uma frase com a nota",
            400: "Criar versão pessoal da lista"
        };
        
        let texto = textosBase[i] || `Ação ${i}`;
        acoes.push({ id: i, numero: i, texto: texto, categoria: categoria, nivel: nivel });
    }
    return acoes;
}

let TODAS_ACOES = gerarAcoes();

function getAcaoPorId(id) {
    return TODAS_ACOES.find(a => a.id === id);
}

function getAcoesPorNivel(nivel) {
    return TODAS_ACOES.filter(a => a.nivel === nivel);
}

function salvarAcoesLocal() {
    localStorage.setItem('acoesPersonalizadas', JSON.stringify(TODAS_ACOES));
}

function carregarAcoesPersonalizadas() {
    const salvas = localStorage.getItem('acoesPersonalizadas');
    if (salvas) {
        const acoesSalvas = JSON.parse(salvas);
        for (let i = 0; i < TODAS_ACOES.length && i < acoesSalvas.length; i++) {
            if (acoesSalvas[i]) {
                TODAS_ACOES[i].texto = acoesSalvas[i].texto;
                TODAS_ACOES[i].categoria = acoesSalvas[i].categoria;
                TODAS_ACOES[i].nivel = acoesSalvas[i].nivel;
            }
        }
    }
}