// ============================================
// EXPORTAR.JS - CONVERTE CANVAS PARA IMAGEM ANTES DE CLONAR
// ============================================

// ============================================
// 1. EXPORTAR AULA ATUAL (HTML) - SEM TÍTULO
// ============================================
async function exportHTML() {
    try {
        const previewOriginal = document.getElementById('preview');
        if (!previewOriginal) throw new Error('Preview não encontrado');
        
        // Salva o conteúdo atual do editor
        const editorOriginal = document.getElementById('editor');
        const conteudoOriginal = editorOriginal ? editorOriginal.value : '';
        
        // Pega o conteúdo atual (já está no editor)
        const conteudoAtual = editorOriginal ? editorOriginal.value : '';
        
        // Coloca o conteúdo no editor e renderiza (garantindo que está atualizado)
        if (editorOriginal) {
            editorOriginal.value = conteudoAtual;
            if (typeof renderizar === 'function') {
                renderizar();
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Converte os canvas do preview para imagens
        const canvasesAtuais = previewOriginal.querySelectorAll('canvas');
        canvasesAtuais.forEach(canvas => {
            try {
                const img = document.createElement('img');
                img.src = canvas.toDataURL('image/png');
                img.style.width = '120px';
                img.style.height = 'auto';
                img.style.display = 'inline-block';
                img.style.margin = '10px';
                canvas.parentNode.replaceChild(img, canvas);
            } catch(e) {}
        });
        
        // Clona o preview com as imagens
        const previewClone = previewOriginal.cloneNode(true);
        
        // Restaura o conteúdo original (se necessário)
        if (editorOriginal && conteudoOriginal) {
            editorOriginal.value = conteudoOriginal;
            if (typeof renderizar === 'function') {
                renderizar();
            }
        }
        
        // Extrai o conteúdo do preview (já com imagens)
        let conteudoPreview = previewClone.innerHTML;
        
        // Organiza os diagramas lado a lado no conteúdo
        conteudoPreview = organizarDiagramasNoHTML(conteudoPreview);
        
        const html = `<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pro Maestro - Aula Exportada</title>
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 1200px; margin: 0 auto; background: #f5f5f5; padding-bottom: 60px; }
    .aula-card { background: white; padding: 30px; margin: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 40px; }
    
    /* DIAGRAMAS LADO A LADO */
    .diagramas-container {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 20px !important;
        justify-content: flex-start !important;
        align-items: flex-start !important;
        margin: 20px 0 !important;
    }
    
    .violao-wrapper {
        display: inline-flex !important;
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
        margin: 0 !important;
        padding: 15px !important;
        background: #f9f9f9 !important;
        border-radius: 10px !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
    }
    
    .violao-wrapper img {
        max-width: 140px !important;
        height: auto !important;
    }
    
    .abc-container { margin: 25px 0; overflow-x: auto; }
    .abcjs-container svg { max-width: 100%; height: auto; }
    
    @media (max-width: 768px) {
        .diagramas-container { gap: 10px !important; }
        .violao-wrapper img { width: 100px !important; }
    }
    
    @media print {
        body { background: white; padding: 0; }
        .no-print { display: none !important; }
        .aula-card { page-break-after: always; margin: 0; padding: 20px; box-shadow: none; }
    }
</style>
</head>
<body>
<div class="aula-card">
    ${conteudoPreview}
    <div style="text-align:center;margin-top:30px" class="no-print">
        <a href="#" onclick="window.scrollTo({top:0,behavior:'smooth'});return false" style="background:#e94560;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block">⬆️ Voltar ao Topo</a>
    </div>
</div>
</body>
</html>`;
        
        const blob = new Blob([html], {type: 'text/html'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Pro_Maestro_Aula_${Date.now()}.html`;
        link.click();
        URL.revokeObjectURL(link.href);
        
        alert('✅ Aula atual exportada com sucesso!');
        
    } catch (erro) {
        console.error('Erro:', erro);
        alert('❌ Erro: ' + erro.message);
    }
}

// ============================================
// FUNÇÃO AUXILIAR PARA ORGANIZAR DIAGRAMAS NO HTML
// ============================================
function organizarDiagramasNoHTML(html) {
    // Cria um elemento temporário para manipular o HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Encontra todos os violao-wrapper
    const violoes = temp.querySelectorAll('.violao-wrapper');
    if (violoes.length === 0) return html;
    
    // Verifica se já estão dentro de um diagramas-container
    const primeiroPai = violoes[0].parentNode;
    if (primeiroPai.classList && primeiroPai.classList.contains('diagramas-container')) {
        return html;
    }
    
    // Cria o container
    const container = document.createElement('div');
    container.className = 'diagramas-container';
    
    // Move todos os violoes para o container
    violoes.forEach(violao => {
        container.appendChild(violao.cloneNode(true));
    });
    
    // Remove os violoes originais
    violoes.forEach(violao => {
        violao.remove();
    });
    
    // Adiciona o container no lugar
    temp.appendChild(container);
    
    return temp.innerHTML;
}

// ============================================
// 2. EXPORTAR PASTA COMPLETA (HTML)
// ============================================
async function exportarPastaAtual() {
    // Guarda o estado original do preview
    const previewOriginal = document.getElementById('preview');
    if (!previewOriginal) {
        alert('Preview não encontrado');
        return;
    }
    
    try {
        let listasSistema = [];
        if (typeof window.dados !== 'undefined' && window.dados.listas) {
            listasSistema = window.dados.listas;
        } else {
            const storedData = localStorage.getItem('pro_maestro_listas');
            if (storedData) {
                const parsed = JSON.parse(storedData);
                if (parsed.listas) listasSistema = parsed.listas;
            }
        }

        if (listasSistema.length === 0) {
            throw new Error('Nenhuma pasta encontrada.');
        }

        let opcoesPastas = listasSistema.map((l, idx) => `${idx + 1} - ${l.nome}`).join('\n');
        let escolha = prompt(`Digite o número da pasta para exportar:\n\n${opcoesPastas}`);
        
        if (!escolha) return; 
        let indexEscolhido = parseInt(escolha) - 1;
        
        if (isNaN(indexEscolhido) || !listasSistema[indexEscolhido]) {
            alert('❌ Seleção inválida.');
            return;
        }

        const pastaSelecionada = listasSistema[indexEscolhido];
        let aulasDaPasta = [];

        function extrairCardsDaPasta(lista) {
            let resultado = [];
            if (lista.cards && lista.cards.length > 0) {
                lista.cards.forEach((card) => {
                    resultado.push({
                        titulo: card.texto || 'Aula',
                        conteudo: card.conteudo || ''
                    });
                });
            }
            if (lista.sublistas && lista.sublistas.length > 0) {
                lista.sublistas.forEach(sub => {
                    resultado = resultado.concat(extrairCardsDaPasta(sub));
                });
            }
            return resultado;
        }

        aulasDaPasta = extrairCardsDaPasta(pastaSelecionada);

        if (aulasDaPasta.length === 0) {
            alert(`⚠️ A pasta "${pastaSelecionada.nome}" não contém aulas.`);
            return;
        }

        // Salva o conteúdo atual do editor
        const editorOriginal = document.getElementById('editor');
        const conteudoOriginal = editorOriginal ? editorOriginal.value : '';
        
        let aulasHtml = '';
        let indiceHtml = '<ul style="list-style:none;padding:0;">';
        
        for (let i = 0; i < aulasDaPasta.length; i++) {
            const aula = aulasDaPasta[i];
            const tituloLimpo = aula.titulo.replace(/[<>]/g, '');
            
            indiceHtml += `<li style="margin:10px 0;"><a href="#aula-pasta-${i}" style="color:#1a1a2e;text-decoration:none;">📄 ${i+1}. ${tituloLimpo}</a></li>`;
            
            // Coloca o conteúdo no editor e renderiza
            if (editorOriginal) {
                editorOriginal.value = aula.conteudo;
                if (typeof renderizar === 'function') {
                    renderizar();
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Converte os canvas do preview para imagens
            const canvasesAtuais = previewOriginal.querySelectorAll('canvas');
            canvasesAtuais.forEach(canvas => {
                try {
                    const img = document.createElement('img');
                    img.src = canvas.toDataURL('image/png');
                    img.style.width = '120px';
                    img.style.height = 'auto';
                    img.style.display = 'inline-block';
                    img.style.margin = '10px';
                    canvas.parentNode.replaceChild(img, canvas);
                } catch(e) {}
            });
            
            // Clona o preview com as imagens
            let previewClone = previewOriginal.cloneNode(true);
            
            // Organiza os diagramas lado a lado
            let conteudoAula = previewClone.innerHTML;
            conteudoAula = organizarDiagramasNoHTML(conteudoAula);
            
            aulasHtml += `
            <div id="aula-pasta-${i}" class="aula-card" style="background:white;padding:30px;margin:20px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1);page-break-after:always;">
                <h1 style="color:#1a1a2e;margin-top:0;border-bottom:2px solid #e94560;padding-bottom:10px;">${tituloLimpo}</h1>
                ${conteudoAula}
                <div style="text-align:center;margin-top:30px" class="no-print">
                    <a href="#" onclick="window.scrollTo({top:0,behavior:'smooth'});return false" style="background:#e94560;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block">⬆️ Voltar ao Topo</a>
                </div>
            </div>`;
        }
        indiceHtml += '</ul>';
        
        // Restaura o conteúdo original do editor
        if (editorOriginal && conteudoOriginal) {
            editorOriginal.value = conteudoOriginal;
            if (typeof renderizar === 'function') {
                renderizar();
            }
        }

        const htmlFinal = gerarTemplateSimples(pastaSelecionada.nome, indiceHtml, aulasHtml);
        
        const blob = new Blob([htmlFinal], {type: 'text/html'});
        const link = document.createElement('a');
        const nomeArquivo = pastaSelecionada.nome.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.href = URL.createObjectURL(blob);
        link.download = `Pro_Maestro_Pasta_${nomeArquivo}_${Date.now()}.html`;
        link.click();
        URL.revokeObjectURL(link.href);
        
        alert(`✅ Pasta "${pastaSelecionada.nome}" exportada!`);

    } catch (erro) {
        console.error('Erro:', erro);
        alert('❌ Erro: ' + erro.message);
    } finally {
        // Recarrega a renderização final
        if (typeof renderizar === 'function') {
            renderizar();
        }
    }
}

// ============================================
// 3. EXPORTAR APP COMPLETO
// ============================================
async function exportAppHTML() {
    // Guarda o estado original do preview
    const previewOriginal = document.getElementById('preview');
    if (!previewOriginal) {
        alert('Preview não encontrado');
        return;
    }
    
    try {
        let todasAulas = [];
        
        function extrairAulasGerais(listas) {
            if (!listas) return [];
            let aulasTemp = [];
            for (let i = 0; i < listas.length; i++) {
                const lista = listas[i];
                if (lista.cards && lista.cards.length > 0) {
                    for (let j = 0; j < lista.cards.length; j++) {
                        const card = lista.cards[j];
                        aulasTemp.push({
                            titulo: card.texto || `Aula ${j+1}`,
                            conteudo: card.conteudo || ''
                        });
                    }
                }
                if (lista.sublistas && lista.sublistas.length > 0) {
                    aulasTemp = aulasTemp.concat(extrairAulasGerais(lista.sublistas));
                }
            }
            return aulasTemp;
        }
        
        if (typeof window.dados !== 'undefined' && window.dados.listas) {
            todasAulas = extrairAulasGerais(window.dados.listas);
        }
        
        if (todasAulas.length === 0) {
            const storedData = localStorage.getItem('pro_maestro_listas');
            if (storedData) {
                try {
                    const parsed = JSON.parse(storedData);
                    if (parsed.listas) todasAulas = extrairAulasGerais(parsed.listas);
                } catch(e) {}
            }
        }
        
        if (todasAulas.length === 0) {
            const editor = document.getElementById('editor');
            const conteudo = editor ? editor.value : '';
            todasAulas = [{ titulo: 'Minha Aula Atual', conteudo: conteudo }];
        }

        // Salva o conteúdo atual do editor
        const editorOriginal = document.getElementById('editor');
        const conteudoOriginal = editorOriginal ? editorOriginal.value : '';
        
        let aulasHtml = '';
        let indiceHtml = '<ul style="list-style:none;padding:0;">';
        
        for (let i = 0; i < todasAulas.length; i++) {
            const aula = todasAulas[i];
            const tituloLimpo = aula.titulo.replace(/[<>]/g, '');
            
            indiceHtml += `<li style="margin:10px 0;"><a href="#aula-app-${i}" style="color:#1a1a2e;text-decoration:none;">📄 ${i+1}. ${tituloLimpo}</a></li>`;
            
            // Coloca o conteúdo no editor e renderiza
            if (editorOriginal) {
                editorOriginal.value = aula.conteudo;
                if (typeof renderizar === 'function') {
                    renderizar();
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Converte os canvas do preview para imagens
            const canvasesAtuais = previewOriginal.querySelectorAll('canvas');
            canvasesAtuais.forEach(canvas => {
                try {
                    const img = document.createElement('img');
                    img.src = canvas.toDataURL('image/png');
                    img.style.width = '120px';
                    img.style.height = 'auto';
                    img.style.display = 'inline-block';
                    img.style.margin = '10px';
                    canvas.parentNode.replaceChild(img, canvas);
                } catch(e) {}
            });
            
            // Clona o preview com as imagens
            let previewClone = previewOriginal.cloneNode(true);
            
            // Organiza os diagramas lado a lado
            let conteudoAula = previewClone.innerHTML;
            conteudoAula = organizarDiagramasNoHTML(conteudoAula);

            aulasHtml += `
            <div id="aula-app-${i}" class="aula-card" style="background:white;padding:30px;margin:20px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1);page-break-after:always;">
                <h1 style="color:#1a1a2e;margin-top:0;border-bottom:2px solid #e94560;padding-bottom:10px;">${tituloLimpo}</h1>
                ${conteudoAula}
                <div style="text-align:center;margin-top:30px" class="no-print">
                    <a href="#" onclick="window.scrollTo({top:0,behavior:'smooth'});return false" style="background:#e94560;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block">⬆️ Voltar ao Topo</a>
                </div>
            </div>`;
        }
        indiceHtml += '</ul>';
        
        // Restaura o conteúdo original do editor
        if (editorOriginal && conteudoOriginal) {
            editorOriginal.value = conteudoOriginal;
            if (typeof renderizar === 'function') {
                renderizar();
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

        const htmlFinal = gerarTemplateSimples(`App Completo (${todasAulas.length} aulas)`, indiceHtml, aulasHtml);
        
        const blob = new Blob([htmlFinal], {type: 'text/html'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Pro_Maestro_App_Completo_${Date.now()}.html`;
        link.click();
        URL.revokeObjectURL(link.href);
        
        alert(`✅ App exportado! ${todasAulas.length} aulas.`);
        
    } catch (erro) {
        console.error('Erro:', erro);
        alert('❌ Erro: ' + erro.message);
    } finally {
        // Recarrega a renderização final
        if (typeof renderizar === 'function') {
            renderizar();
        }
    }
}

// ============================================
// TEMPLATE HTML SIMPLES - COM ORGANIZAÇÃO LADO A LADO
// ============================================
function gerarTemplateSimples(titulo, indice, aulasConteudo) {
    return `<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pro Maestro - ${titulo}</title>
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 1200px; margin: 0 auto; background: #f5f5f5; padding-bottom: 60px; }
    .indice { background: white; padding: 30px; margin: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .indice h1 { color: #e94560; margin-bottom: 20px; }
    .aula-card { background: white; padding: 30px; margin: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 40px; }
    .aula-card h1 { color: #1a1a2e; margin-top: 0; border-bottom: 2px solid #e94560; padding-bottom: 10px; }
    
    /* DIAGRAMAS LADO A LADO */
    .diagramas-container {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 20px !important;
        justify-content: flex-start !important;
        align-items: flex-start !important;
        margin: 20px 0 !important;
    }
    
    .violao-wrapper {
        display: inline-flex !important;
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
        margin: 0 !important;
        padding: 15px !important;
        background: #f9f9f9 !important;
        border-radius: 10px !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
    }
    
    .violao-wrapper canvas, .violao-wrapper img {
        max-width: 140px !important;
        height: auto !important;
    }
    
    .abc-container { margin: 25px 0; overflow-x: auto; }
    .abcjs-container svg { max-width: 100%; height: auto; }
    
    @media (max-width: 768px) {
        .diagramas-container { gap: 10px !important; }
        .violao-wrapper canvas, .violao-wrapper img { width: 100px !important; }
    }
    
    @media print {
        body { background: white; padding: 0; }
        .indice, .no-print { display: none !important; }
        .aula-card { page-break-after: always; margin: 0; padding: 20px; box-shadow: none; }
    }
</style>
</head>
<body>
<div class="indice">
    <h1>📚 ${titulo}</h1>
    ${indice}
</div>
${aulasConteudo}

<div style="text-align:center;margin:30px 0" class="no-print">
    <a href="#" onclick="window.scrollTo({top:0,behavior:'smooth'});return false" style="background:#e94560;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block">⬆️ Voltar ao Topo</a>
</div>

<script>
// Função para organizar diagramas lado a lado no HTML exportado
function organizarDiagramasLadoALado() {
    const aulas = document.querySelectorAll('.aula-card');
    
    aulas.forEach(aula => {
        const violoes = aula.querySelectorAll('.violao-wrapper');
        if (violoes.length === 0) return;
        
        const pai = violoes[0].parentNode;
        if (pai.classList && pai.classList.contains('diagramas-container')) return;
        
        const container = document.createElement('div');
        container.className = 'diagramas-container';
        
        violoes.forEach(violao => {
            container.appendChild(violao);
        });
        
        pai.appendChild(container);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', organizarDiagramasLadoALado);
} else {
    organizarDiagramasLadoALado();
}
</script>
</body>
</html>`;
}

// ============================================
// FUNÇÕES DE BACKUP
// ============================================
function exportarBackupJSON() {
    try {
        const dadosCompletos = {
            tipo: 'backup_completo',
            dados: window.dados || null,
            timestamp: Date.now(),
            data: new Date().toLocaleString()
        };
        const blob = new Blob([JSON.stringify(dadosCompletos, null, 2)], {type: 'application/json'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `pro_maestro_backup_${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
        alert('✅ Backup salvo!');
    } catch(e) {
        alert('Erro: ' + e.message);
    }
}

function importarBackupJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                const dados = JSON.parse(evt.target.result);
                if (dados.dados && dados.dados.listas) {
                    window.dados = dados.dados;
                    localStorage.setItem('pro_maestro_listas', JSON.stringify(dados.dados));
                    if (typeof carregarDados === 'function') carregarDados();
                    alert('✅ Backup restaurado!');
                } else if (dados.conteudo) {
                    const editor = document.getElementById('editor');
                    if (editor) editor.value = dados.conteudo;
                    if (typeof renderizar === 'function') renderizar();
                    alert('✅ Conteúdo restaurado!');
                } else {
                    alert('Formato de backup inválido');
                }
            } catch(erro) { alert('Erro: ' + erro.message); }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Aliases
function exportarArquivo() { exportarBackupJSON(); }
function importarArquivo() { importarBackupJSON(); }
function importarParaPastaAtual() { importarBackupJSON(); }
function exportarTudoSistema() { exportarBackupJSON(); }
function importarTudoSistema() { importarBackupJSON(); }
