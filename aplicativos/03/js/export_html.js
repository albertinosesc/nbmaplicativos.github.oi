// ============================================
// EXPORTAR HTML (Aula Atual)
// ============================================
async function exportHTML() {
    const conteudoAtual = editor.value;
    const acordesStr = JSON.stringify(ACORDES);
    const acordesPianoStr = JSON.stringify(ACORDES_PIANO);
    const coresStatus = coresAtivas;
    
    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Pro Maestro - Exportação</title>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/abcjs/6.2.2/abcjs-basic-min.js"><\/script>
<style>
    body { font-family: Arial; max-width: 1000px; margin: 40px auto; padding: 20px; }
    .chord-diagram { display: inline-block; margin: 10px; text-align: center; }
    .piano-diagram { display: inline-block; margin: 10px; text-align: center; background: white; padding: 10px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .piano-title { font-size: 1.2em; font-weight: bold; color: #e94560; margin-bottom: 8px; }
    .piano-keys { display: flex; position: relative; height: 120px; }
    .piano-key-white { width: 35px; height: 100px; background: white; border: 1px solid #333; display: inline-block; position: relative; }
    .piano-key-black { width: 22px; height: 60px; background: #222; position: absolute; border-radius: 0 0 3px 3px; }
    .abc-container { margin: 20px 0; overflow-x: auto; }
    svg { max-width: 100%; height: auto; }
</style>
</head>
<body>
<div id="conteudo"></div>
<script>
    const ACORDES = ${acordesStr};
    const ACORDES_PIANO = ${acordesPianoStr};
    const coresAtivas = ${coresStatus};
    const conteudoOriginal = ${JSON.stringify(conteudoAtual)};
    
    function desenharAcorde(container, sigla) {
        const acorde = ACORDES[sigla];
        if (!acorde) return;
        container.innerHTML = '';
        const canvas = document.createElement('canvas');
        canvas.width = 130; canvas.height = 180;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0,0,130,180);
        const sx=25,sy=42,ss=18,sf=26;
        for(let i=0;i<6;i++){ ctx.beginPath(); ctx.moveTo(sx+i*ss,sy); ctx.lineTo(sx+i*ss,sy+5*sf); ctx.stroke(); }
        for(let i=0;i<=5;i++){ ctx.beginPath(); ctx.moveTo(sx,sy+i*sf); ctx.lineTo(sx+5*ss,sy+i*sf); ctx.stroke(); }
        if(acorde.casaInicial>1){ ctx.font='bold 12px Arial'; ctx.fillStyle='#333'; ctx.fillText(acorde.casaInicial+'ª',sx-18,sy+sf/2+2); }
        if(acorde.pestana && Array.isArray(acorde.pestana)){
            let inicio=acorde.pestana[0],fim=inicio;
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
        acorde.cordas.forEach((c,i)=>{ if(c>0&&c<=5){
            const x=sx+i*ss, y=sy+(c-1)*sf+sf/2;
            ctx.beginPath(); ctx.arc(x,y,7,0,2*Math.PI); ctx.fillStyle='#000'; ctx.fill();
        }});
        container.appendChild(canvas);
        const cifra=document.createElement('div'); cifra.textContent=sigla; cifra.style.fontWeight='bold'; cifra.style.color='#e94560'; container.appendChild(cifra);
    }
    
    function desenharAcordePiano(container, sigla, nome) {
        const acorde = ACORDES_PIANO[sigla];
        if (!acorde) { container.innerHTML = '<div>Acorde não encontrado</div>'; return; }
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'piano-diagram';
        const title = document.createElement('div');
        title.className = 'piano-title';
        title.textContent = sigla + ' - ' + acorde.nome;
        wrapper.appendChild(title);
        const keysDiv = document.createElement('div');
        keysDiv.className = 'piano-keys';
        keysDiv.style.position = 'relative';
        keysDiv.style.height = '120px';
        const notasTeclas = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
        const notasAcorde = acorde.notas;
        for(let i=0;i<12;i++){
            const nota = notasTeclas[i];
            if(!nota.includes('#')){
                const key = document.createElement('div');
                key.className = 'piano-key-white';
                key.style.width = '35px';
                key.style.height = '100px';
                key.style.display = 'inline-block';
                key.style.backgroundColor = notasAcorde.some(n=>n===nota||n===nota+'#'||n===nota+'b') ? '#3a86ff' : '#fff';
                key.style.border = '1px solid #333';
                const label = document.createElement('div');
                label.textContent = nota;
                label.style.position = 'absolute';
                label.style.bottom = '5px';
                label.style.width = '100%';
                label.style.textAlign = 'center';
                label.style.fontSize = '10px';
                key.appendChild(label);
                keysDiv.appendChild(key);
            }
        }
        const whiteKeys = keysDiv.querySelectorAll('.piano-key-white');
        const blackPositions = [1,3,6,8,10];
        let posIdx = 0;
        for(let i=0;i<12;i++){
            const nota = notasTeclas[i];
            if(nota.includes('#')){
                const pos = blackPositions[posIdx++];
                if(pos !== undefined && whiteKeys[pos]){
                    const blackKey = document.createElement('div');
                    blackKey.className = 'piano-key-black';
                    blackKey.style.width = '22px';
                    blackKey.style.height = '60px';
                    blackKey.style.backgroundColor = notasAcorde.some(n=>n===nota) ? '#ff4757' : '#222';
                    blackKey.style.position = 'absolute';
                    blackKey.style.left = (pos * 35 - 11) + 'px';
                    blackKey.style.top = '0';
                    const label = document.createElement('div');
                    label.textContent = nota;
                    label.style.position = 'absolute';
                    label.style.bottom = '5px';
                    label.style.width = '100%';
                    label.style.textAlign = 'center';
                    label.style.fontSize = '8px';
                    label.style.color = '#fff';
                    blackKey.appendChild(label);
                    keysDiv.appendChild(blackKey);
                }
            }
        }
        wrapper.appendChild(keysDiv);
        container.appendChild(wrapper);
    }
    
    function renderizar() {
        let processado = conteudoOriginal;
        processado = processado.replace(/\\[Acorde:([^\\]]+)\\]([\\s\\S]*?)\\[\\/Acorde\\]/g, (match,sigla)=>{ const id='chord-'+Math.random(); setTimeout(()=>{ const el=document.getElementById(id); if(el) desenharAcorde(el,sigla); },10); return '<div id="'+id+'" class="chord-diagram"></div>'; });
        processado = processado.replace(/\\[PIANO:([^\\]]+)\\]([\\s\\S]*?)\\[\\/PIANO\\]/g, (match,sigla,nome)=>{ const id='piano-'+Math.random(); setTimeout(()=>{ const el=document.getElementById(id); if(el) desenharAcordePiano(el,sigla,nome); },10); return '<div id="'+id+'" class="piano-diagram"></div>'; });
        processado = processado.replace(/\\[ABC-INFANTIL\\]([\\s\\S]*?)\\[\\/ABC-INFANTIL\\]/g, (match,code)=>{ const id='abc-'+Math.random(); setTimeout(()=>{ const el=document.getElementById(id); if(el && typeof ABCJS!=='undefined') ABCJS.renderAbc(id,code.trim(),{ add_classes:true, scale:1.0, staffwidth:500 }); },50); return '<div id="'+id+'" class="abc-container"></div>'; });
        processado = processado.replace(/\\[ABC\\]([\\s\\S]*?)\\[\\/ABC\\]/g, (match,code)=>{ const id='abc-'+Math.random(); setTimeout(()=>{ const el=document.getElementById(id); if(el && typeof ABCJS!=='undefined') ABCJS.renderAbc(id,code.trim(),{ scale:1.0, staffwidth:500 }); },50); return '<div id="'+id+'" class="abc-container"></div>'; });
        document.getElementById('conteudo').innerHTML = marked.parse(processado);
    }
    window.onload = renderizar;
<\/script>
</body>
</html>`;
    
    const blob = new Blob([html], {type: 'text/html'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'pro_maestro_aula.html';
    link.click();
    alert('✅ HTML exportado com sucesso!');
}
