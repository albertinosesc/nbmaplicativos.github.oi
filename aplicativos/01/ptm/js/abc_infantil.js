// ============================================
// FUNÇÕES DE CORES PARA PARTITURAS INFANTIS
// ============================================

const CORES_POR_NOTA = {
    'C': '#FF0000', 'D': '#FF6600', 'E': '#FFDD00',
    'F': '#00CC00', 'G': '#0066FF', 'A': '#4B0082', 'B': '#8B00FF'
};

const CORES_POR_TAG = {
    '[r]': '#FF0000', '[o]': '#FF6600', '[y]': '#FFDD00',
    '[g]': '#00CC00', '[b]': '#0066FF', '[i]': '#4B0082', '[v]': '#8B00FF'
};

function getCorPorNota(nota) {
    return CORES_POR_NOTA[nota.charAt(0).toUpperCase()] || '#000000';
}

function ajustarIntensidade(cor, intensidade) {
    if (cor === '#000000') return cor;
    let r = parseInt(cor.slice(1, 3), 16);
    let g = parseInt(cor.slice(3, 5), 16);
    let b = parseInt(cor.slice(5, 7), 16);
    return `rgb(${Math.floor(r * intensidade)}, ${Math.floor(g * intensidade)}, ${Math.floor(b * intensidade)})`;
}

function aplicarCoresNasNotas() {
    if (typeof coresAtivas === 'undefined' || !coresAtivas) return;
    
    setTimeout(() => {
        let intensidade = parseFloat(document.getElementById("intensidadeRange")?.value || 0.8);
        
        document.querySelectorAll("#preview .abcjs-note").forEach(nota => {
            let cabecaNota = nota.querySelector('ellipse, circle');
            if (!cabecaNota) cabecaNota = nota.querySelector('path');
            
            if (cabecaNota) {
                let textoNota = nota.textContent || '';
                let match = textoNota.match(/[CDEFGAB]/i);
                if (match) {
                    let corBase = getCorPorNota(match[0]);
                    let corFinal = ajustarIntensidade(corBase, intensidade);
                    cabecaNota.style.fill = corFinal;
                }
            }
        });
    }, 200);
}

function aplicarCoresAcordesLetras() {
    if (typeof coresAtivas === 'undefined' || !coresAtivas) return;
    
    setTimeout(() => {
        document.querySelectorAll("#preview .abcjs-chord, #preview .abcjs-lyric").forEach(el => {
            let texto = el.textContent;
            if (texto) {
                for (let tag in CORES_POR_TAG) {
                    if (texto.includes(tag)) {
                        el.style.fill = CORES_POR_TAG[tag];
                        el.textContent = texto.replace(/\[(.*?)\]/g, "");
                        break;
                    }
                }
            }
        });
    }, 200);
}
