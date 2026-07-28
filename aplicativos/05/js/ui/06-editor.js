// ============================================
// FUNÇÕES DO EDITOR (COPIAR, COLAR, FORMATAR)
// ============================================

function copiarEditor(event) {
    const editor = document.getElementById('editor');
    if (!editor) {
        toast('❌ Editor não encontrado.', 'error');
        return;
    }
    
    editor.select();
    editor.setSelectionRange(0, editor.value.length);
    
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(editor.value)
                .then(() => {
                    toast('✅ Texto copiado!', 'success');
                    if (event && event.target) {
                        const btn = event.target;
                        const textoOriginal = btn.textContent;
                        btn.textContent = '✅ Copiado!';
                        setTimeout(() => {
                            btn.textContent = textoOriginal;
                        }, 1500);
                    }
                })
                .catch(err => {
                    console.error('Erro ao copiar:', err);
                    document.execCommand('copy');
                    toast('✅ Texto copiado! (método alternativo)', 'success');
                });
        } else {
            const sucesso = document.execCommand('copy');
            if (sucesso) {
                toast('✅ Texto copiado!', 'success');
                if (event && event.target) {
                    const btn = event.target;
                    const textoOriginal = btn.textContent;
                    btn.textContent = '✅ Copiado!';
                    setTimeout(() => {
                        btn.textContent = textoOriginal;
                    }, 1500);
                }
            } else {
                toast('❌ Falha ao copiar.', 'error');
            }
        }
    } catch (err) {
        console.error('Erro ao copiar:', err);
        toast('❌ Erro ao copiar: ' + err.message, 'error');
    }
    
    editor.setSelectionRange(0, 0);
    editor.focus();
}

function colarEditor(event) {
    const editor = document.getElementById('editor');
    if (!editor) {
        toast('❌ Editor não encontrado.', 'error');
        return;
    }
    
    editor.focus();
    
    if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText()
            .then(text => {
                if (text) {
                    const start = editor.selectionStart;
                    const end = editor.selectionEnd;
                    const currentText = editor.value;
                    editor.value = currentText.substring(0, start) + text + currentText.substring(end);
                    
                    if (typeof renderizar === 'function') renderizar();
                    if (typeof salvarAulaAtual === 'function') salvarAulaAtual();
                    
                    toast('✅ Texto colado!', 'success');
                    if (event && event.target) {
                        const btn = event.target;
                        const textoOriginal = btn.textContent;
                        btn.textContent = '✅ Colado!';
                        setTimeout(() => {
                            btn.textContent = textoOriginal;
                        }, 1500);
                    }
                }
            })
            .catch(err => {
                console.log('Clipboard API falhou, usando método alternativo:', err);
                colarComPrompt(editor);
            });
    } else {
        colarComPrompt(editor);
    }
}

function colarComPrompt(editor) {
    const textoColado = prompt('📋 Cole o texto aqui (Ctrl+V):');
    if (textoColado !== null && textoColado !== '') {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const currentText = editor.value;
        editor.value = currentText.substring(0, start) + textoColado + currentText.substring(end);
        
        if (typeof renderizar === 'function') renderizar();
        if (typeof salvarAulaAtual === 'function') salvarAulaAtual();
        
        editor.focus();
        toast('✅ Texto colado via prompt!', 'success');
        
        const btn = document.activeElement;
        if (btn && btn.tagName === 'BUTTON') {
            const textoOriginal = btn.textContent;
            btn.textContent = '✅ Colado!';
            setTimeout(() => {
                btn.textContent = textoOriginal;
            }, 1500);
        }
    }
}

function addFormatacao(antes, depois) {
    const editor = document.getElementById('editor');
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const texto = editor.value;
    const selectedText = texto.substring(start, end);
    let newText = selectedText ? texto.substring(0, start) + antes + selectedText + depois + texto.substring(end) : texto.substring(0, start) + antes + depois + texto.substring(end);
    editor.value = newText;
    editor.setSelectionRange(start + antes.length, start + antes.length);
    renderizar();
    salvarAulaAtual();
    editor.focus();
}

function inserirLink() {
    const url = prompt('Digite uma URL:', 'https://');
    const texto = prompt('Digite o texto do link:', 'Clique aqui');
    if (url && texto) {
        const editor = document.getElementById('editor');
        const start = editor.selectionStart;
        editor.value = editor.value.substring(0, start) + `[${texto}](${url})` + editor.value.substring(start);
        renderizar();
        salvarAulaAtual();
    }
}

function inserirImagem() {
    const url = prompt('Digite a URL da imagem:', 'https://via.placeholder.com/300x200');
    const alt = prompt('Digite o texto alternativo:', 'Imagem');
    if (url && alt) {
        const editor = document.getElementById('editor');
        const start = editor.selectionStart;
        editor.value = editor.value.substring(0, start) + `![${alt}](${url})` + editor.value.substring(start);
        renderizar();
        salvarAulaAtual();
    }
}

console.log('✅ Editor carregado');
