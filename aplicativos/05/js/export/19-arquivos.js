// ============================================
// EXPORTAÇÃO DE ARQUIVOS (TXT, MD, HTML, JSON)
// ============================================

function gerarHTMLCompleto(conteudoPreview) {
    return `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${obterTituloAtual()}</title>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/abcjs/6.2.2/abcjs-basic-min.js"><\/script>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: white; }
    .chord-diagram canvas { max-width: 140px; height: auto; }
    .abcjs-container { max-width: 100%; overflow-x: auto; }
    .abcjs-container svg { max-width: 100%; height: auto; }
    .piano-diagram-container { display: inline-block; margin: 10px; }
    ${document.querySelector('style')?.innerHTML || ''}
  </style>
</head>
<body>
  ${conteudoPreview}
</body>
</html>`;
}

function exportarArquivo(conteudo, extensao, mimeType = 'text/plain') {
    if (!conteudo) {
        alert('❌ Não há conteúdo para exportar.');
        return;
    }
    const blob = new Blob([conteudo], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const titulo = obterTituloAtual().replace(/\s+/g, '_');
    link.download = `${titulo}.${extensao}`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast(`✅ Arquivo ${extensao.toUpperCase()} exportado!`, 'success');
}

function exportarTXT() {
    const conteudo = obterConteudoAtual();
    exportarArquivo(conteudo, 'txt', 'text/plain');
}

function exportarMD() {
    const conteudo = obterConteudoAtual();
    exportarArquivo(conteudo, 'md', 'text/markdown');
}

function exportarHTML() {
    const preview = document.getElementById('preview');
    if (!preview) {
        alert('❌ Pré-visualização não encontrada.');
        return;
    }
    const htmlContent = gerarHTMLCompleto(preview.innerHTML);
    exportarArquivo(htmlContent, 'html', 'text/html');
}

function exportarEstruturaJSON() {
    const json = JSON.stringify(dados, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'pro_maestro_backup.json';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast('✅ Estrutura completa exportada em JSON!', 'success');
}

// Exportar para GitHub
async function exportarEnviarTXT() {
    const conteudo = obterConteudoAtual();
    if (!conteudo) { alert('❌ Sem conteúdo para exportar.'); return; }
    const titulo = obterTituloAtual().replace(/\s+/g, '_');
    const nomeArquivo = `${titulo}.txt`;
    const pasta = 'txt';
    const ok = await enviarArquivoParaGitHub(nomeArquivo, conteudo, pasta);
    if (ok) toast('✅ TXT enviado para o GitHub!', 'success');
}

async function exportarEnviarMD() {
    const conteudo = obterConteudoAtual();
    if (!conteudo) { alert('❌ Sem conteúdo para exportar.'); return; }
    const titulo = obterTituloAtual().replace(/\s+/g, '_');
    const nomeArquivo = `${titulo}.md`;
    const pasta = 'markdown';
    const ok = await enviarArquivoParaGitHub(nomeArquivo, conteudo, pasta);
    if (ok) toast('✅ MD enviado para o GitHub!', 'success');
}

async function exportarEnviarHTML() {
    const preview = document.getElementById('preview');
    if (!preview) { alert('❌ Pré-visualização não encontrada.'); return; }
    const titulo = obterTituloAtual().replace(/\s+/g, '_');
    const htmlContent = gerarHTMLCompleto(preview.innerHTML);
    const nomeArquivo = `${titulo}.html`;
    const pasta = 'html';
    const ok = await enviarArquivoParaGitHub(nomeArquivo, htmlContent, pasta);
    if (ok) toast('✅ HTML enviado para o GitHub!', 'success');
}

console.log('✅ Export arquivos carregado');
