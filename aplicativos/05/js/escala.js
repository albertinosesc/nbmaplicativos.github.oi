// ============================================
// escalas_arpejos.js - Sistema de Escalas e Arpejos
// ============================================

(function() {
    // Afinação padrão do violão (semitons relativos a C)
    // Cordas: 6(E)=4, 5(A)=9, 4(D)=2, 3(G)=7, 2(B)=11, 1(E)=4
    const AFINACAO = [4, 9, 2, 7, 11, 4]; // índice 0 = corda 6 (mais grave)
    
    // Mapeamento de notas em semitons (C=0)
    const NOTAS_MAP = {
        'C':0, 'C#':1, 'Db':1, 'D':2, 'D#':3, 'Eb':3, 'E':4,
        'F':5, 'F#':6, 'Gb':6, 'G':7, 'G#':8, 'Ab':8, 'A':9,
        'A#':10, 'Bb':10, 'B':11
    };
    const NOTAS_ARRAY = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    
    // Intervalos das escalas (em semitons a partir da tônica)
    const ESCALAS = {
        'maior': [0,2,4,5,7,9,11],
        'menor': [0,2,3,5,7,8,10],
        'menor-harmonica': [0,2,3,5,7,8,11],
        'menor-melodica': [0,2,3,5,7,9,11],
        'pentatonica': [0,2,4,7,9],
        'blues': [0,3,5,6,7,10],
        'jonio': [0,2,4,5,7,9,11],       // modo grego (igual maior)
        'dorico': [0,2,3,5,7,9,10],
        'frigio': [0,1,3,5,7,8,10],
        'lidio': [0,2,4,6,7,9,11],
        'mixolidio': [0,2,4,5,7,9,10],
        'eolio': [0,2,3,5,7,8,10],       // igual menor natural
        'locrio': [0,1,3,5,6,8,10]
    };
    
    // Intervalos dos arpejos (graus relativos à tônica)
    const ARPEJOS = {
        'maior': [0,4,7],
        'menor': [0,3,7],
        'aumentado': [0,4,8],
        'diminuto': [0,3,6],
        '7': [0,4,7,10],
        'm7': [0,3,7,10],
        '7M': [0,4,7,11],
        'm7M': [0,3,7,11],
        '7+': [0,4,8,10],   // aumentado com sétima
        'm7b5': [0,3,6,10]
    };
    
    // Mapeia nome da função para cor (para exibição)
    const FUNCAO_COR = {
        1: '#e94560',  // tônica (vermelho)
        3: '#3a86ff',  // terça (azul)
        5: '#2ecc71',  // quinta (verde)
        7: '#f39c12',  // sétima (laranja)
        'outros': '#888888' // outros graus (cinza)
    };
    
    // Obtém a função (grau) a partir do intervalo em semitons (relativo à tônica)
    function getFuncao(intervalo) {
        const mapa = {0:1, 2:2, 4:3, 5:4, 7:5, 9:6, 11:7, 1:9, 3:10, 6:11, 8:12, 10:13};
        return mapa[intervalo] || 'outros';
    }
    
    // Converte nota em string para semitom
    function notaParaSemitom(nota) {
        return NOTAS_MAP[nota];
    }
    
    // Converte semitom para nome da nota
    function semitomParaNota(semitom) {
        return NOTAS_ARRAY[semitom % 12];
    }
    
    // Gera as posições (corda, casa) de todas as notas da escala/arpejo no braço
    // tonicaSem: semitom da tônica (0-11)
    // intervalos: array de intervalos em semitons a partir da tônica
    // posInicial: casa inicial preferencial (ex: 3) - as notas mais próximas serão priorizadas
    // cordasRange: string "inicio-fim" ex "4-1" (corda 4 até corda 1) - índice 0 = corda 6
    // maxNotas: número máximo de notas a retornar (as mais próximas de posInicial)
    function gerarPosicoes(tonicaSem, intervalos, posInicial = 0, cordasRange = "6-1", maxNotas = 0) {
        // Parse do range de cordas
        let [cordaIni, cordaFim] = cordasRange.split('-').map(Number);
        if (isNaN(cordaIni)) cordaIni = 6;
        if (isNaN(cordaFim)) cordaFim = 1;
        // Converter para índices 0-5 (corda 6 = índice 0, corda 1 = índice 5)
        let idxIni = 6 - cordaIni;
        let idxFim = 6 - cordaFim;
        if (idxIni < 0) idxIni = 0;
        if (idxFim > 5) idxFim = 5;
        if (idxIni > idxFim) { let temp = idxIni; idxIni = idxFim; idxFim = temp; }
        
        // Gera todas as notas da escala (semitons absolutos)
        const notasEscala = intervalos.map(intervalo => (tonicaSem + intervalo) % 12);
        
        // Percorre cordas e casas (até a casa 12) para encontrar posições
        let posicoes = [];
        for (let corda = idxIni; corda <= idxFim; corda++) {
            const trasteBase = AFINACAO[corda];
            for (let casa = 0; casa <= 12; casa++) {
                const notaSem = (trasteBase + casa) % 12;
                if (notasEscala.includes(notaSem)) {
                    const intervalo = (notaSem - tonicaSem + 12) % 12;
                    const funcao = getFuncao(intervalo);
                    posicoes.push({
                        corda: corda,           // índice 0-5 (0=corda6)
                        casa: casa,             // 0 a 12
                        nota: semitomParaNota(notaSem),
                        funcao: funcao,
                        intervalo: intervalo,
                        // Distância à posição inicial (em casas)
                        distancia: Math.abs(casa - posInicial)
                    });
                }
            }
        }
        
        // Ordenar por distância à posição inicial
        posicoes.sort((a,b) => a.distancia - b.distancia);
        
        // Limitar número máximo de notas
        if (maxNotas > 0 && posicoes.length > maxNotas) {
            posicoes = posicoes.slice(0, maxNotas);
        }
        
        // Reordenar por corda (para exibição consistente)
        posicoes.sort((a,b) => a.corda - b.corda);
        return posicoes;
    }
    
    // Desenha o diagrama no canvas estilo violão
    // Parâmetros:
    //   container: elemento onde será inserido o canvas
    //   titulo: string (ex: "C Maior")
    //   posicoes: array de {corda, casa, funcao}
    //   posInicial: número da primeira casa (para exibir o número da posição)
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
        
        // Fundo
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Parâmetros de desenho
        const startX = 28, startY = 45, stringSpacing = 18, fretSpacing = 26;
        const numFrets = 5;
        
        // Desenhar cordas (linhas verticais)
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(startX + i * stringSpacing, startY);
            ctx.lineTo(startX + i * stringSpacing, startY + numFrets * fretSpacing);
            ctx.stroke();
        }
        
        // Desenhar trastes (linhas horizontais)
        for (let i = 0; i <= numFrets; i++) {
            ctx.beginPath();
            ctx.moveTo(startX, startY + i * fretSpacing);
            ctx.lineTo(startX + 5 * stringSpacing, startY + i * fretSpacing);
            ctx.stroke();
        }
        
        // Mostrar número da posição inicial (se maior que 0)
        if (posInicial > 0) {
            ctx.font = 'bold 12px Arial';
            ctx.fillStyle = '#333';
            ctx.fillText(posInicial + 'ª', startX - 18, startY + fretSpacing / 2 + 2);
        }
        
        // Desenhar as notas
        for (const p of posicoes) {
            // p.corda: índice 0-5 (0=6ª corda)
            const x = startX + p.corda * stringSpacing;
            // p.casa: número da casa (0 = solta)
            let casaRelativa = p.casa - posInicial + 1;
            if (p.casa === 0) {
                // Corda solta: desenha círculo acima do primeiro traste
                const y = startY - 12;
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, 2 * Math.PI);
                ctx.fillStyle = FUNCAO_COR[p.funcao] || FUNCAO_COR.outros;
                ctx.fill();
                // Escreve o nome da nota
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
                // Escreve o nome da nota
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 8px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(p.nota, x, y);
            }
        }
        
        wrapper.appendChild(canvas);
        
        // Título (cifra)
        const tituloSpan = document.createElement('div');
        tituloSpan.textContent = titulo;
        tituloSpan.style.cssText = 'font-size: 14px; margin-top: 8px; color: #1a1a2e; font-weight: bold;';
        wrapper.appendChild(tituloSpan);
        
        // Legenda (opcional)
        const legenda = document.createElement('div');
        legenda.style.cssText = 'font-size: 10px; margin-top: 4px; color: #666;';
        legenda.innerHTML = '🔴 Tônica 🔵 3ª 🟢 5ª 🟠 7ª';
        wrapper.appendChild(legenda);
        
        container.appendChild(wrapper);
    }
    
    // Processa uma string de comando do tipo [Escala:...] ou [Arpejo:...]
    // Retorna um objeto com os dados necessários para desenhar, ou null se inválido.
    function processarComando(texto) {
        // Regex para capturar: [Escala:C;maior;pos=0;cordas=4-1;max=9]
        const regexEscala = /\[Escala:([^;]+);([^;]+);pos=(\d+)(?:;cordas=([\d\-]+))?(?:;max=(\d+))?\]/i;
        const regexArpejo = /\[Arpejo:([^;]+);([^;]+);pos=(\d+)(?:;cordas=([\d\-]+))?(?:;max=(\d+))?\]/i;
        
        let match;
        let tipoComando = null;
        let tonica, tipo, pos, cordas, max;
        
        if ((match = regexEscala.exec(texto))) {
            tipoComando = 'escala';
            tonica = match[1];
            tipo = match[2];
            pos = parseInt(match[3]);
            cordas = match[4] || '6-1';
            max = match[5] ? parseInt(match[5]) : 0;
        } else if ((match = regexArpejo.exec(texto))) {
            tipoComando = 'arpejo';
            tonica = match[1];
            tipo = match[2];
            pos = parseInt(match[3]);
            cordas = match[4] || '6-1';
            max = match[5] ? parseInt(match[5]) : 0;
        } else {
            return null;
        }
        
        // Validar tônica
        if (!NOTAS_MAP[tonica]) return null;
        const tonicaSem = NOTAS_MAP[tonica];
        
        let intervalos = null;
        let nomeTipo = '';
        if (tipoComando === 'escala') {
            intervalos = ESCALAS[tipo.toLowerCase()];
            nomeTipo = ESCALAS[tipo.toLowerCase()] ? tipo : 'maior';
        } else {
            intervalos = ARPEJOS[tipo.toLowerCase()];
            nomeTipo = ARPEJOS[tipo.toLowerCase()] ? tipo : 'maior';
        }
        if (!intervalos) return null;
        
        // Gerar posições
        const posicoes = gerarPosicoes(tonicaSem, intervalos, pos, cordas, max);
        if (posicoes.length === 0) return null;
        
        // Construir título
        const notasMapInv = Object.fromEntries(Object.entries(NOTAS_MAP).map(([k,v]) => [v,k]));
        const tonicaNome = notasMapInv[tonicaSem] || tonica;
        const titulo = `${tonicaNome} ${nomeTipo} ${posicoes.length} notas`;
        
        return {
            titulo: titulo,
            posicoes: posicoes,
            posInicial: pos,
            raw: texto
        };
    }
    
    // Função principal que varre o DOM e substitui os comandos pelos diagramas
    function renderizarEscalasArpejos(container = document.body) {
        const elementos = container.querySelectorAll('*');
        const textoComandos = [];
        
        // Coletar nós de texto que contenham os comandos
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
            acceptNode: function(node) {
                if (node.textContent.match(/\[(Escala|Arpejo):/)) return NodeFilter.FILTER_ACCEPT;
                return NodeFilter.FILTER_SKIP;
            }
        });
        
        const nodesToReplace = [];
        while (walker.nextNode()) {
            nodesToReplace.push(walker.currentNode);
        }
        
        for (const textNode of nodesToReplace) {
            const content = textNode.textContent;
            const regex = /\[(Escala|Arpejo):[^\]]+\]/gi;
            let lastIndex = 0;
            let fragment = document.createDocumentFragment();
            
            let match;
            while ((match = regex.exec(content)) !== null) {
                // Texto antes do comando
                if (match.index > lastIndex) {
                    fragment.appendChild(document.createTextNode(content.substring(lastIndex, match.index)));
                }
                // Processa comando
                const comando = match[0];
                const dados = processarComando(comando);
                if (dados) {
                    const containerDiv = document.createElement('div');
                    containerDiv.style.display = 'inline-block';
                    desenharDiagramaEscala(containerDiv, dados.titulo, dados.posicoes, dados.posInicial);
                    fragment.appendChild(containerDiv);
                } else {
                    // Caso inválido, manter o texto original
                    fragment.appendChild(document.createTextNode(comando));
                }
                lastIndex = match.index + comando.length;
            }
            // Texto após o último comando
            if (lastIndex < content.length) {
                fragment.appendChild(document.createTextNode(content.substring(lastIndex)));
            }
            textNode.parentNode.replaceChild(fragment, textNode);
        }
    }
    
    // Expor funções globalmente
    window.escalasArpejos = {
        renderizar: renderizarEscalasArpejos,
        processarComando: processarComando,
        gerarPosicoes: gerarPosicoes
    };
    
    // Se o DOM já estiver carregado, podemos chamar automaticamente?
    // Melhor deixar explícito, mas podemos adicionar um evento.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            renderizarEscalasArpejos();
        });
    } else {
        renderizarEscalasArpejos();
    }
})();