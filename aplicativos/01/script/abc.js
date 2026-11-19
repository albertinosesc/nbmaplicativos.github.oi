// ============================================================
// MÓDULO ABC (abc.js)
// ============================================================
(function () {
    let currentSynth = null;
    let audioContext = null;
    let playTimeout = null;
    let activeBtnPlay = null;
    let activeBtnStop = null;
    let isPlaying = false;

    function stopCurrentPlayback() {
        if (playTimeout) {
            clearTimeout(playTimeout);
            playTimeout = null;
        }

        if (currentSynth) {
            try {
                currentSynth.stop();
            } catch (e) {}
            currentSynth = null;
        }

        isPlaying = false;

        if (activeBtnPlay) {
            activeBtnPlay.disabled = false;
            activeBtnPlay.innerHTML = '▶ Tocar';
        }
        if (activeBtnStop) {
            activeBtnStop.disabled = false;
            activeBtnStop.style.display = 'none';
        }

        activeBtnPlay = null;
        activeBtnStop = null;
    }

    async function playAbc(abcCode, btnPlay) {
        const btnStop = btnPlay ? btnPlay.nextElementSibling : null;

        if (currentSynth) {
            stopCurrentPlayback();
        }

        try {
            if (!window.ABCJS || !ABCJS.synth || !ABCJS.synth.supportsAudio()) {
                throw new Error('Seu navegador não suporta reprodução de áudio WebAudio.');
            }

            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!audioContext) {
                audioContext = new AudioCtx();
            }
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            const tempDiv = document.createElement('div');
            const rendered = ABCJS.renderAbc(tempDiv, abcCode);
            if (!rendered || !rendered[0]) {
                throw new Error('Não foi possível preparar a partitura para áudio.');
            }
            const visualObj = rendered[0];

            activeBtnPlay = btnPlay;
            activeBtnStop = btnStop;
            isPlaying = true;

            if (btnPlay) {
                btnPlay.disabled = true;
                btnPlay.innerHTML = '⏳ Carregando...';
            }
            if (btnStop) {
                btnStop.disabled = false;
                btnStop.style.display = 'inline-block';
            }

            const synth = new ABCJS.synth.CreateSynth();
            currentSynth = synth;

            await synth.init({
                visualObj: visualObj,
                audioContext: audioContext,
                options: {}
            });

            await synth.prime();

            if (!isPlaying || currentSynth !== synth) {
                return;
            }

            if (btnPlay) {
                btnPlay.innerHTML = '🔊 Tocando...';
            }

            synth.start();

            const totalSec = (typeof synth.duration === 'number' && synth.duration > 0)
                ? synth.duration
                : (typeof visualObj.getTotalTime === 'function' && visualObj.getTotalTime() > 0)
                    ? visualObj.getTotalTime()
                    : 15;

            playTimeout = setTimeout(() => {
                if (currentSynth === synth) {
                    stopCurrentPlayback();
                }
            }, (totalSec * 1000) + 2000);
        } catch (error) {
            console.error('Erro ao tocar:', error);
            alert('Erro ao reproduzir áudio: ' + (error && error.message ? error.message : error));
            stopCurrentPlayback();
        }
    }

    function abrirModalViolaoDaCifra(cifra, triggerEl) {
        const limpo = String(cifra || '').replace(/^"+|"+$/g, '').trim();
        if (!limpo) return;

        if (typeof window.abrirModalViolaoPorCifra === 'function') {
            window.abrirModalViolaoPorCifra(limpo, triggerEl);
            return;
        }
        if (typeof window.abrirModalCifra === 'function') {
            window.abrirModalCifra(limpo, triggerEl);
            return;
        }
        if (typeof window.mostrarDiagramaViolao === 'function') {
            window.mostrarDiagramaViolao(limpo, triggerEl);
        }
    }

    function habilitarCliqueAcordesNoAbc(sheetContainer) {
        if (!sheetContainer) return;

        // Regex para cifras comuns (ex.: C, Cm, C#m7, Bb/D, G7(9), F#dim, Asus4)
        const regexAcorde = /^[A-G][#b]?(?:m|maj|min|dim|aug|sus\d*|add\d*|\d)*(?:\/[A-G][#b]?)?$/;

        const candidatos = sheetContainer.querySelectorAll('.abcjs-chord, svg text, svg tspan');
        candidatos.forEach((el) => {
            const isAbcChord =
                (el.classList && el.classList.contains('abcjs-chord')) ||
                Boolean(el.closest && el.closest('.abcjs-chord'));

            const textoLimpo = String(el.textContent || '')
                .replace(/^"+|"+$/g, '')
                .trim();

            if (!textoLimpo) return;
            if (!isAbcChord && !regexAcorde.test(textoLimpo)) return;

            el.style.cursor = 'pointer';
            el.style.pointerEvents = 'all';
            if (el.tagName && ['text', 'tspan'].includes(el.tagName.toLowerCase())) {
                el.style.fill = '#b91c1c';
                el.style.fontWeight = '700';
            }
            if (!el.getAttribute('title')) {
                try {
                    el.setAttribute('title', `Ver diagrama de violão: ${textoLimpo}`);
                } catch (_) {}
            }

            if (el.dataset.chordModalBound === 'true') return;
            el.dataset.chordModalBound = 'true';

            el.addEventListener('click', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                abrirModalViolaoDaCifra(textoLimpo, el);
            });
        });
    }

    function criarEditorAbcMinimizado(initialCode, onApplyCode) {
        const wrapper = document.createElement('div');
        wrapper.className = 'abc-editor-minimized-wrap';

        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'btn-edit abc-edit-toggle';
        toggleBtn.textContent = '✏️ Editar';
        toggleBtn.title = 'Abrir ou minimizar o editor ABC';
        toggleBtn.setAttribute('aria-expanded', 'false');

        const editorBox = document.createElement('div');
        editorBox.className = 'abc-editor-box';
        editorBox.style.display = 'none';
        editorBox.style.marginTop = '8px';

        const textarea = document.createElement('textarea');
        textarea.className = 'abc-inline-textarea';
        textarea.rows = 8;
        textarea.value = initialCode;
        textarea.style.width = '100%';
        textarea.style.fontFamily = 'monospace';

        const actionsRow = document.createElement('div');
        actionsRow.className = 'abc-editor-actions';
        actionsRow.style.display = 'flex';
        actionsRow.style.gap = '8px';
        actionsRow.style.marginTop = '6px';

        const btnAplicar = document.createElement('button');
        btnAplicar.type = 'button';
        btnAplicar.className = 'btn-apply-abc';
        btnAplicar.textContent = '✓ Aplicar na partitura';

        const btnMinimizar = document.createElement('button');
        btnMinimizar.type = 'button';
        btnMinimizar.className = 'btn-minimize-abc';
        btnMinimizar.textContent = '— Minimizar';

        const setMinimized = (minimized) => {
            editorBox.style.display = minimized ? 'none' : 'block';
            toggleBtn.setAttribute('aria-expanded', String(!minimized));
            toggleBtn.innerHTML = minimized ? '✏️ Editar' : '— Minimizar';
            if (!minimized) {
                textarea.focus();
            }
        };

        toggleBtn.onclick = () => {
            const estaMinimizado = editorBox.style.display === 'none';
            setMinimized(!estaMinimizado);
        };

        btnMinimizar.onclick = () => setMinimized(true);

        btnAplicar.onclick = () => {
            if (typeof onApplyCode === 'function') {
                onApplyCode(textarea.value);
            }
        };

        actionsRow.appendChild(btnAplicar);
        actionsRow.appendChild(btnMinimizar);
        editorBox.appendChild(textarea);
        editorBox.appendChild(actionsRow);

        wrapper.appendChild(editorBox);

        return {
            toggleBtn,
            editorWrap: wrapper,
            setCode(novoCodigo) {
                textarea.value = novoCodigo;
            }
        };
    }

    window.AbcModule = {
        resetPlayback: stopCurrentPlayback,
        render(rawCode, blockId) {
            const block = document.createElement('div');
            block.className = 'abc-block';

            const sheetContainer = document.createElement('div');
            sheetContainer.className = 'abc-sheet';
            sheetContainer.id = `abc-sheet-${blockId}`;
            block.appendChild(sheetContainer);

            const controls = document.createElement('div');
            controls.className = 'abc-controls';
            controls.style.display = 'none';

            const btnPlay = document.createElement('button');
            btnPlay.type = 'button';
            btnPlay.className = 'btn-play';
            btnPlay.innerHTML = '▶ Tocar';

            const btnStop = document.createElement('button');
            btnStop.type = 'button';
            btnStop.className = 'btn-stop';
            btnStop.innerHTML = '■ Parar';
            btnStop.style.display = 'none';
            btnStop.onclick = () => stopCurrentPlayback();

            controls.appendChild(btnPlay);
            controls.appendChild(btnStop);
            block.appendChild(controls);

            const codeHeader = document.createElement('div');
            codeHeader.className = 'abc-code-header';

            const codeLabel = document.createElement('span');
            codeLabel.className = 'abc-code-label';
            codeLabel.textContent = 'Código ABC';

            const codeView = document.createElement('pre');
            codeView.className = 'abc-code';
            codeView.style.display = 'none'; // fica minimizado/oculto por padrão

            let editorApi = null;
            let codigoComPlayAtual = String(rawCode || '').trim();

            const renderPartitura = (codigoEntrada) => {
                stopCurrentPlayback();
                codigoComPlayAtual = String(codigoEntrada || '').trim();
                const hasPlayAtual = /%%play\b/.test(codigoComPlayAtual);
                const cleanCode = codigoComPlayAtual.replace(/%%play\s*/g, '').trim();

                controls.style.display = hasPlayAtual ? 'flex' : 'none';
                btnPlay.onclick = () => playAbc(cleanCode, btnPlay);
                codeView.textContent = cleanCode;

                try {
                    if (window.ABCJS && typeof ABCJS.renderAbc === 'function') {
                        ABCJS.renderAbc(sheetContainer, cleanCode, {
                            responsive: 'resize',
                            scale: 0.75,
                            staffwidth: 700,
                            paddingtop: 10,
                            paddingbottom: 10,
                            add_classes: true
                        });
                        habilitarCliqueAcordesNoAbc(sheetContainer);
                        if (typeof window.ativarAcordesClicaveisNoAbc === 'function') {
                            window.ativarAcordesClicaveisNoAbc(sheetContainer);
                        }
                    } else {
                        sheetContainer.innerHTML = '<div class="error">Biblioteca ABCJS não carregada.</div>';
                    }
                } catch (error) {
                    sheetContainer.innerHTML = `<div class="error">Erro ao renderizar ABC: ${error.message}</div>`;
                }

                if (editorApi) {
                    editorApi.setCode(codigoComPlayAtual);
                }
            };

            editorApi = criarEditorAbcMinimizado(codigoComPlayAtual, (novoCodigo) => {
                renderPartitura(novoCodigo);
            });

            codeHeader.appendChild(codeLabel);
            codeHeader.appendChild(editorApi.toggleBtn);

            block.appendChild(codeHeader);
            block.appendChild(editorApi.editorWrap);
            block.appendChild(codeView);

            renderPartitura(codigoComPlayAtual);

            return block;
        }
    };
})();
