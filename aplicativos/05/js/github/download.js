// ============================================
// FUNÇÕES PARA BAIXAR DO GITHUB
// ============================================

async function salvarArquivo(handle, conteudo) {
    const writable = await handle.createWritable();
    await writable.write(conteudo);
    await writable.close();
}

function formatarTamanho(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

window.puxarDoGitHub = async function() {
    console.log("🔍 Iniciando puxarDoGitHub...");

    if (!window.githubToken || !window.githubRepo) {
        toast('Configure o GitHub primeiro (🔑).', 'error');
        return;
    }

    const pastaOrigem = prompt(
        '📂 Pasta de origem no GitHub (ex: arquivos/, conteudo/, ou vazio para raiz):',
        window.githubPasta || ''
    );
    if (pastaOrigem === null) return;
    let pasta = pastaOrigem.trim();
    if (pasta && !pasta.endsWith('/')) pasta += '/';

    const urlLista = `https://api.github.com/repos/${window.githubRepo}/contents/${pasta}?ref=${window.githubBranch}`;
    let arquivos = [];
    try {
        const response = await fetch(urlLista, {
            headers: { 'Authorization': `token ${window.githubToken}` }
        });
        if (!response.ok) {
            if (response.status === 404) {
                toast(`❌ Pasta "${pasta || 'raiz'}" não encontrada.`, 'error');
                return;
            }
            const error = await response.json();
            toast(`❌ Erro: ${error.message}`, 'error');
            return;
        }
        const data = await response.json();
        const extensoes = ['.txt', '.md', '.html', '.css', '.js', '.json', '.csv', '.xml'];
        arquivos = data
            .filter(item => item.type === 'file' && extensoes.some(ext => item.name.endsWith(ext)))
            .map(item => item.name);

        if (arquivos.length === 0) {
            toast(`📭 Nenhum arquivo encontrado em "${pasta || 'raiz'}"`, 'error');
            const manual = confirm('Deseja digitar o nome do arquivo manualmente?');
            if (!manual) return;
            const nomeManual = prompt('Digite o nome do arquivo:');
            if (!nomeManual) return;
            arquivos = [nomeManual];
        } else {
            let listaMsg = '📄 Escolha um arquivo (digite o número):\n\n';
            arquivos.forEach((nome, idx) => {
                listaMsg += `  ${idx + 1}. ${nome}\n`;
            });
            listaMsg += `\n  ${arquivos.length + 1}. Digitar manualmente`;
            const escolha = prompt(listaMsg, '1');
            if (escolha === null) return;
            const numero = parseInt(escolha);
            if (isNaN(numero) || numero < 1 || numero > arquivos.length + 1) {
                toast('❌ Número inválido.', 'error');
                return;
            }
            if (numero === arquivos.length + 1) {
                const nomeManual = prompt('Digite o nome do arquivo:');
                if (!nomeManual) return;
                arquivos = [nomeManual];
            } else {
                arquivos = [arquivos[numero - 1]];
            }
        }
    } catch (err) {
        toast(`❌ Erro ao listar arquivos: ${err.message}`, 'error');
        return;
    }

    const nomeArquivo = arquivos[0];
    console.log(`✅ Arquivo selecionado: "${nomeArquivo}"`);

    const caminho = encodeURIComponent(pasta + nomeArquivo);
    const urlDownload = `https://api.github.com/repos/${window.githubRepo}/contents/${caminho}?ref=${window.githubBranch}`;
    let conteudo;
    try {
        const response = await fetch(urlDownload, {
            headers: { 'Authorization': `token ${window.githubToken}` }
        });
        if (!response.ok) {
            if (response.status === 404) {
                toast(`❌ "${nomeArquivo}" não encontrado.`, 'error');
            } else {
                const error = await response.json();
                toast(`❌ Erro: ${error.message}`, 'error');
            }
            return;
        }
        const data = await response.json();
        try {
            conteudo = decodeURIComponent(escape(atob(data.content)));
            console.log(`✅ Conteúdo decodificado (${conteudo.length} caracteres).`);
        } catch (decodeErr) {
            toast(`❌ Erro ao decodificar arquivo: ${decodeErr.message}`, 'error');
            return;
        }
    } catch (err) {
        toast(`❌ Erro ao baixar: ${err.message}`, 'error');
        return;
    }

    const acao = confirm(
        `📄 "${nomeArquivo}" baixado com sucesso!\n\n` +
        `Clique em "OK" para ABRIR no editor (sem salvar em disco).\n` +
        `Clique em "Cancelar" para BAIXAR para uma pasta do computador.`
    );

    if (acao) {
        if (listaAtual === null || cartaoAtual === null) {
            let listaTemp = dados.listas.find(l => l.nome === 'Temporários');
            if (!listaTemp) {
                listaTemp = { nome: 'Temporários', cards: [], sublistas: [] };
                dados.listas.push(listaTemp);
            }
            const novoCard = {
                texto: nomeArquivo.replace(/\.[^.]+$/, ''),
                conteudo: conteudo,
                ultimaModificacao: Date.now()
            };
            listaTemp.cards.push(novoCard);
            const idx = dados.listas.indexOf(listaTemp);
            const cardIdx = listaTemp.cards.length - 1;
            salvarDados();
            carregarAula([idx], cardIdx);
            toast(`✅ "${nomeArquivo}" aberto no editor!`, 'success');
        } else {
            const lista = obterListaPorCaminho(listaAtual);
            if (lista && lista.cards[cartaoAtual]) {
                lista.cards[cartaoAtual].conteudo = conteudo;
                lista.cards[cartaoAtual].texto = nomeArquivo.replace(/\.[^.]+$/, '');
                lista.cards[cartaoAtual].ultimaModificacao = Date.now();
                salvarDados();
                editor.value = conteudo;
                renderizar();
                toast(`✅ "${nomeArquivo}" carregado na aula atual.`, 'success');
            } else {
                toast('❌ Erro: aula não encontrada.', 'error');
            }
        }
    } else {
        let pastaLocal;
        try {
            pastaLocal = await window.showDirectoryPicker({ mode: 'readwrite' });
            console.log(`📁 Pasta local selecionada: ${pastaLocal.name}`);
        } catch (err) {
            if (err.name !== 'AbortError') {
                toast('Erro ao selecionar pasta: ' + err.message, 'error');
            }
            return;
        }

        try {
            const arquivoHandle = await pastaLocal.getFileHandle(nomeArquivo, { create: true });
            await salvarArquivo(arquivoHandle, conteudo);
            toast(`✅ "${nomeArquivo}" baixado em "${pastaLocal.name}"`, 'success');
        } catch (saveErr) {
            toast(`❌ Erro ao salvar arquivo: ${saveErr.message}`, 'error');
            return;
        }

        const abrir = confirm(`Deseja abrir a pasta "${pastaLocal.name}" no explorador agora?`);
        if (abrir) {
            try {
                if (typeof window.carregarPasta === 'function') {
                    window.pastaHandle = pastaLocal;
                    await window.carregarPasta();
                } else if (typeof carregarPasta === 'function') {
                    pastaHandle = pastaLocal;
                    await carregarPasta();
                } else {
                    toast('⚠️ Função carregarPasta não encontrada.', 'warning');
                }
            } catch (err) {
                toast(`⚠️ Erro ao abrir pasta: ${err.message}`, 'warning');
            }
        }
    }
};
