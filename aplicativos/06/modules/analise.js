// ============================================
// ANÁLISE DA APRENDIZAGEM
// ============================================

const SENTIDOS = ["visão", "audição", "tato", "equilíbrio", "propriocepção"];
const PERCEPCOES = ["rítmica", "melódica", "temporal", "espacial", "corporal", "intensidade", "altura", "timbre"];
const FLUXO_APRENDIZAGEM = [
    { etapa: 1, nome: "Receber", descricao: "Contato com o estímulo" },
    { etapa: 2, nome: "Perceber", descricao: "Notar características" },
    { etapa: 3, nome: "Identificar", descricao: "Reconhecer especificamente" },
    { etapa: 4, nome: "Interpretar", descricao: "Dar significado" },
    { etapa: 5, nome: "Processar", descricao: "Organizar informações" },
    { etapa: 6, nome: "Reproduzir", descricao: "Mostrar na prática" },
    { etapa: 7, nome: "Registrar", descricao: "Transformar em representação" },
    { etapa: 8, nome: "Criar", descricao: "Produzir algo novo" },
    { etapa: 9, nome: "Comunicar", descricao: "Compartilhar" },
    { etapa: 10, nome: "Avaliar", descricao: "Perceber o resultado" },
    { etapa: 11, nome: "Internalizar", descricao: "Conhecimento natural" }
];
const PROPRIEDADES = [
    { nome: "Altura", descricao: "Grave/agudo", elementos: ["notas", "escalas"] },
    { nome: "Duração", descricao: "Tempo do som", elementos: ["ritmo", "compasso"] },
    { nome: "Intensidade", descricao: "Força do som", elementos: ["dinâmica", "forte/piano"] },
    { nome: "Timbre", descricao: "Cor do som", elementos: ["instrumentos", "voz"] }
];
const ORGANIZACAO = [
    { nome: "Estrutura", descricao: "Construção da música", elementos: ["frase", "motivo"] },
    { nome: "Expressão", descricao: "Intenção e emoção", elementos: ["articulação", "interpretação"] },
    { nome: "Harmonia", descricao: "Combinação simultânea", elementos: ["acordes", "progressões"] }
];
const SINTESE = `A música envolve corpo, sentidos, percepção, cognição, linguagem musical, execução, criação, expressão e desenvolvimento artístico.`;

function carregarAnalise() {
    const sentidosDiv = document.getElementById('sentidosContainer');
    const percepcoesDiv = document.getElementById('percepcoesContainer');
    const sequenciaDiv = document.getElementById('sequenciaContainer');
    const propriedadesDiv = document.getElementById('propriedadesContainer');
    const organizacaoDiv = document.getElementById('organizacaoContainer');
    const sinteseDiv = document.getElementById('sinteseContainer');
    
    if (sentidosDiv) sentidosDiv.innerHTML = `<h3>Sentidos</h3><div>${SENTIDOS.map(s => `<span class="badge">${s}</span>`).join('')}</div>`;
    if (percepcoesDiv) percepcoesDiv.innerHTML = `<h3>Percepções</h3><div>${PERCEPCOES.map(p => `<span class="badge">${p}</span>`).join('')}</div>`;
    if (sequenciaDiv) sequenciaDiv.innerHTML = FLUXO_APRENDIZAGEM.map(f => `<div class="etapa-card"><div class="etapa-numero">${f.etapa}. ${f.nome}</div><div>${f.descricao}</div></div>`).join('');
    if (propriedadesDiv) propriedadesDiv.innerHTML = PROPRIEDADES.map(p => `<div class="plano-card"><strong>🎵 ${p.nome}</strong><br><small>${p.descricao}</small><br><div>${p.elementos.map(e => `<span class="badge">${e}</span>`).join('')}</div></div>`).join('');
    if (organizacaoDiv) organizacaoDiv.innerHTML = ORGANIZACAO.map(o => `<div class="plano-card"><strong>📐 ${o.nome}</strong><br><small>${o.descricao}</small><br><div>${o.elementos.map(e => `<span class="badge">${e}</span>`).join('')}</div></div>`).join('');
    if (sinteseDiv) sinteseDiv.innerHTML = `<p style="line-height:1.6">${SINTESE}</p>`;
}

window.carregarAnalise = carregarAnalise;