// ============================================
// EXPORTAR APP (Todas as Aulas) - VERSÃO CORRIGIDA
// ============================================
function exportAppHTML() {
    const aulasExport = aulas;
    const acordesStr = JSON.stringify(ACORDES);
    const acordesPianoStr = JSON.stringify(ACORDES_PIANO);
    const coresStatus = coresAtivas;
    
    let aulasHtml = '';
    let indice = '<ul style="list-style:none;padding:0;">';
    
    for (let i = 0; i < aulasExport.length; i++) {
        const aula = aulasExport[i];
        indice += '<li style="margin:10px 0;"><a href="#aula-' + i + '" style="color:#1a1a2e;text-decoration:none;">' + (i + 1) + '. ' + aula.titulo + '</a></li>';
        
        aulasHtml += `
            <div id="aula-${i}" style="background:white;padding:30px;margin:20px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
                <h1 style="color:#1a1a2e;margin-top:0;">${aula.titulo}</h1>
                <div class="aula-conteudo" data-conteudo="${encodeURIComponent(aula.conteudo)}"></div>
                <div style="text-align:center;margin-top:30px">
                    <a href="#" onclick="window.scrollTo({top:0,behavior:'smooth'});return false" style="background:#e94560;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block">📚 Voltar ao Índice</a>
                </div>
            </div>
        `;
    }
    indice += '</ul>';
    
    const appHtml = `<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pro Maestro - App</title>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/abcjs@6.2.3/dist/abcjs-basic-min.js"><\/script>
<style>
    * { box-sizing: border-box; }
    body { 
        font-family: 'Segoe UI', sans-serif; 
        max-width: 1200px; margin: 0 auto; 
        background: #f5f5f5; 
    }
    .indice { background: white; padding: 30px; margin: 20px; border-radius: 10px; }
    .indice ul { list-style: none; padding: 0; }
    .indice li { margin: 10px 0; }
    .indice a { color: #1a1a2e; text-decoration: none; }
    .indice a:hover { color: #e94560; }
    
    /* Estilos para acordes de violão */
    .chord-diagram { display: inline-block; margin: 10px auto; text-align: center; }
    .violao-wrapper { display: inline-block; text-align: center; margin: 10px; }
    .violao-titulo { font-size: 1.6em; font-weight: bold; color: #e94560; margin-bottom: 5px; text-align: center; }
    
    /* Estilos para piano */
    .piano-diagram-container { margin: 15px 0; text-align: center; }
    .wrapper-piano { display: inline-block; margin: 10px auto; text-align: center; background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .titulo-acorde { font-size: 1.6em; font-weight: bold; color: #e94560; margin-bottom: 10px; text-align: center; }
    .piano-teclado { display: flex; position: relative; background: #131212; padding: 3px; border-radius: 4px; box-shadow: inset 0 0 10px rgba(0,0,0,0.5), 0 5px 15px rgba(0,0,0,0.3); }
    .tecla-branca { width: 37px; height: 120px; background: linear-gradient(to bottom, #ffffff 0%, #f0f0f0 100%); border: 1px solid #333; border-radius: 0 0 8px 8px; position: relative; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 1; cursor: default; }
    .tecla-branca.ativa { background: linear-gradient(to bottom, #3a86ff 0%, #2666cc 100%); }
    .tecla-preta { width: 25px; height: 79px; background: linear-gradient(to bottom, #222 0%, #111 100%); position: absolute; top: 0; border-radius: 0 0 5px 5px; box-shadow: 0 3px 8px rgba(0,0,0,0.4); z-index: 2; cursor: default; }
    .tecla-preta.ativa { background: linear-gradient(to bottom, #ff4757 0%, #cc2233 100%); }
    .dedo-circulo { position: absolute; top: 80%; left: 50%; transform: translate(-50%, -50%); width: 23px; height: 25px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: bold; font-family: Arial; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 10; color: #3a86ff; }
    
    /* Cores para partitura infantil */
    .abc-container { margin: 25px 0; padding: 15px; background: #fff; border: 1px solid #eee; border-radius: 8px; overflow-x: auto; }
    .abcjs-chord, .abcjs-lyric { transition: fill 0.3s; }
    .abcjs-note circle, .abcjs-note ellipse { transition: fill 0.3s; }
</style>
</head>
<body>
<div class="indice"><h1>📚 Índice</h1>${indice}</div>
${aulasHtml}

<script>
const ACORDES = ${acordesStr};
const ACORDES_PIANO = ${acordesPianoStr};
const coresAtivas = ${coresStatus};

// ============================================
// FUNÇÕES PARA CORES
// ============================================
function getCorPorTag(texto) {
    if (!texto) return "#000000";
    if (texto.includes("[r]")) return "#FF0000";
    if (texto.includes("[o]")) return "#FF6600";
    if (texto.includes("[y]")) return "#FFDD00";
    if (texto.includes("[g]")) return "#00CC00";
    if (texto.includes("[b]")) return "#0066FF";
    if (texto.includes("[i]")) return "#4B0082";
    if (texto.includes("[v]")) return "#8B00FF";
    return "#000000";
}

function getCorPorNota(nota) {
    const cores = { 'C':'#FF0000','D':'#FF6600','E':'#FFDD00',
                    'F':'#00CC00','G':'#0066FF','A':'#4B0082','B':'#8B00FF' };
    return cores[nota.toUpperCase()] || '#000000';
}

function aplicarCoresABC() {
    document.querySelectorAll(".abcjs-chord").forEach(el => {
        let texto = el.textContent || "";
        let cor = getCorPorTag(texto);
        if (cor !== "#000000") el.style.fill = cor;
        el.textContent = texto.replace(/\\[(.*?)\\]/g, "");
    });
    
    document.querySelectorAll(".abcjs-lyric").forEach(el => {
        let texto = el.textContent || "";
        let cor = getCorPorTag(texto);
        if (cor !== "#000000") el.style.fill = cor;
        el.textContent = texto.replace(/\\[(.*?)\\]/g, "");
    });
    
    document.querySelectorAll(".abcjs-note").forEach(nota => {
        let cabeca = nota.querySelector('ellipse, circle, path');
        if (cabeca) {
            let textoNota = nota.textContent || '';
            let match = textoNota.match(/[CDEFGAB]/i);
            if (match) {
                cabeca.style.fill = getCorPorNota(match[0]);
                cabeca.style.fillOpacity = '1';
            }
        }
    });
}

// ============================================
// DESENHAR ACORDE DE VIOLÃO
// ============================================
function desenharAcordeViolao(container, sigla) {
    const acorde = ACORDES[sigla];
    if (!acorde) { container.innerHTML = '<div style="color:red">Acorde não encontrado</div>'; return; }
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'violao-wrapper';
    const titulo = document.createElement('div');
    titulo.className = 'violao-titulo';
    titulo.textContent = acorde.nome;
    wrapper.appendChild(titulo);
    const canvas = document.createElement('canvas');
    canvas.width = 130; canvas.height = 180;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,130,180);
    const sx=25, sy=42, ss=18, sf=26;
    for(let i=0;i<6;i++){ ctx.beginPath(); ctx.moveTo(sx+i*ss,sy); ctx.lineTo(sx+i*ss,sy+5*sf); ctx.stroke(); }
    for(let i=0;i<=5;i++){ ctx.beginPath(); ctx.moveTo(sx,sy+i*sf); ctx.lineTo(sx+5*ss,sy+i*sf); ctx.stroke(); }
    if(acorde.casaInicial>1){ ctx.font='bold 12px Arial'; ctx.fillStyle='#333'; ctx.fillText(acorde.casaInicial+'ª',sx-18,sy+sf/2+2); }
    if(acorde.pestana && Array.isArray(acorde.pestana)){
        let inicio=acorde.pestana[0], fim=inicio;
        for(let i=1;i<=acorde.pestana.length;i++){
            if(i<acorde.pestana.length && acorde.pestana[i]===acorde.pestana[i-1]+1){ fim=acorde.pestana[i]; }
            else{
                const xi=sx+inicio*ss, xf=sx+fim*ss;
                ctx.beginPath(); ctx.moveTo(xi-3,sy+12); ctx.lineTo(xf+3,sy+12);
                ctx.lineWidth=8; ctx.strokeStyle='#000'; ctx.stroke();
                if(i<acorde.pestana.length){ inicio=acorde.pestana[i]; fim=inicio; }
            }
        }
    }
    acorde.cordas.forEach((casa, i) => {
        const x = sx + i * ss;
        if(casa === 0) {
            const y = sy - 12;
            ctx.beginPath(); ctx.arc(x, y, 7, 0, 2*Math.PI);
            ctx.strokeStyle = '#333'; ctx.stroke();
        } else if(casa === -1) {
            const y = sy - 12;
            ctx.beginPath(); ctx.moveTo(x-5,y-5); ctx.lineTo(x+5,y+5);
            ctx.moveTo(x+5,y-5); ctx.lineTo(x-5,y+5); ctx.stroke();
        } else if(casa > 0 && casa <= 5) {
            const y = sy + (casa-1)*sf + sf/2;
            ctx.beginPath(); ctx.arc(x, y, 8, 0, 2*Math.PI);
            ctx.fillStyle = '#000'; ctx.fill();
            if(acorde.dedos && acorde.dedos[i]){
                ctx.fillStyle = '#fff'; ctx.font='bold 11px Arial';
                ctx.textAlign='center'; ctx.textBaseline='middle';
                ctx.fillText(acorde.dedos[i], x, y);
            }
        }
    });
    wrapper.appendChild(canvas);
    container.appendChild(wrapper);
}

// ============================================
// DESENHAR TECLADO DO PIANO
// ============================================
function desenharTecladoPianoExport(container, sigla, nome, notasAcorde, startOitava, endOitava, dedosTreble) {
    container.innerHTML = '';
    
    const wrapper = document.createElement('div'); 
    wrapper.className = 'wrapper-piano';
    wrapper.style.cssText = 'display: inline-block; margin: 10px auto; text-align: center; background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);';
    
    const title = document.createElement('div'); 
    title.className = 'titulo-acorde'; 
    title.style.cssText = 'font-size: 1.6em; font-weight: bold; color: #e94560; margin-bottom: 10px; text-align: center;';
    title.textContent = nome;
    wrapper.appendChild(title);
    
    const pianoDiv = document.createElement('div'); 
    pianoDiv.className = 'piano-teclado';
    pianoDiv.style.cssText = 'display: flex; position: relative; background: #131212; padding: 3px; border-radius: 4px; box-shadow: inset 0 0 10px rgba(0,0,0,0.5), 0 5px 15px rgba(0,0,0,0.3);';
    
    const escala = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const startMatch = startOitava.match(/^([A-G])(\\d+)$/);
    const endMatch = endOitava.match(/^([A-G])(\\d+)$/);
    
    if(!startMatch || !endMatch) {
        container.innerHTML = '<div style="color:red">Erro no range de oitavas</div>';
        return;
    }
    
    const pretasMap = { 
        'C#3':0,'D#3':1,'F#3':3,'G#3':4,'A#3':5,
        'C#4':7,'D#4':8,'F#4':10,'G#4':11,'A#4':12,
        'C#5':14,'D#5':15,'F#5':17,'G#5':18,'A#5':19 
    };
    
    const whiteKeyWidth = 37;
    const blackKeyOffset = 34;
    
    const teclas = [];
    for(let oct = parseInt(startMatch[2]); oct <= parseInt(endMatch[2]); oct++){
        for(let i = 0; i < escala.length; i++){
            const nota = escala[i];
            const num = (oct + 1) * 12 + i;
            if(num >= (parseInt(startMatch[2]) + 1) * 12 + escala.indexOf(startMatch[1]) && 
               num <= (parseInt(endMatch[2]) + 1) * 12 + escala.indexOf(endMatch[1])){
                teclas.push({ nota, oitava: oct });
            }
        }
    }
    
    const whiteKeys = teclas.filter(t => !t.nota.includes('#'));
    const blackKeys = [];
    teclas.forEach(t => {
        if(t.nota.includes('#')){
            const pos = pretasMap[t.nota + t.oitava];
            if(pos !== undefined) blackKeys.push({...t, pos});
        }
    });
    
    function getDedo(notaNome, oitava) {
        const notaCompleta = notaNome + oitava;
        if(!notasAcorde) return null;
        for(let i = 0; i < notasAcorde.length; i++) {
            if(notasAcorde[i] === notaCompleta || notasAcorde[i] === notaNome) {
                if(dedosTreble && dedosTreble[i]) return dedosTreble[i];
                return null;
            }
        }
        return null;
    }
    
    // Teclas brancas
    whiteKeys.forEach(t => {
        const dedo = getDedo(t.nota, t.oitava);
        const isActive = dedo !== null;
        
        const key = document.createElement('div');
        key.style.cssText = \`
            width: \${whiteKeyWidth}px;
            height: 120px;
            background: \${isActive ? 'linear-gradient(to bottom, #3a86ff 0%, #2666cc 100%)' : 'linear-gradient(to bottom, #ffffff 0%, #f0f0f0 100%)'};
            border: 1px solid #333;
            border-radius: 0 0 8px 8px;
            position: relative;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 1;
            cursor: default;
        \`;
        
        if(isActive && dedo) {
            const dedoDiv = document.createElement('div');
            dedoDiv.textContent = dedo;
            dedoDiv.style.cssText = \`
                position: absolute;
                top: 80%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 23px;
                height: 25px;
                background: white;
                color: #3a86ff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 15px;
                font-weight: bold;
                font-family: Arial;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                z-index: 10;
            \`;
            key.appendChild(dedoDiv);
        }
        pianoDiv.appendChild(key);
    });
    
    // Teclas pretas
    blackKeys.forEach(t => {
        const dedo = getDedo(t.nota, t.oitava);
        const isActive = dedo !== null;
        
        const key = document.createElement('div');
        key.style.cssText = \`
            width: 25px;
            height: 79px;
            background: \${isActive ? 'linear-gradient(to bottom, #ff4757 0%, #cc2233 100%)' : 'linear-gradient(to bottom, #222 0%, #111 100%)'};
            position: absolute;
            left: \${t.pos * whiteKeyWidth + blackKeyOffset}px;
            top: 0;
            border-radius: 0 0 5px 5px;
            box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            z-index: 2;
            cursor: default;
        \`;
        
        if(isActive && dedo) {
            const dedoDiv = document.createElement('div');
            dedoDiv.textContent = dedo;
            dedoDiv.style.cssText = \`
                position: absolute;
                top: 78%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 18px;
                height: 20px;
                background: white;
                color: #ff4757;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                font-family: Arial;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                z-index: 11;
            \`;
            key.appendChild(dedoDiv);
        }
        pianoDiv.appendChild(key);
    });
    
    wrapper.appendChild(pianoDiv);
    container.appendChild(wrapper);
}

// ============================================
// RENDERIZAR AULA
// ============================================
function renderizarAula(container, conteudoOriginal) {
    let texto = conteudoOriginal;
    const chords = [], pianos = [], abcs = [], abcInfantis = [];
    
    // Extrair Acordes de Violão
    texto = texto.replace(/\\[Acorde:([^\\]]+)\\]([\\s\\S]*?)\\[\\/Acorde\\]/g, (match, sigla) => {
        const id = 'chord_' + Date.now() + '_' + chords.length;
        chords.push({ id, sigla });
        return '<div id="'+id+'" class="chord-diagram"></div>';
    });
    
    // Extrair Acordes de Piano
    texto = texto.replace(/\\[PIANO:([^\\]]+)\\]([\\s\\S]*?)\\[\\/PIANO\\]/g, (match, sigla, nome) => {
        const id = 'piano_' + Date.now() + '_' + pianos.length;
        pianos.push({ id, sigla, nome: nome.trim() });
        return '<div id="'+id+'" class="piano-diagram-container"></div>';
    });
    
    // Extrair ABC Normal
    texto = texto.replace(/\\[ABC\\]([\\s\\S]*?)\\[\\/ABC\\]/g, (match, code) => {
        const id = 'abc_' + Date.now() + '_' + abcs.length;
        abcs.push({ id, code: code.trim() });
        return '<div id="'+id+'" class="abc-container"></div>';
    });
    
    // Extrair ABC Infantil
    texto = texto.replace(/\\[ABC-INFANTIL\\]([\\s\\S]*?)\\[\\/ABC-INFANTIL\\]/g, (match, code) => {
        const id = 'inf_' + Date.now() + '_' + abcInfantis.length;
        abcInfantis.push({ id, code: code.trim() });
        return '<div id="'+id+'" class="abc-container"></div>';
    });
    
    container.innerHTML = marked.parse(texto);
    
    // Renderizar Acordes de Violão
    chords.forEach(c => { const el = document.getElementById(c.id); if(el) desenharAcordeViolao(el, c.sigla); });
    
    // Renderizar Acordes de Piano
    pianos.forEach(p => { 
        const el = document.getElementById(p.id); 
        if(el && ACORDES_PIANO && ACORDES_PIANO[p.sigla]) { 
            const a = ACORDES_PIANO[p.sigla]; 
            desenharTecladoPianoExport(el, p.sigla, a.nome, a.notas, a.startOitava || 'C3', a.endOitava || 'C5', a.dedosTreble || []); 
        } 
    });
    
    // Renderizar ABC Normal
    abcs.forEach(a => { const el = document.getElementById(a.id); if(el && typeof ABCJS !== 'undefined') { ABCJS.renderAbc(a.id, a.code, { scale: 1.0, staffwidth: 500 }); } });
    
    // Renderizar ABC Infantil com cores
    abcInfantis.forEach(a => {
        const el = document.getElementById(a.id);
        if(el && typeof ABCJS !== 'undefined') {
            ABCJS.renderAbc(a.id, a.code, {
                add_classes: true,
                staffwidth: 800,
                responsive: 'resize'
            });
            setTimeout(aplicarCoresABC, 200);
        }
    });
}

window.onload = function() {
    document.querySelectorAll('.aula-conteudo').forEach(el => {
        const conteudo = decodeURIComponent(el.getAttribute('data-conteudo'));
        renderizarAula(el, conteudo);
    });
};
<\/script>
</body>
</html>`;
    
    const blob = new Blob([appHtml], {type: 'text/html'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'pro_maestro_app.html';
    link.click();
    alert('✅ App exportado com sucesso!');
}