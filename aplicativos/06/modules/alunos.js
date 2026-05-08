// ============================================
// GERENCIAMENTO DE ALUNOS
// ============================================

let ALUNOS = [];
let ALUNO_SELECIONADO_ID = null;

function carregarAlunos() {
    const dados = localStorage.getItem('alunos_nota_musical');
    if (dados) {
        try {
            ALUNOS = JSON.parse(dados);
            ALUNOS.forEach(aluno => {
                if (!aluno.acoesConcluidas) aluno.acoesConcluidas = [];
                if (!aluno.planosConcluidos) aluno.planosConcluidos = [];
            });
        } catch(e) { console.error(e); }
    }
    if (ALUNOS.length === 0) {
        ALUNOS = [{ 
            id: Date.now(), 
            nome: "Aluno Demo", 
            nivel: 1, 
            planoCursoId: 1,
            planosConcluidos: [],
            acoesConcluidas: [1, 2, 12] 
        }];
        salvarAlunos();
    }
    atualizarListaAlunos();
    atualizarSelectsAlunos();
}

function salvarAlunos() {
    localStorage.setItem('alunos_nota_musical', JSON.stringify(ALUNOS));
    atualizarListaAlunos();
    atualizarSelectsAlunos();
    const totalSpan = document.getElementById('totalAlunos');
    if (totalSpan) totalSpan.textContent = ALUNOS.length;
}

function atualizarSelectsAlunos() {
    const selects = ['selecionarAlunoAcoes', 'selecionarAlunoDash', 'selecionarAlunoPlanosAula', 'selecionarAlunoPlanosCurso'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.innerHTML = '<option value="">Selecione um aluno</option>';
            ALUNOS.forEach(aluno => {
                select.innerHTML += `<option value="${aluno.id}">${aluno.nome}</option>`;
            });
        }
    });
    
    const planoCursoSelect = document.getElementById('planoCursoAluno');
    if (planoCursoSelect) {
        const planos = getAllPlanosCurso();
        planoCursoSelect.innerHTML = '';
        planos.forEach(p => {
            planoCursoSelect.innerHTML += `<option value="${p.id}">${p.nome}</option>`;
        });
    }
}

function atualizarListaAlunos() {
    const container = document.getElementById('listaAlunos');
    if (!container) return;
    
    if (ALUNOS.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhum aluno cadastrado</div>';
        return;
    }
    
    container.innerHTML = ALUNOS.map(aluno => {
        const total = getAcoesPorNivel(aluno.nivel).length;
        const concluidas = aluno.acoesConcluidas?.length || 0;
        const perc = total ? Math.round((concluidas/total)*100) : 0;
        
        return `
            <div class="aluno-card" onclick="verPlanosDoAluno(${aluno.id})">
                <div class="aluno-info">
                    <h3>👤 ${escapeHtml(aluno.nome)} <span style="font-size:0.7em; color:#ff6b6b;">(clique)</span></h3>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width:${perc}%"></div></div>
                <span>${perc}%</span>
                <button onclick="event.stopPropagation(); editarAluno(${aluno.id})" style="background:#ffc107;">✏️</button>
                <button onclick="event.stopPropagation(); deletarAluno(${aluno.id})" style="background:#dc3545;">🗑️</button>
            </div>
        `;
    }).join('');
}

function selecionarAluno(id) {
    ALUNO_SELECIONADO_ID = id;
    const selects = ['selecionarAlunoAcoes', 'selecionarAlunoDash', 'selecionarAlunoPlanosAula', 'selecionarAlunoPlanosCurso'];
    selects.forEach(idSelect => {
        const select = document.getElementById(idSelect);
        if (select) select.value = id;
    });
    if (typeof atualizarAcoes === 'function') atualizarAcoes();
    if (typeof atualizarDashboard === 'function') atualizarDashboard();
    if (typeof carregarPlanosAulaAluno === 'function') carregarPlanosAulaAluno();
    if (typeof carregarPlanosCursoAluno === 'function') carregarPlanosCursoAluno();
}

function getAluno() {
    return ALUNOS.find(a => a.id === ALUNO_SELECIONADO_ID);
}

function getAlunoPorId(id) {
    return ALUNOS.find(a => a.id === id);
}

function editarAluno(id) {
    const aluno = getAlunoPorId(id);
    if (!aluno) return;
    const novoNome = prompt('Editar nome:', aluno.nome);
    if (novoNome && novoNome.trim()) {
        aluno.nome = novoNome.trim();
        salvarAlunos();
        mostrarToast('✅ Nome alterado');
    }
}

function deletarAluno(id) {
    if (confirm('Excluir aluno?')) {
        ALUNOS = ALUNOS.filter(a => a.id !== id);
        if (ALUNO_SELECIONADO_ID === id) ALUNO_SELECIONADO_ID = ALUNOS[0]?.id || null;
        salvarAlunos();
        if (ALUNOS.length > 0 && ALUNO_SELECIONADO_ID) selecionarAluno(ALUNO_SELECIONADO_ID);
    }
}

function adicionarAluno() {
    const nome = document.getElementById('nomeAluno').value.trim();
    const nivel = parseInt(document.getElementById('nivelAluno').value);
    const planoCursoId = parseInt(document.getElementById('planoCursoAluno').value);
    if (!nome) { alert('Digite o nome'); return; }
    
    ALUNOS.push({ 
        id: Date.now(), 
        nome, 
        nivel, 
        planoCursoId: planoCursoId || 1,
        planosConcluidos: [],
        acoesConcluidas: [] 
    });
    salvarAlunos();
    document.getElementById('nomeAluno').value = '';
    mostrarToast(`✅ Aluno ${nome} cadastrado!`);
}

function togglePlanoConcluido(planoId, alunoId) {
    const aluno = getAlunoPorId(alunoId);
    if (!aluno) return;
    if (!aluno.planosConcluidos) aluno.planosConcluidos = [];
    
    const index = aluno.planosConcluidos.indexOf(planoId);
    if (index === -1) {
        aluno.planosConcluidos.push(planoId);
        mostrarToast(`✅ Plano concluído!`);
    } else {
        aluno.planosConcluidos.splice(index, 1);
        mostrarToast(`↩️ Plano desmarcado`);
    }
    salvarAlunos();
}

function toggleAcaoConcluida(acaoId) {
    console.log('toggleAcaoConcluida chamado para ação:', acaoId);
    const aluno = getAluno();
    if (!aluno) {
        console.error('Nenhum aluno selecionado');
        return;
    }
    const idx = aluno.acoesConcluidas.indexOf(acaoId);
    if (idx === -1) {
        aluno.acoesConcluidas.push(acaoId);
    } else {
        aluno.acoesConcluidas.splice(idx, 1);
    }
    salvarAlunos();
    if (typeof atualizarAcoes === 'function') atualizarAcoes();
    if (typeof atualizarDashboard === 'function') atualizarDashboard();
}

window.toggleAcaoConcluida = toggleAcaoConcluida;

window.getAluno = getAluno;
window.getAlunoPorId = getAlunoPorId;
window.togglePlanoConcluido = togglePlanoConcluido;
window.toggleAcaoConcluida = toggleAcaoConcluida;
window.selecionarAluno = selecionarAluno;
window.adicionarAluno = adicionarAluno;
window.editarAluno = editarAluno;
window.deletarAluno = deletarAluno;

