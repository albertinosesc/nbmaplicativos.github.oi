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
    'atividades/atividades401_500.json'
];

// Para os outros arquivos, usamos BASE_PATH diretamente
// Ex: carregarPlanosAulaDoGitHub() usa `${BASE_PATH}planosAula.json`
// Ex: carregarPlanosCursoDoGitHub() usa `${BASE_PATH}planosCurso.json`
// Ex: carregarAbordagensDoGitHub() usa `${BASE_PATH}abordagem.json`

// ==================== DADOS ====================
let ATIVIDADES = {};
let PLANOS_AULA = {};
let PLANOS_CURSO = {};

const CATEGORIAS = ['Percepção', 'Leitura', 'Escrita', 'Execução', 'Teoria', 'Composição', 'Memória', 'Coordenação', 'Expressão', 'Tecnologia', 'Metacognição', 'Social', 'Ludicidade'];

let atividadesFiltradasAdmin = {};
let planosAulaFiltradosAdmin = {};
let planosCursoFiltradosAdmin = {};

// ==================== GERAR AÇÕES A PARTIR DAS ATIVIDADES (CORRIGIDO) ====================
function gerarAcoesAPartirDasAtividades() {
    const acoes = [];
    const ids = Object.keys(ATIVIDADES).sort((a, b) => a - b);
    
    for (const id of ids) {
        const atividade = ATIVIDADES[id];
        const titulo = atividade.titulo ? atividade.titulo : `Atividade ${id}`;
        
        // MUDANÇA AQUI: usa categorias_base (array) ou fallback
        let categorias = atividade.categorias_base || [atividade.categoria || 'Atividade'];
        
        // Para cada categoria, cria uma ação separada
        for (const categoria of categorias) {
            let nivel = atividade.nivel || 1;
            if (id <= 70) nivel = 1;
            else if (id <= 145) nivel = 2;
            else if (id <= 275) nivel = 3;
            else if (id <= 340) nivel = 4;
            else nivel = 5;
            
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
        // CORRETO: BASE_PATH já inclui /data/, então ARQUIVOS_ATIVIDADES deve começar com 'atividades/'
        const url = `${BASE_PATH}${arquivo}?t=${Date.now()}`;
        console.log("📡 Tentando carregar:", url); // ← ADICIONE ESTA LINHA PARA DEBUG
        
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
    // ... resto
}

async function carregarPlanosAulaDoGitHub() {
    const url = `${BASE_PATH}planosAula.json?t=${Date.now()}`;  // ← CORRETO
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
    const url = `${BASE_PATH}planosCurso.json?t=${Date.now()}`;  // ← CORRETO
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
function mostrarToast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2000); }
function escapeHtml(t) { if (!t) return ''; return t.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m])); }
function fecharModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('active'); }
function abrirModal(id) { const m = document.getElementById(id); if (m) m.classList.add('active'); }

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
    }
    
    atividadesFiltradasAdmin = { ...ATIVIDADES };
    planosAulaFiltradosAdmin = { ...PLANOS_AULA };
    planosCursoFiltradosAdmin = { ...PLANOS_CURSO };
    TODAS_ACOES = gerarAcoesAPartirDasAtividades();
    
    atualizarTudo();
    
    // ESPERA o carregamento de TODOS os arquivos
    await carregarAtividadesDoGitHub();
    await carregarPlanosAulaDoGitHub();
    await carregarPlanosCursoDoGitHub();
    await carregarAbordagensDoGitHub();
    
    // Após carregar, atualiza tudo novamente
    atualizarAcoes();
    atualizarListasAdmin();
    atualizarEstatisticas();
    console.log("✅ Todos os dados carregados!");
}
 

function atualizarEstatisticas() {
    document.getElementById('statAtividades').textContent = Object.keys(ATIVIDADES).length;
    document.getElementById('statPlanosAula').textContent = Object.keys(PLANOS_AULA).length;
    document.getElementById('statPlanosCurso').textContent = Object.keys(PLANOS_CURSO).length;
}

// ==================== AÇÕES ====================
function atualizarFiltros() {
    const sCat = document.getElementById('filtroCategoria');
    if (sCat && sCat.options.length <= 1) { sCat.innerHTML = '<option value="todas">Todas</option>'; CATEGORIAS.forEach(c => sCat.innerHTML += `<option value="${c}">${c}</option>`); }
    const sNiv = document.getElementById('filtroNivel');
    if (sNiv && sNiv.options.length <= 1) { sNiv.innerHTML = '<option value="todos">Todos</option>'; for(let i=1;i<=5;i++) sNiv.innerHTML += `<option value="${i}">Nível ${i}</option>`; }
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
        
        // MUDANÇA: exibe categorias_base (array)
        if (ativ.categorias_base && ativ.categorias_base.length) {
            html += `<div class="atividade-detalhe"><strong>📂 Categorias:</strong> ${ativ.categorias_base.join(', ')}</div>`;
        } else if (ativ.categoria) {
            html += `<div class="atividade-detalhe"><strong>📂 Categoria:</strong> ${ativ.categoria}</div>`;
        }
        
        html += `<div class="atividade-detalhe"><strong>⏱️ Duração:</strong> ${ativ.duracao || 'Não informada'}</div>`;
        html += `<div class="atividade-detalhe"><strong>🎚️ Nível:</strong> ${ativ.nivel || 1}</div>`;
        
        // NOVO: exibe tags_avancadas se existirem
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
        // ... fallback
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
        markdown += `**Categoria:** ${dados.categoria || 'Não definida'}\n`;
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
    const url = `${BASE_PATH}abordagem.json?t=${Date.now()}`;  // ← CORRETO
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
    
    // Preparar categorias_base para exibição (array para texto)
    const categoriasBaseStr = (ativ.categorias_base || [ativ.categoria || '']).join(', ');
    
    document.getElementById('editorTitulo').innerHTML = `✏️ Editar Atividade ID ${id}`;
    document.getElementById('editorConteudo').innerHTML = `
        <div class="form-row"><label>ID:</label><input type="number" id="editId" value="${id}" readonly></div>
        <div class="form-row"><label>Título:</label><input type="text" id="editTitulo" value="${escapeHtml(ativ.titulo || '')}"></div>
        <div class="form-row"><label>Categorias Base (separadas por vírgula):</label>
            <input type="text" id="editCategoriasBase" value="${escapeHtml(categoriasBaseStr)}" placeholder="Ex: Percepção, Escrita, Memória">
            <small>Digite as categorias separadas por vírgula (ex: Percepção, Escrita, Memória)</small>
        </div>
        <div class="form-row"><label>Objetivo:</label><textarea id="editObjetivo" rows="3">${escapeHtml(ativ.objetivo || '')}</textarea></div>
        <div class="form-row"><label>Materiais (um por linha):</label><textarea id="editMateriais" rows="3">${(ativ.materiais || []).join('\n')}</textarea></div>
        <div class="form-row"><label>Passo a passo (um por linha):</label><textarea id="editPassos" rows="5">${(ativ.passo_a_passo || []).join('\n')}</textarea></div>
        <div class="form-row"><label>Duração:</label><input type="text" id="editDuracao" value="${escapeHtml(ativ.duracao || '')}"></div>
        <div class="form-row"><label>Nível:</label><select id="editNivel">${[1,2,3,4,5].map(n => `<option value="${n}" ${ativ.nivel===n?'selected':''}>Nível ${n}</option>`).join('')}</select></div>
        <div class="form-row"><label>IDs das Ações (separados por vírgula):</label><input type="text" id="editAcoesIds" value="${(ativ.acoes_ids || []).join(', ')}"></div>
        
        <details><summary>🏷️ Tags Avançadas (opcional)</summary>
            <div class="form-row"><label>Pedagógico (separados por vírgula):</label><input type="text" id="editPedagogico" value="${(ativ.tags_avancadas?.pedagogico || []).join(', ')}"></div>
            <div class="form-row"><label>Tipo de Atividade:</label><input type="text" id="editTipoAtividade" value="${(ativ.tags_avancadas?.tipo_atividade || []).join(', ')}"></div>
            <div class="form-row"><label>Interação Social:</label><input type="text" id="editInteracao" value="${(ativ.tags_avancadas?.interacao || []).join(', ')}"></div>
            <div class="form-row"><label>Cognitivo:</label><input type="text" id="editCognitivo" value="${(ativ.tags_avancadas?.cognitivo || []).join(', ')}"></div>
            <div class="form-row"><label>Elemento Musical:</label><input type="text" id="editElemento" value="${(ativ.tags_avancadas?.elemento_musical || []).join(', ')}"></div>
            <div class="form-row"><label>Conteúdo:</label><input type="text" id="editConteudo" value="${(ativ.tags_avancadas?.conteudo || []).join(', ')}"></div>
            <div class="form-row"><label>Pedagogos:</label><input type="text" id="editPedagogos" value="${(ativ.tags_avancadas?.pedagogos || []).join(', ')}"></div>
            <div class="form-row"><label>Princípios:</label><input type="text" id="editPrincipios" value="${(ativ.tags_avancadas?.principios || []).join(', ')}"></div>
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
        <div class="form-row"><label>IDs das Atividades (separados por vírgula):</label><input type="text" id="editAtividadesIds" value="${(plano.atividades_ids || []).join(', ')}"></div>
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
    
    // Processar categorias_base (array)
    const categoriasBaseStr = document.getElementById('editCategoriasBase').value;
    const categoriasBase = categoriasBaseStr ? categoriasBaseStr.split(',').map(s => s.trim()).filter(s => s) : [];
    
    // Processar tags avançadas
    const tags_avancadas = {
        pedagogico: document.getElementById('editPedagogico')?.value.split(',').map(s=>s.trim()).filter(s=>s) || [],
        tipo_atividade: document.getElementById('editTipoAtividade')?.value.split(',').map(s=>s.trim()).filter(s=>s) || [],
        interacao: document.getElementById('editInteracao')?.value.split(',').map(s=>s.trim()).filter(s=>s) || [],
        cognitivo: document.getElementById('editCognitivo')?.value.split(',').map(s=>s.trim()).filter(s=>s) || [],
        elemento_musical: document.getElementById('editElemento')?.value.split(',').map(s=>s.trim()).filter(s=>s) || [],
        conteudo: document.getElementById('editConteudo')?.value.split(',').map(s=>s.trim()).filter(s=>s) || [],
        pedagogos: document.getElementById('editPedagogos')?.value.split(',').map(s=>s.trim()).filter(s=>s) || [],
        principios: document.getElementById('editPrincipios')?.value.split(',').map(s=>s.trim()).filter(s=>s) || []
    };
    
    // Remover grupos vazios
    Object.keys(tags_avancadas).forEach(key => {
        if (tags_avancadas[key].length === 0) delete tags_avancadas[key];
    });
    
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
    
    // Adicionar tags_avancadas se não estiver vazio
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
    PLANOS_AULA[id] = {
        id: id,
        titulo: document.getElementById('editTitulo').value,
        nivel: parseInt(document.getElementById('editNivel').value),
        duracao: document.getElementById('editDuracao').value,
        objetivoGeral: document.getElementById('editObjetivoGeral').value,
        atividades_ids: atividadesIds
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
    document.getElementById('editorTitulo').innerHTML = '✏️ Nova Atividade';
    document.getElementById('editorConteudo').innerHTML = `
        <div class="form-row"><label>ID da Atividade:</label><input type="number" id="editId"></div>
        <div class="form-row"><label>Título:</label><input type="text" id="editTitulo"></div>
        <div class="form-row"><label>Categorias Base (separadas por vírgula):</label>
            <input type="text" id="editCategoriasBase" placeholder="Ex: Percepção, Escrita, Memória">
            <small>Opções: ${CATEGORIAS.join(', ')}</small>
        </div>
        <div class="form-row"><label>Objetivo:</label><textarea id="editObjetivo" rows="3"></textarea></div>
        <div class="form-row"><label>Materiais (um por linha):</label><textarea id="editMateriais" rows="3"></textarea></div>
        <div class="form-row"><label>Passo a passo (um por linha):</label><textarea id="editPassos" rows="5"></textarea></div>
        <div class="form-row"><label>Duração:</label><input type="text" id="editDuracao"></div>
        <div class="form-row"><label>Nível:</label><select id="editNivel"><option value="1">Nível 1</option><option value="2">Nível 2</option><option value="3">Nível 3</option><option value="4">Nível 4</option><option value="5">Nível 5</option></select></div>
        <div class="form-row"><label>IDs das Ações (separados por vírgula):</label><input type="text" id="editAcoesIds"></div>
        
        <details><summary>🏷️ Tags Avançadas (opcional)</summary>
            <div class="form-row"><label>Pedagógico (separados por vírgula):</label><input type="text" id="editPedagogico" placeholder="Ex: Alfabetização Musical, Ritmo"></div>
            <div class="form-row"><label>Tipo de Atividade:</label><input type="text" id="editTipoAtividade" placeholder="Ex: Jogo, Exercício, Desafio"></div>
            <div class="form-row"><label>Interação Social:</label><input type="text" id="editInteracao" placeholder="Ex: Individual, Dupla, Grupo"></div>
            <div class="form-row"><label>Cognitivo:</label><input type="text" id="editCognitivo" placeholder="Ex: Memória, Percepção, Raciocínio"></div>
            <div class="form-row"><label>Elemento Musical:</label><input type="text" id="editElemento" placeholder="Ex: Altura, Duração, Timbre"></div>
            <div class="form-row"><label>Conteúdo:</label><input type="text" id="editConteudo" placeholder="Ex: Escala, Acorde, Intervalo"></div>
            <div class="form-row"><label>Pedagogos:</label><input type="text" id="editPedagogos" placeholder="Ex: Kodály, Orff, Suzuki"></div>
            <div class="form-row"><label>Princípios:</label><input type="text" id="editPrincipios" placeholder="Ex: Movimento corporal, Criatividade"></div>
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
        <div class="form-row"><label>IDs das Atividades (separados por vírgula):</label><input type="text" id="editAtividadesIds"></div>
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

// ==================== EXPORTAÇÃO ESPECÍFICA ====================
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

// ==================== EXPORTAÇÃO ====================
function baixarArquivo(conteudo, nome) { 
    const blob = new Blob([conteudo], {type:'application/json'}); 
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(blob); 
    a.download = nome; 
    a.click(); 
    URL.revokeObjectURL(blob); 
}

// EXPORTAR ATIVIDADES COMPLETAS (para backup)
function exportarAtividades() { 
    baixarArquivo(JSON.stringify(ATIVIDADES, null, 2), `atividades_completo_${new Date().toISOString().split('T')[0]}.json`); 
}

// EXPORTAR POR BLOCOS (para manter a estrutura)
function exportarAtividadesPorBloco(inicio, fim) {
    const bloco = {};
    for (let i = inicio; i <= fim; i++) {
        if (ATIVIDADES[i]) {
            bloco[i] = ATIVIDADES[i];
        }
    }
    baixarArquivo(JSON.stringify(bloco, null, 2), `atividades${inicio}_${fim}.json`);
}

// EXPORTAR TODOS OS BLOCOS (compactado em ZIP não é possível nativamente, então criamos múltiplos downloads)
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

// IMPORTAR DADOS - mantém a estrutura de blocos
function importarDados() { 
    const file = document.getElementById('arquivoImport').files[0]; 
    if(!file) return; 
    const reader = new FileReader(); 
    reader.onload = function(e) { 
        try { 
            const dados = JSON.parse(e.target.result); 
            
            // Se for backup completo (com atividades, planosAula, planosCurso)
            if(dados.atividades) ATIVIDADES = dados.atividades; 
            if(dados.planosAula) PLANOS_AULA = dados.planosAula; 
            if(dados.planosCurso) PLANOS_CURSO = dados.planosCurso; 
            
            // Se for apenas um bloco de atividades (objeto com IDs)
            else if(dados && typeof dados === 'object') {
                // Verifica se parece ser um bloco de atividades (contém IDs numéricos)
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

// FUNÇÃO PARA RECARREGAR UM BLOCO ESPECÍFICO DO GITHUB
async function recarregarBlocoAtividades(inicio, fim) {
    const arquivo = `atividades${inicio}_${fim}.json`;
    const url = `${BASE_PATH}data/atividades/${arquivo}?t=${Date.now()}`;
    
    try {
        const response = await fetch(url);
        if (response.ok) {
            const dados = await response.json();
            
            // Remover atividades antigas do bloco
            for (let i = inicio; i <= fim; i++) {
                delete ATIVIDADES[i];
            }
            
            // Adicionar as novas
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
