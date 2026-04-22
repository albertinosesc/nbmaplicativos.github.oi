// ============================================
// RENDERIZAÇÃO PRINCIPAL
// ============================================
function renderizar() {
    console.log("Renderizando...");
    let conteudo = editor.value || '';
    
    try {
        let processado = conteudo;
        const acordes = [];
        const pianos = [];
        const abcInfantis = [];
        const abcNormais = [];
        const pianosCustom = [];
        
        // ============================================
        // PROCESSAR ACORDES DE VIOLÃO
        // ============================================
        processado = processado.replace(/\[Acorde:([^\]]+)\]([\s\S]*?)\[\/Acorde\]/g, (match, sigla, nome) => {
            const id = 'chord-' + Date.now() + '-' + acordes.length;
            acordes.push({ id, sigla: sigla.trim(), nome: nome ? nome.trim() : '' });
            return `<div id="${id}" class="chord-diagram"></div>`;
        });
        
        // ============================================
        // PROCESSAR ACORDES DE PIANO
        // ============================================
        processado = processado.replace(/\[PIANO:([^\]]+)\]([\s\S]*?)\[\/PIANO\]/g, (match, sigla, nome) => {
            const id = 'piano-' + Date.now() + '-' + pianos.length;
            pianos.push({ id, sigla: sigla.trim(), nome: nome.trim() });
            return `<div id="${id}" class="piano-diagram-container"></div>`;
        });
        
        // ============================================
        // PROCESSAR ABC INFANTIL
        // ============================================
        processado = processado.replace(/\[ABC-INFANTIL\]([\s\S]*?)\[\/ABC-INFANTIL\]/g, (match, code) => {
            const id = 'abc-inf-' + Date.now() + '-' + abcInfantis.length;
            abcInfantis.push({ id, code: code.trim() });
            return `<div id="${id}" class="abc-container"></div>`;
        });
        
        // ============================================
        // PROCESSAR ABC NORMAL
        // ============================================
        processado = processado.replace(/\[ABC\]([\s\S]*?)\[\/ABC\]/g, (match, code) => {
            const id = 'abc-' + Date.now() + '-' + abcNormais.length;
            abcNormais.push({ id, code: code.trim() });
            return `<div id="${id}" class="abc-container"></div>`;
        });
        
        // ============================================
        // RENDERIZAR MARKDOWN
        // ============================================
        preview.innerHTML = marked.parse(processado);
        
        // ============================================
        // RENDERIZAR ACORDES DE VIOLÃO
        // ============================================
        acordes.forEach(a => {
            const el = document.getElementById(a.id);
            if (el) {
                desenharAcorde(el, a.sigla, a.nome);
            }
        });
        
        // ============================================
        // RENDERIZAR ACORDES DE PIANO
        // ============================================
        pianos.forEach(p => {
            const el = document.getElementById(p.id);
            if (el) {
                // Placeholder para piano - será implementado depois
                el.innerHTML = `<div style="color:#e94560; padding:10px;">🎹 Acorde: ${p.nome} (${p.sigla})</div>`;
            }
        });
        
        // ============================================
        // RENDERIZAR ABC
        // ============================================
        abcNormais.forEach(a => {
            const el = document.getElementById(a.id);
            if (el && typeof ABCJS !== 'undefined') {
                try {
                    ABCJS.renderAbc(a.id, a.code, { scale: 1.0, staffwidth: 500 });
                } catch(e) {
                    el.innerHTML = `<p style="color:red">Erro: ${e.message}</p>`;
                }
            }
        });
        
        abcInfantis.forEach(a => {
            const el = document.getElementById(a.id);
            if (el && typeof ABCJS !== 'undefined') {
                try {
                    ABCJS.renderAbc(a.id, a.code, { add_classes: true, scale: 1.0, staffwidth: 500 });
                } catch(e) {
                    el.innerHTML = `<p style="color:red">Erro: ${e.message}</p>`;
                }
            }
        });
        
    } catch (e) {
        console.error("Erro na renderização:", e);
        preview.innerHTML = '<p style="color:red;">❌ Erro ao renderizar: ' + e.message + '</p>';
    }
}
