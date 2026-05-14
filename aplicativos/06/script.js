// ==================== CONFIGURAÇÃO ====================
const GITHUB_USER = "albertinosesc";
const GITHUB_REPO = "nbmaplicativos.github.oi";
const GITHUB_BRANCH = "main";
const BASE_PATH = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/aplicativos/06/data/`;

// Lista dos arquivos de atividades (dentro da pasta atividades/)
const ARQUIVOS_ATIVIDADES = [
    'atividades/atividades1_100.json',
    'atividades/atividades101_200.json',
    'atividades/atividades201_300.json',
    'atividades/atividades301_400.json',
    'atividades/atividades401_500.json',
    'atividades/atividades501_600.json'
];

// ==================== DADOS ====================
let ATIVIDADES = {};
let PLANOS_AULA = {};
let PLANOS_CURSO = {};

// ==================== CATEGORIAS ATUALIZADAS ====================
// Categorias Base (principais - usadas em categorias_base)
const CATEGORIAS_BASE = [
    'Percepção', 'Leitura', 'Escrita', 'Execução', 'Teoria', 
    'Composição', 'Memória', 'Coordenação', 'Expressão', 
    'Tecnologia', 'Metacognição', 'Social', 'Ludicidade',
    // NOVAS CATEGORIAS BASE (usadas nas atividades G3)
    'Ritmo', 'Audição', 'Discriminação', 'Criação', 
    'Exploração', 'Dinâmica', 'Duração', 'Performance', 
    'Canto', 'Cultura', 'Movimento', 'Apreciação'
];

// Categorias Pedagógicas (para tags_avancadas.pedagogico)
const CATEGORIAS_PEDAGOGICAS = [
    'Alfabetização Musical', 'Coordenação Motora', 'Técnica', 'Execução',
    'Leitura Musical', 'Escala', 'Percepção Musical', 'Discriminação Auditiva',
    'Expressão Vocal', 'Ritmo', 'Movimento', 'Expressão', 'Canto',
    'Teoria Musical', 'Acidentes', 'Instrumentos', 'Articulação',
    'Memória Musical', 'Performance', 'Criação', 'Exploração Sonora',
    'Audição', 'Dinâmica', 'Duração', 'Social', 'Cultura Brasileira',
    'Metacognição', 'Avaliação', 'Reflexão', 'Tecnologia Musical'
];

// Tipos de Atividade (para tags_avancadas.tipo_atividade)
const CATEGORIAS_TIPO_ATIVIDADE = [
    'Exercício', 'Jogo', 'Demonstração', 'Performance', 
    'Exploração', 'Criação', 'Apreciação', 'Desafio',
    'Movimento', 'Dança', 'Canto', 'Ritmo', 'Leitura',
    'Teoria', 'Percepção', 'Avaliação', 'Revisão',
    'Ensaio', 'Brincadeira', 'Classificação', 'Competição'
];

// Tipos de Interação (para tags_avancadas.interacao)
const CATEGORIAS_INTERACAO = [
    'Individual', 'Turma', 'Grupo', 'Dupla', 'Professor-Aluno', 'Famílias'
];

// Habilidades Cognitivas (para tags_avancadas.cognitivo)
const CATEGORIAS_COGNITIVAS = [
    'Memória', 'Percepção', 'Coordenação Motora', 'Atenção', 'Criatividade',
    'Discriminação Auditiva', 'Associação', 'Raciocínio Lógico', 'Planejamento',
    'Sincronização', 'Expressão Emocional', 'Contextualização Cultural',
    'Metacognição', 'Avaliação', 'Comunicação', 'Autoconfiança',
    'Percepção Temporal', 'Percepção Espacial', 'Memória Sequencial',
    'Memória de Timbre', 'Imitação', 'Classificação', 'Transferência'
];

// Elementos Musicais (para tags_avancadas.elemento_musical)
const CATEGORIAS_ELEMENTO_MUSICAL = [
    'Altura', 'Ritmo', 'Duração', 'Timbre', 'Intensidade', 'Melodia',
    'Harmonia', 'Escala', 'Acorde', 'Intervalo', 'Pulso', 'Andamento',
    'Som/Silêncio', 'Paisagem Sonora', 'Notação', 'Clave', 'Fraseado',
    'Articulação', 'Staccato', 'Legato', 'Dinâmica', 'Expressão',
    'Forma Musical', 'Tonalidade', 'Acidentes'
];

// Conteúdos (para tags_avancadas.conteudo)
const CATEGORIAS_CONTEUDO = [
    'Violino/Cordas', 'Piano/Teclado', 'Instrumentos de Percussão',
    'Notas', 'Pauta', 'Escala Maior', 'Intervalo', 'Acorde',
    'Ritmo', 'Pulsação', 'Cantigas de Roda', 'Folclore Brasileiro',
    'MPB', 'História da Música', 'Partitura Gráfica', 'Notação Digital',
    'DAW', 'Sequenciador', 'Áudio', 'MIDI', 'Gravação',
    'Movimento Corporal', 'Dança', 'Expressão', 'Performance',
    'Avaliação', 'Processo Criativo', 'Percepção Auditiva'
];

// Pedagogos/Referências (para tags_avancadas.pedagogos)
const CATEGORIAS_PEDAGOGOS = [
    'Suzuki', 'Kodály', 'Orff', 'Dalcroze', 'Willems', 'Martenot',
    'Schafer', 'Gordon', 'Swanwick', 'Montessori', 'Cage', 'Brincante'
];

// Princípios Pedagógicos (para tags_avancadas.principios)
const CATEGORIAS_PRINCIPIOS = [
    'Técnica', 'Coordenação Motora', 'Repetição', 'Memorização',
    'Prática antes da teoria', 'Vivência musical', 'Expressão musical',
    'Movimento corporal', 'Escuta ativa', 'Criatividade', 'Exploração',
    'Trabalho em equipe', 'Performance', 'Avaliação formativa',
    'Metacognição', 'Jogo musical', 'Tradição oral', 'Cultura popular'
];

// ==================== FUNÇÃO PARA OBTER TODAS AS CATEGORIAS ====================
function obterTodasCategorias() {
    return CATEGORIAS_BASE;
}

// ==================== GERAR AÇÕES A PARTIR DAS ATIVIDADES ====================
function gerarAcoesAPartirDasAtividades() {
    const acoes = [];
    const ids = Object.keys(ATIVIDADES).sort((a, b) => a - b);
    
    for (const id of ids) {
        const atividade = ATIVIDADES[id];
        const titulo = atividade.titulo ? atividade.titulo : `Atividade ${id}`;
        
        let categorias = [];
        if (atividade.categorias_base && Array.isArray(atividade.categorias_base)) {
            categorias = atividade.categorias_base;
        } else if (atividade.categoria) {
            categorias = [atividade.categoria];
        } else {
            categorias = ['Atividade'];
        }
        
        let nivel = atividade.nivel || 1;
        if (id <= 70) nivel = 1;
        else if (id <= 145) nivel = 2;
        else if (id <= 275) nivel = 3;
        else if (id <= 340) nivel = 4;
        else nivel = 5;
        
        for (const categoria of categorias) {
            acoes.push({
                id: parseInt(id),
                numero: parseInt(id),
                texto: titulo,
                categoria: categoria,
                nivel: nivel
            });
        }
    }
    
    acoes.sort((a, b) => a.id - b.id);
    return acoes;
}

let TODAS_ACOES = [];

// ==================== CARREGAR DO GITHUB ====================
async function carregarAtividadesDoGitHub() {
    console.log("🔄 Carregando atividades do GitHub (múltiplos arquivos)...");
    ATIVIDADES = {};
    let total = 0;
    
    for (const arquivo of ARQUIVOS_ATIVIDADES) {
        const url = `${BASE_PATH}${arquivo}?t=${Date.now()}`;
        console.log("📡 Tentando carregar:", url);
        
        try {
            const response = await fetch(url);
            if (response.ok) {
                const dados = await response.json();
                ATIVIDADES = { ...ATIVIDADES, ...dados };
                const count = Object.keys(dados).length;
                total += count;
                console.log(`✅ ${arquivo}: ${count} atividades carregadas`);
            } else {
                console.log(`⚠️ ${arquivo} não encontrado (status: ${response.status})`);
            }
        } catch(e) {
            console.error(`❌ Erro ao carregar ${arquivo}:`, e);
        }
    }
    
    console.log(`✅ Total: ${total} atividades carregadas!`);
}

async function carregarPlanosAulaDoGitHub() {
    const url = `${BASE_PATH}planosAula.json?t=${Date.now()}`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            const dados = await response.json();
            PLANOS_AULA = dados;
            console.log(`✅ ${Object.keys(PLANOS_AULA).length} planos de aula carregados!`);
        } else {
            console.log("⚠️ planosAula.json não encontrado");
        }
    } catch(e) {
        console.error("Erro ao carregar planosAula:", e);
    }
    planosAulaFiltradosAdmin = { ...PLANOS_AULA };
}

async function carregarPlanosCursoDoGitHub() {
    const url = `${BASE_PATH}planosCurso.json?t=${Date.now()}`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            const dados = await response.json();
            PLANOS_CURSO = dados;
            console.log(`✅ ${Object.keys(PLANOS_CURSO).length} planos de curso carregados!`);
        } else {
            console.log("⚠️ planosCurso.json não encontrado");
        }
    } catch(e) {
        console.error("Erro ao carregar planosCurso:", e);
    }
    planosCursoFiltradosAdmin = { ...PLANOS_CURSO };
}

// ==================== UTILITÁRIOS ====================
function mostrarToast(msg) { 
    const t = document.createElement('div'); 
    t.className = 'toast'; 
    t.textContent = msg; 
    document.body.appendChild(t); 
    setTimeout(() => t.remove(), 2000); 
}

function escapeHtml(t) { 
    if (!t) return ''; 
    return t.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m])); 
}

function fecharModal(id) { 
    const m = document.getElementById(id); 
    if (m) m.classList.remove('active'); 
}

function abrirModal(id) { 
    const m = document.getElementById(id); 
    if (m) m.classList.add('active'); 
}

// ==================== SALVAR/CARREGAR ====================
function salvarTodosDados() {
    const dados = { atividades: ATIVIDADES, planosAula: PLANOS_AULA, planosCurso: PLANOS_CURSO };
    localStorage.setItem('biblioteca_dados', JSON.stringify(dados));
    atualizarEstatisticas();
    atualizarListasAdmin();
    mostrarToast('✅ Dados salvos!');
}

async function carregarDados() {
    const forceReload = true;
    
    if (!forceReload) {
        const salvos = localStorage.getItem('biblioteca_dados');
        if (salvos) {
            try {
                const dados = JSON.parse(salvos);
                ATIVIDADES = dados.atividades || {};
                PLANOS_AULA = dados.planosAula || {};
                PLANOS_CURSO = dados.planosCurso || {};
                console.log("📀 Dados carregados do localStorage");
            } catch(e) { console.error(e); }
        }
    } else {
        localStorage.removeItem('biblioteca_dados');
        console.log("🔄 Forçando recarga do GitHub...");
        ATIVIDADES = {};
        PLANOS_AULA = {};
        PLANOS_CURSO = {};
    }
    
    atualizarTudo();
    
    await carregarAtividadesDoGitHub();
    await carregarPlanosAulaDoGitHub();
    await carregarPlanosCursoDoGitHub();
    await carregarAbordagensDoGitHub();
    
    atividadesFiltradasAdmin = { ...ATIVIDADES };
    planosAulaFiltradosAdmin = { ...PLANOS_AULA };
    planosCursoFiltradosAdmin = { ...PLANOS_CURSO };
    TODAS_ACOES = gerarAcoesAPartirDasAtividades();
    
    atualizarAcoes();
    atualizarListasAdmin();
    atualizarEstatisticas();
    
    console.log(`✅ Todos os dados carregados! Atividades: ${Object.keys(ATIVIDADES).length}`);
}

function atualizarEstatisticas() {
    document.getElementById('statAtividades').textContent = Object.keys(ATIVIDADES).length;
    document.getElementById('statPlanosAula').textContent = Object.keys(PLANOS_AULA).length;
    document.getElementById('statPlanosCurso').textContent = Object.keys(PLANOS_CURSO).length;
}

// ==================== AÇÕES ====================
function atualizarFiltros() {
    const sCat = document.getElementById('filtroCategoria');
    if (sCat && sCat.options.length <= 1) { 
        sCat.innerHTML = '<option value="todas">Todas</option>'; 
        CATEGORIAS_BASE.forEach(c => sCat.innerHTML += `<option value="${c}">${c}</option>`); 
    }
    const sNiv = document.getElementById('filtroNivel');
    if (sNiv && sNiv.options.length <= 1) { 
        sNiv.innerHTML = '<option value="todos">Todos</option>'; 
        for(let i=1;i<=5;i++) sNiv.innerHTML += `<option value="${i}">Nível ${i}</option>`; 
    }
}

function atualizarAcoes() {
    const container = document.getElementById('listaAcoes');
    const cat = document.getElementById('filtroCategoria').value;
    const niv = document.getElementById('filtroNivel').value;
    const search = document.getElementById('searchAcao')?.value.toLowerCase() || '';
    
    let filtradas = TODAS_ACOES;
    if (cat !== 'todas') filtradas = filtradas.filter(a => a.categoria === cat);
    if (niv !== 'todos') filtradas = filtradas.filter(a => a.nivel == niv);
    if (search) filtradas = filtradas.filter(a => a.texto.toLowerCase().includes(search) || a.numero.toString().includes(search));
    
    document.getElementById('contadorAcoes').innerHTML = `📊 ${filtradas.length} ações encontradas`;
    container.innerHTML = filtradas.map(acao => `<div class="acao-item">
        <span class="acao-numero">#${acao.numero}</span>
        <span class="acao-texto">${escapeHtml(acao.texto)}</span>
        <span class="acao-categoria">${acao.categoria}</span>
        <span class="acao-nivel">Nível ${acao.nivel}</span>
        <button class="btn-ver" onclick="verAtividade(${acao.id})">📖 Ver</button>
    </div>`).join('');
}

function verAtividade(acaoId) {
    const ativ = ATIVIDADES[acaoId];
    if (ativ) {
        let html = `<div class="atividade-detalhe"><strong>🎯 Objetivo:</strong> ${escapeHtml(ativ.objetivo || '')}</div>`;
        
        if (ativ.categorias_base && ativ.categorias_base.length) {
            html += `<div class="atividade-detalhe"><strong>📂 Categorias:</strong> ${ativ.categorias_base.join(', ')}</div>`;
        } else if (ativ.categoria) {
            html += `<div class="atividade-detalhe"><strong>📂 Categoria:</strong> ${ativ.categoria}</div>`;
        }
        
        html += `<div class="atividade-detalhe"><strong>⏱️ Duração:</strong> ${ativ.duracao || 'Não informada'}</div>`;
        html += `<div class="atividade-detalhe"><strong>🎚️ Nível:</strong> ${ativ.nivel || 1}</div>`;
        
        if (ativ.tags_avancadas) {
            const tags = ativ.tags_avancadas;
            html += `<div class="tags-section"><strong>🏷️ Tags Avançadas:</strong><div class="tags-container">`;
            
            if (tags.pedagogico && tags.pedagogico.length) {
                html += `<div class="tag-group"><strong>🎯 Pedagógico:</strong> ${tags.pedagogico.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`;
            }
            if (tags.tipo_atividade && tags.tipo_atividade.length) {
                html += `<div class="tag-group"><strong>🎭 Tipo:</strong> ${tags.tipo_atividade.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`;
            }
            if (tags.interacao && tags.interacao.length) {
                html += `<div class="tag-group"><strong>👥 Interação:</strong> ${tags.interacao.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`;
            }
            if (tags.cognitivo && tags.cognitivo.length) {
                html += `<div class="tag-group"><strong>🧠 Cognitivo:</strong> ${tags.cognitivo.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`;
            }
            if (tags.elemento_musical && tags.elemento_musical.length) {
                html += `<div class="tag-group"><strong>🎵 Elemento:</strong> ${tags.elemento_musical.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`;
            }
            if (tags.conteudo && tags.conteudo.length) {
                html += `<div class="tag-group"><strong>📚 Conteúdo:</strong> ${tags.conteudo.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`;
            }
            if (tags.pedagogos && tags.pedagogos.length) {
                html += `<div class="tag-group"><strong>🎓 Pedagogos:</strong> ${tags.pedagogos.map(t => `<span class="tag tag-pedagogo">${escapeHtml(t)}</span>`).join('')}</div>`;
            }
            if (tags.principios && tags.principios.length) {
                html += `<div class="tag-group"><strong>📖 Princípios:</strong> ${tags.principios.map(t => `<span class="tag tag-principio">${escapeHtml(t)}</span>`).join('')}</div>`;
            }
            
            html += `</div></div>`;
        }
        
        if (ativ.materiais && ativ.materiais.length) {
            html += `<div class="atividade-detalhe"><strong>📦 Materiais:</strong><ul>${ativ.materiais.map(m=>`<li>${escapeHtml(m)}</li>`).join('')}</ul></div>`;
        }
        if (ativ.passo_a_passo && ativ.passo_a_passo.length) {
            html += `<div class="atividade-detalhe"><strong>📝 Passo a passo:</strong><ul>${ativ.passo_a_passo.map(p=>`<li>${escapeHtml(p)}</li>`).join('')}</ul></div>`;
        }
        html += `<button onclick="fecharModal('modalAtividade')" class="secondary">Fechar</button>`;
        
        document.getElementById('modalTitulo').innerHTML = `📖 ${escapeHtml(ativ.titulo)}`;
        document.getElementById('modalConteudo').innerHTML = html;
    } else {
        document.getElementById('modalTitulo').innerHTML = '📖 Atividade não encontrada';
        document.getElementById('modalConteudo').innerHTML = `<p>Atividade ID ${acaoId} não encontrada.</p><button onclick="fecharModal('modalAtividade')" class="secondary">Fechar</button>`;
    }
    abrirModal('modalAtividade');
}

// ==================== COPIAR MARKDOWN ====================
function copiarMarkdown(tipo, id, dados) {
    let markdown = '';
    const data = new Date().toLocaleDateString('pt-BR');
    
    if (tipo === 'atividade') {
        markdown = `# 📝 ${dados.titulo}\n\n`;
        markdown += `**ID:** ${id}\n`;
        markdown += `**Categoria:** ${(dados.categorias_base || [dados.categoria || 'Não definida']).join(', ')}\n`;
        markdown += `**Duração:** ${dados.duracao || 'Não definida'}\n\n`;
        markdown += `## 🎯 Objetivo\n\n${dados.objetivo || 'Não informado'}\n\n`;
        if (dados.materiais && dados.materiais.length) {
            markdown += `## 📦 Materiais\n\n${dados.materiais.map(m => `- ${m}`).join('\n')}\n\n`;
        }
        if (dados.passo_a_passo && dados.passo_a_passo.length) {
            markdown += `## 📝 Passo a Passo\n\n${dados.passo_a_passo.join('\n')}\n\n`;
        }
    } 
    else if (tipo === 'planoAula') {
        markdown = `# 📖 ${dados.titulo}\n\n`;
        markdown += `**ID:** ${id}\n`;
        markdown += `**Nível:** ${dados.nivel}\n`;
        markdown += `**Duração:** ${dados.duracao}\n\n`;
        markdown += `## 🎯 Objetivo Geral\n\n${dados.objetivoGeral || 'Não informado'}\n\n`;
        if (dados.objetivosEspecificos && dados.objetivosEspecificos.length) {
            markdown += `## 📝 Objetivos Específicos\n\n${dados.objetivosEspecificos.map(o => `- ${o}`).join('\n')}\n\n`;
        }
        if (dados.conteudo && dados.conteudo.length) {
            markdown += `## 📚 Conteúdo\n\n${dados.conteudo.map(c => `- ${c}`).join('\n')}\n\n`;
        }
        if (dados.metodologia) markdown += `## ⚙️ Metodologia\n\n${dados.metodologia}\n\n`;
        if (dados.avaliacao) markdown += `## ✅ Avaliação\n\n${dados.avaliacao}\n\n`;
        if (dados.atividades_ids && dados.atividades_ids.length) {
            markdown += `## 🎨 Atividades\n\nIDs: ${dados.atividades_ids.join(', ')}\n\n`;
        }
    }
    else if (tipo === 'planoCurso') {
        markdown = `# 🎓 ${dados.nome}\n\n`;
        markdown += `**ID:** ${id}\n`;
        markdown += `**Ano:** ${dados.ano}\n`;
        markdown += `**Nível:** ${dados.nivel}\n`;
        markdown += `**Carga Horária:** ${dados.cargaHoraria}h\n\n`;
        if (dados.objetivoGeral) markdown += `## 🎯 Objetivo Geral\n\n${dados.objetivoGeral}\n\n`;
        if (dados.conteudoProgramatico && dados.conteudoProgramatico.length) {
            markdown += `## 📚 Conteúdo Programático\n\n${dados.conteudoProgramatico.map(c => `- ${c}`).join('\n')}\n\n`;
        }
        if (dados.metodologia) markdown += `## ⚙️ Metodologia\n\n${dados.metodologia}\n\n`;
        if (dados.avaliacao) markdown += `## ✅ Avaliação\n\n${dados.avaliacao}\n\n`;
        if (dados.planos_aula_ids && dados.planos_aula_ids.length) {
            markdown += `## 📚 Planos de Aula\n\nIDs: ${dados.planos_aula_ids.join(', ')}\n\n`;
        }
    }
    else if (tipo === 'abordagem') {
        markdown = `# 📚 ${dados.nome || 'Abordagem'}\n\n`;
        markdown += `**Caminho:** \`${id}\`\n\n`;
        if (dados.descricao) markdown += `## 📖 Descrição\n\n${dados.descricao}\n\n`;
        if (dados.dicas && dados.dicas.length) {
            markdown += `## 💡 Dicas\n\n${dados.dicas.map(d => `- ${d}`).join('\n')}\n\n`;
        }
    }
    
    markdown += `---\n*Gerado em: ${data}*`;
    
    navigator.clipboard.writeText(markdown).then(() => {
        mostrarToast(`✅ ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} copiado em Markdown!`);
    }).catch(() => {
        alert('Erro ao copiar. Selecione manualmente.\n\n' + markdown);
    });
}

function copiarConteudoEditor() {
    const tipo = window.editandoAdminTipo;
    
    if (tipo === 'atividade') {
        const id = parseInt(document.getElementById('editId')?.value);
        if (id && ATIVIDADES[id]) {
            copiarMarkdown('atividade', id, ATIVIDADES[id]);
        } else {
            alert('Atividade não encontrada para copiar');
        }
    } 
    else if (tipo === 'planoAula') {
        const id = parseInt(document.getElementById('editId')?.value);
        if (id && PLANOS_AULA[id]) {
            copiarMarkdown('planoAula', id, PLANOS_AULA[id]);
        } else {
            alert('Plano de aula não encontrado para copiar');
        }
    }
    else if (tipo === 'planoCurso') {
        const id = parseInt(document.getElementById('editId')?.value);
        if (id && PLANOS_CURSO[id]) {
            copiarMarkdown('planoCurso', id, PLANOS_CURSO[id]);
        } else {
            alert('Plano de curso não encontrado para copiar');
        }
    }
    else if (tipo === 'abordagem') {
        const caminho = document.getElementById('editCaminho')?.value;
        if (caminho) {
            const partes = caminho.split('/');
            let abordagem = ABORDAGENS;
            for (const parte of partes) {
                abordagem = abordagem?.[parte];
                if (!abordagem) break;
            }
            if (abordagem) {
                copiarMarkdown('abordagem', caminho, abordagem);
            } else {
                alert('Abordagem não encontrada para copiar');
            }
        } else {
            alert('Caminho não informado');
        }
    }
}

// ==================== ABORDAGENS ====================
let ABORDAGENS = {};

async function carregarAbordagensDoGitHub() {
    const url = `${BASE_PATH}abordagem.json?t=${Date.now()}`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            ABORDAGENS = await response.json();
            console.log("✅ Abordagens carregadas!");
        } else {
            console.log("⚠️ abordagem.json não encontrado");
        }
    } catch(e) {
        console.log("⚠️ Arquivo abordagem.json não encontrado");
    }
}

function atualizarListaAbordagensAdmin() {
    const container = document.getElementById('listaAbordagensAdmin');
    const termo = document.getElementById('searchAdminAbordagem')?.value.toLowerCase() || '';
    const campo = document.getElementById('searchAdminAbordagemCampo')?.value || 'tudo';
    
    function buscarAbordagens(obj, caminho = '') {
        let resultados = [];
        for (const [chave, valor] of Object.entries(obj)) {
            const novoCaminho = caminho ? `${caminho}/${chave}` : chave;
            if (valor && typeof valor === 'object' && !Array.isArray(valor) && valor.nome === undefined) {
                resultados = resultados.concat(buscarAbordagens(valor, novoCaminho));
            } else if (valor && typeof valor === 'object' && valor.nome) {
                resultados.push({ caminho: novoCaminho, dados: valor });
            }
        }
        return resultados;
    }
    
    let resultados = buscarAbordagens(ABORDAGENS);
    
    if (termo) {
        resultados = resultados.filter(r => {
            if (campo === 'tudo') {
                return r.caminho.toLowerCase().includes(termo) || r.dados.nome?.toLowerCase().includes(termo);
            } else if (campo === 'caminho') {
                return r.caminho.toLowerCase().includes(termo);
            } else if (campo === 'titulo') {
                return r.dados.nome?.toLowerCase().includes(termo);
            }
            return false;
        });
    }
    
    if (resultados.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhuma abordagem encontrada.</div>';
        return;
    }
    
    container.innerHTML = resultados.map(r => `
        <div class="acao-item" style="cursor:pointer;" onclick="editarAbordagemAdmin('${r.caminho}')">
            <span class="acao-numero">📚</span>
            <span class="acao-texto"><strong>${escapeHtml(r.dados.nome || 'Sem nome')}</strong><br><small style="color:#666;">${escapeHtml(r.caminho)}</small></span>
            <button onclick="event.stopPropagation(); deletarAbordagemAdmin('${r.caminho}')" style="background:#dc3545; padding:2px 8px;">🗑️</button>
        </div>
    `).join('');
}

function editarAbordagemAdmin(caminho) {
    const partes = caminho.split('/');
    let abordagem = ABORDAGENS;
    for (const parte of partes) {
        abordagem = abordagem?.[parte];
        if (!abordagem) break;
    }
    if (!abordagem) { alert('Abordagem não encontrada'); return; }
    
    document.getElementById('editorTitulo').innerHTML = `✏️ Editar Abordagem: ${caminho}`;
    document.getElementById('editorConteudo').innerHTML = `
        <div class="form-row"><label>Caminho:</label><input type="text" id="editCaminho" value="${escapeHtml(caminho)}" readonly style="background:#f0f0f0;"></div>
        <div class="form-row"><label>Nome:</label><input type="text" id="editNome" value="${escapeHtml(abordagem.nome || '')}"></div>
        <div class="form-row"><label>Descrição:</label><textarea id="editDescricao" rows="3">${escapeHtml(abordagem.descricao || '')}</textarea></div>
        <div class="form-row"><label>Dicas (uma por linha):</label><textarea id="editDicas" rows="3">${(abordagem.dicas || []).join('\n')}</textarea></div>
        <div class="form-row"><label>JSON Completo (opcional):</label><textarea id="editJson" rows="10">${JSON.stringify(abordagem, null, 2)}</textarea></div>
        <button onclick="salvarAbordagemAdmin()" class="success">💾 Salvar</button>
    `;
    document.getElementById('formEditor').style.display = 'block';
    window.editandoAdminTipo = 'abordagem';
    window.editandoCaminho = caminho;
}

function salvarAbordagemAdmin() {
    try {
        const jsonStr = document.getElementById('editJson').value;
        const dados = JSON.parse(jsonStr);
        const caminho = document.getElementById('editCaminho').value;
        const partes = caminho.split('/');
        
        let obj = ABORDAGENS;
        for (let i = 0; i < partes.length - 1; i++) {
            if (!obj[partes[i]]) obj[partes[i]] = {};
            obj = obj[partes[i]];
        }
        obj[partes[partes.length - 1]] = dados;
        
        salvarTodosDados();
        document.getElementById('formEditor').style.display = 'none';
        atualizarListaAbordagensAdmin();
        mostrarToast('✅ Abordagem salva!');
    } catch(e) {
        alert('Erro ao salvar: ' + e.message);
    }
}

function deletarAbordagemAdmin(caminho) {
    if (confirm(`Excluir abordagem "${caminho}"?`)) {
        const partes = caminho.split('/');
        let obj = ABORDAGENS;
        for (let i = 0; i < partes.length - 1; i++) {
            obj = obj?.[partes[i]];
            if (!obj) break;
        }
        if (obj && obj[partes[partes.length - 1]]) {
            delete obj[partes[partes.length - 1]];
            salvarTodosDados();
            atualizarListaAbordagensAdmin();
            mostrarToast('✅ Abordagem excluída!');
        }
    }
}

function novaAbordagemAdmin() {
    document.getElementById('editorTitulo').innerHTML = '✏️ Nova Abordagem';
    document.getElementById('editorConteudo').innerHTML = `
        <div class="form-row"><label>Caminho (ex: violino/padroes_digitais):</label><input type="text" id="editCaminho" placeholder="ex: instrumento/nome_da_tecnica"></div>
        <div class="form-row"><label>Nome:</label><input type="text" id="editNome" placeholder="Nome da abordagem"></div>
        <div class="form-row"><label>Descrição:</label><textarea id="editDescricao" rows="3"></textarea></div>
        <div class="form-row"><label>Dicas (uma por linha):</label><textarea id="editDicas" rows="3"></textarea></div>
        <div class="form-row"><label>JSON Completo:</label><textarea id="editJson" rows="10"></textarea></div>
        <button onclick="salvarNovaAbordagemAdmin()" class="success">💾 Salvar</button>
    `;
    document.getElementById('formEditor').style.display = 'block';
    window.editandoAdminTipo = 'novaAbordagem';
}

function salvarNovaAbordagemAdmin() {
    try {
        let dados = {};
        const caminho = document.getElementById('editCaminho').value;
        const jsonStr = document.getElementById('editJson').value;
        
        if (jsonStr.trim()) {
            dados = JSON.parse(jsonStr);
        } else {
            dados = {
                nome: document.getElementById('editNome').value,
                descricao: document.getElementById('editDescricao').value,
                dicas: document.getElementById('editDicas').value.split('\n').filter(l => l.trim())
            };
        }
        
        const partes = caminho.split('/');
        let obj = ABORDAGENS;
        for (let i = 0; i < partes.length - 1; i++) {
            if (!obj[partes[i]]) obj[partes[i]] = {};
            obj = obj[partes[i]];
        }
        obj[partes[partes.length - 1]] = dados;
        
        salvarTodosDados();
        document.getElementById('formEditor').style.display = 'none';
        atualizarListaAbordagensAdmin();
        mostrarToast('✅ Nova abordagem criada!');
    } catch(e) {
        alert('Erro: ' + e.message);
    }
}

// ==================== ADMIN COM PESQUISA ====================
let atividadesFiltradasAdmin = {};
let planosAulaFiltradosAdmin = {};
let planosCursoFiltradosAdmin = {};

function buscarAtividadesAdmin() {
    const termo = document.getElementById('searchAdminAtividade').value.toLowerCase();
    const campo = document.getElementById('searchAdminAtividadeCampo').value;
    
    if (!termo.trim()) {
        atividadesFiltradasAdmin = { ...ATIVIDADES };
    } else {
        atividadesFiltradasAdmin = {};
        for (const [id, ativ] of Object.entries(ATIVIDADES)) {
            let encontrado = false;
            if ((campo === 'tudo' || campo === 'id') && id.toString().includes(termo)) encontrado = true;
            if ((campo === 'tudo' || campo === 'titulo') && ativ.titulo?.toLowerCase().includes(termo)) encontrado = true;
            if ((campo === 'tudo' || campo === 'objetivo') && ativ.objetivo?.toLowerCase().includes(termo)) encontrado = true;
            if (encontrado) atividadesFiltradasAdmin[id] = ativ;
        }
    }
    atualizarListaAtividadesAdmin();
}

function buscarPlanosAulaAdmin() {
    const termo = document.getElementById('searchAdminPlano').value.toLowerCase();
    const campo = document.getElementById('searchAdminPlanoCampo').value;
    
    if (!termo.trim()) {
        planosAulaFiltradosAdmin = { ...PLANOS_AULA };
    } else {
        planosAulaFiltradosAdmin = {};
        for (const [id, plano] of Object.entries(PLANOS_AULA)) {
            let encontrado = false;
            if ((campo === 'tudo' || campo === 'id') && id.toString().includes(termo)) encontrado = true;
            if ((campo === 'tudo' || campo === 'titulo') && plano.titulo?.toLowerCase().includes(termo)) encontrado = true;
            if ((campo === 'tudo' || campo === 'objetivoGeral') && plano.objetivoGeral?.toLowerCase().includes(termo)) encontrado = true;
            if (encontrado) planosAulaFiltradosAdmin[id] = plano;
        }
    }
    atualizarListaPlanosAulaAdmin();
}

function buscarPlanosCursoAdmin() {
    const termo = document.getElementById('searchAdminCurso').value.toLowerCase();
    const campo = document.getElementById('searchAdminCursoCampo').value;
    
    if (!termo.trim()) {
        planosCursoFiltradosAdmin = { ...PLANOS_CURSO };
    } else {
        planosCursoFiltradosAdmin = {};
        for (const [id, curso] of Object.entries(PLANOS_CURSO)) {
            let encontrado = false;
            if ((campo === 'tudo' || campo === 'id') && id.toString().includes(termo)) encontrado = true;
            if ((campo === 'tudo' || campo === 'nome') && curso.nome?.toLowerCase().includes(termo)) encontrado = true;
            if (encontrado) planosCursoFiltradosAdmin[id] = curso;
        }
    }
    atualizarListaPlanosCursoAdmin();
}

function limparBuscaAtividadesAdmin() {
    document.getElementById('searchAdminAtividade').value = '';
    atividadesFiltradasAdmin = { ...ATIVIDADES };
    atualizarListaAtividadesAdmin();
}

function limparBuscaPlanosAdmin() {
    document.getElementById('searchAdminPlano').value = '';
    planosAulaFiltradosAdmin = { ...PLANOS_AULA };
    atualizarListaPlanosAulaAdmin();
}

function limparBuscaCursosAdmin() {
    document.getElementById('searchAdminCurso').value = '';
    planosCursoFiltradosAdmin = { ...PLANOS_CURSO };
    atualizarListaPlanosCursoAdmin();
}

function atualizarListaAtividadesAdmin() {
    const container = document.getElementById('listaAtividadesAdmin');
    const ids = Object.keys(atividadesFiltradasAdmin).sort((a,b)=>a-b);
    if (ids.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhuma atividade encontrada.</div>';
        return;
    }
    container.innerHTML = ids.map(id => `<div class="acao-item" style="cursor:pointer;" onclick="editarAtividadeAdmin(${id})">
        <span class="acao-numero">ID ${id}</span>
        <span class="acao-texto">${escapeHtml(ATIVIDADES[id]?.titulo || 'Sem título')}</span>
        <button onclick="event.stopPropagation(); deletarAtividadeAdmin(${id})" style="background:#dc3545; padding:2px 8px;">🗑️</button>
    </div>`).join('');
}

function atualizarListaPlanosAulaAdmin() {
    const container = document.getElementById('listaPlanosAulaAdmin');
    const ids = Object.keys(planosAulaFiltradosAdmin).sort((a,b)=>a-b);
    if (ids.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhum plano de aula encontrado.</div>';
        return;
    }
    container.innerHTML = ids.map(id => `<div class="acao-item" style="cursor:pointer;" onclick="editarPlanoAulaAdmin(${id})">
        <span class="acao-numero">ID ${id}</span>
        <span class="acao-texto">${escapeHtml(PLANOS_AULA[id]?.titulo || 'Sem título')}</span>
        <button onclick="event.stopPropagation(); deletarPlanoAulaAdmin(${id})" style="background:#dc3545; padding:2px 8px;">🗑️</button>
    </div>`).join('');
}

function atualizarListaPlanosCursoAdmin() {
    const container = document.getElementById('listaPlanosCursoAdmin');
    const ids = Object.keys(planosCursoFiltradosAdmin).sort((a,b)=>a-b);
    if (ids.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhum plano de curso encontrado.</div>';
        return;
    }
    container.innerHTML = ids.map(id => `<div class="acao-item" style="cursor:pointer;" onclick="editarPlanoCursoAdmin(${id})">
        <span class="acao-numero">ID ${id}</span>
        <span class="acao-texto">${escapeHtml(PLANOS_CURSO[id]?.nome || 'Sem nome')}</span>
        <button onclick="event.stopPropagation(); deletarPlanoCursoAdmin(${id})" style="background:#dc3545; padding:2px 8px;">🗑️</button>
    </div>`).join('');
}

function editarAtividadeAdmin(id) {
    const ativ = ATIVIDADES[id];
    if (!ativ) { alert('Atividade não encontrada'); return; }
    
    const categoriasBaseStr = (ativ.categorias_base || [ativ.categoria || '']).join(', ');
    
    // Obter categorias disponíveis para o datalist
    const categoriasBaseOptions = CATEGORIAS_BASE.map(c => `<option value="${c}">`).join('');
    const categoriasPedagogicasOptions = CATEGORIAS_PEDAGOGICAS.map(c => `<option value="${c}">`).join('');
    const categoriasTipoAtividadeOptions = CATEGORIAS_TIPO_ATIVIDADE.map(c => `<option value="${c}">`).join('');
    const categoriasInteracaoOptions = CATEGORIAS_INTERACAO.map(c => `<option value="${c}">`).join('');
    const categoriasCognitivasOptions = CATEGORIAS_COGNITIVAS.map(c => `<option value="${c}">`).join('');
    const categoriasElementoOptions = CATEGORIAS_ELEMENTO_MUSICAL.map(c => `<option value="${c}">`).join('');
    const categoriasConteudoOptions = CATEGORIAS_CONTEUDO.map(c => `<option value="${c}">`).join('');
    const categoriasPedagogosOptions = CATEGORIAS_PEDAGOGOS.map(c => `<option value="${c}">`).join('');
    const categoriasPrincipiosOptions = CATEGORIAS_PRINCIPIOS.map(c => `<option value="${c}">`).join('');
    
    document.getElementById('editorTitulo').innerHTML = `✏️ Editar Atividade ID ${id}`;
    document.getElementById('editorConteudo').innerHTML = `
        <div class="form-row"><label>ID:</label><input type="number" id="editId" value="${id}" readonly></div>
        <div class="form-row"><label>Título:</label><input type="text" id="editTitulo" value="${escapeHtml(ativ.titulo || '')}"></div>
        <div class="form-row"><label>Categorias Base (separadas por vírgula):</label>
            <input type="text" id="editCategoriasBase" value="${escapeHtml(categoriasBaseStr)}" list="categoriasBaseList" placeholder="Ex: Percepção, Escrita, Memória">
            <datalist id="categoriasBaseList">${categoriasBaseOptions}</datalist>
            <small>Opções disponíveis: ${CATEGORIAS_BASE.join(', ')}</small>
        </div>
        <div class="form-row"><label>Objetivo:</label><textarea id="editObjetivo" rows="3">${escapeHtml(ativ.objetivo || '')}</textarea></div>
        <div class="form-row"><label>Materiais (um por linha):</label><textarea id="editMateriais" rows="3">${(ativ.materiais || []).join('\n')}</textarea></div>
        <div class="form-row"><label>Passo a passo (um por linha):</label><textarea id="editPassos" rows="5">${(ativ.passo_a_passo || []).join('\n')}</textarea></div>
        <div class="form-row"><label>Duração:</label><input type="text" id="editDuracao" value="${escapeHtml(ativ.duracao || '')}"></div>
        <div class="form-row"><label>Nível:</label><select id="editNivel">${[1,2,3,4,5].map(n => `<option value="${n}" ${ativ.nivel===n?'selected':''}>Nível ${n}</option>`).join('')}</select></div>
        <div class="form-row"><label>IDs das Ações (separados por vírgula):</label><input type="text" id="editAcoesIds" value="${(ativ.acoes_ids || []).join(', ')}"></div>
        
        <details open><summary>🏷️ Tags Avançadas (opcional)</summary>
            <div class="form-row"><label>Pedagógico (separados por vírgula):</label>
                <input type="text" id="editPedagogico" value="${(ativ.tags_avancadas?.pedagogico || []).join(', ')}" list="pedagogicoList">
                <datalist id="pedagogicoList">${categoriasPedagogicasOptions}</datalist>
            </div>
            <div class="form-row"><label>Tipo de Atividade (separados por vírgula):</label>
                <input type="text" id="editTipoAtividade" value="${(ativ.tags_avancadas?.tipo_atividade || []).join(', ')}" list="tipoAtividadeList">
                <datalist id="tipoAtividadeList">${categoriasTipoAtividadeOptions}</datalist>
            </div>
            <div class="form-row"><label>Interação Social (separados por vírgula):</label>
                <input type="text" id="editInteracao" value="${(ativ.tags_avancadas?.interacao || []).join(', ')}" list="interacaoList">
                <datalist id="interacaoList">${categoriasInteracaoOptions}</datalist>
            </div>
            <div class="form-row"><label>Cognitivo (separados por vírgula):</label>
                <input type="text" id="editCognitivo" value="${(ativ.tags_avancadas?.cognitivo || []).join(', ')}" list="cognitivoList">
                <datalist id="cognitivoList">${categoriasCognitivasOptions}</datalist>
            </div>
            <div class="form-row"><label>Elemento Musical (separados por vírgula):</label>
                <input type="text" id="editElemento" value="${(ativ.tags_avancadas?.elemento_musical || []).join(', ')}" list="elementoList">
                <datalist id="elementoList">${categoriasElementoOptions}</datalist>
            </div>
            <div class="form-row"><label>Conteúdo (separados por vírgula):</label>
                <input type="text" id="editConteudo" value="${(ativ.tags_avancadas?.conteudo || []).join(', ')}" list="conteudoList">
                <datalist id="conteudoList">${categoriasConteudoOptions}</datalist>
            </div>
            <div class="form-row"><label>Pedagogos (separados por vírgula):</label>
                <input type="text" id="editPedagogos" value="${(ativ.tags_avancadas?.pedagogos || []).join(', ')}" list="pedagogosList">
                <datalist id="pedagogosList">${categoriasPedagogosOptions}</datalist>
            </div>
            <div class="form-row"><label>Princípios (separados por vírgula):</label>
                <input type="text" id="editPrincipios" value="${(ativ.tags_avancadas?.principios || []).join(', ')}" list="principiosList">
                <datalist id="principiosList">${categoriasPrincipiosOptions}</datalist>
            </div>
        </details>
        
        <button onclick="salvarAtividadeAdmin()" class="success">💾 Salvar</button>
    `;
    document.getElementById('formEditor').style.display = 'block';
    window.editandoAdminTipo = 'atividade';
    window.editandoId = id;
}

function editarPlanoAulaAdmin(id) {
    const plano = PLANOS_AULA[id];
    if (!plano) { alert('Plano não encontrado'); return; }
    
    document.getElementById('editorTitulo').innerHTML = `✏️ Editar Plano de Aula ID ${id}`;
    document.getElementById('editorConteudo').innerHTML = `
        <div class="form-row"><label>ID:</label><input type="number" id="editId" value="${id}" readonly></div>
        <div class="form-row"><label>Título:</label><input type="text" id="editTitulo" value="${escapeHtml(plano.titulo || '')}"></div>
        <div class="form-row"><label>Nível:</label><select id="editNivel">${[1,2,3,4,5].map(n => `<option value="${n}" ${plano.nivel===n?'selected':''}>Nível ${n}</option>`).join('')}</select></div>
        <div class="form-row"><label>Duração:</label><input type="text" id="editDuracao" value="${escapeHtml(plano.duracao || '')}"></div>
        
        <div class="form-row"><label>Objetivo Geral:</label><textarea id="editObjetivoGeral" rows="2">${escapeHtml(plano.objetivoGeral || '')}</textarea></div>
        
        <div class="form-row"><label>Objetivos Específicos (um por linha):</label><textarea id="editObjetivosEspecificos" rows="4">${(plano.objetivosEspecificos || []).join('\n')}</textarea></div>
        
        <div class="form-row"><label>Conteúdo (um por linha):</label><textarea id="editConteudo" rows="4">${(plano.conteudo || []).join('\n')}</textarea></div>
        
        <div class="form-row"><label>Metodologia:</label><textarea id="editMetodologia" rows="3">${escapeHtml(plano.metodologia || '')}</textarea></div>
        
        <div class="form-row"><label>Recursos Didáticos (um por linha):</label><textarea id="editRecursosDidaticos" rows="3">${(plano.recursosDidaticos || []).join('\n')}</textarea></div>
        
        <div class="form-row"><label>Desenvolvimento (um por linha):</label><textarea id="editDesenvolvimento" rows="5">${(plano.desenvolvimento || []).join('\n')}</textarea></div>
        
        <div class="form-row"><label>Avaliação:</label><textarea id="editAvaliacao" rows="2">${escapeHtml(plano.avaliacao || '')}</textarea></div>
        
        <div class="form-row"><label>IDs das Atividades (separados por vírgula):</label><input type="text" id="editAtividadesIds" value="${(plano.atividades_ids || []).join(', ')}"></div>
        
        <div class="form-row"><label>Adaptações (um por linha):</label><textarea id="editAdaptacoes" rows="3">${(plano.adaptacoes || []).join('\n')}</textarea></div>
        
        <div class="form-row"><label>Tarefa de Casa:</label><textarea id="editTarefaCasa" rows="2">${escapeHtml(plano.tarefaCasa || '')}</textarea></div>
        
        <div class="form-row"><label>Referências (um por linha):</label><textarea id="editReferencias" rows="3">${(plano.referencias || []).join('\n')}</textarea></div>
        
        <div class="form-row"><label>Observações:</label><textarea id="editObservacoes" rows="2">${escapeHtml(plano.observacoes || '')}</textarea></div>
        
        <button onclick="salvarPlanoAulaAdmin()" class="success">💾 Salvar</button>
    `;
    document.getElementById('formEditor').style.display = 'block';
    window.editandoAdminTipo = 'planoAula';
    window.editandoId = id;
}

function editarPlanoCursoAdmin(id) {
    const plano = PLANOS_CURSO[id];
    if (!plano) { alert('Curso não encontrado'); return; }
    document.getElementById('editorTitulo').innerHTML = `✏️ Editar Plano de Curso ID ${id}`;
    document.getElementById('editorConteudo').innerHTML = `
        <div class="form-row"><label>ID:</label><input type="number" id="editId" value="${id}" readonly></div>
        <div class="form-row"><label>Nome:</label><input type="text" id="editNome" value="${escapeHtml(plano.nome || '')}"></div>
        <div class="form-row"><label>Ano:</label><input type="number" id="editAno" value="${plano.ano || 1}"></div>
        <div class="form-row"><label>Nível:</label><select id="editNivelCurso">${[1,2,3,4,5].map(n => `<option value="${n}" ${plano.nivel===n?'selected':''}>Nível ${n}</option>`).join('')}</select></div>
        <div class="form-row"><label>Objetivo Geral:</label><textarea id="editObjetivoGeralCurso" rows="2">${escapeHtml(plano.objetivoGeral || '')}</textarea></div>
        <div class="form-row"><label>Carga Horária:</label><input type="number" id="editCarga" value="${plano.cargaHoraria || 40}"></div>
        <div class="form-row"><label>IDs dos Planos de Aula (separados por vírgula):</label><input type="text" id="editPlanosAulaIds" value="${(plano.planos_aula_ids || []).join(', ')}"></div>
        <button onclick="salvarPlanoCursoAdmin()" class="success">💾 Salvar</button>
    `;
    document.getElementById('formEditor').style.display = 'block';
    window.editandoAdminTipo = 'planoCurso';
    window.editandoId = id;
}

function salvarAtividadeAdmin() {
    const id = parseInt(document.getElementById('editId').value);
    
    const categoriasBaseStr = document.getElementById('editCategoriasBase').value;
    const categoriasBase = categoriasBaseStr ? categoriasBaseStr.split(',').map(s => s.trim()).filter(s => s) : [];
    
    const tags_avancadas = {};
    
    const pedagogico = document.getElementById('editPedagogico')?.value.split(',').map(s=>s.trim()).filter(s=>s);
    if (pedagogico && pedagogico.length) tags_avancadas.pedagogico = pedagogico;
    
    const tipo_atividade = document.getElementById('editTipoAtividade')?.value.split(',').map(s=>s.trim()).filter(s=>s);
    if (tipo_atividade && tipo_atividade.length) tags_avancadas.tipo_atividade = tipo_atividade;
    
    const interacao = document.getElementById('editInteracao')?.value.split(',').map(s=>s.trim()).filter(s=>s);
    if (interacao && interacao.length) tags_avancadas.interacao = interacao;
    
    const cognitivo = document.getElementById('editCognitivo')?.value.split(',').map(s=>s.trim()).filter(s=>s);
    if (cognitivo && cognitivo.length) tags_avancadas.cognitivo = cognitivo;
    
    const elemento_musical = document.getElementById('editElemento')?.value.split(',').map(s=>s.trim()).filter(s=>s);
    if (elemento_musical && elemento_musical.length) tags_avancadas.elemento_musical = elemento_musical;
    
    const conteudo = document.getElementById('editConteudo')?.value.split(',').map(s=>s.trim()).filter(s=>s);
    if (conteudo && conteudo.length) tags_avancadas.conteudo = conteudo;
    
    const pedagogos = document.getElementById('editPedagogos')?.value.split(',').map(s=>s.trim()).filter(s=>s);
    if (pedagogos && pedagogos.length) tags_avancadas.pedagogos = pedagogos;
    
    const principios = document.getElementById('editPrincipios')?.value.split(',').map(s=>s.trim()).filter(s=>s);
    if (principios && principios.length) tags_avancadas.principios = principios;
    
    const acoesIdsStr = document.getElementById('editAcoesIds').value;
    const acoesIds = acoesIdsStr ? acoesIdsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : [];
    
    ATIVIDADES[id] = {
        id: id,
        titulo: document.getElementById('editTitulo').value,
        categorias_base: categoriasBase,
        objetivo: document.getElementById('editObjetivo').value,
        nivel: parseInt(document.getElementById('editNivel').value) || 1,
        materiais: document.getElementById('editMateriais').value.split('\n').filter(l=>l.trim()),
        passo_a_passo: document.getElementById('editPassos').value.split('\n').filter(l=>l.trim()),
        duracao: document.getElementById('editDuracao').value,
        acoes_ids: acoesIds
    };
    
    if (Object.keys(tags_avancadas).length > 0) {
        ATIVIDADES[id].tags_avancadas = tags_avancadas;
    }
    
    salvarTodosDados();
    document.getElementById('formEditor').style.display = 'none';
    atividadesFiltradasAdmin = { ...ATIVIDADES };
    TODAS_ACOES = gerarAcoesAPartirDasAtividades();
    atualizarListaAtividadesAdmin();
    atualizarAcoes();
    mostrarToast('✅ Atividade salva!');
}

function salvarPlanoAulaAdmin() {
    const id = parseInt(document.getElementById('editId').value);
    
    const atividadesIdsStr = document.getElementById('editAtividadesIds').value;
    const atividadesIds = atividadesIdsStr ? atividadesIdsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : [];
    
    const objetivosEspecificos = document.getElementById('editObjetivosEspecificos')?.value.split('\n').filter(l => l.trim()) || [];
    const conteudo = document.getElementById('editConteudo')?.value.split('\n').filter(l => l.trim()) || [];
    const recursosDidaticos = document.getElementById('editRecursosDidaticos')?.value.split('\n').filter(l => l.trim()) || [];
    const desenvolvimento = document.getElementById('editDesenvolvimento')?.value.split('\n').filter(l => l.trim()) || [];
    const adaptacoes = document.getElementById('editAdaptacoes')?.value.split('\n').filter(l => l.trim()) || [];
    const referencias = document.getElementById('editReferencias')?.value.split('\n').filter(l => l.trim()) || [];
    
    PLANOS_AULA[id] = {
        id: id,
        titulo: document.getElementById('editTitulo').value,
        nivel: parseInt(document.getElementById('editNivel').value),
        duracao: document.getElementById('editDuracao').value,
        objetivoGeral: document.getElementById('editObjetivoGeral').value,
        objetivosEspecificos: objetivosEspecificos,
        conteudo: conteudo,
        metodologia: document.getElementById('editMetodologia').value,
        recursosDidaticos: recursosDidaticos,
        desenvolvimento: desenvolvimento,
        avaliacao: document.getElementById('editAvaliacao').value,
        atividades_ids: atividadesIds,
        adaptacoes: adaptacoes,
        tarefaCasa: document.getElementById('editTarefaCasa').value,
        referencias: referencias,
        observacoes: document.getElementById('editObservacoes').value
    };
    
    salvarTodosDados();
    document.getElementById('formEditor').style.display = 'none';
    planosAulaFiltradosAdmin = { ...PLANOS_AULA };
    atualizarListaPlanosAulaAdmin();
    mostrarToast('✅ Plano de aula salvo!');
}

function salvarPlanoCursoAdmin() {
    const id = parseInt(document.getElementById('editId').value);
    const planosAulaIdsStr = document.getElementById('editPlanosAulaIds').value;
    const planosAulaIds = planosAulaIdsStr ? planosAulaIdsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : [];
    PLANOS_CURSO[id] = {
        id: id,
        nome: document.getElementById('editNome').value,
        ano: parseInt(document.getElementById('editAno').value),
        nivel: parseInt(document.getElementById('editNivelCurso').value),
        objetivoGeral: document.getElementById('editObjetivoGeralCurso').value,
        cargaHoraria: parseInt(document.getElementById('editCarga').value),
        planos_aula_ids: planosAulaIds
    };
    salvarTodosDados();
    document.getElementById('formEditor').style.display = 'none';
    planosCursoFiltradosAdmin = { ...PLANOS_CURSO };
    atualizarListaPlanosCursoAdmin();
    mostrarToast('✅ Plano de curso salvo!');
}

function novaAtividadeAdmin() {
    const categoriasBaseOptions = CATEGORIAS_BASE.map(c => `<option value="${c}">`).join('');
    const categoriasPedagogicasOptions = CATEGORIAS_PEDAGOGICAS.map(c => `<option value="${c}">`).join('');
    const categoriasTipoAtividadeOptions = CATEGORIAS_TIPO_ATIVIDADE.map(c => `<option value="${c}">`).join('');
    const categoriasInteracaoOptions = CATEGORIAS_INTERACAO.map(c => `<option value="${c}">`).join('');
    const categoriasCognitivasOptions = CATEGORIAS_COGNITIVAS.map(c => `<option value="${c}">`).join('');
    const categoriasElementoOptions = CATEGORIAS_ELEMENTO_MUSICAL.map(c => `<option value="${c}">`).join('');
    const categoriasConteudoOptions = CATEGORIAS_CONTEUDO.map(c => `<option value="${c}">`).join('');
    const categoriasPedagogosOptions = CATEGORIAS_PEDAGOGOS.map(c => `<option value="${c}">`).join('');
    const categoriasPrincipiosOptions = CATEGORIAS_PRINCIPIOS.map(c => `<option value="${c}">`).join('');
    
    document.getElementById('editorTitulo').innerHTML = '✏️ Nova Atividade';
    document.getElementById('editorConteudo').innerHTML = `
        <div class="form-row"><label>ID da Atividade:</label><input type="number" id="editId"></div>
        <div class="form-row"><label>Título:</label><input type="text" id="editTitulo"></div>
        <div class="form-row"><label>Categorias Base (separadas por vírgula):</label>
            <input type="text" id="editCategoriasBase" list="categoriasBaseList" placeholder="Ex: Percepção, Escrita, Memória">
            <datalist id="categoriasBaseList">${categoriasBaseOptions}</datalist>
            <small>Opções: ${CATEGORIAS_BASE.join(', ')}</small>
        </div>
        <div class="form-row"><label>Objetivo:</label><textarea id="editObjetivo" rows="3"></textarea></div>
        <div class="form-row"><label>Materiais (um por linha):</label><textarea id="editMateriais" rows="3"></textarea></div>
        <div class="form-row"><label>Passo a passo (um por linha):</label><textarea id="editPassos" rows="5"></textarea></div>
        <div class="form-row"><label>Duração:</label><input type="text" id="editDuracao"></div>
        <div class="form-row"><label>Nível:</label><select id="editNivel"><option value="1">Nível 1</option><option value="2">Nível 2</option><option value="3">Nível 3</option><option value="4">Nível 4</option><option value="5">Nível 5</option></select></div>
        <div class="form-row"><label>IDs das Ações (separados por vírgula):</label><input type="text" id="editAcoesIds"></div>
        
        <details open><summary>🏷️ Tags Avançadas (opcional)</summary>
            <div class="form-row"><label>Pedagógico (separados por vírgula):</label>
                <input type="text" id="editPedagogico" list="pedagogicoList" placeholder="Ex: Alfabetização Musical, Ritmo">
                <datalist id="pedagogicoList">${categoriasPedagogicasOptions}</datalist>
            </div>
            <div class="form-row"><label>Tipo de Atividade:</label>
                <input type="text" id="editTipoAtividade" list="tipoAtividadeList" placeholder="Ex: Jogo, Exercício, Desafio">
                <datalist id="tipoAtividadeList">${categoriasTipoAtividadeOptions}</datalist>
            </div>
            <div class="form-row"><label>Interação Social:</label>
                <input type="text" id="editInteracao" list="interacaoList" placeholder="Ex: Individual, Dupla, Grupo">
                <datalist id="interacaoList">${categoriasInteracaoOptions}</datalist>
            </div>
            <div class="form-row"><label>Cognitivo:</label>
                <input type="text" id="editCognitivo" list="cognitivoList" placeholder="Ex: Memória, Percepção, Raciocínio">
                <datalist id="cognitivoList">${categoriasCognitivasOptions}</datalist>
            </div>
            <div class="form-row"><label>Elemento Musical:</label>
                <input type="text" id="editElemento" list="elementoList" placeholder="Ex: Altura, Duração, Timbre">
                <datalist id="elementoList">${categoriasElementoOptions}</datalist>
            </div>
            <div class="form-row"><label>Conteúdo:</label>
                <input type="text" id="editConteudo" list="conteudoList" placeholder="Ex: Escala, Acorde, Intervalo">
                <datalist id="conteudoList">${categoriasConteudoOptions}</datalist>
            </div>
            <div class="form-row"><label>Pedagogos:</label>
                <input type="text" id="editPedagogos" list="pedagogosList" placeholder="Ex: Kodály, Orff, Suzuki">
                <datalist id="pedagogosList">${categoriasPedagogosOptions}</datalist>
            </div>
            <div class="form-row"><label>Princípios:</label>
                <input type="text" id="editPrincipios" list="principiosList" placeholder="Ex: Movimento corporal, Criatividade">
                <datalist id="principiosList">${categoriasPrincipiosOptions}</datalist>
            </div>
        </details>
        
        <button onclick="salvarAtividadeAdmin()" class="success">💾 Salvar</button>
    `;
    document.getElementById('formEditor').style.display = 'block';
    window.editandoAdminTipo = 'atividade';
}

function novoPlanoAulaAdmin() {
    document.getElementById('editorTitulo').innerHTML = '✏️ Novo Plano de Aula';
    document.getElementById('editorConteudo').innerHTML = `
        <div class="form-row"><label>ID do Plano:</label><input type="number" id="editId"></div>
        <div class="form-row"><label>Título:</label><input type="text" id="editTitulo"></div>
        <div class="form-row"><label>Nível:</label><select id="editNivel"><option value="1">Nível 1</option><option value="2">Nível 2</option><option value="3">Nível 3</option><option value="4">Nível 4</option><option value="5">Nível 5</option></select></div>
        <div class="form-row"><label>Duração:</label><input type="text" id="editDuracao" value="50min"></div>
        
        <div class="form-row"><label>Objetivo Geral:</label><textarea id="editObjetivoGeral" rows="2"></textarea></div>
        
        <div class="form-row"><label>Objetivos Específicos (um por linha):</label><textarea id="editObjetivosEspecificos" rows="4"></textarea></div>
        
        <div class="form-row"><label>Conteúdo (um por linha):</label><textarea id="editConteudo" rows="4"></textarea></div>
        
        <div class="form-row"><label>Metodologia:</label><textarea id="editMetodologia" rows="3"></textarea></div>
        
        <div class="form-row"><label>Recursos Didáticos (um por linha):</label><textarea id="editRecursosDidaticos" rows="3"></textarea></div>
        
        <div class="form-row"><label>Desenvolvimento (um por linha):</label><textarea id="editDesenvolvimento" rows="5"></textarea></div>
        
        <div class="form-row"><label>Avaliação:</label><textarea id="editAvaliacao" rows="2"></textarea></div>
        
        <div class="form-row"><label>IDs das Atividades (separados por vírgula):</label><input type="text" id="editAtividadesIds"></div>
        
        <div class="form-row"><label>Adaptações (um por linha):</label><textarea id="editAdaptacoes" rows="3"></textarea></div>
        
        <div class="form-row"><label>Tarefa de Casa:</label><textarea id="editTarefaCasa" rows="2"></textarea></div>
        
        <div class="form-row"><label>Referências (um por linha):</label><textarea id="editReferencias" rows="3"></textarea></div>
        
        <div class="form-row"><label>Observações:</label><textarea id="editObservacoes" rows="2"></textarea></div>
        
        <button onclick="salvarPlanoAulaAdmin()" class="success">💾 Salvar</button>
    `;
    document.getElementById('formEditor').style.display = 'block';
    window.editandoAdminTipo = 'planoAula';
}

function novoPlanoCursoAdmin() {
    document.getElementById('editorTitulo').innerHTML = '✏️ Novo Plano de Curso';
    document.getElementById('editorConteudo').innerHTML = `
        <div class="form-row"><label>ID do Curso:</label><input type="number" id="editId"></div>
        <div class="form-row"><label>Nome:</label><input type="text" id="editNome"></div>
        <div class="form-row"><label>Ano:</label><input type="number" id="editAno" value="1"></div>
        <div class="form-row"><label>Nível:</label><select id="editNivelCurso"><option value="1">Nível 1</option><option value="2">Nível 2</option><option value="3">Nível 3</option><option value="4">Nível 4</option><option value="5">Nível 5</option></select></div>
        <div class="form-row"><label>Objetivo Geral:</label><textarea id="editObjetivoGeralCurso" rows="2"></textarea></div>
        <div class="form-row"><label>Carga Horária:</label><input type="number" id="editCarga" value="40"></div>
        <div class="form-row"><label>IDs dos Planos de Aula (separados por vírgula):</label><input type="text" id="editPlanosAulaIds"></div>
        <button onclick="salvarPlanoCursoAdmin()" class="success">💾 Salvar</button>
    `;
    document.getElementById('formEditor').style.display = 'block';
    window.editandoAdminTipo = 'planoCurso';
}

function deletarAtividadeAdmin(id) {
    if (confirm(`Excluir atividade ID ${id}?`)) {
        delete ATIVIDADES[id];
        salvarTodosDados();
        atividadesFiltradasAdmin = { ...ATIVIDADES };
        TODAS_ACOES = gerarAcoesAPartirDasAtividades();
        atualizarListaAtividadesAdmin();
        atualizarAcoes();
        mostrarToast('✅ Atividade excluída!');
    }
}

function deletarPlanoAulaAdmin(id) {
    if (confirm(`Excluir plano de aula ID ${id}?`)) {
        delete PLANOS_AULA[id];
        salvarTodosDados();
        planosAulaFiltradosAdmin = { ...PLANOS_AULA };
        atualizarListaPlanosAulaAdmin();
        mostrarToast('✅ Plano de aula excluído!');
    }
}

function deletarPlanoCursoAdmin(id) {
    if (confirm(`Excluir plano de curso ID ${id}?`)) {
        delete PLANOS_CURSO[id];
        salvarTodosDados();
        planosCursoFiltradosAdmin = { ...PLANOS_CURSO };
        atualizarListaPlanosCursoAdmin();
        mostrarToast('✅ Plano de curso excluído!');
    }
}

function atualizarListasAdmin() {
    atualizarListaAtividadesAdmin();
    atualizarListaPlanosAulaAdmin();
    atualizarListaPlanosCursoAdmin();
    atualizarListaAbordagensAdmin();
}

// ==================== EXPORTAÇÃO ====================
function baixarArquivo(conteudo, nome) { 
    const blob = new Blob([conteudo], {type:'application/json'}); 
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(blob); 
    a.download = nome; 
    a.click(); 
    URL.revokeObjectURL(blob); 
}

function exportarAtividades() { 
    baixarArquivo(JSON.stringify(ATIVIDADES, null, 2), `atividades_completo_${new Date().toISOString().split('T')[0]}.json`); 
}

function exportarAtividadesPorBloco(inicio, fim) {
    const bloco = {};
    for (let i = inicio; i <= fim; i++) {
        if (ATIVIDADES[i]) {
            bloco[i] = ATIVIDADES[i];
        }
    }
    baixarArquivo(JSON.stringify(bloco, null, 2), `atividades${inicio}_${fim}.json`);
}

function exportarTodosBlocos() {
    const blocos = [
        { inicio: 1, fim: 100 },
        { inicio: 101, fim: 200 },
        { inicio: 201, fim: 300 },
        { inicio: 301, fim: 400 },
        { inicio: 401, fim: 500 }
    ];
    for (const bloco of blocos) {
        exportarAtividadesPorBloco(bloco.inicio, bloco.fim);
    }
    mostrarToast('✅ Blocos exportados! Verifique a pasta de downloads.');
}

function exportarPlanosAula() { 
    baixarArquivo(JSON.stringify(PLANOS_AULA, null, 2), `planos_aula.json`); 
}

function exportarPlanosCurso() { 
    baixarArquivo(JSON.stringify(PLANOS_CURSO, null, 2), `planos_curso.json`); 
}

function exportarTudo() { 
    baixarArquivo(JSON.stringify({ 
        atividades: ATIVIDADES, 
        planosAula: PLANOS_AULA, 
        planosCurso: PLANOS_CURSO 
    }, null, 2), `backup_completo_${new Date().toISOString().split('T')[0]}.json`); 
}

function exportarAtividadesEspecificas() {
    const input = document.getElementById('exportarIdsAtividades').value;
    if (!input.trim()) {
        alert('Digite pelo menos um ID de atividade');
        return;
    }
    
    const ids = input.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    if (ids.length === 0) {
        alert('Nenhum ID válido encontrado');
        return;
    }
    
    const atividadesSelecionadas = {};
    let encontradas = 0;
    let naoEncontradas = [];
    
    for (const id of ids) {
        if (ATIVIDADES[id]) {
            atividadesSelecionadas[id] = ATIVIDADES[id];
            encontradas++;
        } else {
            naoEncontradas.push(id);
        }
    }
    
    if (encontradas === 0) {
        alert(`Nenhuma atividade encontrada com os IDs: ${ids.join(', ')}`);
        return;
    }
    
    const json = JSON.stringify(atividadesSelecionadas, null, 2);
    const nomeArquivo = `atividades_ids_${ids.join('_')}.json`;
    baixarArquivo(json, nomeArquivo);
    
    let msg = `✅ ${encontradas} atividades exportadas!`;
    if (naoEncontradas.length > 0) {
        msg += `\n⚠️ IDs não encontrados: ${naoEncontradas.join(', ')}`;
    }
    mostrarToast(msg);
}

function exportarPlanosAulaEspecificos() {
    const input = document.getElementById('exportarIdsPlanosAula').value;
    if (!input.trim()) {
        alert('Digite pelo menos um ID de plano de aula');
        return;
    }
    
    const ids = input.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    if (ids.length === 0) {
        alert('Nenhum ID válido encontrado');
        return;
    }
    
    const planosSelecionados = {};
    let encontradas = 0;
    let naoEncontradas = [];
    
    for (const id of ids) {
        if (PLANOS_AULA[id]) {
            planosSelecionados[id] = PLANOS_AULA[id];
            encontradas++;
        } else {
            naoEncontradas.push(id);
        }
    }
    
    if (encontradas === 0) {
        alert(`Nenhum plano de aula encontrado com os IDs: ${ids.join(', ')}`);
        return;
    }
    
    const json = JSON.stringify(planosSelecionados, null, 2);
    const nomeArquivo = `planos_aula_ids_${ids.join('_')}.json`;
    baixarArquivo(json, nomeArquivo);
    
    let msg = `✅ ${encontradas} planos de aula exportados!`;
    if (naoEncontradas.length > 0) {
        msg += `\n⚠️ IDs não encontrados: ${naoEncontradas.join(', ')}`;
    }
    mostrarToast(msg);
}

function exportarPlanosCursoEspecificos() {
    const input = document.getElementById('exportarIdsPlanosCurso').value;
    if (!input.trim()) {
        alert('Digite pelo menos um ID de plano de curso');
        return;
    }
    
    const ids = input.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    if (ids.length === 0) {
        alert('Nenhum ID válido encontrado');
        return;
    }
    
    const planosSelecionados = {};
    let encontradas = 0;
    let naoEncontradas = [];
    
    for (const id of ids) {
        if (PLANOS_CURSO[id]) {
            planosSelecionados[id] = PLANOS_CURSO[id];
            encontradas++;
        } else {
            naoEncontradas.push(id);
        }
    }
    
    if (encontradas === 0) {
        alert(`Nenhum plano de curso encontrado com os IDs: ${ids.join(', ')}`);
        return;
    }
    
    const json = JSON.stringify(planosSelecionados, null, 2);
    const nomeArquivo = `planos_curso_ids_${ids.join('_')}.json`;
    baixarArquivo(json, nomeArquivo);
    
    let msg = `✅ ${encontradas} planos de curso exportados!`;
    if (naoEncontradas.length > 0) {
        msg += `\n⚠️ IDs não encontrados: ${naoEncontradas.join(', ')}`;
    }
    mostrarToast(msg);
}

function importarDados() { 
    const file = document.getElementById('arquivoImport').files[0]; 
    if(!file) return; 
    const reader = new FileReader(); 
    reader.onload = function(e) { 
        try { 
            const dados = JSON.parse(e.target.result); 
            
            if(dados.atividades) ATIVIDADES = dados.atividades; 
            if(dados.planosAula) PLANOS_AULA = dados.planosAula; 
            if(dados.planosCurso) PLANOS_CURSO = dados.planosCurso; 
            
            else if(dados && typeof dados === 'object') {
                const primeiraChave = Object.keys(dados)[0];
                if(primeiraChave && !isNaN(parseInt(primeiraChave))) {
                    ATIVIDADES = { ...ATIVIDADES, ...dados };
                }
            }
            
            salvarTodosDados(); 
            mostrarToast('✅ Importado! Recarregando...'); 
            setTimeout(() => location.reload(), 500);
        } catch(err) { 
            alert('Erro: '+err.message); 
        } 
    }; 
    reader.readAsText(file); 
}

async function recarregarBlocoAtividades(inicio, fim) {
    const arquivo = `atividades${inicio}_${fim}.json`;
    const url = `${BASE_PATH}data/atividades/${arquivo}?t=${Date.now()}`;
    
    try {
        const response = await fetch(url);
        if (response.ok) {
            const dados = await response.json();
            for (let i = inicio; i <= fim; i++) {
                delete ATIVIDADES[i];
            }
            ATIVIDADES = { ...ATIVIDADES, ...dados };
            salvarTodosDados();
            atividadesFiltradasAdmin = { ...ATIVIDADES };
            TODAS_ACOES = gerarAcoesAPartirDasAtividades();
            atualizarAcoes();
            atualizarListasAdmin();
            mostrarToast(`✅ Bloco ${inicio}-${fim} recarregado!`);
        } else {
            mostrarToast(`⚠️ Bloco ${inicio}-${fim} não encontrado no GitHub`);
        }
    } catch(e) {
        console.error(`Erro ao recarregar bloco ${inicio}-${fim}:`, e);
        mostrarToast(`❌ Erro ao recarregar bloco ${inicio}-${fim}`);
    }
}

// ==================== INICIALIZAÇÃO ====================
function atualizarTudo() {
    atualizarFiltros();
    atualizarAcoes();
}

// Event Listeners
document.getElementById('btnExportarAtividades')?.addEventListener('click', exportarAtividades);
document.getElementById('btnExportarPlanosAula')?.addEventListener('click', exportarPlanosAula);
document.getElementById('btnExportarPlanosCurso')?.addEventListener('click', exportarPlanosCurso);
document.getElementById('btnExportarTudo')?.addEventListener('click', exportarTudo);
document.getElementById('btnImportar')?.addEventListener('click', importarDados);
document.getElementById('btnExportarAtividadesEspecificas')?.addEventListener('click', exportarAtividadesEspecificas);
document.getElementById('btnExportarPlanosAulaEspecificos')?.addEventListener('click', exportarPlanosAulaEspecificos);
document.getElementById('btnExportarPlanosCursoEspecificos')?.addEventListener('click', exportarPlanosCursoEspecificos);

document.getElementById('btnNovaAtividadeAdmin')?.addEventListener('click', novaAtividadeAdmin);
document.getElementById('btnNovoPlanoAulaAdmin')?.addEventListener('click', novoPlanoAulaAdmin);
document.getElementById('btnNovoPlanoCursoAdmin')?.addEventListener('click', novoPlanoCursoAdmin);
document.getElementById('btnNovaAbordagemAdmin')?.addEventListener('click', novaAbordagemAdmin);
document.getElementById('btnSalvarEditor')?.addEventListener('click', () => {
    if (window.editandoAdminTipo === 'atividade') salvarAtividadeAdmin();
    else if (window.editandoAdminTipo === 'planoAula') salvarPlanoAulaAdmin();
    else if (window.editandoAdminTipo === 'planoCurso') salvarPlanoCursoAdmin();
    else if (window.editandoAdminTipo === 'abordagem') salvarAbordagemAdmin();
    else if (window.editandoAdminTipo === 'novaAbordagem') salvarNovaAbordagemAdmin();
});
document.getElementById('btnCopiarEditor')?.addEventListener('click', copiarConteudoEditor);
document.getElementById('btnCancelarEditor')?.addEventListener('click', () => document.getElementById('formEditor').style.display = 'none');

document.getElementById('btnBuscarAdminAtividade')?.addEventListener('click', buscarAtividadesAdmin);
document.getElementById('btnLimparAdminAtividade')?.addEventListener('click', limparBuscaAtividadesAdmin);
document.getElementById('searchAdminAtividade')?.addEventListener('keypress', (e) => { if(e.key === 'Enter') buscarAtividadesAdmin(); });

document.getElementById('btnBuscarAdminPlano')?.addEventListener('click', buscarPlanosAulaAdmin);
document.getElementById('btnLimparAdminPlano')?.addEventListener('click', limparBuscaPlanosAdmin);
document.getElementById('searchAdminPlano')?.addEventListener('keypress', (e) => { if(e.key === 'Enter') buscarPlanosAulaAdmin(); });

document.getElementById('btnBuscarAdminCurso')?.addEventListener('click', buscarPlanosCursoAdmin);
document.getElementById('btnLimparAdminCurso')?.addEventListener('click', limparBuscaCursosAdmin);
document.getElementById('searchAdminCurso')?.addEventListener('keypress', (e) => { if(e.key === 'Enter') buscarPlanosCursoAdmin(); });

document.getElementById('btnBuscarAdminAbordagem')?.addEventListener('click', atualizarListaAbordagensAdmin);
document.getElementById('btnLimparAdminAbordagem')?.addEventListener('click', () => {
    document.getElementById('searchAdminAbordagem').value = '';
    atualizarListaAbordagensAdmin();
});
document.getElementById('searchAdminAbordagem')?.addEventListener('keypress', (e) => { if(e.key === 'Enter') atualizarListaAbordagensAdmin(); });

document.getElementById('filtroCategoria')?.addEventListener('change', () => atualizarAcoes());
document.getElementById('filtroNivel')?.addEventListener('change', () => atualizarAcoes());
document.getElementById('searchAcao')?.addEventListener('input', () => atualizarAcoes());

document.querySelectorAll('.admin-subtab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const subtab = btn.dataset.subtab;
        document.querySelectorAll('.admin-subtab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.admin-subpanel').forEach(p => p.style.display = 'none');
        document.getElementById(subtab).style.display = 'block';
        if (subtab === 'adminAbordagens') atualizarListaAbordagensAdmin();
    });
});

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');
        if (tab === 'acoes') { atualizarFiltros(); atualizarAcoes(); }
        if (tab === 'admin') { atualizarListasAdmin(); }
    });
});

document.getElementById('btnLimparCache')?.addEventListener('click', () => {
    if(confirm('Limpar cache e recarregar dados do GitHub?')) {
        localStorage.removeItem('biblioteca_dados');
        mostrarToast('✅ Cache limpo! Recarregando...');
        setTimeout(() => location.reload(), 500);
    }
});

carregarDados();
