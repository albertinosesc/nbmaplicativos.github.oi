// ============================================
// FUNÇÕES PARA ENVIAR PARA O GITHUB
// ============================================

async function obterShaArquivoGitHub(nomeArquivo, pasta) {
    if (!githubToken || !githubRepo) return null;
    const caminho = pasta + encodeURIComponent(nomeArquivo);
    const url = `https://api.github.com/repos/${githubRepo}/contents/${caminho}`;
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `token ${githubToken}` }
        });
        if (response.ok) {
            const data = await response.json();
            return data.sha;
        }
        return null;
    } catch {
        return null;
    }
}

async function enviarArquivoParaGitHub(nomeArquivo, conteudo, pasta, mensagem = '') {
    if (!githubToken) { toast('Token não configurado.', 'error'); return false; }
    if (!githubRepo) { toast('Repositório não configurado.', 'error'); return false; }

    const caminho = pasta + encodeURIComponent(nomeArquivo);
    const url = `https://api.github.com/repos/${githubRepo}/contents/${caminho}`;

    let sha = await obterShaArquivoGitHub(nomeArquivo, pasta);
    const contentBase64 = btoa(unescape(encodeURIComponent(conteudo)));

    const body = {
        message: mensagem || `Atualizando ${nomeArquivo} via Pro Maestro`,
        content: contentBase64,
        branch: githubBranch
    };
    if (sha) body.sha = sha;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro desconhecido');
        }
        return true;
    } catch (err) {
        toast(`❌ Erro ao enviar "${nomeArquivo}": ${err.message}`, 'error');
        return false;
    }
}

async function enviarParaGitHub() {
    if (listaAtual === null || cartaoAtual === null) {
        toast('❌ Nenhuma aula aberta.', 'error');
        return;
    }
    if (!githubToken) { toast('Configure o GitHub primeiro (🔑).', 'error'); return; }

    const lista = obterListaPorCaminho(listaAtual);
    if (!lista || !lista.cards[cartaoAtual]) {
        toast('❌ Cartão não encontrado.', 'error');
        return;
    }

    const card = lista.cards[cartaoAtual];
    const titulo = card.texto.replace(/\s+/g, '_');

    const formatoSelect = document.getElementById('formatoExport');
    const formato = formatoSelect ? formatoSelect.value : 'md';
    let extensao = formato;
    let conteudo = '';

    if (formato === 'html') {
        const preview = document.getElementById('preview');
        if (!preview) { toast('❌ Pré-visualização não encontrada.', 'error'); return; }
        conteudo = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${card.texto}</title>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/abcjs/6.2.2/abcjs-basic-min.js"><\/script>
<style>body{font-family:Arial;padding:20px;}.chord-diagram canvas{max-width:140px;}.abcjs-container{max-width:100%;overflow-x:auto;}</style>
</head>
<body>
${preview.innerHTML}
</body>
</html>`;
    } else {
        conteudo = editor.value;
        if (formato === 'txt') extensao = 'txt';
        else if (formato === 'md') extensao = 'md';
    }

    const nomeArquivo = `${titulo}.${extensao}`;

    const usarPadrao = confirm(`Usar pasta padrão "${githubPasta || 'raiz'}"? (Cancelar para especificar outra)`);
    let pastaDestino = githubPasta;
    if (!usarPadrao) {
        const resp = prompt('Pasta de destino (ex: aulas/, partituras/, ou vazio):', '');
        if (resp === null) return;
        let pastaDigitada = resp.trim();
        if (pastaDigitada && !pastaDigitada.endsWith('/')) pastaDigitada += '/';
        pastaDestino = pastaDigitada;
    }

    const sucesso = await enviarArquivoParaGitHub(nomeArquivo, conteudo, pastaDestino, `Enviando ${nomeArquivo}`);
    if (sucesso) toast(`✅ "${nomeArquivo}" enviado para "${pastaDestino || 'raiz'}"!`, 'success');
}

async function sincronizarGitHub() {
    if (listaAtual === null) {
        toast('❌ Nenhuma lista aberta.', 'error');
        return;
    }
    if (!githubToken || !githubRepo) {
        toast('Configure o GitHub primeiro (🔑).', 'error');
        return;
    }

    const lista = obterListaPorCaminho(listaAtual);
    if (!lista || !lista.cards || lista.cards.length === 0) {
        toast('📭 Esta lista não tem cartões.', 'info');
        return;
    }

    const formatoSelect = document.getElementById('formatoExport');
    const formato = formatoSelect ? formatoSelect.value : 'md';
    const extensao = formato === 'html' ? 'html' : (formato === 'txt' ? 'txt' : 'md');

    const pastaDestino = prompt('Pasta de destino para TODOS os cartões:', githubPasta || '');
    if (pastaDestino === null) return;
    let pastaTratada = pastaDestino.trim();
    if (pastaTratada && !pastaTratada.endsWith('/')) pastaTratada += '/';

    if (!confirm(`Enviar ${lista.cards.length} cartões para "${pastaTratada || 'raiz'}" como .${extensao}?`)) return;

    let enviados = 0, erros = 0;
    for (let i = 0; i < lista.cards.length; i++) {
        const card = lista.cards[i];
        const titulo = card.texto.replace(/\s+/g, '_');
        let conteudo = '';

        if (formato === 'html') {
            const markedContent = marked.parse(card.conteudo || '');
            conteudo = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${card.texto}</title>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/abcjs/6.2.2/abcjs-basic-min.js"><\/script>
<style>body{font-family:Arial;padding:20px;}.chord-diagram canvas{max-width:140px;}.abcjs-container{max-width:100%;overflow-x:auto;}</style>
</head>
<body>
${markedContent}
</body>
</html>`;
        } else {
            conteudo = card.conteudo || '';
        }

        const nomeArquivo = `${titulo}.${extensao}`;
        const ok = await enviarArquivoParaGitHub(nomeArquivo, conteudo, pastaTratada, `Sincronizando ${nomeArquivo}`);
        if (ok) enviados++; else erros++;
    }

    toast(`✅ Sincronização concluída!\nEnviados: ${enviados}\nErros: ${erros}`, 'success');
}

console.log('✅ GitHub Upload carregado');
