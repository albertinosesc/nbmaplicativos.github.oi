// ============================================
// EXIBIÇÃO E MARCAÇÃO DE AÇÕES
// ============================================

function atualizarFiltros() {
    const selectCat = document.getElementById('filtroCategoria');
    if (selectCat && selectCat.options.length <= 1) {
        selectCat.innerHTML = '<option value="todas">Todas</option>';
        CATEGORIAS.forEach(c => selectCat.innerHTML += `<option value="${c}">${c}</option>`);
    }
    const selectNiv = document.getElementById('filtroNivel');
    if (selectNiv && selectNiv.options.length <= 1) {
        selectNiv.innerHTML = '<option value="todos">Todos</option>';
        for(let i=1;i<=5;i++) {
            const nomes = {1:'Iniciante',2:'Básico',3:'Intermediário',4:'Avançado',5:'Especialista'};
            selectNiv.innerHTML += `<option value="${i}">Nível ${i} - ${nomes[i]}</option>`;
        }
    }
}

function atualizarAcoes() {
    const aluno = getAluno();
    const container = document.getElementById('listaAcoes');
    
    if (!aluno) {
        if (container) container.innerHTML = '<div class="empty-state">Selecione um aluno</div>';
        return;
    }
    
    const cat = document.getElementById('filtroCategoria').value;
    const niv = document.getElementById('filtroNivel').value;
    const search = document.getElementById('searchAcao')?.value.toLowerCase() || '';
    
    let filtradas = getAcoesPorNivel(aluno.nivel);
    if (cat !== 'todas') filtradas = filtradas.filter(a => a.categoria === cat);
    if (niv !== 'todos') filtradas = filtradas.filter(a => a.nivel == niv);
    if (search) filtradas = filtradas.filter(a => a.texto.toLowerCase().includes(search) || a.numero.toString().includes(search));
    
    const concluidas = aluno.acoesConcluidas || [];
    const concluidasCount = filtradas.filter(a => concluidas.includes(a.id)).length;
    const percentual = filtradas.length ? Math.round((concluidasCount/filtradas.length)*100) : 0;
    
    document.getElementById('contadorAcoes').innerHTML = `📊 ${filtradas.length} ações | ✅ ${concluidasCount} concluídas | 📈 ${percentual}%`;
    
    if (container) {
        container.innerHTML = filtradas.map(acao => {
            const isConcluida = concluidas.includes(acao.id);
            return `
                <div class="acao-item ${isConcluida ? 'acao-concluida' : ''}">
                    <input type="checkbox" class="acao-check" ${isConcluida ? 'checked' : ''} onchange="toggleAcaoConcluida(${acao.id})">
                    <span class="acao-numero">#${acao.numero}</span>
                    <span class="acao-texto">${escapeHtml(acao.texto)}</span>
                    <span class="acao-categoria">${acao.categoria}</span>
                    <span class="acao-nivel">Nível ${acao.nivel}</span>
                    <button class="btn-ver" onclick="verAtividadeDaAcao(${acao.id})">📖 Ver</button>
                    <button class="btn-editar" onclick="editarAcao(${acao.id})">✏️ Editar</button>
                </div>
            `;
        }).join('');
    }
}

function verAtividadeDaAcao(acaoId) {
    console.log('verAtividadeDaAcao - acaoId:', acaoId);
    const acao = getAcaoPorId(acaoId);
    const atividade = getAtividadePorAcaoId(acaoId, acao ? acao.texto : '');
    
    const modalContent = `
        <div class="atividade-detalhe"><strong>🎯 Ação:</strong> #${acaoId} - ${acao ? escapeHtml(acao.texto) : 'Não encontrada'}</div>
        <div class="atividade-detalhe"><strong>🎯 Atividade:</strong> ${escapeHtml(atividade.titulo)}</div>
        <div class="atividade-detalhe"><strong>📝 Objetivo:</strong> ${escapeHtml(atividade.objetivo)}</div>
        <div class="atividade-detalhe"><strong>⏱️ Duração:</strong> ${atividade.duracao}</div>
        <div class="atividade-detalhe"><strong>📦 Materiais:</strong><ul>${atividade.materiais.map(m => `<li>${escapeHtml(m)}</li>`).join('')}</ul></div>
        <div class="atividade-detalhe"><strong>📝 Passo a passo:</strong><ul>${atividade.passo_a_passo.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul></div>
        <button class="success" style="width:100%; margin-top:15px;" onclick="baixarAtividade(${acaoId})">📥 Baixar Atividade (TXT)</button>
        <button class="secondary" style="width:100%; margin-top:10px;" onclick="fecharModal('modalAtividade')">Fechar</button>
    `;
    
    document.getElementById('modalTitulo').innerHTML = `📖 ${escapeHtml(atividade.titulo)}`;
    document.getElementById('modalConteudo').innerHTML = modalContent;
    abrirModal('modalAtividade');
}

function editarAcao(acaoId) {
    console.log('editarAcao chamado para ação:', acaoId);
    const acao = getAcaoPorId(acaoId);
    if (!acao) {
        alert('Ação não encontrada!');
        return;
    }
    
    const modalContent = `
        <div class="form-row">
            <label>Texto da Ação:</label>
            <input type="text" id="editAcaoTexto" value="${escapeHtml(acao.texto)}" style="width:100%;">
        </div>
        <div class="form-row">
            <label>Categoria:</label>
            <select id="editAcaoCategoria" style="width:100%;">
                ${CATEGORIAS.map(c => `<option value="${c}" ${acao.categoria === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
        </div>
        <div class="form-row">
            <label>Nível:</label>
            <select id="editAcaoNivel" style="width:100%;">
                ${[1,2,3,4,5].map(n => `<option value="${n}" ${acao.nivel === n ? 'selected' : ''}>Nível ${n} - ${['Iniciante','Básico','Intermediário','Avançado','Especialista'][n-1]}</option>`).join('')}
            </select>
        </div>
        <button onclick="salvarAcaoEditada(${acaoId})" class="success" style="width:100%; margin-top:10px;">💾 Salvar Ação</button>
        <button onclick="fecharModal('modalEditar')" class="secondary" style="width:100%; margin-top:10px;">Cancelar</button>
    `;
    
    document.getElementById('modalEditarTitulo').innerHTML = `✏️ Editar Ação #${acaoId}`;
    document.getElementById('modalEditarConteudo').innerHTML = modalContent;
    abrirModal('modalEditar');
}

function salvarAcaoEditada(acaoId) {
    console.log('salvarAcaoEditada chamado para ação:', acaoId);
    const acao = getAcaoPorId(acaoId);
    if (acao) {
        acao.texto = document.getElementById('editAcaoTexto').value;
        acao.categoria = document.getElementById('editAcaoCategoria').value;
        acao.nivel = parseInt(document.getElementById('editAcaoNivel').value);
        salvarAcoesLocal();
        mostrarToast(`✅ Ação #${acaoId} salva com sucesso!`);
        fecharModal('modalEditar');
        atualizarAcoes();
    } else {
        alert('Erro: Ação não encontrada!');
    }
}

function marcarTodasAcoes() {
    const aluno = getAluno();
    if (!aluno) return;
    const cat = document.getElementById('filtroCategoria').value;
    const niv = document.getElementById('filtroNivel').value;
    let filtradas = getAcoesPorNivel(aluno.nivel);
    if (cat !== 'todas') filtradas = filtradas.filter(a => a.categoria === cat);
    if (niv !== 'todos') filtradas = filtradas.filter(a => a.nivel == niv);
    filtradas.forEach(a => {
        if (!aluno.acoesConcluidas.includes(a.id)) aluno.acoesConcluidas.push(a.id);
    });
    salvarAlunos();
    atualizarAcoes();
    atualizarDashboard();
}

function desmarcarTodasAcoes() {
    const aluno = getAluno();
    if (!aluno) return;
    const cat = document.getElementById('filtroCategoria').value;
    const niv = document.getElementById('filtroNivel').value;
    let filtradas = getAcoesPorNivel(aluno.nivel);
    if (cat !== 'todas') filtradas = filtradas.filter(a => a.categoria === cat);
    if (niv !== 'todos') filtradas = filtradas.filter(a => a.nivel == niv);
    filtradas.forEach(a => {
        const idx = aluno.acoesConcluidas.indexOf(a.id);
        if (idx !== -1) aluno.acoesConcluidas.splice(idx, 1);
    });
    salvarAlunos();
    atualizarAcoes();
    atualizarDashboard();
}

function atualizarDashboard() {
    const select = document.getElementById('selecionarAlunoDash');
    const alunoId = select ? parseInt(select.value) : null;
    const aluno = getAlunoPorId(alunoId);
    const container = document.getElementById('detalhesDashboard');
    
    if (!aluno || !container) {
        if (container) container.innerHTML = '<div class="empty-state">Selecione um aluno</div>';
        return;
    }
    
    const total = getAcoesPorNivel(aluno.nivel).length;
    const concluidas = aluno.acoesConcluidas?.length || 0;
    const perc = total ? Math.round((concluidas/total)*100) : 0;
    
    container.innerHTML = `
        <div style="text-align:center; padding:20px;">
            <h3>${escapeHtml(aluno.nome)}</h3>
            <div class="stat-number" style="font-size:3em;">${perc}%</div>
            <div>${concluidas} de ${total} ações</div>
            <div class="progress-bar" style="margin-top:10px;"><div class="progress-fill" style="width:${perc}%"></div></div>
        </div>
    `;
}

// Registrar funções no escopo global
window.atualizarAcoes = atualizarAcoes;
window.atualizarDashboard = atualizarDashboard;
window.marcarTodasAcoes = marcarTodasAcoes;
window.desmarcarTodasAcoes = desmarcarTodasAcoes;
window.editarAcao = editarAcao;
window.salvarAcaoEditada = salvarAcaoEditada;
window.verAtividadeDaAcao = verAtividadeDaAcao;