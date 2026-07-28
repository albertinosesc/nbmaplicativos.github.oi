// ============================================
// EXPLORADOR DE ARQUIVOS DO GITHUB
// ============================================

function toggleGithubExplorer() {
    const content = document.getElementById('githubExplorerContent');
    if (content) {
        const isVisible = content.style.display !== 'none';
        content.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) {
            document.getElementById('githubPastaInput').value = '';
            listarArquivosGitHubUI();
        }
    }
}

async function listarArquivosGitHubUI(pastaPersonalizada = null) {
    const pastaInput = document.getElementById('githubPastaInput');
    const listaDiv = document.getElementById('githubFileList');
    
    if (!pastaInput || !listaDiv) {
        console.error('Elementos do explorador não encontrados');
        return;
    }
    
    if (!window.githubToken || !window.githubRepo) {
        listaDiv.innerHTML = '<p style="color:#e94560; text-align:center; padding:10px;">❌ Configure o GitHub primeiro (🔑).</p>';
        return;
    }
    
    let pasta = pastaPersonalizada !== null ? pastaPersonalizada : pastaInput.value.trim();
    if (pasta && !pasta.endsWith('/')) pasta += '/';
    
    pastaInput.value = pasta;
    exploradorCaminhoAtual = pasta;
    
    listaDiv.innerHTML = '<p style="color:#aaa; text-align:center; padding:10px;">⏳ Carregando...</p>';
    
    try {
        const url = `https://api.github.com/repos/${window.githubRepo}/contents/${pasta}?ref=${window.githubBranch}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `token ${window.githubToken}` }
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                listaDiv.innerHTML = `<p style="color:#e94560; text-align:center; padding:10px;">❌ Pasta "${pasta || 'raiz'}" não encontrada.</p>`;
            } else {
                const error = await response.json();
                listaDiv.innerHTML = `<p style="color:#e94560; text-align:center; padding:10px;">❌ Erro: ${error.message}</p>`;
            }
            return;
        }
        
        const data = await response.json();
        
        const pastas = data.filter(item => item.type === 'dir');
        const arquivos = data.filter(item => item.type === 'file');
        
        if (data.length === 0) {
            listaDiv.innerHTML = '<p style="color:#888; text-align:center; padding:10px;">📭 Pasta vazia.</p>';
            return;
        }
        
        let html = '<div style="font-size:13px;">';
        
        if (pasta) {
            html += `<div style="padding:5px 8px; cursor:pointer; color:#3a86ff; border-bottom:1px solid #333; margin-bottom:5px;" 
                          onclick="listarArquivosGitHubUI('')">
                          📂 <strong>↩ Voltar à raiz</strong>
                     </div>`;
        }
        
        if (pastas.length > 0) {
            html += '<div style="color:#f39c12; font-weight:bold; padding:5px 8px; margin-top:5px;">📁 Pastas:</div>';
            pastas.forEach(p => {
                html += `<div class="folder-item" style="padding:5px 8px; cursor:pointer; color:#f39c12; border-bottom:1px solid #1a1a2e; display:flex; align-items:center; gap:8px;"
                              onclick="navegarParaPasta('${p.path}')">
                              <span>📁</span> ${p.name}/
                         </div>`;
            });
        }
        
        if (arquivos.length > 0) {
            html += '<div style="color:#3a86ff; font-weight:bold; padding:5px 8px; margin-top:5px;">📄 Arquivos:</div>';
            const extensoes = ['.txt', '.md', '.html', '.css', '.js', '.json', '.csv', '.xml', '.pdf', '.png', '.jpg', '.gif', '.svg', '.mp3', '.mp4'];
            const arquivosFiltrados = arquivos.filter(f => 
                extensoes.some(ext => f.name.endsWith(ext))
            );
            
            if (arquivosFiltrados.length === 0) {
                html += '<div style="color:#888; padding:8px; text-align:center;">Nenhum arquivo compatível encontrado.</div>';
            } else {
                arquivosFiltrados.forEach(arquivo => {
                    const icone = arquivo.name.endsWith('.md') ? '📝' :
                                 arquivo.name.endsWith('.html') ? '🌐' :
                                 arquivo.name.endsWith('.txt') ? '📄' :
                                 arquivo.name.endsWith('.pdf') ? '📕' :
                                 arquivo.name.endsWith('.png') || arquivo.name.endsWith('.jpg') || arquivo.name.endsWith('.gif') ? '🖼️' :
                                 arquivo.name.endsWith('.mp3') ? '🎵' :
                                 arquivo.name.endsWith('.mp4') ? '🎬' : '📎';
                    html += `<div class="file-item" style="padding:5px 8px; cursor:pointer; border-bottom:1px solid #1a1a2e; display:flex; justify-content:space-between; align-items:center;"
                                  onclick="abrirArquivoDoGitHub('${arquivo.path}')">
                                  <span>${icone} ${arquivo.name}</span>
                                  <span style="font-size:10px; color:#666;">${formatarTamanho(arquivo.size)}</span>
                             </div>`;
                });
            }
        }
        
        html += '</div>';
        listaDiv.innerHTML = html;
        
    } catch (err) {
        listaDiv.innerHTML = `<p style="color:#e94560; text-align:center; padding:10px;">❌ Erro: ${err.message}</p>`;
        console.error('Erro ao listar arquivos:', err);
    }
}

function navegarParaPasta(caminho) {
    const pastaInput = document.getElementById('githubPastaInput');
    if (pastaInput) {
        pastaInput.value = caminho;
        listarArquivosGitHubUI(caminho);
    }
}

async function abrirArquivoDoGitHub(caminho) {
    if (!window.githubToken || !window.githubRepo) {
        toast('Configure o GitHub primeiro (🔑).', 'error');
        return;
    }
    
    toast(`⏳ Baixando "${caminho.split('/').pop()}"...`, 'info');
    
    try {
        const url = `https://api.github.com/repos/${window.githubRepo}/contents/${caminho}?ref=${window.githubBranch}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `token ${window.githubToken}` }
        });
        
        if (!response.ok) {
            const error = await response.json();
            toast(`❌ Erro: ${error.message}`, 'error');
            return;
        }
        
        const data = await response.json();
        
        const extensoesTexto = ['.txt', '.md', '.html', '.css', '.js', '.json', '.csv', '.xml', '.svg', '.yml', '.yaml'];
        const nomeArquivo = caminho.split('/').pop();
        const extensao = '.' + nomeArquivo.split('.').pop();
        
        let conteudo;
        if (extensoesTexto.some(ext => ext === extensao)) {
            conteudo = decodeURIComponent(escape(atob(data.content)));
        } else {
            toast(`⚠️ "${nomeArquivo}" é um arquivo binário. Não pode ser aberto no editor.`, 'warning');
            return;
        }
        
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
            toast(`✅ "${nomeArquivo}" aberto!`, 'success');
        } else {
            const lista = obterListaPorCaminho(listaAtual);
            if (lista && lista.cards[cartaoAtual]) {
                lista.cards[cartaoAtual].conteudo = conteudo;
                lista.cards[cartaoAtual].texto = nomeArquivo.replace(/\.[^.]+$/, '');
                lista.cards[cartaoAtual].ultimaModificacao = Date.now();
                salvarDados();
                editor.value = conteudo;
                renderizar();
                toast(`✅ "${nomeArquivo}" carregado!`, 'success');
            }
        }
        
    } catch (err) {
        toast(`❌ Erro ao abrir: ${err.message}`, 'error');
        console.error('Erro ao abrir arquivo:', err);
    }
}

function atualizarExploradorGitHub() {
    const pastaInput = document.getElementById('githubPastaInput');
    if (pastaInput) {
        listarArquivosGitHubUI(pastaInput.value);
    }
}
