// ============================================
// DICIONÁRIO DINÂMICO DE ACORDES
// ============================================

const FORMAS_INFINITAS = {
    // ===== CORDAS BASE 6 (Mi) =====
    '1': { nome: 'Maior', cordaBase: 6, cordas: [1, 3, 3, 2, 1, 1], dedos: ['1', '3', '4', '2', '1', '1'], pestana: [0,1,2,3,4,5] },
    '2': { nome: 'Menor', cordaBase: 6, cordas: [1, 3, 3, 1, 1, 1], dedos: ['1', '3', '4', '1', '1', '1'], pestana: [0,1,2,3,4,5] },
    '3': { nome: 'Sétima', cordaBase: 6, cordas: [1, 3, 1, 2, 4, 1], dedos: ['1', '3', '1', '2', '4', '1'], pestana: [0,1,2,3,4,5] },
    
    // ===== CORDAS BASE 5 (Lá) =====
    '4': { nome: 'Maior', cordaBase: 5, cordas: [-1, 1, 3, 3, 3, 1], dedos: ['', '1', '3', '4', '2', '1'], pestana: [1,2,3,4,5] },
    '5': { nome: 'Menor', cordaBase: 5, cordas: [-1, 1, 2, 2, 3, 1], dedos: ['', '1', '2', '3', '4', '1'], pestana: [1,2,3,4,5] },
    '6': { nome: 'Sétima', cordaBase: 5, cordas: [-1, 1, 3, 2, 3, 1], dedos: ['', '1', '3', '2', '4', '1'], pestana: [1,2,3,4,5] },
    
    // ===== CORDAS BASE 4 (Ré) =====
    '7': { nome: 'Maior', cordaBase: 4, cordas: [-1, -1, 1, 3, 4, 3], dedos: ['', '', '1', '3', '4', '2'], pestana: [2,3,4,5] },
    '8': { nome: 'Menor', cordaBase: 4, cordas: [-1, -1, 1, 2, 3, 1], dedos: ['', '', '1', '2', '3', '4'], pestana: [2,3,4,5] },
    '9': { nome: 'Sétima', cordaBase: 4, cordas: [-1, -1, 1, 3, 2, 1], dedos: ['', '', '1', '3', '2', '4'], pestana: [2,3,4,5] },
    '10': { nome: '7+', cordaBase: 6, cordas: [1, -1, 2, 2, 1, -1], dedos: ['1', '', '3', '4', '2', ''], pestana: false },
};

// Processa pestana
function processarPestana(pestanaConfig, cordas) {
    let temPestana = false;
    let casa = 1;
    let cordasPestana = [];
    
    if (!pestanaConfig) return { temPestana: false, casa: 1, cordas: [] };
    
    if (typeof pestanaConfig === 'number') {
        temPestana = true;
        casa = pestanaConfig;
        cordas.forEach((cordaCasa, idx) => {
            if (cordaCasa === casa) cordasPestana.push(idx);
        });
    } else if (Array.isArray(pestanaConfig)) {
        temPestana = true;
        const primeiraCorda = pestanaConfig[0];
        if (cordas[primeiraCorda]) casa = cordas[primeiraCorda];
        cordasPestana = pestanaConfig;
    } else if (pestanaConfig === true) {
        temPestana = true;
        casa = 1;
        cordas.forEach((cordaCasa, idx) => {
            if (cordaCasa === casa) cordasPestana.push(idx);
        });
    }
    
    return { temPestana, casa, cordas: cordasPestana };
}

// Função principal USANDO o dicionário FORMAS_INFINITAS
function processarAcordeDinamico(formato, nomePersonalizado = '') {
    // Formato: "forma;casa;posicao;texto" 
    // Exemplo: "2;5;5;5" (forma 2=Menor, casa 5, posição 5, texto 5)
    
    const partes = formato.split(';').map(p => p.trim());
    
    if (partes.length < 2) {
        console.error('Formato inválido. Use: forma;casa');
        return null;
    }
    
    const formaId = partes[0];  // '1', '2', '3', '4', '5', '6', '7', '8', '9'
    const casa = parseInt(partes[1]);  // casa da pestana
    const posicaoMostrada = partes[2] ? parseInt(partes[2]) : null;
    const textoNumero = partes[3] ? parseInt(partes[3]) : null;
    
    // Busca a forma no dicionário
    const formaBase = FORMAS_INFINITAS[formaId];
    if (!formaBase) {
        console.error(`Forma ${formaId} não encontrada no dicionário`);
        return null;
    }
    
    // Calcula as cordas baseado na casa
    const cordas = formaBase.cordas.map(c => {
        if (c === -1) return -1;
        if (c === 0) return 0;
        return c + casa - 1;  // Ajusta pela casa da pestana
    });
    
    // Dedos (mantém os mesmos)
    const dedos = [...formaBase.dedos];
    
    // Processa a pestana
    let pestanaInfo = { temPestana: false, casa: casa, cordas: [] };
    if (formaBase.pestana) {
        pestanaInfo = processarPestana(formaBase.pestana, cordas);
    }
    
    // Nome do acorde
    let nome = nomePersonalizado;
    if (!nome || nome === '') {
        const notas = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const notaIndex = (casa + 2) % 12;
        nome = `${notas[notaIndex]} ${formaBase.nome}`;
    }
    
    const acorde = {
        nome: nome,
        cordas: cordas,
        dedos: dedos,
        pestana: pestanaInfo.temPestana,
        pestanaCasa: pestanaInfo.casa,
        pestanaCordas: pestanaInfo.cordas,
        casaInicial: casa,
        baixo: ''
    };
    
    // Adiciona posição se tiver
    if (posicaoMostrada !== null) {
        acorde.posicao = posicaoMostrada;
        acorde.mostrarPosicao = true;
        acorde.textoPosicao = (textoNumero !== null && !isNaN(textoNumero)) 
            ? textoNumero + 'ª' 
            : posicaoMostrada + 'ª';
    }
    
    return acorde;
}

// Desenha acorde no canvas
function desenharAcorde(container, acorde) {
    if (!container || !acorde) return;
    
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: inline-block; margin: 10px; text-align: center;';
    
    const canvas = document.createElement('canvas');
    canvas.width = 140;
    canvas.height = 190;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const startX = 28, startY = 45, stringSpacing = 18, fretSpacing = 26;
    const numFrets = 5;
    
    // Cordas
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(startX + i * stringSpacing, startY);
        ctx.lineTo(startX + i * stringSpacing, startY + numFrets * fretSpacing);
        ctx.stroke();
    }
    
    // Trastes
    for (let i = 0; i <= numFrets; i++) {
        ctx.beginPath();
        ctx.moveTo(startX, startY + i * fretSpacing);
        ctx.lineTo(startX + 5 * stringSpacing, startY + i * fretSpacing);
        ctx.stroke();
    }
    
    // Casa inicial
    if (acorde.casaInicial > 1) {
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText(acorde.casaInicial + 'ª', startX - 18, startY + fretSpacing / 2 + 2);
    }
    
    // Texto da posição
    if (acorde.textoPosicao && acorde.posicao) {
        const posY = startY + (acorde.posicao - 1) * fretSpacing + fretSpacing / 2;
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#e94560';
        ctx.fillText(acorde.textoPosicao, startX - 20, posY + 5);
    }
    
    // Pestana
    if (acorde.pestana && acorde.pestanaCordas && acorde.pestanaCordas.length > 0) {
        const pestanaY = startY + 12;
        const primeiraCorda = Math.min(...acorde.pestanaCordas);
        const ultimaCorda = Math.max(...acorde.pestanaCordas);
        
        ctx.beginPath();
        ctx.moveTo(startX + primeiraCorda * stringSpacing - 3, pestanaY);
        ctx.lineTo(startX + ultimaCorda * stringSpacing + 3, pestanaY);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#2c3e50';
        ctx.stroke();
        ctx.lineWidth = 1.5;
    }
    
    // Notas
    const pestanaCasa = acorde.pestanaCasa || acorde.casaInicial;
    acorde.cordas.forEach((casa, i) => {
        const x = startX + i * stringSpacing;
        const casaRelativa = casa - pestanaCasa + 1;
        const isPestanaCorda = acorde.pestanaCordas && acorde.pestanaCordas.includes(i);
        
        if (casa === 0) {
            const y = startY - 12;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.strokeStyle = '#333';
            ctx.stroke();
        } else if (casa === -1) {
            const y = startY - 12;
            ctx.beginPath();
            ctx.moveTo(x - 5, y - 5);
            ctx.lineTo(x + 5, y + 5);
            ctx.moveTo(x + 5, y - 5);
            ctx.lineTo(x - 5, y + 5);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#e94560';
            ctx.stroke();
        } else if (casa > 0 && casaRelativa > 0 && casaRelativa <= numFrets && !isPestanaCorda) {
            const y = startY + (casaRelativa - 1) * fretSpacing + fretSpacing / 2;
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = '#1a1a2e';
            ctx.fill();
            
            const dedo = acorde.dedos && acorde.dedos[i] ? acorde.dedos[i] : '';
            if (dedo) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 11px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(dedo, x, y);
            }
        }
    });
    
    wrapper.appendChild(canvas);
    
    const nomeSpan = document.createElement('div');
    nomeSpan.textContent = acorde.nome;
    nomeSpan.style.cssText = 'font-size: 12px; margin-top: 8px; color: #333; font-weight: bold;';
    wrapper.appendChild(nomeSpan);
    
    container.appendChild(wrapper);
}

// PARSER
function renderizarAcordes() {
    const body = document.body;
    if (!body) return;
    
    let html = body.innerHTML;
    const regex = /\[Acorde:([^\]]+)\]([^\[]*)\[\/Acorde\]/g;
    let match;
    let newHtml = html;
    let containers = [];
    
    while ((match = regex.exec(html)) !== null) {
        const formato = match[1];
        const nomeAcorde = match[2];
        const acorde = processarAcordeDinamico(formato, nomeAcorde);
        
        if (acorde) {
            const id = 'acorde-' + Date.now() + '-' + containers.length;
            const placeholder = `<div id="${id}" class="acorde-placeholder" style="display: inline-block;"></div>`;
            newHtml = newHtml.replace(match[0], placeholder);
            containers.push({ id, acorde });
        }
    }
    
    if (newHtml !== html) {
        body.innerHTML = newHtml;
        containers.forEach(container => {
            const elemento = document.getElementById(container.id);
            if (elemento) desenharAcorde(elemento, container.acorde);
        });
    }
}

// Inicializa
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderizarAcordes);
    } else {
        renderizarAcordes();
    }
}

window.processarAcordeDinamico = processarAcordeDinamico;
window.desenharAcorde = desenharAcorde;
window.renderizarAcordes = renderizarAcordes;
window.FORMAS_INFINITAS = FORMAS_INFINITAS;

console.log('✅ Sistema com dicionário carregado!');
