// ============================================
// INICIALIZAÇÃO PRINCIPAL
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema inicializando...');
    
    // Carregar dados
    carregarAcoesPersonalizadas();
    carregarAtividadesSalvas();
    carregarPlanosAulaSalvos();
    carregarPlanosCursoSalvos();
    carregarAlunos();
    carregarAnalise();
    
    // Configurar abas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            document.getElementById(`tab-${tab}`).classList.add('active');
            
            if (tab === 'acoes') {
                atualizarFiltros();
                atualizarAcoes();
            }
            if (tab === 'dashboard') {
                if (typeof atualizarDashboard === 'function') atualizarDashboard();
            }
            if (tab === 'planosAula') {
                if (typeof carregarPlanosAulaAluno === 'function') carregarPlanosAulaAluno();
            }
            if (tab === 'planosCurso') {
                if (typeof carregarPlanosCursoAluno === 'function') carregarPlanosCursoAluno();
            }
            if (tab === 'editar') {
                if (typeof preencherSelectsEdicao === 'function') preencherSelectsEdicao();
            }
        });
    });
    
    // Event listeners dos filtros
    const filtroCategoria = document.getElementById('filtroCategoria');
    const filtroNivel = document.getElementById('filtroNivel');
    const searchAcao = document.getElementById('searchAcao');
    
    if (filtroCategoria) filtroCategoria.addEventListener('change', () => atualizarAcoes());
    if (filtroNivel) filtroNivel.addEventListener('change', () => atualizarAcoes());
    if (searchAcao) searchAcao.addEventListener('input', () => atualizarAcoes());
    
    // Event listeners dos selects de alunos
    const selectAlunoAcoes = document.getElementById('selecionarAlunoAcoes');
    const selectAlunoDash = document.getElementById('selecionarAlunoDash');
    const selectAlunoPlanosAula = document.getElementById('selecionarAlunoPlanosAula');
    const selectAlunoPlanosCurso = document.getElementById('selecionarAlunoPlanosCurso');
    
    if (selectAlunoAcoes) selectAlunoAcoes.addEventListener('change', (e) => e.target.value && selecionarAluno(parseInt(e.target.value)));
    if (selectAlunoDash) selectAlunoDash.addEventListener('change', (e) => e.target.value && selecionarAluno(parseInt(e.target.value)));
    if (selectAlunoPlanosAula) selectAlunoPlanosAula.addEventListener('change', (e) => e.target.value && selecionarAluno(parseInt(e.target.value)));
    if (selectAlunoPlanosCurso) selectAlunoPlanosCurso.addEventListener('change', (e) => e.target.value && selecionarAluno(parseInt(e.target.value)));
    
    // Botões de ação
    const btnMarcarTodas = document.getElementById('btnMarcarTodas');
    const btnDesmarcarTodas = document.getElementById('btnDesmarcarTodas');
    const btnAdicionarAluno = document.getElementById('btnAdicionarAluno');
    const btnCarregarAcao = document.getElementById('btnCarregarAcao');
    const btnCarregarAtividade = document.getElementById('btnCarregarAtividade');
    const btnCarregarPlanoAula = document.getElementById('btnCarregarPlanoAula');
    const btnCarregarPlanoCurso = document.getElementById('btnCarregarPlanoCurso');
    const btnBaixarAtividades = document.getElementById('btnBaixarAtividades');
    const btnBaixarAcoes = document.getElementById('btnBaixarAcoes');
    const btnBaixarPlanosAula = document.getElementById('btnBaixarPlanosAula');
    const btnBaixarPlanosCurso = document.getElementById('btnBaixarPlanosCurso');
    const btnExportarBackup = document.getElementById('btnExportarBackup');
    const btnImportar = document.getElementById('btnImportar');
    
    if (btnMarcarTodas) btnMarcarTodas.addEventListener('click', () => marcarTodasAcoes());
    if (btnDesmarcarTodas) btnDesmarcarTodas.addEventListener('click', () => desmarcarTodasAcoes());
    if (btnAdicionarAluno) btnAdicionarAluno.addEventListener('click', () => adicionarAluno());
    if (btnCarregarAcao) btnCarregarAcao.addEventListener('click', () => carregarAcaoParaEdicao());
    if (btnCarregarAtividade) btnCarregarAtividade.addEventListener('click', () => carregarAtividadeParaEdicao());
    if (btnCarregarPlanoAula) btnCarregarPlanoAula.addEventListener('click', () => carregarPlanoAulaParaEdicao());
    if (btnCarregarPlanoCurso) btnCarregarPlanoCurso.addEventListener('click', () => carregarPlanoCursoParaEdicao());
    if (btnBaixarAtividades) btnBaixarAtividades.addEventListener('click', () => baixarAtividadesTXT());
    if (btnBaixarAcoes) btnBaixarAcoes.addEventListener('click', () => baixarAcoesTXT());
    if (btnBaixarPlanosAula) btnBaixarPlanosAula.addEventListener('click', () => baixarPlanosAulaTXT());
    if (btnBaixarPlanosCurso) btnBaixarPlanosCurso.addEventListener('click', () => baixarPlanosCursoTXT());
    if (btnExportarBackup) btnExportarBackup.addEventListener('click', () => exportarBackupCompleto());
    if (btnImportar) btnImportar.addEventListener('click', () => importarDados());
    
    // Importação de arquivo
    const arquivoImport = document.getElementById('arquivoImport');
    if (arquivoImport) arquivoImport.addEventListener('change', processarImportacao);
    
    // Totais
    document.getElementById('totalAcoes').textContent = TODAS_ACOES.length;
    document.getElementById('totalAtividades').textContent = getTotalAtividadesEditadas();
    
    // Selecionar primeiro aluno se houver
    if (ALUNOS.length > 0) {
        selecionarAluno(ALUNOS[0].id);
    }
    
    console.log('Sistema inicializado com sucesso!');
});