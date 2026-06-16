// ============================================
// escalas.js - Escalas e Arpejos (Estável)
// ============================================

(function() {
    const AFINACAO = [4, 9, 2, 7, 11, 4]; // EADGBE em semitons relativos a C
    const NOTAS_MAP = { C:0, 'C#':1, Db:1, D:2, 'D#':3, Eb:3, E:4, F:5, 'F#':6, Gb:6, G:7, 'G#':8, Ab:8, A:9, 'A#':10, Bb:10, B:11 };
    const NOTAS_ARRAY = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

    const ESCALAS = {
        maior: [0,2,4,5,7,9,11],
        menor: [0,2,3,5,7,8,10],
        pentatonica: [0,2,4,7,9],
        blues: [0,3,5,6,7,10]
    };
    const ARPEJOS = {
        maior: [0,4,7],
        menor: [0,3,7],
        '7': [0,4,7,10]
    };

    const COR_FUNCAO = { 1: '#e94560', 3: '#3a86ff', 5: '#2ecc71', 7: '#f39c12' };

    function getFuncao(intervalo) {
        return {0:1,4:3,3:3,7:5,10:7}[intervalo] || 'outros';
    }

    function gerarPosicoes(tonicaSem, intervalos, posInicial, cordasRange, maxNotas) {
        let [cordaIni, cordaFim] = (cordasRange || '6-1').split('-').map(Number);
        let idxIni = 6 - Math.min(cordaIni,6);
        let idxFim = 6 - Math.max(cordaFim,1);
        if (idxIni > idxFim) [idxIni, idxFim] = [idxFim, idxIni];
        const notasEscala = intervalos.map(i => (tonicaSem + i) % 12);
        let posicoes = [];
        for (let corda = idxIni; corda <= idxFim; corda++) {
            for (let casa = 0; casa <= 12; casa++) {
                let notaSem = (AFINACAO[corda] + casa) % 12;
                if (notasEscala.includes(notaSem)) {
                    let intervalo = (notaSem - tonicaSem + 12) % 12;
                    posicoes.push({
                        corda, casa, nota: NOTAS_ARRAY[notaSem],
                        funcao: getFuncao(intervalo),
                        distancia: Math.abs(casa - posInicial)
                    });
                }
            }
        }
        posicoes.sort((a,b) => a.distancia - b.distancia);
        if (maxNotas > 0) posicoes = posicoes.slice(0, maxNotas);
        posicoes.sort((a,b) => a.corda - b.corda);
        return posicoes;
    }

    function desenharDiagrama(container, titulo, posicoes, posInicial) {
        if (!container) return;
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display: inline-block; margin: 10px; text-align: center; background: #f9f9f9; border-radius: 10px; padding: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);';
        const canvas = document.createElement('canvas');
        canvas.width = 140; canvas.height = 190;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
        const startX = 28, startY = 45, stringSpacing = 18, fretSpacing = 26, numFrets = 5;
        ctx.strokeStyle = '#333';
        for (let i=0;i<6;i++) { ctx.beginPath(); ctx.moveTo(startX+i*stringSpacing,startY); ctx.lineTo(startX+i*stringSpacing,startY+numFrets*fretSpacing); ctx.stroke(); }
        for (let i=0;i<=numFrets;i++) { ctx.beginPath(); ctx.moveTo(startX,startY+i*fretSpacing); ctx.lineTo(startX+5*stringSpacing,startY+i*fretSpacing); ctx.stroke(); }
        if (posInicial>0) { ctx.font='bold 12px Arial'; ctx.fillStyle='#333'; ctx.fillText(posInicial+'ª', startX-18, startY+fretSpacing/2+2); }
        for (let p of posicoes) {
            let x = startX + p.corda * stringSpacing;
            let casaRel = p.casa - posInicial + 1;
            if (p.casa === 0) {
                ctx.beginPath(); ctx.arc(x, startY-12, 6, 0, 2*Math.PI);
                ctx.fillStyle = COR_FUNCAO[p.funcao] || '#888'; ctx.fill();
                ctx.fillStyle = '#fff'; ctx.font='bold 9px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(p.nota, x, startY-12);
            } else if (casaRel >= 1 && casaRel <= numFrets) {
                let y = startY + (casaRel-1)*fretSpacing + fretSpacing/2;
                ctx.beginPath(); ctx.arc(x, y, 7, 0, 2*Math.PI);
                ctx.fillStyle = COR_FUNCAO[p.funcao] || '#888'; ctx.fill();
                ctx.fillStyle = '#fff'; ctx.font='bold 8px Arial'; ctx.fillText(p.nota, x, y);
            }
        }
        wrapper.appendChild(canvas);
        let tituloDiv = document.createElement('div');
        tituloDiv.textContent = titulo;
        tituloDiv.style.cssText = 'font-size: 14px; font-weight: bold; margin-top: 5px; color: #1a1a2e;';
        wrapper.appendChild(tituloDiv);
        container.appendChild(wrapper);
    }

    function processarComando(comando) {
        let regex = /\[(Escala|Arpejo):([^;]+);([^;]+);pos=(\d+)(?:;cordas=([\d\-]+))?(?:;max=(\d+))?\]/i;
        let m = comando.match(regex);
        if (!m) return null;
        let tipo = m[1].toLowerCase();
        let tonica = m[2];
        let nomeTipo = m[3].toLowerCase();
        let pos = parseInt(m[4]);
        let cordas = m[5] || '6-1';
        let max = m[6] ? parseInt(m[6]) : 0;
        if (!NOTAS_MAP[tonica]) return null;
        let intervalos = tipo === 'escala' ? ESCALAS[nomeTipo] : ARPEJOS[nomeTipo];
        if (!intervalos) return null;
        let posicoes = gerarPosicoes(NOTAS_MAP[tonica], intervalos, pos, cordas, max);
        if (posicoes.length === 0) return null;
        let titulo = `${tonica} ${nomeTipo} (${posicoes.length})`;
        return { titulo, posicoes, posInicial: pos };
    }

    function renderizarNoPreview(container) {
        if (!container) return;
        let elementos = container.querySelectorAll('.escala-placeholder, .arpejo-placeholder');
        elementos.forEach(el => {
            let comando = el.getAttribute('data-comando');
            if (comando) {
                let dados = processarComando(comando);
                if (dados) desenharDiagrama(el, dados.titulo, dados.posicoes, dados.posInicial);
                else el.innerHTML = `<span style="color:red">❌ ${comando}</span>`;
            }
        });
    }

    window.escalasArpejos = {
        renderizar: renderizarNoPreview,
        processarComando: processarComando
    };
})();
