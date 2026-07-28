// ============================================
// BOTÕES DA INTERFACE
// ============================================

function toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('collapsed');
}

function toggleCategoria(menuId) {
    document.getElementById(menuId)?.classList.toggle('collapsed');
}

function toggleCoresNotas() {
    coresAtivas = !coresAtivas;
    const btn = document.getElementById("btnCores");
    if (btn) {
        btn.style.background = coresAtivas ? "#00CC00" : "#CC0000";
        btn.textContent = coresAtivas ? "✅ Cores" : "❌ Cores";
    }
    if (coresAtivas) {
        aplicarCoresNasNotas();
        aplicarCoresAcordesLetras();
    }
}

function toggleFullscreenPreview() {
    const previewElement = document.getElementById('preview');
    const fullscreenBtn = document.getElementById('fullscreenBtn');

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (previewElement.requestFullscreen) {
            previewElement.requestFullscreen();
        } else if (previewElement.webkitRequestFullscreen) {
            previewElement.webkitRequestFullscreen();
        } else if (previewElement.msRequestFullscreen) {
            previewElement.msRequestFullscreen();
        }
        if (fullscreenBtn) {
            fullscreenBtn.textContent = '✖';
            fullscreenBtn.style.background = '#e94560';
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        if (fullscreenBtn) {
            fullscreenBtn.textContent = '⛶';
            fullscreenBtn.style.background = '#00CC00';
        }
    }
}

document.addEventListener('fullscreenchange', function() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (!document.fullscreenElement && fullscreenBtn) {
        fullscreenBtn.textContent = '⛶';
        fullscreenBtn.style.background = '#00CC00';
    }
});
document.addEventListener('webkitfullscreenchange', function() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (!document.webkitFullscreenElement && fullscreenBtn) {
        fullscreenBtn.textContent = '⛶';
        fullscreenBtn.style.background = '#00CC00';
    }
});

function abrirModalPiano() {
    const modal = document.getElementById('modalPiano');
    if (modal) modal.style.display = 'block';
    if (typeof initPiano === 'function') initPiano();
}

function fecharModalPiano() {
    const modal = document.getElementById('modalPiano');
    if (modal) modal.style.display = 'none';
}

function abrirEditorAcordes() {
    const modal = document.getElementById('modalAcordes');
    if (modal) {
        if (typeof carregarBiblioteca === 'function') carregarBiblioteca();
        modal.style.display = 'block';
        const campoPesquisa = document.getElementById('pesquisaAcordes');
        if (campoPesquisa) {
            campoPesquisa.value = '';
            campoPesquisa.focus();
            if (typeof atualizarBibliotecaVisual === 'function') {
                campoPesquisa.oninput = () => atualizarBibliotecaVisual();
            }
        }
    } else {
        alert('Modal do editor de acordes não encontrado!');
    }
}

function fecharEditorAcordes() {
    const modal = document.getElementById('modalAcordes');
    if (modal) modal.style.display = 'none';
}

function resetarAcordes() {
    if (confirm('Redefinir acordes?')) {
        localStorage.removeItem('acordes_personalizados_usuario');
        alert('Acordes resetados!');
    }
}

function exportHTML() { alert("📄 Exportação HTML em desenvolvimento"); }
function exportAppHTML() { alert("📱 Exportação App em desenvolvimento"); }
function gerarPreviewAcordes() { }
function salvarAcordeNaBiblioteca() { }
function copiarCodigoAcordes() { }

console.log('✅ Botões carregados');
