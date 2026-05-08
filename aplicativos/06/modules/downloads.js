// ============================================
// DOWNLOADS DE DADOS
// ============================================

function baixarAtividadesTXT() {
    let conteudo = "=== ATIVIDADES ===\n\n";
    for (let i = 1; i <= 400; i++) {
        const acao = getAcaoPorId(i);
        const atividade = getAtividadePorAcaoId(i, acao ? acao.texto : '');
        conteudo += `----------------------------------------\n`;
        conteudo += `AÇÃO #${i}: ${acao ? acao.texto : 'Não encontrada'}\n`;
        conteudo += `ATIVIDADE: ${atividade.titulo}\n`;
        conteudo += `OBJETIVO: ${atividade.objetivo}\n`;
        conteudo += `DURAÇÃO: ${atividade.duracao}\n`;
        conteudo += `MATERIAIS:\n${atividade.materiais.map(m => `  - ${m}`).join('\n')}\n`;
        conteudo += `PASSO A PASSO:\n${atividade.passo_a_passo.join('\n')}\n\n`;
    }
    baixarArquivo(conteudo, `atividades_${new Date().toISOString().split('T')[0]}.txt`);
}

function baixarAcoesTXT() {
    let conteudo = "=== AÇÕES DA NOTA MUSICAL ===\n\n";
    for (const acao of TODAS_ACOES) {
        conteudo += `#${acao.numero} | Nível ${acao.nivel} | ${acao.categoria}\n"${acao.texto}"\n\n`;
    }
    baixarArquivo(conteudo, `acoes_${new Date().toISOString().split('T')[0]}.txt`);
}

function baixarPlanosAulaTXT() {
    const planos = getAllPlanosAula();
    let conteudo = "=== PLANOS DE AULA ===\n\n";
    for (const plano of planos) {
        conteudo += `ID: ${plano.id}\n`;
        conteudo += `TÍTULO: ${plano.titulo}\n`;
        conteudo += `NÍVEL: ${plano.nivel}\n`;
        conteudo += `DURAÇÃO: ${plano.duracao}\n`;
        conteudo += `OBJETIVO GERAL: ${plano.objetivoGeral}\n`;
        conteudo += `ATIVIDADES: ${(plano.atividades_ids || []).join(', ')}\n\n`;
    }
    baixarArquivo(conteudo, `planos_aula_${new Date().toISOString().split('T')[0]}.txt`);
}

function baixarPlanosCursoTXT() {
    const planos = getAllPlanosCurso();
    let conteudo = "=== PLANOS DE CURSO ===\n\n";
    for (const plano of planos) {
        conteudo += `ID: ${plano.id}\n`;
        conteudo += `NOME: ${plano.nome}\n`;
        conteudo += `ANO: ${plano.ano || 1}\n`;
        conteudo += `NÍVEL: ${plano.nivel}\n`;
        conteudo += `OBJETIVO GERAL: ${plano.objetivoGeral}\n`;
        conteudo += `CARGA HORÁRIA: ${plano.cargaHoraria}h\n`;
        conteudo += `PLANOS DE AULA: ${(plano.planos_aula_ids || []).join(', ')}\n\n`;
    }
    baixarArquivo(conteudo, `planos_curso_${new Date().toISOString().split('T')[0]}.txt`);
}

function baixarPlanoAula(planoId) {
    const plano = getPlanoAula(planoId);
    if (!plano) return;
    const data = new Date().toISOString().split('T')[0];
    
    let conteudo = `========================================\n`;
    conteudo += `PLANO DE AULA\n`;
    conteudo += `========================================\n\n`;
    conteudo += `Título: ${plano.titulo}\n`;
    conteudo += `Nível: ${plano.nivel}\n`;
    conteudo += `Duração: ${plano.duracao}\n\n`;
    conteudo += `OBJETIVO GERAL:\n${plano.objetivoGeral}\n\n`;
    if (plano.objetivosEspecificos) {
        conteudo += `OBJETIVOS ESPECÍFICOS:\n${plano.objetivosEspecificos.map(o => `- ${o}`).join('\n')}\n\n`;
    }
    if (plano.conteudo) {
        conteudo += `CONTEÚDO:\n${plano.conteudo.map(c => `- ${c}`).join('\n')}\n\n`;
    }
    if (plano.metodologia) conteudo += `METODOLOGIA:\n${plano.metodologia}\n\n`;
    if (plano.atividades_ids) conteudo += `ATIVIDADES: ${plano.atividades_ids.join(', ')}\n\n`;
    if (plano.avaliacao) conteudo += `AVALIAÇÃO:\n${plano.avaliacao}\n\n`;
    
    baixarArquivo(conteudo, `plano_aula_${plano.titulo.replace(/[^a-z0-9]/gi, '_')}_${data}.txt`);
}

function baixarAtividade(acaoId) {
    const acao = getAcaoPorId(acaoId);
    const atividade = getAtividadePorAcaoId(acaoId, acao ? acao.texto : '');
    const data = new Date().toISOString().split('T')[0];
    
    let conteudo = `========================================\n`;
    conteudo += `ATIVIDADE DA AÇÃO #${acaoId}\n`;
    conteudo += `========================================\n\n`;
    conteudo += `AÇÃO: ${acao ? acao.texto : 'Não encontrada'}\n\n`;
    conteudo += `TÍTULO: ${atividade.titulo}\n\n`;
    conteudo += `OBJETIVO:\n${atividade.objetivo}\n\n`;
    conteudo += `DURAÇÃO: ${atividade.duracao}\n\n`;
    conteudo += `MATERIAIS:\n${atividade.materiais.map(m => `- ${m}`).join('\n')}\n\n`;
    conteudo += `PASSO A PASSO:\n${atividade.passo_a_passo.join('\n')}\n`;
    
    baixarArquivo(conteudo, `atividade_${acaoId}_${data}.txt`);
}

function exportarPlanoCursoAluno() {
    const aluno = getAluno();
    if (!aluno) { alert('Selecione um aluno'); return; }
    
    const plano = getPlanoCurso(aluno.planoCursoId || 1);
    const data = new Date().toISOString().split('T')[0];
    
    let conteudo = `========================================\n`;
    conteudo += `PLANO DE CURSO - ${aluno.nome}\n`;
    conteudo += `========================================\n\n`;
    conteudo += `Curso: ${plano.nome}\n`;
    conteudo += `Ano: ${plano.ano || 1}\n`;
    conteudo += `Nível: ${plano.nivel}\n`;
    conteudo += `Carga Horária: ${plano.cargaHoraria}h\n\n`;
    conteudo += `OBJETIVO GERAL:\n${plano.objetivoGeral}\n\n`;
    if (plano.ementa) conteudo += `EMENTA:\n${plano.ementa}\n\n`;
    if (plano.planos_aula_ids && plano.planos_aula_ids.length) {
        conteudo += `PLANOS DE AULA VINCULADOS:\n`;
        for (const pid of plano.planos_aula_ids) {
            const pa = getPlanoAula(pid);
            if (pa) conteudo += `- ${pa.titulo}\n`;
        }
    }
    
    baixarArquivo(conteudo, `plano_curso_${aluno.nome.replace(/[^a-z0-9]/gi, '_')}_${data}.txt`);
}

function exportarBackupCompleto() {
    const dados = {
        alunos: ALUNOS,
        atividadesPersonalizadas: ATIVIDADES_PERSONALIZADAS,
        acoes: TODAS_ACOES,
        planosAula: PLANOS_AULA_PERSONALIZADOS,
        planosCurso: PLANOS_CURSO_PERSONALIZADOS,
        exportadoEm: new Date().toISOString()
    };
    const json = JSON.stringify(dados, null, 2);
    baixarArquivo(json, `backup_completo_${new Date().toISOString().split('T')[0]}.json`);
}

function importarDados() {
    document.getElementById('arquivoImport').click();
}

function processarImportacao(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            if (dados.alunos) {
                ALUNOS = dados.alunos;
                salvarAlunos();
            }
            if (dados.atividadesPersonalizadas) {
                ATIVIDADES_PERSONALIZADAS = dados.atividadesPersonalizadas;
                localStorage.setItem('atividadesPersonalizadas', JSON.stringify(ATIVIDADES_PERSONALIZADAS));
            }
            if (dados.acoes) {
                for (let i = 0; i < dados.acoes.length && i < TODAS_ACOES.length; i++) {
                    TODAS_ACOES[i].texto = dados.acoes[i].texto;
                    TODAS_ACOES[i].categoria = dados.acoes[i].categoria;
                    TODAS_ACOES[i].nivel = dados.acoes[i].nivel;
                }
                salvarAcoesLocal();
            }
            if (dados.planosAula) {
                PLANOS_AULA_PERSONALIZADOS = dados.planosAula;
                localStorage.setItem('planosAulaPersonalizados', JSON.stringify(PLANOS_AULA_PERSONALIZADOS));
            }
            if (dados.planosCurso) {
                PLANOS_CURSO_PERSONALIZADOS = dados.planosCurso;
                localStorage.setItem('planosCursoPersonalizados', JSON.stringify(PLANOS_CURSO_PERSONALIZADOS));
            }
            mostrarToast('✅ Importação realizada! Recarregando...');
            setTimeout(() => location.reload(), 1500);
        } catch(err) { alert('Erro: ' + err.message); }
    };
    reader.readAsText(file);
}

window.baixarAtividadesTXT = baixarAtividadesTXT;
window.baixarAcoesTXT = baixarAcoesTXT;
window.baixarPlanosAulaTXT = baixarPlanosAulaTXT;
window.baixarPlanosCursoTXT = baixarPlanosCursoTXT;
window.baixarPlanoAula = baixarPlanoAula;
window.baixarAtividade = baixarAtividade;
window.exportarPlanoCursoAluno = exportarPlanoCursoAluno;
window.exportarBackupCompleto = exportarBackupCompleto;
window.importarDados = importarDados;
window.processarImportacao = processarImportacao;