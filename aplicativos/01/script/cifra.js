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
        toggleBtnRef: null,
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

        const keysPattern = '(?:style|letra-style|titulo-style|autor-style|compositor-style)\\s*=';

        const tituloMatch = attrsStr.match(new RegExp(`titulo-style\\s*=\\s*(.+?)(?=\\s+${keysPattern}|$)`, 'i'));
        const autorMatch = attrsStr.match(new RegExp(`(?:autor-style|compositor-style)\\s*=\\s*(.+?)(?=\\s+${keysPattern}|$)`, 'i'));
        const letraMatch = attrsStr.match(new RegExp(`letra-style\\s*=\\s*(.+?)(?=\\s+${keysPattern}|$)`, 'i'));
        const acordeMatch = attrsStr.match(new RegExp(`(?:^|\\s)style\\s*=\\s*(.+?)(?=\\s+${keysPattern}|$)`, 'i'));

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
        let text = String(rawInner || '').replace(/^\[CIFRA[^\]]*\]/i, '').trim();
        let titulo = '';
        let autor = '';

        // 1. Extrai [TITULO]...[/TITULO] ou linha "titulo: ..."
        const tagTitleMatch = text.match(/\[TITULO\]([\s\S]*?)\[\/TITULO\]/i);
        if (tagTitleMatch) {
            titulo = tagTitleMatch[1].trim();
            text = text.replace(/\[TITULO\][\s\S]*?\[\/TITULO\]/i, '').trim();
        }

        // 2. Extrai [AUTOR]...[/AUTOR] ou [COMPOSITOR]...[/COMPOSITOR]
        const tagAuthorMatch = text.match(/\[(?:AUTOR|COMPOSITOR)\]([\s\S]*?)\[\/(?:AUTOR|COMPOSITOR)\]/i);
        if (tagAuthorMatch) {
            autor = tagAuthorMatch[1].trim();
            text = text.replace(/\[(?:AUTOR|COMPOSITOR)\][\s\S]*?\[\/(?:AUTOR|COMPOSITOR)\]/i, '').trim();
        }

        // 3. Suporte alternativo por linhas iniciais "titulo: ..." ou "autor/compositor: ..."
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

        if (consumed > 0) {
            text = lines.slice(consumed).join('\n').trim();
        } else {
            text = lines.join('\n').trim();
        }

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

            tokens.push(
                `<span class="lyric">` +
                    `<span class="chord"${chordAttr} data-original-chord="${escapeHtml(chord)}">${escapeHtml(chord)}</span>` +
                    `<span class="lyric-text"${lyricAttr}>${escapeHtml(lyricPart)}</span>` +
                `</span>`
            );

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

    function renderDiagramaNoContainer(chordNome, targetContainer) {
        targetContainer.innerHTML = '';

        if (window.ViolaoModule && typeof window.ViolaoModule.render === 'function') {
            try {
                const node = window.ViolaoModule.render(chordNome);
                if (node instanceof Node) {
                    targetContainer.appendChild(node);
                    const hasVisual = node.querySelector('canvas, svg, .violao-card');
                    if (!hasVisual) {
                        const info = document.createElement('div');
                        info.className = 'cifra-modal-fallback';
                        info.textContent = `Acorde: ${chordNome}`;
                        targetContainer.appendChild(info);
                    }
                    return;
                }
            } catch (_) {}
        }

        const fallback = document.createElement('div');
        fallback.className = 'cifra-modal-fallback';
        fallback.textContent = `Acorde: ${chordNome}`;
        targetContainer.appendChild(fallback);
    }

    function garantirModalAcorde() {
        const existente = document.getElementById('cifra-chord-modal');
        if (existente && modalState.el === existente) return modalState;

        const modal = document.createElement('div');
        modal.id = 'cifra-chord-modal';
        modal.className = 'cifra-chord-modal';
        modal.style.display = 'none';
        modal.style.left = '24px';
        modal.style.top = '90px';

        const header = document.createElement('div');
        header.className = 'cifra-chord-modal-header';
        header.title = 'Arraste para mover o modal';

        const titleEl = document.createElement('span');
        titleEl.className = 'cifra-chord-modal-title';
        titleEl.textContent = '🎸 Acorde';

        const btnClose = document.createElement('button');
        btnClose.type = 'button';
        btnClose.className = 'cifra-chord-modal-close';
        btnClose.title = 'Fechar';
        btnClose.textContent = '✕';
        btnClose.onclick = () => fecharModalAcorde();

        header.appendChild(titleEl);
        header.appendChild(btnClose);

        const bodyEl = document.createElement('div');
        bodyEl.className = 'cifra-chord-modal-body';

        modal.appendChild(header);
        modal.appendChild(bodyEl);
        document.body.appendChild(modal);

        let dragging = false;
        let offsetX = 0;
        let offsetY = 0;

        const iniciarArraste = (clientX, clientY, target) => {
            if (target === btnClose || btnClose.contains(target)) return;
            dragging = true;
            const rect = modal.getBoundingClientRect();
            offsetX = clientX - rect.left;
            offsetY = clientY - rect.top;
            modal.classList.add('dragging');
        };

        const moverArraste = (clientX, clientY) => {
            if (!dragging) return;
            const maxX = Math.max(8, window.innerWidth - modal.offsetWidth - 8);
            const maxY = Math.max(8, window.innerHeight - modal.offsetHeight - 8);
            const novaLeft = Math.min(Math.max(8, clientX - offsetX), maxX);
            const novaTop = Math.min(Math.max(8, clientY - offsetY), maxY);
            modal.style.left = `${Math.round(novaLeft)}px`;
            modal.style.top = `${Math.round(novaTop)}px`;
        };

        const encerrarArraste = () => {
            if (!dragging) return;
            dragging = false;
            modal.classList.remove('dragging');
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
        return modalState;
    }

    function abrirOuAtualizarModalAcorde(chordNome, toggleBtn = null) {
        const limpo = String(chordNome || '').replace(/^"+|"+$/g, '').trim();
        if (!limpo) return;

        const state = garantirModalAcorde();
        if (state.toggleBtnRef && state.toggleBtnRef !== toggleBtn) {
            state.toggleBtnRef.classList.remove('active');
        }
        state.toggleBtnRef = toggleBtn;
        state.titleEl.textContent = `🎸 Acorde: ${limpo}`;
        renderDiagramaNoContainer(limpo, state.bodyEl);
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

    function alternarModalAcorde(contentDiv, toggleBtn) {
        const state = garantirModalAcorde();
        const estaVisivel = state.el.style.display !== 'none';

        if (estaVisivel) {
            fecharModalAcorde();
            return;
        }

        const primeiroChord = contentDiv.querySelector('.chord');
        const acordeInicial = primeiroChord ? primeiroChord.textContent.trim() : 'C';
        abrirOuAtualizarModalAcorde(acordeInicial || 'C', toggleBtn);
    }

    function criarBarraTranspose(contentDiv, getSemitons, setSemitons) {
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
        btnModal.onclick = () => alternarModalAcorde(contentDiv, btnModal);

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
        };

        btnDown.onclick = () => aplicar(getSemitons() - 1);
        btnUp.onclick = () => aplicar(getSemitons() + 1);
        btnReset.onclick = () => aplicar(0);

        bar.appendChild(btnDown);
        bar.appendChild(statusSpan);
        bar.appendChild(btnUp);
        bar.appendChild(btnReset);
        bar.appendChild(btnModal);

        return { bar, btnModal };
    }

    // ============================================================
    // CONVERSOR: CIFRA TRADICIONAL (ACORDES EM CIMA) -> [CIFRA]
    // ============================================================
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

    function criarEditorCifraMinimizado(initialRawCode, onApply) {
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
                textarea.value = novoRaw;
            }
        };
    }

    // Expõe globalmente para o módulo ABC e para o script.js / painel Admin
    window.abrirModalViolaoPorCifra = function (cifraBruta, triggerEl = null) {
        abrirOuAtualizarModalAcorde(cifraBruta, null);
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
            let btnModalRef = null;
            let editorApi = null;

            const renderizarConteudo = (textoBruto) => {
                const { titulo, autor, bodyText } = extractMetadataAndBody(textoBruto);
                const lines = bodyText ? bodyText.split(/\r?\n/) : [];
                const htmlLines = lines.map((line) => formatChordLine(line, chordAttr, lyricAttr));

                semitonsAtual = 0;
                contentDiv.innerHTML = '';

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

                contentDiv.innerHTML += htmlLines.join('');

                contentDiv.querySelectorAll('.chord').forEach((chordEl) => {
                    chordEl.classList.add('chord-clickable');
                    chordEl.title = 'Clique para ver o diagrama do acorde';
                    chordEl.onclick = (e) => {
                        e.stopPropagation();
                        const acordeAtual = chordEl.textContent.trim();
                        if (acordeAtual) {
                            abrirOuAtualizarModalAcorde(acordeAtual, btnModalRef);
                        }
                    };
                });

                if (editorApi) {
                    editorApi.setCode(textoBruto);
                }
            };

            editorApi = criarEditorCifraMinimizado(String(rawInner || '').trim(), (novoTexto) => {
                renderizarConteudo(novoTexto);
            });

            header.appendChild(label);
            header.appendChild(editorApi.toggleBtn);
            box.appendChild(header);

            const { bar: transposeBar, btnModal } = criarBarraTranspose(
                contentDiv,
                () => semitonsAtual,
                (val) => { semitonsAtual = val; }
            );
            btnModalRef = btnModal;

            box.appendChild(transposeBar);
            box.appendChild(contentDiv);
            box.appendChild(editorApi.editorWrap);

            renderizarConteudo(String(rawInner || '').trim());

            return box;
        }
    };
})();
