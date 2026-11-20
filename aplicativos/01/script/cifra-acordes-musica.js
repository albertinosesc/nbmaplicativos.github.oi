// ============================================================
// MÓDULO SECUNDÁRIO AUTOCONTIDO: MODAL DE ACORDES DA MÚSICA
// ============================================================
(function () {
    const NOTAS_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const NOTAS_BEMOL = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    const MAPA_SEMITONS = {
        'C': 0, 'B#': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'Fb': 4, 'F': 5, 'E#': 5, 'F#': 6, 'Gb': 6, 'G': 7,
        'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11, 'Cb': 11
    };

    const instancias = new WeakMap();
    let ultimoBoxAtivo = null;

    function transporNota(notaStr, semitons, usarBemol = false) {
        const match = String(notaStr || '').trim().match(/^([A-Ga-g])([#b]?)$/);
        if (!match) return notaStr;
        const baseIdx = MAPA_SEMITONS[`${match[1].toUpperCase()}${match[2] || ''}`];
        if (baseIdx === undefined) return notaStr;
        const novoIdx = (((baseIdx + semitons) % 12) + 12) % 12;
        const bemol = match[2] === 'b' || (usarBemol && match[2] !== '#');
        return (bemol ? NOTAS_BEMOL : NOTAS_SHARP)[novoIdx];
    }

    function transporAcorde(acorde, semitons) {
        if (!semitons) return acorde;
        const bemol = semitons < 0;
        return String(acorde).split('/').map((parte) => {
            const t = parte.trim();
            const m = t.match(/^([A-Ga-g][#b]?)(.*)$/);
            return m ? `${transporNota(m[1], semitons, bemol)}${m[2]}` : parte;
        }).join('/');
    }

    function lerSemitonsDoBox(box) {
        const status = box ? box.querySelector('.cifra-transpose-status') : null;
        if (!status) return 0;
        const match = status.textContent.match(/([+-]?\d+)/);
        return match ? parseInt(match[1], 10) || 0 : 0;
    }

    function lerTituloDoBox(box) {
        const el = box ? box.querySelector('.cifra-title') : null;
        return el ? el.textContent.trim() : '';
    }

    function lerAcordesDoBox(box) {
        if (!box) return [];
        const lista = [];
        const vistos = new Set();
        box.querySelectorAll('.cifra-content .chord').forEach((el) => {
            const orig = (el.getAttribute('data-original-chord') || el.textContent || '').trim();
            if (orig && !vistos.has(orig)) {
                vistos.add(orig);
                lista.push(orig);
            }
        });
        return lista;
    }

    function resolverBoxAlvo(boxPreferido) {
        if (boxPreferido && boxPreferido.closest && boxPreferido.closest('.cifra-block')) {
            return boxPreferido.closest('.cifra-block');
        }
        if (boxPreferido && boxPreferido.classList && boxPreferido.classList.contains('cifra-block')) {
            return boxPreferido;
        }
        if (ultimoBoxAtivo && document.body.contains(ultimoBoxAtivo)) {
            return ultimoBoxAtivo;
        }
        return document.querySelector('.cifra-block');
    }

    function criarVisualAcorde(acordeExibido, varItem = null) {
        if (window.ViolaoModule && typeof window.ViolaoModule.resolverVariacoesAcorde === 'function' && typeof window.ViolaoModule.criarCanvasAcorde === 'function') {
            try {
                const vars = window.ViolaoModule.resolverVariacoesAcorde(acordeExibido) || [];
                const escolhida = varItem
                    ? { ...varItem, nome: acordeExibido, acorde: acordeExibido }
                    : (vars[0] || { nome: acordeExibido, acorde: acordeExibido });
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

        const fallback = document.createElement('div');
        fallback.style.padding = '10px 6px';
        fallback.style.fontWeight = '700';
        fallback.style.fontSize = '15px';
        fallback.textContent = acordeExibido;
        return fallback;
    }

    function forcarVisibilidade(modal, mostrar, toggleBtnRef = null) {
        if (!modal) return;
        const val = mostrar ? 'block' : 'none';
        modal.dataset.aberto = mostrar ? '1' : '0';
        modal.style.setProperty('display', val, 'important');
        if (toggleBtnRef) {
            toggleBtnRef.classList.toggle('active', mostrar);
        }
        if (mostrar) {
            requestAnimationFrame(() => {
                if (modal.dataset.aberto === '1' && getComputedStyle(modal).display === 'none') {
                    modal.style.setProperty('display', 'block', 'important');
                }
            });
        }
    }

    function criarModalParaBox(box, apiCifra = null) {
        const existente = box.querySelector(':scope > .cifra-local-modal');
        if (existente) existente.remove();

        const modal = document.createElement('div');
        modal.className = 'cifra-local-modal';
        modal.dataset.aberto = '0';
        modal.style.cssText = [
            'box-sizing: border-box',
            'margin-top: 10px',
            'border: 1px solid #94a3b8',
            'border-radius: 10px',
            'padding: 10px',
            'background: #f8fafc',
            'color: #0f172a',
            'position: relative',
            'z-index: 20',
            'width: 100%'
        ].join('; ');
        modal.style.setProperty('display', 'none', 'important');

        const header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px;';

        const titleEl = document.createElement('strong');
        titleEl.style.fontSize = '0.92rem';
        titleEl.textContent = '🎼 Acordes da música';

        const controls = document.createElement('div');
        controls.style.cssText = 'display:flex;align-items:center;gap:6px;flex-wrap:wrap;';

        const inputAdd = document.createElement('input');
        inputAdd.type = 'text';
        inputAdd.placeholder = 'Ex: G7, Am...';
        inputAdd.style.cssText = 'width:92px;padding:3px 6px;font-size:12px;border-radius:4px;border:1px solid #cbd5e1;background:#fff;color:#0f172a;';

        const btnAdd = document.createElement('button');
        btnAdd.type = 'button';
        btnAdd.textContent = '+ Acorde';
        btnAdd.style.cssText = 'cursor:pointer;font-size:11px;padding:3px 8px;border-radius:4px;border:1px solid #cbd5e1;background:#fff;color:#0f172a;';

        const btnReset = document.createElement('button');
        btnReset.type = 'button';
        btnReset.textContent = '↺ Da música';
        btnReset.style.cssText = 'cursor:pointer;font-size:11px;padding:3px 7px;border-radius:4px;border:1px solid #cbd5e1;background:#fff;color:#334155;';

        const btnClose = document.createElement('button');
        btnClose.type = 'button';
        btnClose.textContent = '✕';
        btnClose.style.cssText = 'cursor:pointer;font-size:11px;padding:3px 7px;border-radius:4px;border:1px solid #cbd5e1;background:#fff;color:#0f172a;';

        controls.append(inputAdd, btnAdd, btnReset, btnClose);
        header.append(titleEl, controls);

        const listEl = document.createElement('div');
        listEl.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start;';

        modal.append(header, listEl);

        const anchor = box.querySelector('.cifra-transpose-bar') || box.firstElementChild;
        if (anchor && anchor.nextSibling) {
            box.insertBefore(modal, anchor.nextSibling);
        } else {
            box.appendChild(modal);
        }

        let itens = [];
        let baseAcordes = [];
        let toggleBtnRef = box.querySelector('.cifra-local-modal-toggle');

        const getSem = () => (apiCifra && typeof apiCifra.getSemitons === 'function')
            ? apiCifra.getSemitons()
            : lerSemitonsDoBox(box);

        const getTit = () => (apiCifra && typeof apiCifra.getTitulo === 'function')
            ? apiCifra.getTitulo()
            : lerTituloDoBox(box);

        const renderLista = () => {
            listEl.replaceChildren();
            const sem = getSem();
            const tit = getTit();
            titleEl.textContent = tit
                ? `🎼 Acordes: ${tit} (${itens.length})`
                : `🎼 Acordes da música (${itens.length})`;

            if (!itens.length) {
                const vazio = document.createElement('div');
                vazio.style.cssText = 'font-size:12px;color:#475569;padding:6px;';
                vazio.textContent = 'Nenhum acorde encontrado nesta cifra.';
                listEl.appendChild(vazio);
                return;
            }

            itens.forEach((entry, idx) => {
                const exibido = transporAcorde(entry.originalChord, sem);
                const card = document.createElement('div');
                card.style.cssText = 'box-sizing:border-box;border:1px solid #cbd5e1;border-radius:8px;padding:8px;background:#fff;color:#0f172a;width:170px;text-align:center;';

                const top = document.createElement('div');
                top.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;';

                const badge = document.createElement('span');
                badge.style.cssText = 'font-weight:700;font-size:13px;';
                badge.textContent = exibido;

                const btnRem = document.createElement('button');
                btnRem.type = 'button';
                btnRem.textContent = '✕';
                btnRem.style.cssText = 'cursor:pointer;font-size:11px;padding:2px 5px;border-radius:4px;border:1px solid #fecaca;background:#fef2f2;color:#b91c1c;';
                btnRem.onclick = (e) => {
                    e.stopPropagation();
                    itens.splice(idx, 1);
                    renderLista();
                };

                top.append(badge, btnRem);

                const visual = criarVisualAcorde(exibido, entry.varItem);
                visual.style.cursor = 'pointer';
                visual.onclick = (e) => {
                    e.stopPropagation();
                    ultimoBoxAtivo = box;
                    if (typeof window.abrirModalViolaoPorCifra === 'function') {
                        window.abrirModalViolaoPorCifra(exibido, card);
                    }
                };

                card.append(top, visual);
                listEl.appendChild(card);
            });
        };

        const definirDaMusica = (lista) => {
            const fonte = Array.isArray(lista) && lista.length ? lista : lerAcordesDoBox(box);
            baseAcordes = fonte.slice();
            itens = baseAcordes.map((c) => ({ originalChord: c, varItem: null }));
            renderLista();
        };

        const adicionarAcorde = (chordOriginal, varItem = null, abrir = false) => {
            const limpo = String(chordOriginal || '').trim();
            if (!limpo) return;
            const sem = getSem();
            const originalNormalizado = sem !== 0 ? transporAcorde(limpo, -sem) : limpo;

            const idx = itens.findIndex((i) => i.originalChord.toLowerCase() === originalNormalizado.toLowerCase());
            if (idx >= 0) {
                itens[idx] = {
                    originalChord: itens[idx].originalChord,
                    varItem: varItem ? { ...varItem } : itens[idx].varItem
                };
            } else {
                itens.push({
                    originalChord: originalNormalizado,
                    varItem: varItem ? { ...varItem } : null
                });
            }

            if (abrir) {
                if (!itens.length) definirDaMusica(lerAcordesDoBox(box));
                else renderLista();
                forcarVisibilidade(modal, true, toggleBtnRef);
            } else {
                renderLista();
            }
        };

        const alternar = (btn = null) => {
            if (btn) toggleBtnRef = btn;
            ultimoBoxAtivo = box;
            const estaAberto = modal.dataset.aberto === '1';
            const proximoEstado = !estaAberto;
            if (proximoEstado) {
                if (!itens.length) definirDaMusica(lerAcordesDoBox(box));
                else renderLista();
            }
            forcarVisibilidade(modal, proximoEstado, toggleBtnRef);
        };

        btnClose.onclick = (e) => {
            e.stopPropagation();
            forcarVisibilidade(modal, false, toggleBtnRef);
        };

        btnReset.onclick = (e) => {
            e.stopPropagation();
            definirDaMusica(baseAcordes.length ? baseAcordes : lerAcordesDoBox(box));
        };

        const submeter = () => {
            const val = String(inputAdd.value || '').trim();
            if (!val) return;
            adicionarAcorde(val, null, false);
            inputAdd.value = '';
            inputAdd.focus();
        };

        btnAdd.onclick = (e) => {
            e.stopPropagation();
            submeter();
        };

        inputAdd.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submeter();
            }
        });

        definirDaMusica(lerAcordesDoBox(box));

        const inst = {
            definirDaMusica,
            adicionarAcorde,
            atualizarTransposicao: renderLista,
            alternar,
            contexto: {
                getSemitons: getSem,
                addChordToLocalModal: adicionarAcorde
            }
        };

        instancias.set(box, inst);
        return inst;
    }

    document.addEventListener('click', (e) => {
        const alvo = e.target instanceof Element ? e.target : (e.target && e.target.parentElement);
        const boxClicado = alvo && alvo.closest ? alvo.closest('.cifra-block') : null;
        if (boxClicado) {
            ultimoBoxAtivo = boxClicado;
        }

        const btn = alvo && alvo.closest ? alvo.closest('.cifra-local-modal-toggle') : null;
        if (!btn) return;
        const box = btn.closest('.cifra-block');
        if (!box) return;
        ultimoBoxAtivo = box;
        e.stopImmediatePropagation();
        const inst = instancias.get(box) || criarModalParaBox(box);
        inst.alternar(btn);
    }, true);

    window.CifraAcordesMusica = {
        registrar(box, apiCifra) {
            if (!box) return null;
            ultimoBoxAtivo = box;
            return instancias.get(box) || criarModalParaBox(box, apiCifra);
        },
        obter(box) {
            return box ? instancias.get(box) || null : null;
        },
        enviarParaMusica(acorde, varItem = null, boxAlvo = null, abrirModal = true) {
            const box = resolverBoxAlvo(boxAlvo);
            if (!box) return false;
            ultimoBoxAtivo = box;
            const inst = instancias.get(box) || criarModalParaBox(box);
            inst.adicionarAcorde(acorde, varItem, abrirModal);
            return true;
        }
    };
})();
