// ============================================
// EXIBIÇÃO DE PLANOS DE AULA E CURSO
// ============================================

function verPlanosDoAluno(id) {
    console.log('verPlanosDoAluno chamado para id:', id);
    
    const aluno = getAlunoPorId(id);
    if (!aluno) {
        console.error('Aluno não encontrado');
        return;
    }
    
    const planoCurso = getPlanoCurso(aluno.planoCursoId || 1);
    const planosIds = planoCurso.planos_aula_ids || [1, 2];
    
    // Buscar planos de aula
    let planosHtml = '';
    for (const pid of planosIds) {
        const plano = getPlanoAula(pid);
        if (plano) {
            const isConcluido = aluno.planosConcluidos?.includes(pid);
            planosHtml += `
                <div class="plano-card" style="border-left: 4px solid ${isConcluido ? '#28a745' : '#ff6b6b'}; margin-bottom:15px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;">
                        <strong>📖 ${escapeHtml(plano.titulo)}</strong>
                        <div>
                            <span class="badge">Nível ${plano.nivel}</span>
                            <span class="badge">${plano.duracao || '50min'}</span>
                            ${isConcluido ? '<span class="badge" style="background:#28a745;">✅ Concluído</span>' : '<span class="badge" style="background:#ffc107; color:#333;">⏳ Em andamento</span>'}
                        </div>
                    </div>
                    <div style="margin-top:8px;"><strong>Objetivo:</strong> ${escapeHtml(plano.objetivoGeral || 'Não informado')}</div>
                    <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
                        <button class="btn-ver" onclick="verPlanoDetalhado(${pid})">📖 Ver detalhes</button>
                        <button class="btn-baixar" onclick="baixarPlanoAula(${pid})">📥 Baixar</button>
                        <button class="${isConcluido ? 'btn-editar' : 'secondary'}" onclick="togglePlanoConcluido(${pid}, ${aluno.id}); verPlanosDoAluno(${aluno.id})" style="background:${isConcluido ? '#dc3545' : '#4ecdc4'}">${isConcluido ? '↩️ Desmarcar' : '✅ Marcar'}</button>
                    </div>
                </div>
            `;
        }
    }
    
    if (planosHtml === '') planosHtml = '<div class="empty-state">Nenhum plano de aula vinculado</div>';
    
    // HTML do plano de curso
    let cursoHtml = `
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:15px;border-radius:15px;margin-bottom:15px;">
            <strong style="font-size:1.2em;">🎓 ${escapeHtml(planoCurso.nome)}</strong><br>
            <small>${planoCurso.codigo || ''} | Ano ${planoCurso.ano || 1} | Nível ${planoCurso.nivel || 1}</small>
            <div style="margin-top:5px;"><strong>👤 Aluno:</strong> ${escapeHtml(aluno.nome)}</div>
        </div>
    `;
    
    if (planoCurso.objetivoGeral) {
        cursoHtml += `<div class="plano-card"><strong>🎯 OBJETIVO GERAL</strong><br>${escapeHtml(planoCurso.objetivoGeral)}</div>`;
    }
    if (planoCurso.ementa) {
        cursoHtml += `<div class="plano-card"><strong>📖 EMENTA</strong><br>${escapeHtml(planoCurso.ementa)}</div>`;
    }
    if (planoCurso.cargaHoraria) {
        cursoHtml += `<div class="plano-card"><strong>⏱️ CARGA HORÁRIA</strong><br>${planoCurso.cargaHoraria} horas</div>`;
    }
    if (planoCurso.competencias && planoCurso.competencias.length) {
        cursoHtml += `<div class="plano-card"><strong>🎓 COMPETÊNCIAS</strong><ul>${planoCurso.competencias.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul></div>`;
    }
    
    // Criar o modal se não existir
    let modal = document.getElementById('modalPlanosAluno');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalPlanosAluno';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:750px; max-height:85vh; overflow-y:auto;">
                <div class="modal-header">
                    <h3 id="modalPlanosTitulo">📋 Planos do Aluno</h3>
                    <button class="close-modal" onclick="fecharModal('modalPlanosAluno')">✕</button>
                </div>
                <div id="modalPlanosConteudo"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Preencher o modal
    const modalContent = `
        <div style="margin-bottom:15px;">
            <button id="btnToggleCurso" onclick="toggleSectionCurso()" style="width:100%; margin-bottom:5px; background:#667eea; color:white; padding:10px; border:none; border-radius:10px; cursor:pointer;">
                📘 Mostrar/Ocultar Plano de Curso
            </button>
            <div id="cursoSection" style="display:block;">
                ${cursoHtml}
            </div>
        </div>
        
        <div>
            <button id="btnTogglePlanos" onclick="toggleSectionPlanos()" style="width:100%; margin-bottom:5px; background:#4ecdc4; color:white; padding:10px; border:none; border-radius:10px; cursor:pointer;">
                📚 Mostrar/Ocultar Planos de Aula (${planosIds.length})
            </button>
            <div id="planosSection" style="display:block;">
                <h3 style="margin:10px 0;">📋 PLANOS DE AULA</h3>
                ${planosHtml}
                <div style="margin-top:15px; text-align:center; padding:10px; background:#f0f0f0; border-radius:10px;">
                    <strong>📊 Progresso:</strong> ${planosIds.filter(pid => aluno.planosConcluidos?.includes(pid)).length} de ${planosIds.length} planos concluídos
                    <div class="progress-bar" style="margin-top:8px;"><div class="progress-fill" style="width:${planosIds.length ? (planosIds.filter(pid => aluno.planosConcluidos?.includes(pid)).length / planosIds.length * 100) : 0}%;"></div></div>
                </div>
            </div>
        </div>
        
        <div style="margin-top:20px; display:flex; gap:10px; justify-content:center;">
            <button onclick="exportarPlanoCursoAluno()" class="success" style="background:#28a745;">📥 Baixar Plano de Curso</button>
            <button onclick="fecharModal('modalPlanosAluno')" class="secondary">Fechar</button>
        </div>
    `;
    
    document.getElementById('modalPlanosTitulo').innerHTML = `📋 Planos de ${escapeHtml(aluno.nome)}`;
    document.getElementById('modalPlanosConteudo').innerHTML = modalContent;
    
    // Mostrar o modal
    modal.classList.add('active');
    console.log('Modal aberto');
}

function toggleSectionCurso() {
    const section = document.getElementById('cursoSection');
    if (section) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
}

function toggleSectionPlanos() {
    const section = document.getElementById('planosSection');
    if (section) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
}

function verPlanoDetalhado(planoId) {
    console.log('verPlanoDetalhado - planoId:', planoId);
    const plano = getPlanoAula(planoId);
    if (!plano) {
        alert('Plano de aula não encontrado!');
        return;
    }
    
    let atividadesHtml = '';
    for (const aid of (plano.atividades_ids || [])) {
        const atividade = getAtividadePorAcaoId(aid, '');
        atividadesHtml += `
            <div style="border-left: 3px solid #ff6b6b; padding-left: 10px; margin-bottom: 10px;">
                <strong>Atividade #${aid}</strong><br>
                ${escapeHtml(atividade.objetivo)}<br>
                <button class="btn-ver" style="margin-top:5px;" onclick="verAtividadeDetalhada(${aid})">📖 Ver atividade</button>
            </div>
        `;
    }
    
    const modalContent = `
        <div><strong>📖 ${escapeHtml(plano.titulo)}</strong></div>
        <div class="atividade-detalhe"><strong>🎯 Objetivo Geral:</strong> ${escapeHtml(plano.objetivoGeral || 'Não informado')}</div>
        <div class="atividade-detalhe"><strong>⏱️ Duração:</strong> ${plano.duracao || '50min'}</div>
        ${plano.objetivosEspecificos && plano.objetivosEspecificos.length ? `<div class="atividade-detalhe"><strong>📝 Objetivos Específicos:</strong><ul>${plano.objetivosEspecificos.map(o => `<li>${escapeHtml(o)}</li>`).join('')}</ul></div>` : ''}
        ${plano.conteudo && plano.conteudo.length ? `<div class="atividade-detalhe"><strong>📚 Conteúdo:</strong><ul>${plano.conteudo.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul></div>` : ''}
        <div class="atividade-detalhe"><strong>🎨 Atividades:</strong>${atividadesHtml || 'Nenhuma'}</div>
        <button class="success" style="margin-top:15px; width:100%;" onclick="baixarPlanoAula(${planoId})">📥 Baixar Plano (TXT)</button>
    `;
    
    document.getElementById('modalTitulo').innerHTML = `📖 ${escapeHtml(plano.titulo)}`;
    document.getElementById('modalConteudo').innerHTML = modalContent;
    abrirModal('modalAtividade');
}

function verAtividadeDetalhada(acaoId) {
    console.log('verAtividadeDetalhada - acaoId:', acaoId);
    const acao = getAcaoPorId(acaoId);
    const atividade = getAtividadePorAcaoId(acaoId, acao ? acao.texto : '');
    
    const modalContent = `
        <div class="atividade-detalhe"><strong>🎯 Ação:</strong> #${acaoId} - ${acao ? escapeHtml(acao.texto) : 'Não encontrada'}</div>
        <div class="atividade-detalhe"><strong>🎯 Objetivo:</strong> ${escapeHtml(atividade.objetivo)}</div>
        <div class="atividade-detalhe"><strong>⏱️ Duração:</strong> ${atividade.duracao}</div>
        <div class="atividade-detalhe"><strong>📦 Materiais:</strong><ul>${atividade.materiais.map(m => `<li>${escapeHtml(m)}</li>`).join('')}</ul></div>
        <div class="atividade-detalhe"><strong>📝 Passo a passo:</strong><ul>${atividade.passo_a_passo.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul></div>
        <button class="success" style="width:100%; margin-top:15px;" onclick="baixarAtividade(${acaoId})">📥 Baixar Atividade</button>
    `;
    
    document.getElementById('modalTitulo').innerHTML = `📖 ${escapeHtml(atividade.titulo)}`;
    document.getElementById('modalConteudo').innerHTML = modalContent;
    abrirModal('modalAtividade');
}

function carregarPlanosAulaAluno() {
    const aluno = getAluno();
    const container = document.getElementById('planosAulaContainer');
    
    if (!aluno) {
        if (container) container.innerHTML = '<div class="empty-state">Selecione um aluno</div>';
        return;
    }
    
    const planoCurso = getPlanoCurso(aluno.planoCursoId || 1);
    const planosIds = planoCurso.planos_aula_ids || [1, 2];
    
    let html = `
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:15px;border-radius:15px;margin-bottom:15px;">
            <strong>🎓 ${escapeHtml(planoCurso.nome)}</strong><br>
            <small>Aluno: ${escapeHtml(aluno.nome)}</small>
        </div>
    `;
    
    for (const pid of planosIds) {
        const plano = getPlanoAula(pid);
        if (plano) {
            html += `
                <div class="plano-card">
                    <strong>📖 ${escapeHtml(plano.titulo)}</strong><br>
                    <small>Nível ${plano.nivel} | ${plano.duracao || '50min'}</small>
                    <div style="margin-top:8px;"><strong>Objetivo:</strong> ${escapeHtml(plano.objetivoGeral ? plano.objetivoGeral.substring(0,100) + '...' : 'Não informado')}</div>
                    <div style="margin-top:10px;">
                        <button class="btn-ver" onclick="verPlanoDetalhado(${pid})">📖 Ver</button>
                        <button class="btn-baixar" onclick="baixarPlanoAula(${pid})">📥 Baixar</button>
                    </div>
                </div>
            `;
        }
    }
    
    if (container) container.innerHTML = html;
}

function carregarPlanosCursoAluno() {
    const aluno = getAluno();
    const container = document.getElementById('planosCursoContainer');
    
    if (!aluno) {
        if (container) container.innerHTML = '<div class="empty-state">Selecione um aluno</div>';
        return;
    }
    
    const plano = getPlanoCurso(aluno.planoCursoId || 1);
    
    let html = `
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:15px;border-radius:15px;margin-bottom:15px;">
            <strong>🎓 ${escapeHtml(plano.nome)}</strong><br>
            <small>Aluno: ${escapeHtml(aluno.nome)}</small>
        </div>
    `;
    
    if (plano.objetivoGeral) html += `<div class="plano-card"><strong>🎯 OBJETIVO GERAL</strong><br>${escapeHtml(plano.objetivoGeral)}</div>`;
    if (plano.ementa) html += `<div class="plano-card"><strong>📖 EMENTA</strong><br>${escapeHtml(plano.ementa)}</div>`;
    if (plano.cargaHoraria) html += `<div class="plano-card"><strong>⏱️ CARGA HORÁRIA</strong><br>${plano.cargaHoraria} horas</div>`;
    
    html += `<div style="margin-top:15px;"><button class="success" onclick="exportarPlanoCursoAluno()">📥 Baixar Plano de Curso</button></div>`;
    
    if (container) container.innerHTML = html;
}

// Registrar funções no escopo global
window.verPlanosDoAluno = verPlanosDoAluno;
window.verPlanoDetalhado = verPlanoDetalhado;
window.verAtividadeDetalhada = verAtividadeDetalhada;
window.carregarPlanosAulaAluno = carregarPlanosAulaAluno;
window.carregarPlanosCursoAluno = carregarPlanosCursoAluno;
window.toggleSectionCurso = toggleSectionCurso;
window.toggleSectionPlanos = toggleSectionPlanos;