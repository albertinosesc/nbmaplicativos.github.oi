// ============================================
// EDIÇÃO DE AÇÕES, ATIVIDADES, PLANOS
// ============================================

function preencherSelectsEdicao() {
    const selectAcao = document.getElementById('selecionarAcaoParaEditar');
    if (selectAcao) {
        selectAcao.innerHTML = '<option value="">Selecione</option>' + TODAS_ACOES.map(a => `<option value="${a.id}">#${a.numero}: ${a.texto.substring(0,50)}</option>`).join('');
    }
    
    const selectAtividade = document.getElementById('selecionarAtividadeParaEditar');
    if (selectAtividade) {
        selectAtividade.innerHTML = '<option value="">Selecione</option>' + TODAS_ACOES.map(a => `<option value="${a.id}">#${a.id} - ${a.texto.substring(0,40)}</option>`).join('');
    }
    
    const selectPlanoAula = document.getElementById('selecionarPlanoAulaParaEditar');
    if (selectPlanoAula) {
        const planos = getAllPlanosAula();
        selectPlanoAula.innerHTML = '<option value="">Selecione</option>' + planos.map(p => `<option value="${p.id}">${p.titulo}</option>`).join('');
    }
    
    const selectPlanoCurso = document.getElementById('selecionarPlanoCursoParaEditar');
    if (selectPlanoCurso) {
        const planos = getAllPlanosCurso();
        selectPlanoCurso.innerHTML = '<option value="">Selecione</option>' + planos.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
    }
}

function carregarAcaoParaEdicao() {
    const id = parseInt(document.getElementById('selecionarAcaoParaEditar').value);
    if (!id) { alert('Selecione uma ação'); return; }
    const acao = getAcaoPorId(id);
    
    document.getElementById('editorAcao').style.display = 'block';
    document.getElementById('editorAcao').innerHTML = `
        <div class="form-row"><label>Texto:</label><input type="text" id="editAcaoTexto" value="${escapeHtml(acao.texto)}"></div>
        <div class="form-row"><label>Categoria:</label><select id="editAcaoCategoria">${CATEGORIAS.map(c => `<option value="${c}" ${acao.categoria === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
        <div class="form-row"><label>Nível:</label><select id="editAcaoNivel">${[1,2,3,4,5].map(n => `<option value="${n}" ${acao.nivel === n ? 'selected' : ''}>Nível ${n}</option>`).join('')}</select></div>
        <button onclick="salvarAcao(${id})" class="success">💾 Salvar</button>
    `;
}

function salvarAcao(id) {
    const acao = getAcaoPorId(id);
    if (acao) {
        acao.texto = document.getElementById('editAcaoTexto').value;
        acao.categoria = document.getElementById('editAcaoCategoria').value;
        acao.nivel = parseInt(document.getElementById('editAcaoNivel').value);
        salvarAcoesLocal();
        mostrarToast(`✅ Ação #${id} salva!`);
        document.getElementById('editorAcao').style.display = 'none';
        if (typeof atualizarAcoes === 'function') atualizarAcoes();
    }
}

function carregarAtividadeParaEdicao() {
    const acaoId = parseInt(document.getElementById('selecionarAtividadeParaEditar').value);
    if (!acaoId) { alert('Selecione uma ação'); return; }
    const acao = getAcaoPorId(acaoId);
    const atividade = getAtividadePorAcaoId(acaoId, acao ? acao.texto : '');
    
    document.getElementById('editorAtividade').style.display = 'block';
    document.getElementById('editorAtividade').innerHTML = `
        <div class="form-row"><label>Título:</label><input type="text" id="editAtividadeTitulo" value="${escapeHtml(atividade.titulo)}"></div>
        <div class="form-row"><label>Objetivo:</label><textarea id="editAtividadeObjetivo" rows="2">${escapeHtml(atividade.objetivo)}</textarea></div>
        <div class="form-row"><label>Materiais (um por linha):</label><textarea id="editAtividadeMateriais" rows="3">${atividade.materiais.join('\n')}</textarea></div>
        <div class="form-row"><label>Passo a passo (um por linha):</label><textarea id="editAtividadePassos" rows="5">${atividade.passo_a_passo.join('\n')}</textarea></div>
        <div class="form-row"><label>Duração:</label><input type="text" id="editAtividadeDuracao" value="${atividade.duracao}"></div>
        <button onclick="salvarAtividade(${acaoId})" class="success">💾 Salvar</button>
    `;
}

function salvarAtividade(acaoId) {
    const novaAtividade = {
        titulo: document.getElementById('editAtividadeTitulo').value,
        objetivo: document.getElementById('editAtividadeObjetivo').value,
        materiais: document.getElementById('editAtividadeMateriais').value.split('\n').filter(l=>l.trim()),
        passo_a_passo: document.getElementById('editAtividadePassos').value.split('\n').filter(l=>l.trim()),
        duracao: document.getElementById('editAtividadeDuracao').value
    };
    salvarAtividade(acaoId, novaAtividade);
    document.getElementById('editorAtividade').style.display = 'none';
    mostrarToast(`✅ Atividade da ação #${acaoId} salva!`);
}

function carregarPlanoAulaParaEdicao() {
    const id = parseInt(document.getElementById('selecionarPlanoAulaParaEditar').value);
    if (!id) { alert('Selecione um plano'); return; }
    const plano = getPlanoAula(id);
    
    document.getElementById('editorPlanoAula').style.display = 'block';
    document.getElementById('editorPlanoAula').innerHTML = `
        <div class="form-row"><label>Título:</label><input type="text" id="editPlanoTitulo" value="${escapeHtml(plano.titulo)}"></div>
        <div class="form-row"><label>Nível:</label><select id="editPlanoNivel">${[1,2,3,4,5].map(n => `<option value="${n}" ${plano.nivel === n ? 'selected' : ''}>Nível ${n}</option>`).join('')}</select></div>
        <div class="form-row"><label>Duração:</label><input type="text" id="editPlanoDuracao" value="${plano.duracao}"></div>
        <div class="form-row"><label>Objetivo Geral:</label><textarea id="editPlanoObjGeral" rows="2">${escapeHtml(plano.objetivoGeral || '')}</textarea></div>
        <div class="form-row"><label>Objetivos Específicos (um por linha):</label><textarea id="editPlanoObjetivos" rows="3">${(plano.objetivosEspecificos || []).join('\n')}</textarea></div>
        <div class="form-row"><label>Conteúdo (um por linha):</label><textarea id="editPlanoConteudo" rows="3">${(plano.conteudo || []).join('\n')}</textarea></div>
        <div class="form-row"><label>IDs das Atividades (separados por vírgula):</label><input type="text" id="editPlanoAtividades" value="${(plano.atividades_ids || []).join(',')}"></div>
        <div class="form-row"><label>Metodologia:</label><textarea id="editPlanoMetodologia" rows="2">${escapeHtml(plano.metodologia || '')}</textarea></div>
        <div class="form-row"><label>Avaliação:</label><textarea id="editPlanoAvaliacao" rows="2">${escapeHtml(plano.avaliacao || '')}</textarea></div>
        <button onclick="salvarPlanoAulaEditado(${id})" class="success">💾 Salvar</button>
    `;
}

function salvarPlanoAulaEditado(id) {
    const novoPlano = {
        id: id,
        titulo: document.getElementById('editPlanoTitulo').value,
        nivel: parseInt(document.getElementById('editPlanoNivel').value),
        duracao: document.getElementById('editPlanoDuracao').value,
        objetivoGeral: document.getElementById('editPlanoObjGeral').value,
        objetivosEspecificos: document.getElementById('editPlanoObjetivos').value.split('\n').filter(l=>l.trim()),
        conteudo: document.getElementById('editPlanoConteudo').value.split('\n').filter(l=>l.trim()),
        atividades_ids: document.getElementById('editPlanoAtividades').value.split(',').map(Number).filter(n=>!isNaN(n)),
        metodologia: document.getElementById('editPlanoMetodologia').value,
        avaliacao: document.getElementById('editPlanoAvaliacao').value
    };
    salvarPlanoAula(id, novoPlano);
    document.getElementById('editorPlanoAula').style.display = 'none';
    mostrarToast(`✅ Plano de aula salvo!`);
}

function carregarPlanoCursoParaEdicao() {
    const id = parseInt(document.getElementById('selecionarPlanoCursoParaEditar').value);
    if (!id) { alert('Selecione um plano'); return; }
    const plano = getPlanoCurso(id);
    
    document.getElementById('editorPlanoCurso').style.display = 'block';
    document.getElementById('editorPlanoCurso').innerHTML = `
        <div class="form-row"><label>Nome:</label><input type="text" id="editCursoNome" value="${escapeHtml(plano.nome)}"></div>
        <div class="form-row"><label>Ano:</label><input type="number" id="editCursoAno" value="${plano.ano || 1}"></div>
        <div class="form-row"><label>Nível:</label><select id="editCursoNivel">${[1,2,3,4,5].map(n => `<option value="${n}" ${plano.nivel === n ? 'selected' : ''}>Nível ${n}</option>`).join('')}</select></div>
        <div class="form-row"><label>Objetivo Geral:</label><textarea id="editCursoObjGeral" rows="2">${escapeHtml(plano.objetivoGeral || '')}</textarea></div>
        <div class="form-row"><label>Ementa:</label><textarea id="editCursoEmenta" rows="3">${escapeHtml(plano.ementa || '')}</textarea></div>
        <div class="form-row"><label>Carga Horária:</label><input type="number" id="editCursoCarga" value="${plano.cargaHoraria || 40}"></div>
        <div class="form-row"><label>IDs dos Planos de Aula (separados por vírgula):</label><input type="text" id="editCursoPlanos" value="${(plano.planos_aula_ids || []).join(',')}"></div>
        <button onclick="salvarPlanoCursoEditado(${id})" class="success">💾 Salvar</button>
    `;
}

function salvarPlanoCursoEditado(id) {
    const novoPlano = {
        id: id,
        nome: document.getElementById('editCursoNome').value,
        ano: parseInt(document.getElementById('editCursoAno').value),
        nivel: parseInt(document.getElementById('editCursoNivel').value),
        objetivoGeral: document.getElementById('editCursoObjGeral').value,
        ementa: document.getElementById('editCursoEmenta').value,
        cargaHoraria: parseInt(document.getElementById('editCursoCarga').value),
        planos_aula_ids: document.getElementById('editCursoPlanos').value.split(',').map(Number).filter(n=>!isNaN(n))    };
    salvarPlanoCurso(id, novoPlano);
    document.getElementById('editorPlanoCurso').style.display = 'none';
    mostrarToast(`✅ Plano de curso salvo!`);
}

window.preencherSelectsEdicao = preencherSelectsEdicao;
window.carregarAcaoParaEdicao = carregarAcaoParaEdicao;
window.salvarAcao = salvarAcao;
window.carregarAtividadeParaEdicao = carregarAtividadeParaEdicao;
window.salvarAtividade = salvarAtividade;
window.carregarPlanoAulaParaEdicao = carregarPlanoAulaParaEdicao;
window.salvarPlanoAulaEditado = salvarPlanoAulaEditado;
window.carregarPlanoCursoParaEdicao = carregarPlanoCursoParaEdicao;
window.salvarPlanoCursoEditado = salvarPlanoCursoEditado;