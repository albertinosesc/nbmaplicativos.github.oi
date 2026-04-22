// ============================================
// ACORDES DINÂMICOS
// ============================================

// Função para processar acorde com pestana personalizada
function processarAcordePersonalizado(sigla, dadosAcorde) {
    // dadosAcorde pode ter:
    // - cordas: array com as casas (-1=silêncio, 0=solta, >0=pressionada)
    // - dedos: array com os dedos para cada corda
    // - pestana: pode ser boolean, número da casa, ou array de índices das cordas
    // - casaInicial: número da primeira casa do diagrama
    // - nome: nome do acorde
    
    const cordas = dadosAcorde.cordas || [];
    if (cordas.length !== 6) {
        console.error('Cordas deve ter 6 posições');
        return null;
    }
    
    // Processa a pestana
    let pestanaInfo = processarPestana(dadosAcorde.pestana, cordas);
    
    return {
        nome: dadosAcorde.nome || sigla,
        cordas: cordas,
        dedos: dadosAcorde.dedos || ['', '', '', '', '', ''],
        pestana: pestanaInfo.temPestana,
        pestanaCasa: pestanaInfo.casa,
        pestanaCordas: pestanaInfo.cordas,
        casaInicial: dadosAcorde.casaInicial || 1,
        baixo: dadosAcorde.baixo || ''
    };
}

// Função para processar diferentes tipos de pestana
function processarPestana(pestanaConfig, cordas) {
    let temPestana = false;
    let casa = 1;
    let cordasPestana = [];
    
    if (!pestanaConfig) {
        return { temPestana: false, casa: 1, cordas: [] };
    }
    
    // Caso 1: Pestana é um número (casa onde está a pestana)
    if (typeof pestanaConfig === 'number') {
        temPestana = true;
        casa = pestanaConfig;
        // Encontra todas as cordas que têm esta casa
        cordas.forEach((cordaCasa, idx) => {
            if (cordaCasa === casa) {
                cordasPestana.push(idx);
            }
        });
    }
    
    // Caso 2: Pestana é um array de índices das cordas
    else if (Array.isArray(pestanaConfig)) {
        temPestana = true;
        // Usa a casa da primeira corda da pestana
        const primeiraCorda = pestanaConfig[0];
        if (cordas[primeiraCorda]) {
            casa = cordas[primeiraCorda];
        }
        cordasPestana = pestanaConfig;
    }
    
    // Caso 3: Pestana é true (pestana em todas as cordas na casa 1)
    else if (pestanaConfig === true) {
        temPestana = true;
        casa = 1;
        cordas.forEach((cordaCasa, idx) => {
            if (cordaCasa === casa) {
                cordasPestana.push(idx);
            }
        });
    }
    
    return { temPestana, casa, cordas: cordasPestana };
}

// Interface para o usuário criar acorde personalizado
function abrirEditorAcordePersonalizado() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: #1a1a2e; padding: 20px; border-radius: 10px; width: 90%; max-width: 500px; color: white;">
            <h2 style="color: #e94560; margin-bottom: 20px;">🎸 Criar Acorde Personalizado</h2>
            
            <div style="margin-bottom: 15px;">
                <label>Nome do Acorde:</label>
                <input type="text" id="acordeNome" placeholder="Ex: C7M" style="width: 100%; padding: 8px; margin-top: 5px; border-radius: 5px; border: none;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label>Casa Inicial:</label>
                <input type="number" id="casaInicial" value="1" min="1" max="12" style="width: 100%; padding: 8px; margin-top: 5px; border-radius: 5px; border: none;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label>Cordas (casa ou -1 para silêncio, 0 para solta):</label>
                <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-top: 10px;">
                    ${['6 (E)', '5 (A)', '4 (D)', '3 (G)', '2 (B)', '1 (e)'].map((corda, i) => `
                        <div>
                            <div style="text-align: center; font-size: 12px; margin-bottom: 5px;">${corda}</div>
                            <input type="number" id="corda${i}" value="-1" style="width: 100%; padding: 8px; border-radius: 5px; border: none; text-align: center;">
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label>Dedos (opcional, deixe vazio para nenhum):</label>
                <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-top: 10px;">
                    ${[1,2,3,4,5,6].map(i => `
                        <div>
                            <div style="text-align: center; font-size: 12px; margin-bottom: 5px;">Corda ${i}</div>
                            <input type="text" id="dedo${i-1}" maxlength="1" placeholder="" style="width: 100%; padding: 8px; border-radius: 5px; border: none; text-align: center;">
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label>Pestana:</label>
                <select id="tipoPestana" style="width: 100%; padding: 8px; margin-top: 5px; border-radius: 5px;">
                    <option value="none">Sem pestana</option>
                    <option value="auto">Automática (nas cordas com mesma casa)</option>
                    <option value="custom">Personalizada (escolher cordas)</option>
                </select>
            </div>
            
            <div id="pestanaCustomDiv" style="display: none; margin-top: 10px;">
                <label>Cordas com pestana (selecione):</label>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    ${[1,2,3,4,5,6].map(i => `
                        <label style="display: flex; flex-direction: column; align-items: center;">
                            <span style="font-size: 12px;">Corda ${i}</span>
                            <input type="checkbox" id="pestanaCorda${i-1}" value="${i-1}">
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button id="salvarAcordeBtn" style="flex: 1; background: #2ecc71; color: white; padding: 10px; border: none; border-radius: 5px; cursor: pointer;">💾 Salvar Acorde</button>
                <button id="cancelarAcordeBtn" style="flex: 1; background: #e94560; color: white; padding: 10px; border: none; border-radius: 5px; cursor: pointer;">❌ Cancelar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Mostrar/esconder opções de pestana personalizada
    const tipoPestana = modal.querySelector('#tipoPestana');
    const pestanaCustomDiv = modal.querySelector('#pestanaCustomDiv');
    
    tipoPestana.addEventListener('change', (e) => {
        pestanaCustomDiv.style.display = e.target.value === 'custom' ? 'block' : 'none';
    });
    
    // Salvar acorde
    modal.querySelector('#salvarAcordeBtn').addEventListener('click', () => {
        const nome = modal.querySelector('#acordeNome').value.trim();
        if (!nome) {
            alert('Digite um nome para o acorde!');
            return;
        }
        
        const casaInicial = parseInt(modal.querySelector('#casaInicial').value) || 1;
        
        // Pega as cordas
        const cordas = [];
        for (let i = 0; i < 6; i++) {
            cordas.push(parseInt(modal.querySelector(`#corda${i}`).value) || -1);
        }
        
        // Pega os dedos
        const dedos = [];
        for (let i = 0; i < 6; i++) {
            dedos.push(modal.querySelector(`#dedo${i}`).value || '');
        }
        
        // Processa a pestana
        let pestana = false;
        const tipo = tipoPestana.value;
        
        if (tipo === 'auto') {
            pestana = true; // Será processado automaticamente
        } else if (tipo === 'custom') {
            const cordasPestana = [];
            for (let i = 0; i < 6; i++) {
                const checkbox = modal.querySelector(`#pestanaCorda${i}`);
                if (checkbox && checkbox.checked) {
                    cordasPestana.push(i);
                }
            }
            pestana = cordasPestana;
        }
        
        // Salvar acorde
        const acordeData = {
            nome: nome,
            cordas: cordas,
            dedos: dedos,
            pestana: pestana,
            casaInicial: casaInicial
        };
        
        // Salvar no localStorage
        const acordesPersonalizados = JSON.parse(localStorage.getItem('acordes_violao_personalizados') || '{}');
        acordesPersonalizados[nome] = acordeData;
        localStorage.setItem('acordes_violao_personalizados', JSON.stringify(acordesPersonalizados));
        
        // Adicionar ao ACORDES global
        if (typeof ACORDES !== 'undefined') {
            ACORDES[nome] = processarAcordePersonalizado(nome, acordeData);
        }
        
        alert(`✅ Acorde "${nome}" salvo com sucesso!`);
        modal.remove();
    });
    
    modal.querySelector('#cancelarAcordeBtn').addEventListener('click', () => {
        modal.remove();
    });
}

// Função para desenhar acorde com pestana personalizada
function desenharAcordeComPestanaPersonalizada(container, acorde) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: inline-block; margin: 20px 10px; text-align: center;';
    
    const canvas = document.createElement('canvas');
    canvas.width = 140;
    canvas.height = 190;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const startX = 28, startY = 45, stringSpacing = 18, fretSpacing = 26;
    const numFrets = 5;
    
    // Desenha cordas
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(startX + i * stringSpacing, startY);
        ctx.lineTo(startX + i * stringSpacing, startY + numFrets * fretSpacing);
        ctx.stroke();
    }
    
    // Desenha trastes
    for (let i = 0; i <= numFrets; i++) {
        ctx.beginPath();
        ctx.moveTo(startX, startY + i * fretSpacing);
        ctx.lineTo(startX + 5 * stringSpacing, startY + i * fretSpacing);
        ctx.stroke();
    }
    
    // Número da casa inicial
    if (acorde.casaInicial > 1) {
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText(acorde.casaInicial + 'ª', startX - 18, startY + fretSpacing / 2 + 2);
    }
    
    // Desenha pestana personalizada
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
    
    // Desenha as notas
    const pestanaCasa = acorde.pestanaCasa || acorde.casaInicial;
    acorde.cordas.forEach((casa, i) => {
        const x = startX + i * stringSpacing;
        let casaRelativa = casa - pestanaCasa + 1;
        
        // Se a corda está na pestana, não desenha bolinha separada
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
    container.appendChild(wrapper);
}
// ============================================
// PROCESSAR ACORDE DINÂMICO (formato 1;3 ou 1;3;5)
// ============================================

function processarAcordeDinamico(sigla, nome) {
    console.log("processarAcordeDinamico chamado com:", sigla, nome);
    
    // Suporta formatos: 1;3  ou  1;3;5
    let match = sigla.match(/^(\d+);(\d+)$/);
    let matchComCorda = sigla.match(/^(\d+);(\d+);(\d+)$/);
    
    if (!match && !matchComCorda) return null;
    
    let forma, casa, cordaBase;
    
    if (matchComCorda) {
        forma = parseInt(matchComCorda[1]);
        casa = parseInt(matchComCorda[2]);
        cordaBase = parseInt(matchComCorda[3]);
    } else {
        forma = parseInt(match[1]);
        casa = parseInt(match[2]);
        cordaBase = 6;  // corda padrão (Mi)
    }
    
    // FORMAS DE ACORDE com PESTANA CORRETA para cada corda base
    const formas = {
        // ===== CORDAS BASE 6 (Mi) - Pestana [0,1,2,3,4,5] =====
        '6_1': { 
            cordas: [1, 3, 3, 2, 1, 1], 
            dedos: ['1', '3', '4', '2', '1', '1'], 
            pestana: [0,1,2,3,4,5],
            nome: 'Maior' 
        },
        '6_2': { 
            cordas: [1, 2, 3, 3, 1, 1], 
            dedos: ['1', '2', '3', '4', '1', '1'], 
            pestana: [0,1,2,3,4,5],
            nome: 'Menor' 
        },
        '6_3': { 
            cordas: [1, 3, 2, 2, 1, 1], 
            dedos: ['1', '3', '2', '4', '1', '1'], 
            pestana: [0,1,2,3,4,5],
            nome: 'Sétima' 
        },
        
        // ===== CORDAS BASE 5 (Lá) - Pestana [1,2,3,4,5] =====
        '5_1': { 
            cordas: [-1, 1, 3, 3, 3, 1], 
            dedos: ['', '1', '3', '4', '2', '1'], 
            pestana: [1,2,3,4,5],
            nome: 'Maior' 
        },
        '5_2': { 
            cordas: [-1, 1, 2, 2, 3, 1], 
            dedos: ['', '1', '2', '3', '4', '1'], 
            pestana: [1,2,3,4,5],
            nome: 'Menor' 
        },
        '5_3': { 
            cordas: [-1, 1, 3, 2, 3, 1], 
            dedos: ['', '1', '3', '2', '4', '1'], 
            pestana: [1,2,3,4,5],
            nome: 'Sétima' 
        },
        
        // ===== CORDAS BASE 4 (Ré) - Pestana [2,3,4,5] =====
        '4_1': { 
            cordas: [-1, -1, 1, 3, 3, 1], 
            dedos: ['', '', '1', '3', '4', '2'], 
            pestana: [2,3,4,5],
            nome: 'Maior' 
        },
        '4_2': { 
            cordas: [-1, -1, 1, 2, 3, 1], 
            dedos: ['', '', '1', '2', '3', '4'], 
            pestana: [2,3,4,5],
            nome: 'Menor' 
        },
        '4_3': { 
            cordas: [-1, -1, 1, 3, 2, 1], 
            dedos: ['', '', '1', '3', '2', '4'], 
            pestana: [2,3,4,5],
            nome: 'Sétima' 
        },
        
        // ===== CORDAS BASE 3 (Sol) - Pestana [3,4,5] =====
        '3_1': { 
            cordas: [-1, -1, -1, 1, 3, 3], 
            dedos: ['', '', '', '1', '3', '4'], 
            pestana: [3,4,5],
            nome: 'Maior' 
        },
        '3_2': { 
            cordas: [-1, -1, -1, 1, 2, 3], 
            dedos: ['', '', '', '1', '2', '3'], 
            pestana: [3,4,5],
            nome: 'Menor' 
        },
        '3_3': { 
            cordas: [-1, -1, -1, 1, 3, 2], 
            dedos: ['', '', '', '1', '3', '2'], 
            pestana: [3,4,5],
            nome: 'Sétima' 
        }
    };
    
    const chave = `${cordaBase}_${forma}`;
    let formaBase = formas[chave];
    
    if (!formaBase) {
        console.error(`Forma não encontrada: ${chave}`);
        return null;
    }
    
    // Copia as cordas e ajusta para a casa desejada
    const cordasAjustadas = [...formaBase.cordas];
    
    // Ajusta os valores das cordas baseado na casa inicial
    for (let i = 0; i < cordasAjustadas.length; i++) {
        if (cordasAjustadas[i] > 0) {
            cordasAjustadas[i] = cordasAjustadas[i] + (casa - 1);
        }
    }
    
    // Gera o nome do acorde
    let nomeGerado = nome;
    if (!nomeGerado || nomeGerado === sigla) {
        const notasPorCorda = {
            6: { 1: 'F', 2: 'F#', 3: 'G', 4: 'G#', 5: 'A', 6: 'A#', 7: 'B', 8: 'C', 9: 'C#', 10: 'D', 11: 'D#', 12: 'E' },
            5: { 1: 'A#', 2: 'B', 3: 'C', 4: 'C#', 5: 'D', 6: 'D#', 7: 'E', 8: 'F', 9: 'F#', 10: 'G', 11: 'G#', 12: 'A' },
            4: { 1: 'D#', 2: 'E', 3: 'F', 4: 'F#', 5: 'G', 6: 'G#', 7: 'A', 8: 'A#', 9: 'B', 10: 'C', 11: 'C#', 12: 'D' },
            3: { 1: 'G#', 2: 'A', 3: 'A#', 4: 'B', 5: 'C', 6: 'C#', 7: 'D', 8: 'D#', 9: 'E', 10: 'F', 11: 'F#', 12: 'G' }
        };
        
        let notaBase = notasPorCorda[cordaBase]?.[casa];
        if (!notaBase) {
            const casaMod = ((casa - 1) % 12) + 1;
            notaBase = notasPorCorda[cordaBase]?.[casaMod];
            if (notaBase && casa > 12) {
                const oitavas = Math.floor((casa - 1) / 12);
                notaBase = notaBase + (oitavas > 0 ? ` (${oitavas+1}ª oitava)` : '');
            }
        }
        
        const tipoAcorde = formaBase.nome;
        nomeGerado = notaBase ? `${notaBase} ${tipoAcorde}` : `${casa}ª casa ${tipoAcorde}`;
    }
    
    console.log(`✅ Acorde dinâmico gerado: ${nomeGerado} (corda base ${cordaBase}, pestana: ${JSON.stringify(formaBase.pestana)})`);
    
    return {
        nome: nomeGerado,
        cordas: cordasAjustadas,
        dedos: [...formaBase.dedos],
        pestana: true,
        pestanaCordas: formaBase.pestana,
        pestanaCasa: casa,
        casaInicial: casa,
        cordaBase: cordaBase,
        baixo: cordaBase === 6 ? 'E' : (cordaBase === 5 ? 'A' : (cordaBase === 4 ? 'D' : 'G'))
    };
}
// Exporta as funções
if (typeof window !== 'undefined') {
    window.processarAcordePersonalizado = processarAcordePersonalizado;
    window.abrirEditorAcordePersonalizado = abrirEditorAcordePersonalizado;
    window.desenharAcordeComPestanaPersonalizada = desenharAcordeComPestanaPersonalizada;
}
