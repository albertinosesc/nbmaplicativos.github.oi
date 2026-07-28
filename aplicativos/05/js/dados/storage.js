// ============================================
// SALVAR E CARREGAR DADOS
// ============================================

function salvarDados() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    renderizarListaAulas();
    console.log("💾 Dados salvos");
}

function carregarDados() {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
        try {
            dados = JSON.parse(localData);
            console.log("✅ Dados carregados:", dados.listas.length, "listas");
        } catch (e) {
            console.error("Erro ao carregar:", e);
            dados = obterDadosPadrao();
        }
    } else {
        dados = obterDadosPadrao();
        console.log("📁 Dados padrão carregados");
    }
    renderizarListaAulas();
    if (dados.listas.length > 0 && dados.listas[0].cards.length > 0) {
        carregarAula([0], 0);
    }
}
