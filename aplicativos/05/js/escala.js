// ============================================
// escalas_arpejos.js - Sistema de Escalas e Arpejos
// ============================================

(function() {
    // Afinação padrão do violão (semitons relativos a C)
    // Cordas: 6(E)=4, 5(A)=9, 4(D)=2, 3(G)=7, 2(B)=11, 1(E)=4
    const AFINACAO = [4, 9, 2, 7, 11, 4];
    
    const NOTAS_MAP = {
        'C':0, 'C#':1, 'Db':1, 'D':2, 'D#':3, 'Eb':3, 'E':4,
        'F':5, 'F#':6, 'Gb':6, 'G':7, 'G#':8, 'Ab':8, 'A':9,
        'A#':10, 'Bb':10, 'B':11
    };
    const NOTAS_ARRAY = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    
    const ESCALAS = {
        'maior': [0,2,4,5,7,9,11],
        'menor': [0,2,3,5,7,8,10],
        'menor-harmonica': [0,2,3,5,7,8,11],
        'menor-melodica': [0,2,3,5,7,9,11],
        'pentatonica': [0,2,4,7,9],
        'blues': [0,3,5,6,7,10],
        'jonio': [0,2,4,5,7,9,11],
        'dorico': [0,2,3,5,7,9,10],
        'frigio': [0,1,3,5,7,8,10],
        'lidio': [0,2,4,6,7,9,11],
        'mixolidio': [0,2,4,5,7,9,10],
        'eolio': [0,2,3,5,7,8,10],
        'locrio': [0,1,3,5,6,8,10]
    };
    
    const ARPEJOS = {
        'maior': [0,4,7],
        'menor': [0,3,7],
        'aumentado': [0,4,8],
        'diminuto': [0,3,6],
        '7': [0,4,7,10],
        'm7': [0,3,7,10],
        '7M': [0,4,7,11],
        'm7M': [0,3,7,11],
        '7+': [0,4,8,10],
        'm7b5': [0,3,6,10]
    };
    
    const FUNCAO_COR = {
        1: '#e94560',  // tônica
        3: '#3a86ff',  // terça
        5: '#2ecc71',  // quinta
        7: '#f39c12',  // sétima
        'outros': '#888888'
    };
    
    function getFuncao(intervalo) {
        const mapa = {0:1, 2:2, 4:3, 5:4, 7:5, 9:6, 11:7, 1:9, 3:10, 6:11, 8:12, 10:13};
        return mapa[intervalo] || 'outros';
    }
    
    function notaParaSemitom(nota) { return NOTAS_MAP[nota]; }
    function semitomParaNota(semitom) { return NOTAS_ARRAY[semitom % 12]; }
    
    function gerarPosicoes(tonicaSem, intervalos, posInicial = 0, cordasRange = "6-1", maxNotas = 0) {
        let [cordaIni, cordaFim] = cordasRange.split('-').map(Number);
        if (isNaN(cordaIni)) cordaIni = 6;
        if (isNaN(cordaFim)) cordaFim = 1;
        let idxIni = 6 - cordaIni;
        let idxFim = 6 - cordaFim;
        if (idxIni < 0) idxIni = 0;
        if (idxFim > 5) idxFim = 5;
        if (idxIni > idxFim) { let temp = idxIni; idxIni = idxFim; idxFim = temp; }
        
        const notasEscala = intervalos.map(intervalo => (tonicaSem + intervalo) % 12);
        let posicoes = [];
        for (let corda = idxIni; corda <= idxFim; corda++) {
            const trasteBase = AFINACAO[corda];
            for (let casa = 0; casa <= 12; casa++) {
                const notaSem = (trasteBase + casa) % 12;
                if (notasEscala.includes(notaSem)) {
                    const intervalo = (notaSem - tonicaSem + 12) % 12;
                    const funcao = getFuncao(intervalo);
                    posicoes.push({
                        corda: corda, casa: casa, nota: semitomParaNota(notaSem),
                        funcao: funcao, intervalo: intervalo, distancia: Math.abs(casa - posInicial)
                    });
                }
            }
        }
        posicoes.sort((a,b) => a.distancia - b.distancia);
        if (maxNotas > 0 && posicoes.length > maxNotas) posicoes = posicoes.slice(0, maxNotas);
        posicoes.sort((a,b) => a.corda - b.corda);
        return posicoes;
    }
    
    function desenharDiagramaEscala(container, titulo, posicoes, posInicial = 0) {
        if (!container) return;
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'violao-wrapper';
        wrapper.style.cssText = 'display: inline-block; margin: 10px; text-align: center;';
        
        const canvas = document.createElement('canvas');
        canvas.width = 140;
        canvas.height = 190;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const startX = 28, startY = 45, stringSpacing = 18, fretSpacing = 26, numFrets = 5;
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(startX + i * stringSpacing, startY);
            ctx.lineTo(startX + i * stringSpacing, startY + numFrets * fretSpacing);
            ctx.stroke();
        }
        for (let i = 0; i <= numFrets; i++) {
            ctx.beginPath();
            ctx.moveTo(startX, startY + i * fretSpacing);
            ctx.lineTo(startX + 5 * stringSpacing, startY + i * fretSpacing);
            ctx.stroke();
        }
        if (posInicial > 0) {
            ctx.font = 'bold 12px Arial';
            ctx.fillStyle = '#333';
            ctx.fillText(posInicial + 'ª', startX - 18, startY + fretSpacing / 2 + 2);
        }
        for (const p of posicoes) {
            const x = startX + p.corda * stringSpacing;
            let casaRelativa = p.casa - posInicial + 1;
            if (p.casa === 0) {
                const y = startY - 12;
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, 2 * Math.PI);
                ctx.fillStyle = FUNCAO_COR[p.funcao] || FUNCAO_COR.outros;
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 9px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(p.nota, x, y);
            } else if (casaRelativa >= 1 && casaRelativa <= numFrets) {
                const y = startY + (casaRelativa - 1) * fretSpacing + fretSpacing / 2;
                ctx.beginPath();
                ctx.arc(x, y, 7, 0, 2 * Math.PI);
                ctx.fillStyle = FUNCAO_COR[p.funcao] || FUNCAO_COR.outros;
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 8px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(p.nota, x, y);
            }
        }
        wrapper.appendChild(canvas);
        const tituloSpan = document.createElement('div');
        tituloSpan.textContent = titulo;
        tituloSpan.style.cssText = 'font-size: 14px; margin-top: 8px; color: #1a1a2e; font-weight: bold;';
        wrapper.appendChild(tituloSpan);
        container.appendChild(wrapper);
    }
    
    function processarComando(fullMatch) {
        const regexEscala = /\[Escala:([^;]+);([^;]+);pos=(\d+)(?:;cordas=([\d\-]+))?(?:;max=(\d+))?\]/i;
        const regexArpejo = /\[Arpejo:([^;]+);([^;]+);pos=(\d+)(?:;cordas=([\d\-]+))?(?:;max=(\d+))?\]/i;
        let match, tipoComando, tonica, tipo, pos, cordas, max;
        if ((match = regexEscala.exec(fullMatch))) {
            tipoComando = 'escala';
            tonica = match[1];
            tipo = match[2];
            pos = parseInt(match[3]);
            cordas = match[4] || '6-1';
            max = match[5] ? parseInt(match[5]) : 0;
        } else if ((match = regexArpejo.exec(fullMatch))) {
            tipoComando = 'arpejo';
            tonica = match[1];
            tipo = match[2];
            pos = parseInt(match[3]);
            cordas = match[4] || '6-1';
            max = match[5] ? parseInt(match[5]) : 0;
        } else {
            return null;
        }
        if (!NOTAS_MAP[tonica]) return null;
        const tonicaSem = NOTAS_MAP[tonica];
        let intervalos = tipoComando === 'escala' ? ESCALAS[tipo.toLowerCase()] : ARPEJOS[tipo.toLowerCase()];
        if (!intervalos) return null;
        const posicoes = gerarPosicoes(tonicaSem, intervalos, pos, cordas, max);
        if (posicoes.length === 0) return null;
        const titulo = `${tonica} ${tipo} (${posicoes.length} notas)`;
        return { titulo, posicoes, posInicial: pos };
    }
    
    // Função principal de renderização usando placeholders
    function renderizarEscalasArpejos(container) {
        if (!container) container = document.body;
        const placeholders = [];
        const html = container.innerHTML;
        // Substitui comandos por placeholders e guarda os dados
        let novoHtml = html.replace(/\[Escala:[^\]]+\]/gi, (match) => {
            const id = 'escala-' + Date.now() + '-' + placeholders.length;
            placeholders.push({ id, comando: match });
            return `<div id="${id}" class="escala-placeholder" style="display:inline-block;"></div>`;
        }).replace(/\[Arpejo:[^\]]+\]/gi, (match) => {
            const id = 'arpejo-' + Date.now() + '-' + placeholders.length;
            placeholders.push({ id, comando: match });
            return `<div id="${id}" class="escala-placeholder" style="display:inline-block;"></div>`;
        });
        if (novoHtml !== html) container.innerHTML = novoHtml;
        placeholders.forEach(p => {
            const el = document.getElementById(p.id);
            if (el) {
                const dados = processarComando(p.comando);
                if (dados) desenharDiagramaEscala(el, dados.titulo, dados.posicoes, dados.posInicial);
                else el.innerHTML = `<span style="color:red">❌ ${p.comando}</span>`;
            }
        });
    }
    
    window.escalasArpejos = {
        renderizar: renderizarEscalasArpejos,
        processarComando: processarComando,
        gerarPosicoes: gerarPosicoes,
        desenharDiagramaEscala: desenharDiagramaEscala
    };
})();
