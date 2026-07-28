// ============================================
// DESENHAR ACORDE (DIAGRAMA DE VIOLÃO)
// ============================================

function desenharAcorde(container, sigla, nomeParam = '') {
    let acorde = null;
    let nomeExibido = nomeParam || sigla;

    if (sigla === 'C1') {
        if (typeof ACORDES !== 'undefined' && ACORDES['C1']) {
            acorde = { ...ACORDES['C1'] };
            acorde.posicao = null;
            acorde.mostrarNumero = false;
            nomeExibido = acorde.nome;
        }
    }

    if (!acorde && typeof ACORDES !== 'undefined' && ACORDES[sigla]) {
        acorde = ACORDES[sigla];
        nomeExibido = acorde.nome;
    } else if (!acorde && typeof bibliotecaAcordes !== 'undefined' && bibliotecaAcordes[sigla]) {
        acorde = bibliotecaAcordes[sigla];
        nomeExibido = acorde.nome;
    } else if (!acorde && typeof window.processarAcordeDinamico === 'function') {
        const acordeDinamico = window.processarAcordeDinamico(sigla, nomeExibido);
        if (acordeDinamico) {
            acorde = acordeDinamico;
            nomeExibido = acorde.nome;
        }
    }

    if (!acorde) {
        container.innerHTML = `<div style="color:red; padding:10px;">❌ Acorde "${sigla}" não encontrado</div>`;
        return;
    }

    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative; display:inline-block; text-align:center; margin:20px 10px;';

    const cifraDiv = document.createElement('div');
    cifraDiv.textContent = nomeExibido;
    cifraDiv.style.cssText = 'position:absolute; top:-3px; left:50%; transform:translateX(-50%); font-size:25px; font-weight:bold; color:#e94560; background:white; padding:0px 8px; border-radius:20px; white-space:nowrap;';
    wrapper.appendChild(cifraDiv);

    const canvas = document.createElement('canvas');
    canvas.width = 140;
    canvas.height = 190;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const startX = 28, startY = 45, stringSpacing = 18, fretSpacing = 26;
    const numFrets = 5;

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
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

    const temPestana = acorde.pestana && acorde.pestanaCordas && acorde.pestanaCordas.length > 0;
    const casaBase = acorde.pestanaCasa || acorde.casaInicial || 1;
    const mostrarNumero = acorde.mostrarNumero !== false;
    let cordasNaPestana = [];

    if (temPestana) {
        cordasNaPestana = acorde.pestanaCordas;
        const casaPestana = acorde.pestanaCasa || acorde.casaInicialParaPestana || 1;
        const pestanaY = startY + (casaPestana - 1) * fretSpacing + (fretSpacing / 2);
        const primeiraCorda = Math.min(...cordasNaPestana);
        const ultimaCorda = Math.max(...cordasNaPestana);
        const xInicio = startX + primeiraCorda * stringSpacing - 2;
        const xFim = startX + ultimaCorda * stringSpacing + 2;
        ctx.beginPath();
        ctx.moveTo(xInicio, pestanaY);
        ctx.lineTo(xFim, pestanaY);
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#2c3e50';
        ctx.stroke();
    }

    let numeroMostrar = null;
    let textoMostrar = null;
    if (acorde.mostrarPosicao === true && acorde.posicao) {
        numeroMostrar = acorde.posicao;
        textoMostrar = acorde.textoPosicao || (acorde.posicao + 'ª');
    } else if (mostrarNumero && temPestana) {
        numeroMostrar = acorde.pestanaCasa || acorde.casaInicial || 1;
        textoMostrar = numeroMostrar + 'ª';
    }
    if (numeroMostrar !== null && textoMostrar !== null && acorde.mostrarNumero !== false) {
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#333';
        const yPos = startY + (numeroMostrar - 1) * fretSpacing + fretSpacing / 2 + 2;
        ctx.fillText(textoMostrar, startX - 28, yPos);
    }

    ctx.lineWidth = 1.5;
    acorde.cordas.forEach((casa, i) => {
        const x = startX + i * stringSpacing;
        const casaRelativa = casa - casaBase + 1;
        const estaNaPestana = temPestana && cordasNaPestana.includes(i) && casa === casaBase;

        if (casa === 0) {
            const y = startY - 10;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.strokeStyle = '#333';
            ctx.stroke();
        } else if (casa === -1) {
            const y = startY - 10;
            ctx.strokeStyle = '#e94560';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4);
            ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4);
            ctx.stroke();
            ctx.lineWidth = 1.5;
        } else if (casa > 0 && casaRelativa > 0 && casaRelativa <= numFrets) {
            if (!estaNaPestana) {
                const y = startY + (casaRelativa - 1) * fretSpacing + fretSpacing / 2;
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, 2 * Math.PI);
                ctx.fillStyle = '#1a1a2e';
                ctx.fill();
                const dedo = (acorde.dedos && acorde.dedos[i]) ? acorde.dedos[i] : '';
                if (dedo) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 11px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(dedo, x, y);
                }
            }
        }
    });

    wrapper.appendChild(canvas);

    const idDiv = document.createElement('div');
    if (sigla.includes(';')) {
        const primeiroNumero = sigla.split(';')[0];
        idDiv.textContent = primeiroNumero;
        idDiv.style.cssText = 'text-align: center; width: 100%; margin-top: -18px; font-size: 20px; font-weight: bold; color: #e94560;';
    } else {
        idDiv.textContent = '';
        idDiv.style.display = 'none';
    }
    wrapper.appendChild(idDiv);
    container.appendChild(wrapper);
}
