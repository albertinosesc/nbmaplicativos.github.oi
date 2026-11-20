// ============================================================
// MÓDULO CIFRA (cifra.js)
// ============================================================
(function () {
    const NOTAS_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const NOTAS_BEMOL = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

    const MAPA_SEMITONS = {
        'C': 0, 'B#': 0,
        'C#': 1, 'Db': 1,
        'D': 2,
        'D#': 3, 'Eb': 3,
        'E': 4, 'Fb': 4,
        'F': 5, 'E#': 5,
        'F#': 6, 'Gb': 6,
        'G': 7,
        'G#': 8, 'Ab': 8,
        'A': 9,
        'A#': 10, 'Bb': 10,
        'B': 11, 'Cb': 11
    };

    let modalState = {
        el: null,
        titleEl: null,
        bodyEl: null,
        orientBtn: null,
        expandBtn: null,
        toggleBtnRef: null,
        currentChord: 'C',
        sourceContext: null,
        orientation: 'vertical',
        expanded: false,
        savedPos: null,
        listenersAttached: false
    };

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function parseStyleList(rawList) {
        const styles = {};
        if (!rawList) return styles;

        rawList.split(',').forEach((item) => {
            const idx = item.indexOf(':');
            if (idx === -1) return;
            const prop = item.slice(0, idx).trim();
            const val = item.slice(idx + 1).trim().replace(/^["']|["']$/g, '');

            if (/^[a-zA-Z\-]+$/.test(prop) && val && !/[<>{};]/.test(val)) {
                styles[prop] = val;
            }
        });

        return styles;
    }

    function stylesToAttr(stylesObj) {
        const entries = Object.entries(stylesObj).map(([k, v]) => `${k}: ${v}`);
        return entries.length > 0 ? ` style="${entries.join('; ')}"` : '';
    }

    function cleanInlineStyle(attrStr) {
        return String(attrStr || '').replace(/^ style="|"$|^ style='|'$/g, '');
    }

    function parseCifraTagStyles(rawSegment) {
        const tagMatch = String(rawSegment || '').match(/^\[CIFRA([^\]]*)\]/i);
        const attrsStr = tagMatch ? tagMatch[1] : '';

        const tituloMatch = attrsStr.match(/titulo-style\s*=\s*(.+?)(?=\s+(?:style|letra-style|titulo-style|autor-style|compositor-style)\s*=|$)/i);
        const autorMatch = attrsStr.match(/(?:autor-style|compositor-style)\s*=\s*(.+?)(?=\s+(?:style|letra-style|titulo-style|autor-style|compositor-style)\s*=|$)/i);
        const letraMatch = attrsStr.match(/letra-style\s*=\s*(.+?)(?=\s+(?:style|letra-style|titulo-style|autor-style|compositor-style)\s*=|$)/i);
        const acordeMatch = attrsStr.match(/(?:^|\s)style\s*=\s*(.+?)(?=\s+(?:style|letra-style|titulo-style|autor-style|compositor-style)\s*=|$)/i);

        const tituloRaw = tituloMatch ? tituloMatch[1].trim().replace(/,$/, '') : '';
        const autorRaw = autorMatch ? autorMatch[1].trim().replace(/,$/, '') : '';
        const letraRaw = letraMatch ? letraMatch[1].trim().replace(/,$/, '') : '';
        const acordeRaw = acordeMatch ? acordeMatch[1].trim().replace(/,$/, '') : '';

        return {
            chordAttr: stylesToAttr(parseStyleList(acordeRaw)),
            lyricAttr: stylesToAttr(parseStyleList(letraRaw)),
            titleAttr: stylesToAttr(parseStyleList(tituloRaw)),
            authorAttr: stylesToAttr(parseStyleList(autorRaw))
        };
    }

    function extractMetadataAndBody(rawInner) {
        let text = String(rawInner || '')
            .replace(/\[\/?CIFRA[^\]]*\]/gi, '')
            .trim();

        let titulo = '';
        let autor = '';

        text = text.replace(/\[TITULO\]([\s\S]*?)(?:\[\/TITULO\]|$)/gi, (_, p1) => {
            if (!titulo) titulo = String(p1 || '').trim();
            return ' ';
        });

        text = text.replace(/\[(?:AUTOR|COMPOSITOR)\]([\s\S]*?)(?:\[\/(?:AUTOR|COMPOSITOR)\]|$)/gi, (_, p1) => {
            if (!autor) autor = String(p1 || '').trim();
            return ' ';
        });

        text = text.replace(/[ \t]{2,}/g, ' ').trim();

        let lines = text.split(/\r?\n/);
        while (lines.length > 0 && !lines[0].trim()) {
            lines.shift();
        }

        let consumed = 0;
        while (consumed < lines.length && consumed < 2) {
            const lineTrim = lines[consumed].trim();
            if (!titulo && /^titulo\s*:/i.test(lineTrim)) {
                titulo = lineTrim.replace(/^titulo\s*:/i, '').trim();
                consumed++;
            } else if (!autor && /^(?:autor|compositor)\s*:/i.test(lineTrim)) {
                autor = lineTrim.replace(/^(?:autor|compositor)\s*:/i, '').trim();
                consumed++;
            } else {
                break;
            }
        }

        text = (consumed > 0 ? lines.slice(consumed) : lines).join('\n').trim();

        return { titulo, autor, bodyText: text };
    }

    function transporNota(notaStr, semitons, usarBemol = false) {
        const match = String(notaStr || '').trim().match(/^([A-Ga-g])([#b]?)$/);
        if (!match) return notaStr;

        const letra = match[1].toUpperCase();
        const acidente = match[2] || '';
        const chave = `${letra}${acidente}`;
        const baseIdx = MAPA_SEMITONS[chave];
        if (baseIdx === undefined) return notaStr;

        const novoIdx = (((baseIdx + semitons) % 12) + 12) % 12;
        const preferirBemol = acidente === 'b' || (usarBemol && acidente !== '#');
        const escala = preferirBemol ? NOTAS_BEMOL : NOTAS_SHARP;

        return escala[novoIdx];
    }

    function transporAcordeTexto(acordeTexto, semitons) {
        if (!semitons) return acordeTexto;

        const preferirBemol = semitons < 0;
        const partes = String(acordeTexto).split('/');

        return partes.map((parte) => {
            const trimmed = parte.trim();
            if (!trimmed) return parte;

            const m = trimmed.match(/^([A-Ga-g][#b]?)(.*)$/);
            if (!m) return parte;

            const novaNota = transporNota(m[1], semitons, preferirBemol);
            return `${novaNota}${m[2]}`;
        }).join('/');
    }

    function extrairAcordesDaCifra(textoBruto) {
        const { bodyText } = extractMetadataAndBody(textoBruto);
        const acordes = [];
        const vistos = new Set();
        const regex = /\[([^\]]+)\]/g;
        let match;

        while ((match = regex.exec(bodyText || '')) !== null) {
            const limpo = String(match[1] || '').trim();
            if (!limpo || /^(?:\/?TITULO|\/?AUTOR|\/?COMPOSITOR|\/?CIFRA)$/i.test(limpo)) continue;
            if (!vistos.has(limpo)) {
                vistos.add(limpo);
                acordes.push(limpo);
            }
        }

        return acordes;
    }

    function formatChordLine(line, chordAttr, lyricAttr) {
        if (!line.trim()) {
            return '<div class="cifra-break"></div>';
        }

        const tokens = [];
        const regex = /\[([^\]]+)\]([^\[]*)/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(line)) !== null) {
            if (match.index > lastIndex) {
                const prefix = line.slice(lastIndex, match.index);
                tokens.push(
                    `<span class="lyric no-chord"><span class="lyric-text"${lyricAttr}>${escapeHtml(prefix)}</span></span>`
                );
            }

            const chord = match[1].trim();
            const lyricPart = match[2] || '';

            if (/^(?:\/?TITULO|\/?AUTOR|\/?COMPOSITOR|\/?CIFRA)$/i.test(chord)) {
                tokens.push(
                    `<span class="lyric no-chord"><span class="lyric-text"${lyricAttr}>${escapeHtml(lyricPart)}</span></span>`
                );
            } else {
                tokens.push(
                    `<span class="lyric">` +
                        `<span class="chord"${chordAttr} data-original-chord="${escapeHtml(chord)}">${escapeHtml(chord)}</span>` +
                        `<span class="lyric-text"${lyricAttr}>${escapeHtml(lyricPart)}</span>` +
                    `</span>`
                );
            }

            lastIndex = match.index + match[0].length;
        }

        if (tokens.length === 0) {
            return `<div class="cifra-plain-line"${lyricAttr}>${escapeHtml(line)}</div>`;
        }

        if (lastIndex < line.length) {
            const tail = line.slice(lastIndex);
            tokens.push(
                `<span class="lyric no-chord"><span class="lyric-text"${lyricAttr}>${escapeHtml(tail)}</span></span>`
            );
        }

        return `<div class="cifra-line">${tokens.join('')}</div>`;
    }

    function aplicarTamanhoEPosicaoModal(modal, expanded, orientacao = 'vertical') {
        if (!modal) return;
        modal.style.boxSizing = 'border-box';
        modal.style.maxHeight = expanded ? '92vh' : '85vh';
        modal.style.overflow = 'hidden';

        if (expanded) {
            if (!modalState.savedPos) {
                modalState.savedPos = {
                    left: modal.style.left || '24px',
                    top: modal.style.top || '90px'
                };
            }
            modal.style.left = '2.5vw';
            modal.style.top = '4vh';
            modal.style.width = '95vw';
            modal.style.maxWidth = '95vw';
        } else {
            const pos = modalState.savedPos || { left: '24px', top: '90px' };
            modalState.savedPos = null;
            modal.style.left = pos.left;
            modal.style.top = pos.top;
            if (orientacao === 'horizontal') {
                modal.style.width = 'min(92vw, 760px)';
                modal.style.maxWidth = 'min(92vw, 760px)';
            } else {
                modal.style.width = 'auto';
                modal.style.maxWidth = '340px';
            }
        }
    }

    function aplicarOrientacaoBody(bodyEl, orientacao, expanded = false) {
        if (!bodyEl) return;
        bodyEl.style.boxSizing = 'border-box';
        bodyEl.style.display = 'flex';
        bodyEl.style.maxHeight = expanded ? 'calc(92vh - 46px)' : 'calc(85vh - 46px)';
        bodyEl.style.padding = '10px';
        bodyEl.style.gap = '10px';
        bodyEl.style.webkitOverflowScrolling = 'touch';
        bodyEl.style.width = '100%';

        if (expanded) {
            bodyEl.style.overflowX = 'hidden';
            bodyEl.style.overflowY = 'auto';
            bodyEl.style.flexDirection = 'row';
            bodyEl.style.flexWrap = 'wrap';
            bodyEl.style.alignItems = 'flex-start';
            bodyEl.style.justifyContent = 'flex-start';
            bodyEl.style.maxWidth = '95vw';
        } else if (orientacao === 'horizontal') {
            bodyEl.style.overflowX = 'auto';
            bodyEl.style.overflowY = 'auto';
            bodyEl.style.flexDirection = 'row';
            bodyEl.style.flexWrap = 'nowrap';
            bodyEl.style.alignItems = 'flex-start';
            bodyEl.style.justifyContent = 'flex-start';
            bodyEl.style.maxWidth = 'min(92vw, 760px)';
        } else {
            bodyEl.style.overflowX = 'auto';
            bodyEl.style.overflowY = 'auto';
            bodyEl.style.flexDirection = 'column';
            bodyEl.style.flexWrap = 'nowrap';
            bodyEl.style.alignItems = 'center';
            bodyEl.style.justifyContent = 'flex-start';
            bodyEl.style.maxWidth = '340px';
        }
    }

    function criarElementoVisualAcorde(chordExibido, varItemBase = null) {
        if (window.ViolaoModule && typeof window.ViolaoModule.resolverVariacoesAcorde === 'function' && typeof window.ViolaoModule.criarCanvasAcorde === 'function') {
            try {
                const vars = window.ViolaoModule.resolverVariacoesAcorde(chordExibido) || [];
                const escolhida = varItemBase
                    ? { ...varItemBase, nome: chordExibido, acorde: chordExibido }
                    : (vars[0] || { nome: chordExibido, acorde: chordExibido });
                const canvas = window.ViolaoModule.criarCanvasAcorde(escolhida);
                if (canvas instanceof Node) {
                    canvas.style.maxWidth = '100%';
                    canvas.style.height = 'auto';
                    canvas.style.display = 'block';
                    canvas.style.margin = '0 auto';
                    return canvas;
                }
            } catch (_) {}
        }

        if (window.ViolaoModule && typeof window.ViolaoModule.render === 'function') {
            try {
                const node = window.ViolaoModule.render(chordExibido);
                if (node instanceof Node) return node;
            } catch (_) {}
        }

        const fallback = document.createElement('div');
        fallback.className = 'cifra-modal-fallback';
        fallback.style.fontWeight = '700';
        fallback.style.padding = '8px 4px';
        fallback.textContent = chordExibido;
        return fallback;
    }

    function renderDiagramaNoContainer(chordNome, targetContainer, orientacao = 'vertical', expanded = false, sourceContext = null) {
        if (!targetContainer) return;
        targetContainer.replaceChildren();
        aplicarOrientacaoBody(targetContainer, orientacao, expanded);

        const semitons = sourceContext && typeof sourceContext.getSemitons === 'function'
            ? sourceContext.getSemitons()
            : 0;
        const acordeTransposto = transporAcordeTexto(chordNome, semitons);

        if (window.ViolaoModule && typeof window.ViolaoModule.resolverVariacoesAcorde === 'function' && typeof window.ViolaoModule.criarCanvasAcorde === 'function') {
            try {
                const variacoes = window.ViolaoModule.resolverVariacoesAcorde(acordeTransposto) || [];
                if (variacoes.length > 0) {
                    variacoes.forEach((varItem, idx) => {
                        const itemBox = document.createElement('div');
                        itemBox.className = 'cifra-modal-var-item';
                        itemBox.style.boxSizing = 'border-box';
                        itemBox.style.border = idx === 0 ? '2px solid #f59e0b' : '1px solid #cbd5e1';
                        itemBox.style.borderRadius = '8px';
                        itemBox.style.padding = '8px';
                        itemBox.style.background = '#ffffff';
                        itemBox.style.textAlign = 'center';
                        itemBox.style.flexShrink = '0';
                        itemBox.style.minWidth = '164px';
                        itemBox.style.width = (expanded || orientacao === 'horizontal') ? '180px' : 'auto';

                        const canvas = window.ViolaoModule.criarCanvasAcorde(varItem);
                        if (canvas instanceof Node) {
                            canvas.style.maxWidth = '100%';
                            canvas.style.height = 'auto';
                            canvas.style.display = 'block';
                            canvas.style.margin = '0 auto';
                            itemBox.appendChild(canvas);
                        }

                        if (varItem && varItem.descricao) {
                            const desc = document.createElement('div');
                            desc.textContent = varItem.descricao;
                            desc.style.fontSize = '11px';
                            desc.style.color = '#475569';
                            desc.style.marginTop = '4px';
                            itemBox.appendChild(desc);
                        }

                        const btnPref = document.createElement('button');
                        btnPref.type = 'button';
                        const ehPreferida = Boolean(varItem && varItem.preferida);
                        btnPref.textContent = ehPreferida ? '★ Preferência' : '☆ Preferência';
                        btnPref.title = 'Definir preferência e enviar este acorde para o modal da música';
                        btnPref.style.marginTop = '6px';
                        btnPref.style.cursor = 'pointer';
                        btnPref.style.fontSize = '11px';
                        btnPref.style.padding = '3px 8px';
                        btnPref.style.borderRadius = '4px';
                        btnPref.style.border = ehPreferida ? '1px solid #f59e0b' : '1px solid #cbd5e1';
                        btnPref.style.background = ehPreferida ? '#fef3c7' : '#f8fafc';
                        btnPref.style.color = ehPreferida ? '#92400e' : '#1e293b';

                        btnPref.addEventListener('click', (ev) => {
                            ev.stopPropagation();
                            try {
                                if (typeof window.ViolaoModule.definirPreferenciaAcorde === 'function' && varItem && varItem.id !== undefined) {
                                    window.ViolaoModule.definirPreferenciaAcorde(acordeTransposto, varItem.id);
                                }
                            } catch (_) {}

                            const ctx = modalState.sourceContext || sourceContext;
                            const semAtual = ctx && typeof ctx.getSemitons === 'function' ? ctx.getSemitons() : 0;
                            const acordeOriginalParaMusica = semAtual !== 0
                                ? transporAcordeTexto(acordeTransposto, -semAtual)
                                : chordNome;

                            if (ctx && typeof ctx.addChordToLocalModal === 'function') {
                                ctx.addChordToLocalModal(acordeOriginalParaMusica, varItem, true);
                            }

                            targetContainer.querySelectorAll('.cifra-modal-var-item button').forEach((b) => {
                                b.textContent = '☆ Preferência';
                                b.style.border = '1px solid #cbd5e1';
                                b.style.background = '#f8fafc';
                                b.style.color = '#1e293b';
                            });
                            btnPref.textContent = '★ Preferência';
                            btnPref.style.border = '1px solid #f59e0b';
                            btnPref.style.background = '#fef3c7';
                            btnPref.style.color = '#92400e';
                        });

                        itemBox.appendChild(btnPref);
                        targetContainer.appendChild(itemBox);
                    });

                    targetContainer.scrollTop = 0;
                    targetContainer.scrollLeft = 0;
                    return;
                }
            } catch (_) {}
        }

        const node = criarElementoVisualAcorde(acordeTransposto);
        targetContainer.appendChild(node);
        targetContainer.scrollTop = 0;
        targetContainer.scrollLeft = 0;
    }

    function atualizarBotaoOrientacao(btnEl, orientacao) {
        if (!btnEl) return;
        btnEl.textContent = orientacao === 'horizontal' ? '↔ Horizontal' : '↕ Vertical';
        btnEl.title = orientacao === 'horizontal'
            ? 'Alternar para disposição vertical'
            : 'Alternar para disposição horizontal';
    }

    function atualizarBotaoExpandir(btnEl, expanded) {
        if (!btnEl) return;
        btnEl.textContent = expanded ? '↙ Reduzir' : '⛶ Expandir';
        btnEl.title = expanded ? 'Voltar ao tamanho normal do modal' : 'Expandir o modal para ver mais acordes';
    }

    function garantirModalAcorde() {
        const existente = document.getElementById('cifra-chord-modal');
        if (existente && modalState.el === existente && document.body.contains(existente)) {
            return modalState;
        }

        if (existente) {
            existente.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'cifra-chord-modal';
        modal.className = 'cifra-chord-modal';
        modal.style.display = 'none';
        modal.style.left = '24px';
        modal.style.top = '90px';

        const header = document.createElement('div');
        header.className = 'cifra-chord-modal-header';
        header.title = 'Arraste para mover o modal';
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        header.style.justifyContent = 'space-between';
        header.style.gap = '6px';
        header.style.flexWrap = 'wrap';
        header.style.boxSizing = 'border-box';

        const titleEl = document.createElement('span');
        titleEl.className = 'cifra-chord-modal-title';
        titleEl.textContent = '🎸 Acorde';

        const rightActions = document.createElement('div');
        rightActions.style.display = 'flex';
        rightActions.style.alignItems = 'center';
        rightActions.style.gap = '5px';

        const btnOrient = document.createElement('button');
        btnOrient.type = 'button';
        btnOrient.className = 'cifra-chord-modal-orient';
        btnOrient.style.cursor = 'pointer';
        btnOrient.style.fontSize = '11px';
        btnOrient.style.padding = '3px 7px';
        btnOrient.style.borderRadius = '4px';
        btnOrient.style.border = '1px solid #cbd5e1';
        btnOrient.style.background = '#ffffff';
        btnOrient.style.color = '#1e293b';
        atualizarBotaoOrientacao(btnOrient, modalState.orientation);

        btnOrient.onclick = (e) => {
            e.stopPropagation();
            modalState.orientation = modalState.orientation === 'vertical' ? 'horizontal' : 'vertical';
            atualizarBotaoOrientacao(btnOrient, modalState.orientation);
            aplicarTamanhoEPosicaoModal(modal, modalState.expanded, modalState.orientation);
            renderDiagramaNoContainer(
                modalState.currentChord,
                bodyEl,
                modalState.orientation,
                modalState.expanded,
                modalState.sourceContext
            );
        };

        const btnExpand = document.createElement('button');
        btnExpand.type = 'button';
        btnExpand.className = 'cifra-chord-modal-expand';
        btnExpand.style.cursor = 'pointer';
        btnExpand.style.fontSize = '11px';
        btnExpand.style.padding = '3px 7px';
        btnExpand.style.borderRadius = '4px';
        btnExpand.style.border = '1px solid #cbd5e1';
        btnExpand.style.background = '#ffffff';
        btnExpand.style.color = '#1e293b';
        atualizarBotaoExpandir(btnExpand, modalState.expanded);

        btnExpand.onclick = (e) => {
            e.stopPropagation();
            modalState.expanded = !modalState.expanded;
            atualizarBotaoExpandir(btnExpand, modalState.expanded);
            aplicarTamanhoEPosicaoModal(modal, modalState.expanded, modalState.orientation);
            renderDiagramaNoContainer(
                modalState.currentChord,
                bodyEl,
                modalState.orientation,
                modalState.expanded,
                modalState.sourceContext
            );
        };

        const btnClose = document.createElement('button');
        btnClose.type = 'button';
        btnClose.className = 'cifra-chord-modal-close';
        btnClose.title = 'Fechar';
        btnClose.textContent = '✕';
        btnClose.onclick = () => fecharModalAcorde();

        rightActions.appendChild(btnOrient);
        rightActions.appendChild(btnExpand);
        rightActions.appendChild(btnClose);
        header.appendChild(titleEl);
        header.appendChild(rightActions);

        const bodyEl = document.createElement('div');
        bodyEl.className = 'cifra-chord-modal-body';
        aplicarOrientacaoBody(bodyEl, modalState.orientation, modalState.expanded);

        modal.appendChild(header);
        modal.appendChild(bodyEl);
        document.body.appendChild(modal);

        let dragging = false;
        let offsetX = 0;
        let offsetY = 0;

        const iniciarArraste = (clientX, clientY, target) => {
            if (modalState.expanded) return;
            if (
                target === btnClose || btnClose.contains(target) ||
                target === btnOrient || btnOrient.contains(target) ||
                target === btnExpand || btnExpand.contains(target)
            ) return;
            dragging = true;
            const rect = modal.getBoundingClientRect();
            offsetX = clientX - rect.left;
            offsetY = clientY - rect.top;
            modal.classList.add('dragging');
        };

        const moverArraste = (clientX, clientY) => {
            if (!dragging || !modalState.el) return;
            const maxX = Math.max(8, window.innerWidth - modalState.el.offsetWidth - 8);
            const maxY = Math.max(8, window.innerHeight - modalState.el.offsetHeight - 8);
            const novaLeft = Math.min(Math.max(8, clientX - offsetX), maxX);
            const novaTop = Math.min(Math.max(8, clientY - offsetY), maxY);
            modalState.el.style.left = `${Math.round(novaLeft)}px`;
            modalState.el.style.top = `${Math.round(novaTop)}px`;
        };

        const encerrarArraste = () => {
            if (!dragging) return;
            dragging = false;
            if (modalState.el) modalState.el.classList.remove('dragging');
        };

        header.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            iniciarArraste(e.clientX, e.clientY, e.target);
        });

        header.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            if (!touch) return;
            iniciarArraste(touch.clientX, touch.clientY, e.target);
        }, { passive: true });

        if (!modalState.listenersAttached) {
            window.addEventListener('mousemove', (e) => moverArraste(e.clientX, e.clientY));
            window.addEventListener('mouseup', encerrarArraste);
            window.addEventListener('touchmove', (e) => {
                const touch = e.touches[0];
                if (!touch) return;
                moverArraste(touch.clientX, touch.clientY);
            }, { passive: true });
            window.addEventListener('touchend', encerrarArraste);
            modalState.listenersAttached = true;
        }

        modalState.el = modal;
        modalState.titleEl = titleEl;
        modalState.bodyEl = bodyEl;
        modalState.orientBtn = btnOrient;
        modalState.expandBtn = btnExpand;
        return modalState;
    }

    function abrirOuAtualizarModalAcorde(chordNome, toggleBtn = null, sourceContext = null) {
        const limpo = String(chordNome || '').replace(/^"+|"+$/g, '').trim();
        if (!limpo) return;

        const state = garantirModalAcorde();
        state.currentChord = limpo;
        if (sourceContext) {
            state.sourceContext = sourceContext;
        }
        if (state.toggleBtnRef && state.toggleBtnRef !== toggleBtn) {
            state.toggleBtnRef.classList.remove('active');
        }
        state.toggleBtnRef = toggleBtn;

        const semAtual = state.sourceContext && typeof state.sourceContext.getSemitons === 'function'
            ? state.sourceContext.getSemitons()
            : 0;
        const tituloAcorde = transporAcordeTexto(limpo, semAtual);

        state.titleEl.textContent = `🎸 Acorde: ${tituloAcorde}`;
        atualizarBotaoOrientacao(state.orientBtn, state.orientation);
        atualizarBotaoExpandir(state.expandBtn, state.expanded);
        aplicarTamanhoEPosicaoModal(state.el, state.expanded, state.orientation);
        renderDiagramaNoContainer(limpo, state.bodyEl, state.orientation, state.expanded, state.sourceContext);
        state.el.style.display = 'block';
        if (toggleBtn) toggleBtn.classList.add('active');
    }

    function fecharModalAcorde() {
        if (!modalState.el) return;
        modalState.el.style.display = 'none';
        if (modalState.toggleBtnRef) {
            modalState.toggleBtnRef.classList.remove('active');
        }
    }

    function alternarModalAcorde(contentDiv, toggleBtn, sourceContext = null) {
        const state = garantirModalAcorde();
        const estaVisivel = state.el.style.display !== 'none';

        if (estaVisivel && state.toggleBtnRef === toggleBtn) {
            fecharModalAcorde();
            return;
        }

        const primeiroChord = contentDiv ? contentDiv.querySelector('.chord') : null;
        const acordeInicial = primeiroChord
            ? (primeiroChord.getAttribute('data-original-chord') || primeiroChord.textContent.trim())
            : 'C';
        abrirOuAtualizarModalAcorde(acordeInicial || 'C', toggleBtn, sourceContext);
    }

    function criarBarraTranspose(contentDiv, getSemitons, setSemitons, onTransposeChange, sourceContext, onToggleLocalModal) {
        const bar = document.createElement('div');
        bar.className = 'cifra-transpose-bar';

        const btnDown = document.createElement('button');
        btnDown.type = 'button';
        btnDown.className = 'cifra-transpose-btn';
        btnDown.title = 'Baixar 1 semitom';
        btnDown.textContent = '‹ -1';

        const statusSpan = document.createElement('span');
        statusSpan.className = 'cifra-transpose-status';
        statusSpan.textContent = 'Tom: 0';

        const btnUp = document.createElement('button');
        btnUp.type = 'button';
        btnUp.className = 'cifra-transpose-btn';
        btnUp.title = 'Subir 1 semitom';
        btnUp.textContent = '+1 ›';

        const btnReset = document.createElement('button');
        btnReset.type = 'button';
        btnReset.className = 'cifra-transpose-btn cifra-transpose-reset';
        btnReset.title = 'Voltar ao tom original';
        btnReset.textContent = 'Original';
        btnReset.style.display = 'none';

        const btnModal = document.createElement('button');
        btnModal.type = 'button';
        btnModal.className = 'cifra-transpose-btn cifra-modal-toggle';
        btnModal.title = 'Abrir ou fechar janela flutuante do acorde';
        btnModal.textContent = 'Diagrama';
        btnModal.onclick = () => alternarModalAcorde(contentDiv, btnModal, sourceContext);

        const btnLocalModal = document.createElement('button');
        btnLocalModal.type = 'button';
        btnLocalModal.className = 'cifra-transpose-btn cifra-local-modal-toggle';
        btnLocalModal.title = 'Abrir ou fechar modal com os acordes desta música';
        btnLocalModal.textContent = 'Acordes da música';
        btnLocalModal.onclick = () => {
            if (typeof onToggleLocalModal === 'function') {
                onToggleLocalModal(btnLocalModal);
            }
        };

        const aplicar = (novoSemitons) => {
            setSemitons(novoSemitons);

            contentDiv.querySelectorAll('.chord[data-original-chord]').forEach((chordEl) => {
                const original = chordEl.getAttribute('data-original-chord') || '';
                chordEl.textContent = transporAcordeTexto(original, novoSemitons);
            });

            if (novoSemitons === 0) {
                statusSpan.textContent = 'Tom: 0';
                btnReset.style.display = 'none';
            } else {
                const sinal = novoSemitons > 0 ? `+${novoSemitons}` : `${novoSemitons}`;
                statusSpan.textContent = `Tom: ${sinal}`;
                btnReset.style.display = 'inline-block';
            }

            if (typeof onTransposeChange === 'function') {
                onTransposeChange(novoSemitons);
            }
        };

        btnDown.onclick = () => aplicar(getSemitons() - 1);
        btnUp.onclick = () => aplicar(getSemitons() + 1);
        btnReset.onclick = () => aplicar(0);

        bar.appendChild(btnDown);
        bar.appendChild(statusSpan);
        bar.appendChild(btnUp);
        bar.appendChild(btnReset);
        bar.appendChild(btnModal);
        bar.appendChild(btnLocalModal);

        return { bar, btnModal, btnLocalModal };
    }

    function parecerLinhaDeAcordes(linha) {
        const limpa = String(linha || '').trim();
        if (!limpa) return false;

        if (/^(titulo|autor|compositor|tom|capotraste|ritmo|intro|verso|refrao|refrão|ponte)\s*:/i.test(limpa)) {
            return false;
        }

        const tokens = limpa.split(/\s+/).filter(Boolean);
        if (tokens.length === 0) return false;

        const regexAcorde = /^[A-G][#b]?(?:m|maj|min|dim|aug|m7M|7M|add\d*|sus\d*|\d)*(?:\([^)]*\))?(?:\/[A-G][#b]?)?$/;
        let acordesValidos = 0;

        for (const tk of tokens) {
            const semBarra = tk.replace(/^[|(]+|[|)]+$/g, '');
            if (regexAcorde.test(semBarra)) {
                acordesValidos++;
            } else if (!/^[|\-–—]+$/.test(tk)) {
                return false;
            }
        }

        return acordesValidos > 0;
    }

    function extrairAcordesComColuna(linhaAcordes) {
        const acordes = [];
        const regex = /\S+/g;
        let match;

        while ((match = regex.exec(linhaAcordes)) !== null) {
            const token = match[0];
            if (/^[|\-–—]+$/.test(token)) continue;
            const limpo = token.replace(/^[|(]+|[|)]+$/g, '');
            if (!limpo) continue;

            acordes.push({
                chord: limpo,
                col: match.index
            });
        }

        return acordes;
    }

    function mesclarAcordesNaLetra(linhaAcordes, linhaLetra) {
        const acordes = extrairAcordesComColuna(linhaAcordes);
        const letraBase = String(linhaLetra || '');

        if (acordes.length === 0) {
            return letraBase.trimEnd();
        }

        if (!letraBase.trim()) {
            return acordes.map(a => `[${a.chord}]`).join(' ');
        }

        const lenAcordes = Math.max(
            linhaAcordes.length,
            acordes[acordes.length - 1].col + acordes[acordes.length - 1].chord.length
        );
        const lenLetra = letraBase.length;

        const insercoes = acordes.map((item) => {
            let idx;
            if (lenAcordes <= 1 || lenLetra <= 1) {
                idx = Math.min(item.col, lenLetra);
            } else {
                const proporcao = item.col / Math.max(1, lenAcordes - 1);
                const posProporcional = Math.round(proporcao * Math.max(0, lenLetra - 1));
                idx = item.col <= lenLetra ? item.col : posProporcional;
            }
            return {
                chord: item.chord,
                idx: Math.max(0, Math.min(idx, lenLetra))
            };
        });

        insercoes.sort((a, b) => b.idx - a.idx);

        let resultado = letraBase;
        for (const ins of insercoes) {
            resultado = resultado.slice(0, ins.idx) + `[${ins.chord}]` + resultado.slice(ins.idx);
        }

        return resultado.trim();
    }

    function converterCifraTradicionalParaTag(textoBruto) {
        const raw = String(textoBruto || '').replace(/\u200B/g, '').trim();
        if (!raw) return '';

        if (/^\[CIFRA[^\]]*\]/i.test(raw)) {
            return raw;
        }

        const linhas = raw.split(/\r?\n/);
        const saida = [];
        let i = 0;

        while (i < linhas.length) {
            const atual = linhas[i];
            const proxima = i + 1 < linhas.length ? linhas[i + 1] : null;

            if (parecerLinhaDeAcordes(atual)) {
                if (proxima !== null && proxima.trim() !== '' && !parecerLinhaDeAcordes(proxima)) {
                    saida.push(mesclarAcordesNaLetra(atual, proxima));
                    i += 2;
                    continue;
                } else {
                    const acordesSoltos = extrairAcordesComColuna(atual).map(a => `[${a.chord}]`).join(' ');
                    if (acordesSoltos) saida.push(acordesSoltos);
                    i += 1;
                    continue;
                }
            }

            saida.push(atual.trim());
            i += 1;
        }

        return `[CIFRA]\n${saida.join('\n').trim()}\n[/CIFRA]`;
    }

    function criarEditorCifraMinimizado(initialRawCode, onApply, onPreview) {
        const wrap = document.createElement('div');
        wrap.className = 'cifra-editor-minimized-wrap';

        const box = document.createElement('div');
        box.className = 'cifra-editor-box';
        box.style.display = 'none';
        box.style.marginTop = '8px';

        const textarea = document.createElement('textarea');
        textarea.className = 'cifra-inline-textarea';
        textarea.rows = 9;
        textarea.value = initialRawCode;
        textarea.style.width = '100%';
        textarea.style.fontFamily = 'monospace';

        textarea.addEventListener('input', () => {
            if (typeof onPreview === 'function') {
                onPreview(textarea.value);
            }
        });

        const actions = document.createElement('div');
        actions.className = 'cifra-editor-actions';
        actions.style.display = 'flex';
        actions.style.flexWrap = 'wrap';
        actions.style.gap = '8px';
        actions.style.marginTop = '6px';

        const btnApply = document.createElement('button');
        btnApply.type = 'button';
        btnApply.className = 'btn-apply-cifra';
        btnApply.textContent = '✓ Aplicar na cifra';

        const btnConvert = document.createElement('button');
        btnConvert.type = 'button';
        btnConvert.className = 'btn-convert-cifra';
        btnConvert.textContent = '🔄 Converter';
        btnConvert.title = 'Converte cifra tradicional (acordes em cima) para [ACORDE] na letra';
        btnConvert.onclick = () => {
            const start = typeof textarea.selectionStart === 'number' ? textarea.selectionStart : 0;
            const end = typeof textarea.selectionEnd === 'number' ? textarea.selectionEnd : 0;
            const atual = textarea.value || '';

            const limparEnvoltorio = (str) =>
                converterCifraTradicionalParaTag(str)
                    .replace(/^\[CIFRA[^\]]*\]\s*/i, '')
                    .replace(/\s*\[\/CIFRA\]$/i, '');

            if (end > start) {
                const trecho = atual.slice(start, end);
                const convertido = limparEnvoltorio(trecho);
                textarea.value = atual.slice(0, start) + convertido + atual.slice(end);
                textarea.focus();
                textarea.setSelectionRange(start, start + convertido.length);
            } else {
                textarea.value = limparEnvoltorio(atual);
                textarea.focus();
            }
            if (typeof onPreview === 'function') {
                onPreview(textarea.value);
            }
        };

        const btnMinimize = document.createElement('button');
        btnMinimize.type = 'button';
        btnMinimize.className = 'btn-minimize-cifra';
        btnMinimize.textContent = '— Minimizar';

        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'btn-edit cifra-edit-toggle';
        toggleBtn.textContent = '✏️ Editar';
        toggleBtn.title = 'Abrir ou minimizar o editor da cifra';
        toggleBtn.setAttribute('aria-expanded', 'false');

        const setMinimized = (minimized) => {
            box.style.display = minimized ? 'none' : 'block';
            toggleBtn.setAttribute('aria-expanded', String(!minimized));
            toggleBtn.innerHTML = minimized ? '✏️ Editar' : '— Minimizar';
            if (!minimized) {
                textarea.focus();
            }
        };

        toggleBtn.onclick = () => {
            const estaMinimizado = box.style.display === 'none';
            setMinimized(!estaMinimizado);
        };

        btnMinimize.onclick = () => setMinimized(true);

        btnApply.onclick = () => {
            if (typeof onApply === 'function') {
                onApply(textarea.value);
            }
        };

        actions.appendChild(btnApply);
        actions.appendChild(btnConvert);
        actions.appendChild(btnMinimize);
        box.appendChild(textarea);
        box.appendChild(actions);
        wrap.appendChild(box);

        return {
            toggleBtn,
            editorWrap: wrap,
            setCode(novoRaw) {
                if (textarea.value !== novoRaw) {
                    textarea.value = novoRaw;
                }
            }
        };
    }

    window.abrirModalViolaoPorCifra = function (cifraBruta, triggerEl = null) {
        abrirOuAtualizarModalAcorde(cifraBruta, null, null);
    };

    window.converterCifraTradicionalParaTag = converterCifraTradicionalParaTag;

    window.CifraModule = {
        render(rawInner, fullMatch = '') {
            const { chordAttr, lyricAttr, titleAttr, authorAttr } = parseCifraTagStyles(fullMatch);

            const box = document.createElement('div');
            box.className = 'cifra-block';

            const header = document.createElement('div');
            header.className = 'cifra-header';

            const label = document.createElement('span');
            label.className = 'cifra-label';
            label.textContent = '🎸 Cifra';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'cifra-content';

            let semitonsAtual = 0;
            let tituloAtualMusica = '';
            let btnModalRef = null;
            let editorApi = null;

            const extensaoAcordes = window.CifraAcordesMusica
                ? window.CifraAcordesMusica.registrar(box, {
                    getSemitons: () => semitonsAtual,
                    getTitulo: () => tituloAtualMusica,
                    transpor: transporAcordeTexto,
                    criarVisual: criarElementoVisualAcorde,
                    abrirDiagrama: abrirOuAtualizarModalAcorde
                })
                : null;

            const sourceContext = extensaoAcordes ? extensaoAcordes.contexto : {
                getSemitons: () => semitonsAtual,
                addChordToLocalModal: null
            };

            const renderizarConteudo = (textoBruto, syncEditor = true, resetTranspose = true) => {
                const { titulo, autor, bodyText } = extractMetadataAndBody(textoBruto);
                tituloAtualMusica = titulo || '';
                const lines = bodyText ? bodyText.split(/\r?\n/) : [];
                const htmlLines = lines.map((line) => formatChordLine(line, chordAttr, lyricAttr));

                if (resetTranspose) {
                    semitonsAtual = 0;
                }

                contentDiv.replaceChildren();

                if (titulo || autor) {
                    const metaHeader = document.createElement('div');
                    metaHeader.className = 'cifra-meta-header';
                    metaHeader.style.cssText = 'margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid rgba(148, 163, 184, 0.28);';

                    if (titulo) {
                        const titleEl = document.createElement('div');
                        titleEl.className = 'cifra-title';
                        titleEl.style.cssText = 'font-size: 1.25rem; font-weight: 700; line-height: 1.25; letter-spacing: -0.01em;';
                        const customTitle = cleanInlineStyle(titleAttr);
                        if (customTitle) {
                            titleEl.setAttribute('style', `${titleEl.getAttribute('style')}; ${customTitle}`);
                        }
                        titleEl.textContent = titulo;
                        metaHeader.appendChild(titleEl);
                    }

                    if (autor) {
                        const authorEl = document.createElement('div');
                        authorEl.className = 'cifra-author';
                        authorEl.style.cssText = `margin-top: ${titulo ? '3px' : '0'}; font-size: 0.9rem; font-style: italic; opacity: 0.82;`;
                        const customAuthor = cleanInlineStyle(authorAttr);
                        if (customAuthor) {
                            authorEl.setAttribute('style', `${authorEl.getAttribute('style')}; ${customAuthor}`);
                        }
                        authorEl.textContent = `Compositor: ${autor}`;
                        metaHeader.appendChild(authorEl);
                    }

                    contentDiv.appendChild(metaHeader);
                }

                const temp = document.createElement('div');
                temp.innerHTML = htmlLines.join('');
                while (temp.firstChild) {
                    contentDiv.appendChild(temp.firstChild);
                }

                if (extensaoAcordes) {
                    extensaoAcordes.definirDaMusica(extrairAcordesDaCifra(textoBruto));
                }

                contentDiv.querySelectorAll('.chord').forEach((chordEl) => {
                    const original = chordEl.getAttribute('data-original-chord') || chordEl.textContent.trim();
                    if (semitonsAtual !== 0) {
                        chordEl.textContent = transporAcordeTexto(original, semitonsAtual);
                    }
                    chordEl.classList.add('chord-clickable');
                    chordEl.title = 'Clique para ver o diagrama do acorde';
                    chordEl.onclick = (e) => {
                        e.stopPropagation();
                        const acordeOriginal = chordEl.getAttribute('data-original-chord') || chordEl.textContent.trim();
                        if (acordeOriginal) {
                            abrirOuAtualizarModalAcorde(acordeOriginal, btnModalRef, sourceContext);
                        }
                    };
                });

                if (syncEditor && editorApi) {
                    editorApi.setCode(textoBruto);
                }
            };

            editorApi = criarEditorCifraMinimizado(
                String(rawInner || '').trim(),
                (novoTexto) => renderizarConteudo(novoTexto, true, true),
                (textoDigitado) => renderizarConteudo(textoDigitado, false, false)
            );

            header.appendChild(label);
            header.appendChild(editorApi.toggleBtn);
            box.appendChild(header);

            const { bar: transposeBar, btnModal } = criarBarraTranspose(
                contentDiv,
                () => semitonsAtual,
                (val) => { semitonsAtual = val; },
                () => {
                    if (extensaoAcordes) {
                        extensaoAcordes.atualizarTransposicao();
                    }
                    if (modalState.el && modalState.el.style.display !== 'none' && modalState.currentChord) {
                        abrirOuAtualizarModalAcorde(
                            modalState.currentChord,
                            modalState.toggleBtnRef,
                            modalState.sourceContext
                        );
                    }
                },
                sourceContext,
                (btnLocal) => {
                    if (extensaoAcordes) {
                        extensaoAcordes.alternar(btnLocal);
                    }
                }
            );
            btnModalRef = btnModal;

            box.appendChild(transposeBar);
            box.appendChild(contentDiv);
            box.appendChild(editorApi.editorWrap);

            renderizarConteudo(String(rawInner || '').trim(), true, true);

            return box;
        }
    };
})();
