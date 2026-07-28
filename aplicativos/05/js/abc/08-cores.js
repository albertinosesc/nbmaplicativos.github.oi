// ============================================
// FUNÇÕES DE CORES PARA ABC
// ============================================

function aplicarCoresNasNotas() {
    if (!coresAtivas) return;
    document.querySelectorAll("#preview .abcjs-note").forEach(nota => {
        let cabeca = nota.querySelector('ellipse, circle');
        if (!cabeca) cabeca = nota.querySelector('path');
        if (cabeca) {
            let textoNota = nota.textContent || '';
            let match = textoNota.match(/[CDEFGAB]/i);
            if (match) {
                cabeca.style.fill = obterCorPorNota(match[0]);
                cabeca.style.fillOpacity = '1';
            }
        }
    });
}

function aplicarCoresAcordesLetras() {
    document.querySelectorAll("#preview .abcjs-chord, #preview .abcjs-lyric").forEach(el => {
        let texto = el.textContent || '';
        let cor = getCorPorTag(texto);
        if (cor !== "#000000") el.style.fill = cor;
        el.textContent = texto.replace(/\[(.*?)\]/g, "");
    });
}

console.log('✅ Cores carregadas');
