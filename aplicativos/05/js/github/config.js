// ============================================
// CONFIGURAR GITHUB (botão 🔑)
// ============================================

function configurarGitHub() {
    const token = prompt('🔑 Token do GitHub (ou vazio para remover):', githubToken || '');
    if (token === null) return;
    if (token.trim() === '') {
        localStorage.removeItem('github_token');
        githubToken = '';
        toast('Token removido.', 'info');
    } else {
        localStorage.setItem('github_token', token.trim());
        githubToken = token.trim();
        toast('✅ Token salvo.', 'success');
    }

    const repo = prompt('📁 Repositório (usuario/repo):', githubRepo || '');
    if (repo !== null && repo.trim() !== '') {
        localStorage.setItem('github_repo', repo.trim());
        githubRepo = repo.trim();
    }

    const branch = prompt('🌿 Branch (padrão: main):', githubBranch || 'main');
    if (branch !== null && branch.trim() !== '') {
        localStorage.setItem('github_branch', branch.trim());
        githubBranch = branch.trim();
    }

    const pasta = prompt('📂 Pasta padrão (ex: aulas/, partituras/, ou vazio):', githubPasta || '');
    if (pasta !== null) {
        let pastaTratada = pasta.trim();
        if (pastaTratada && !pastaTratada.endsWith('/')) pastaTratada += '/';
        localStorage.setItem('github_pasta', pastaTratada);
        githubPasta = pastaTratada;
        toast(`Pasta definida: "${githubPasta || 'raiz'}"`, 'info');
    }

    window.githubToken = githubToken;
    window.githubRepo = githubRepo;
    window.githubBranch = githubBranch;
    window.githubPasta = githubPasta;
}
