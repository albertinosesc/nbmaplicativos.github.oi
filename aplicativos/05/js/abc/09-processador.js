// ============================================
// PROCESSAR ABC COM ESPAÇAMENTO
// ============================================

function processarABCComEspacamento(id, code, tipo) {
    const elemento = document.getElementById(id);
    if (!elemento) return;

    const staffsep = document.getElementById("staffsepRange")?.value || 60;
    const sysstaffsep = document.getElementById("sysstaffsepRange")?.value || 80;

    let linhas = code.split('\n');
    let novasLinhas = [];
    let hasStaffsep = false, hasSysstaffsep = false;

    for (let linha of linhas) {
        if (linha.trim().startsWith('%%staffsep')) {
            novasLinhas.push(`%%staffsep ${staffsep}`);
            hasStaffsep = true;
        } else if (linha.trim().startsWith('%%sysstaffsep')) {
            novasLinhas.push(`%%sysstaffsep ${sysstaffsep}`);
            hasSysstaffsep = true;
        } else {
            novasLinhas.push(linha);
        }
    }

    if (!hasStaffsep && linhas.length > 0) novasLinhas.unshift(`%%staffsep ${staffsep}`);
    if (!hasSysstaffsep && linhas.length > 0) novasLinhas.unshift(`%%sysstaffsep ${sysstaffsep}`);

    let codigoProcessado = novasLinhas.join('\n');
    codigoProcessado = codigoProcessado.replace(/"%"/g, '"％"');
    try {
        elemento.innerHTML = "";
        ABCJS.renderAbc(id, codigoProcessado, { add_classes: true, staffwidth: 800, responsive: 'resize' });
        if (tipo === 'infantil') {
            setTimeout(() => {
                aplicarCoresAcordesLetras();
                if (coresAtivas) aplicarCoresNasNotas();
                ajustarAcordes();
                ajustarLetras();
            }, 200);
        }
    } catch (e) {
        elemento.innerHTML = `<p style="color:red">Erro: ${e.message}</p>`;
    }
}

console.log('✅ Processador ABC carregado');
