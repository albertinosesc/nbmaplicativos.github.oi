// ============================================
// EDITOR DE ACORDES (POPUP)
// ============================================

let bibliotecaAcordes = {};

function carregarBiblioteca() {
    const salvos = localStorage.getItem('biblioteca_acordes');
    if (salvos) {
        bibliotecaAcordes = JSON.parse(salvos);
    } else {
        bibliotecaAcordes = {
            'C': { nome: 'Dó Maior', cordas: [-1,3,2,0,1,0], dedos: ['','3','2','','1',''], pestana: false, casaInicial: 1, baixo: 'C' },
            'G': { nome: 'Sol Maior', cordas: [3,2,0,0,0,3], dedos: ['2','1','','','','3'], pestana: false, casaInicial: 1, baixo: 'G' },
            'Am': { nome: 'Lá Menor', cordas: [0,1,2,2,0,0], dedos: ['','1','2','3','',''], pestana: false, casaInicial: 1, baixo: 'A' },
            'F': { nome: 'Fá Maior', cordas: [1,3,3,2,1,1], dedos: ['1','3','4','2','1','1'], pestana: [0,1,2,3,4,5], casaInicial: 1, baixo: 'F' },
            'Bb': { nome: 'Si Bemol', cordas: [6,8,8,7,6,6], dedos: ['1','3','4','2','1','1'], pestana: [0,1,2,3,4,5], casaInicial: 6, baixo: 'Bb' }
        };
    }
    
    if (typeof ACORDES !== 'undefined') {
        for (const [sigla, acorde] of Object.entries(bibliotecaAcordes)) {
            ACORDES[sigla] = acorde;
        }
    }
    
    atualizarBibliotecaVisual();
}

function atualizarBibliotecaVisual() {
    const container = document.getElementById('bibliotecaAcordes');
    const termoPesquisa = document.getElementById('pesquisaAcordes')?.value.toLowerCase() || '';
    container.innerHTML = '';
    
    const acordesFiltrados = Object.entries(bibliotecaAcordes).filter(([sigla, acorde]) => {
        return sigla.toLowerCase().includes(termoPesquisa) || acorde.nome.toLowerCase().includes(termoPesquisa);
    });
    
    if (acordesFiltrados.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">Nenhum acorde encontrado.</div>';
        return;
    }
    
    acordesFiltrados.forEach(([sigla, acorde]) => {
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; gap: 5px; margin: 5px; align-items: center; background: #0f3460; padding: 5px 10px; border-radius: 5px;';
        
        const btnInserir = document.createElement('button');
        btnInserir.textContent = `${sigla} - ${acorde.nome}`;
        btnInserir.style.flex = '1';
        btnInserir.style.background = '#e94560';
        btnInserir.onclick = () => inserirAcordeNoEditor(sigla);
        
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = '🗑️';
        btnExcluir.style.background = '#CC0000';
        btnExcluir.style.width = '40px';
        btnExcluir.onclick = () => excluirAcordeBiblioteca(sigla);
        
        div.appendChild(btnInserir);
        div.appendChild(btnExcluir);
        container.appendChild(div);
    });
}

function excluirAcordeBiblioteca(sigla) {
    if (confirm(`Tem certeza que deseja excluir o acorde "${sigla}" da biblioteca?`)) {
        delete bibliotecaAcordes[sigla];
        if (typeof ACORDES !== 'undefined') delete ACORDES[sigla];
        localStorage.setItem('biblioteca_acordes', JSON.stringify(bibliotecaAcordes));
        if (typeof salvarAcordesPersonalizadosUsuario === 'function') salvarAcordesPersonalizadosUsuario();
        atualizarBibliotecaVisual();
        alert(`✅ Acorde ${sigla} excluído!`);
    }
}

function inserirAcordeNoEditor(sigla) {
    let acorde = bibliotecaAcordes[sigla];
    if (!acorde && typeof ACORDES !== 'undefined' && ACORDES[sigla]) acorde = ACORDES[sigla];
    if (!acorde) {
        alert(`❌ Acorde "${sigla}" não encontrado!`);
        return;
    }
    
    const codigo = `[Acorde:${sigla}]${acorde.nome}[/Acorde]`;
    const editorField = document.getElementById('editor');
    const start = editorField.selectionStart;
    editorField.value = editorField.value.substring(0, start) + codigo + editorField.value.substring(start);
    editorField.selectionStart = editorField.selectionEnd = start + codigo.length;
    
    if (typeof renderizar === 'function') renderizar();
    if (typeof salvarAulaAtual === 'function') salvarAulaAtual();
    
    fecharEditorAcordes();
    alert(`✅ Acorde ${sigla} inserido!`);
}

function parseLinhaAcorde(linha) {
    linha = linha.trim();
    if (!linha) return null;
    
    const partes = linha.split('/').map(p => p.trim());
    if (partes.length >= 3) {
        const siglaNome = partes[0];
        const doisPontos = siglaNome.indexOf(':');
        if (doisPontos === -1) return null;
        
        const sigla = siglaNome.substring(0, doisPontos).trim();
        const nome = siglaNome.substring(doisPontos + 1).trim();
        const cordas = partes[1].split(',').map(c => parseInt(c.trim()) || 0);
        if (cordas.length !== 6) return null;
        
        let dedos = ['', '', '', '', '', ''];
        if (partes[2]) {
            const dedosTemp = partes[2].split(',');
            for (let i = 0; i < Math.min(dedosTemp.length, 6); i++) {
                dedos[i] = dedosTemp[i].trim();
            }
        }
        
        let pestana = false;
        let pestanaArray = null;
        if (partes[3] && partes[3] !== 'false') {
            if (partes[3].startsWith('[')) {
                pestanaArray = JSON.parse(partes[3]);
                pestana = true;
            } else {
                pestana = partes[3].toLowerCase() === 'true';
            }
        }
        
        let casaInicial = 1;
        if (partes[4]) casaInicial = parseInt(partes[4]) || 1;
        let baixo = sigla;
        if (partes[5]) baixo = partes[5];
        
        return { sigla, nome, cordas, dedos, pestana, pestanaArray, casaInicial, baixo };
    }
    return null;
}

function desenharAcordePreview(container, sigla, acorde) {
    if (!acorde) return;
    
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.textAlign = 'center';
    
    const cifraDiv = document.createElement('div');
    cifraDiv.textContent = sigla;
    cifraDiv.style.position = 'absolute';
    cifraDiv.style.top = '-22px';
    cifraDiv.style.left = '50%';
    cifraDiv.style.transform = 'translateX(-50%)';
    cifraDiv.style.fontSize = '1.4em';
    cifraDiv.style.fontWeight = 'bold';
    cifraDiv.style.color = '#e94560';
    wrapper.appendChild(cifraDiv);
    
    const canvas = document.createElement('canvas');
    canvas.width = 130;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const startX = 22, startY = 30, stringSpacing = 16, fretSpacing = 24, numFrets = 5;
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
    
    if (acorde.casaInicial > 1) {
        ctx.font = 'bold 10px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText(acorde.casaInicial + 'ª', startX - 16, startY + fretSpacing / 2 + 2);
    }
    
    if (acorde.pestanaArray && acorde.pestanaArray.length > 0) {
        let inicio = acorde.pestanaArray[0], fim = inicio;
        for (let i = 1; i <= acorde.pestanaArray.length; i++) {
            if (i < acorde.pestanaArray.length && acorde.pestanaArray[i] === acorde.pestanaArray[i - 1] + 1) {
                fim = acorde.pestanaArray[i];
            } else {
                const xInicio = startX + inicio * stringSpacing;
                const xFim = startX + fim * stringSpacing;
                ctx.beginPath();
                ctx.moveTo(xInicio - 2, startY + 8);
                ctx.lineTo(xFim + 2, startY + 8);
                ctx.lineWidth = 5;
                ctx.strokeStyle = '#000000';
                ctx.stroke();
                if (i < acorde.pestanaArray.length) {
                    inicio = acorde.pestanaArray[i];
                    fim = inicio;
                }
            }
        }
        ctx.lineWidth = 1.2;
    }
    
    acorde.cordas.forEach((casa, i) => {
        if (casa > 0 && casa <= numFrets) {
            const x = startX + i * stringSpacing;
            const y = startY + (casa - 1) * fretSpacing + fretSpacing / 2;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = '#000000';
            ctx.fill();
            const dedo = acorde.dedos && acorde.dedos[i] ? acorde.dedos[i] : '';
            if (dedo) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 8px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(dedo, x, y);
            }
        }
    });
    
    acorde.cordas.forEach((casa, i) => {
        const x = startX + i * stringSpacing;
        const y = startY - 10;
        if (casa === 0) {
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (casa === -1) {
            ctx.beginPath();
            ctx.moveTo(x - 4, y - 4);
            ctx.lineTo(x + 4, y + 4);
            ctx.moveTo(x + 4, y - 4);
            ctx.lineTo(x - 4, y + 4);
            ctx.stroke();
        }
    });
    
    wrapper.appendChild(canvas);
    container.appendChild(wrapper);
}

function gerarPreviewAcordes() {
    const input = document.getElementById('acordeInput').value;
    const linhas = input.split('\n');
    const previewDiv = document.getElementById('previewAcordes');
    const codigos = [];
    previewDiv.innerHTML = '';
    
    for (const linha of linhas) {
        const linhaTrim = linha.trim();
        if (!linhaTrim || linhaTrim.startsWith('//')) continue;
        const acorde = parseLinhaAcorde(linhaTrim);
        if (acorde) {
            const container = document.createElement('div');
            container.style.display = 'inline-block';
            container.style.margin = '10px';
            previewDiv.appendChild(container);
            desenharAcordePreview(container, acorde.sigla, acorde);
            
            let codigo = `'${acorde.sigla}': {\n    nome: '${acorde.nome}',\n    cordas: [${acorde.cordas.join(',')}],\n    dedos: ['${acorde.dedos.join("','")}'],\n    pestana: ${acorde.pestanaArray ? JSON.stringify(acorde.pestanaArray) : false},\n    casaInicial: ${acorde.casaInicial},\n    baixo: '${acorde.baixo}'\n},`;
            codigos.push(codigo);
        }
    }
    
    const codigoField = document.getElementById('codigoAcordes');
    if (codigoField) {
        if (codigos.length > 0) {
            codigoField.value = `// ============================================\n// ACORDES GERADOS\n// ============================================\n\nconst ACORDES_GERADOS = {\n${codigos.join('\n')}\n};\n\n// Object.assign(ACORDES, ACORDES_GERADOS);`;
        } else {
            codigoField.value = 'Nenhum acorde válido encontrado.';
        }
    }
}

function salvarAcordeNaBiblioteca() {
    const input = document.getElementById('acordeInput').value;
    const linhas = input.split('\n');
    let salvos = 0;
    
    for (const linha of linhas) {
        const linhaTrim = linha.trim();
        if (!linhaTrim || linhaTrim.startsWith('//')) continue;
        const acorde = parseLinhaAcorde(linhaTrim);
        if (acorde) {
            bibliotecaAcordes[acorde.sigla] = {
                nome: acorde.nome,
                cordas: acorde.cordas,
                dedos: acorde.dedos,
                pestana: acorde.pestanaArray || false,
                casaInicial: acorde.casaInicial,
                baixo: acorde.baixo
            };
            if (typeof ACORDES !== 'undefined') {
                ACORDES[acorde.sigla] = { ...bibliotecaAcordes[acorde.sigla] };
            }
            salvos++;
        }
    }
    
    if (salvos > 0) {
        localStorage.setItem('biblioteca_acordes', JSON.stringify(bibliotecaAcordes));
        if (typeof salvarAcordesPersonalizadosUsuario === 'function') salvarAcordesPersonalizadosUsuario();
        atualizarBibliotecaVisual();
        alert(`✅ ${salvos} acorde(s) salvo(s) na biblioteca!`);
    } else {
        alert('Nenhum acorde válido encontrado para salvar.');
    }
}

function copiarCodigoAcordes() {
    const codigo = document.getElementById('codigoAcordes');
    if (codigo) {
        codigo.select();
        document.execCommand('copy');
        alert('✅ Código copiado!');
    }
}

function abrirEditorAcordes() {
    carregarBiblioteca();
    document.getElementById('modalAcordes').style.display = 'block';
    const campoPesquisa = document.getElementById('pesquisaAcordes');
    if (campoPesquisa) {
        campoPesquisa.value = '';
        campoPesquisa.focus();
        campoPesquisa.addEventListener('input', () => atualizarBibliotecaVisual());
    }
}

function fecharEditorAcordes() {
    document.getElementById('modalAcordes').style.display = 'none';
}
