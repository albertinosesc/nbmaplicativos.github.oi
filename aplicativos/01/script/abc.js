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
        if (typeof window.abrirModalViolaoPorCifra === 'function') {
            window.abrirModalViolaoPorCifra(cifra, triggerEl);
        } else if (typeof window.abrirModalCifra === 'function') {
            window.abrirModalCifra(cifra, triggerEl);
        } else if (typeof window.mostrarDiagramaViolao === 'function') {
            window.mostrarDiagramaViolao(cifra, triggerEl);
        }
    }

    function habilitarCliqueAcordesNoAbc(sheetContainer) {
        if (!sheetContainer) return;

        // Regex para cifras comuns (ex.: C, Cm, C#m7, Bb/D, G7(9), F#dim, Asus4)
        const regexAcorde = /^[A-G][#b]?(?:m|maj|min|dim|aug|sus\d*|add\d*|\d)*(?:\/[A-G][#b]?)?$/;

        const elementos = sheetContainer.querySelectorAll('.abcjs-chord, svg text, svg tspan');
        elementos.forEach((el) => {
            const isAbcChord = el.classList && el.classList.contains('abcjs-chord');
            const texto = String(el.textContent || '').trim().replace(/^"+|"+$/g, '');

            if (!texto) return;
            if (!isAbcChord && !regexAcorde.test(texto)) return;

            el.style.cursor = 'pointer';
            if (el.tagName && el.tagName.toLowerCase() !== 'text' && el.tagName.toLowerCase() !== 'tspan') {
                el.title = `Ver diagrama de violão: ${texto}`;
            } else {
                el.style.fill = '#b91c1c';
                el.style.fontWeight = '700';
            }

            if (el.dataset.chordModalBound === 'true') return;
            el.dataset.chordModalBound = 'true';

            el.addEventListener('click', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                abrirModalViolaoDaCifra(texto, el);
            });
        });
    }

    function criarAreaEdicaoMinimizada(initialCode, onApplyCode) {
        const wrapper = document.createElement('div');
        wrapper.className = 'abc-editor-minimized-wrap';

        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'btn-edit abc-edit-toggle';
        toggleBtn.innerHTML = '✏️ Editar ABC (minimizado)';
        toggleBtn.setAttribute('aria-expanded', 'false');

        const editorBox = document.createElement('div');
        editorBox.className = 'abc-editor-box';
        editorBox.style.display = 'none';
        editorBox.style.marginTop = '8px';

        const textarea = document.createElement('textarea');
        textarea.className = 'abc-inline-textarea';
        textarea.rows = 7;
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
            toggleBtn.innerHTML = minimized ? '✏️ Editar ABC (minimizado)' : '▼ Editando ABC';
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
            const novoCodigo = textarea.value;
            if (typeof onApplyCode === 'function') {
                onApplyCode(novoCodigo);
            }
        };

        actionsRow.appendChild(btnAplicar);
        actionsRow.appendChild(btnMinimizar);
        editorBox.appendChild(textarea);
        editorBox.appendChild(actionsRow);

        wrapper.appendChild(toggleBtn);
        wrapper.appendChild(editorBox);

        return {
            wrapper,
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

            const hasPlay = /%%play\b/.test(rawCode);
            let currentCleanCode = rawCode.replace(/%%play\s*/g, '').trim();

            const sheetContainer = document.createElement('div');
            sheetContainer.className = 'abc-sheet';
            sheetContainer.id = `abc-sheet-${blockId}`;
            block.appendChild(sheetContainer);

            const controls = document.createElement('div');
            controls.className = 'abc-controls';
            controls.style.display = hasPlay ? 'flex' : 'none';

            const btnPlay = document.createElement('button');
            btnPlay.className = 'btn-play';
            btnPlay.innerHTML = '▶ Tocar';

            const btnStop = document.createElement('button');
            btnStop.className = 'btn-stop';
            btnStop.innerHTML = '■ Parar';
            btnStop.style.display = 'none';
            btnStop.onclick = () => stopCurrentPlayback();

            controls.appendChild(btnPlay);
            controls.appendChild(btnStop);
            block.appendChild(controls);

            const codeView = document.createElement('pre');
            codeView.className = 'abc-code';
            codeView.style.display = 'none'; // fica oculto/minimizado até abrir a edição

            let editorApi = null;

            const renderPartitura = (codigoParaRenderizar) => {
                stopCurrentPlayback();
                const hasPlayAtual = /%%play\b/.test(codigoParaRenderizar);
                currentCleanCode = codigoParaRenderizar.replace(/%%play\s*/g, '').trim();

                controls.style.display = hasPlayAtual ? 'flex' : 'none';
                btnPlay.onclick = () => playAbc(currentCleanCode, btnPlay);
                codeView.textContent = currentCleanCode;

                try {
                    if (window.ABCJS && typeof ABCJS.renderAbc === 'function') {
                        ABCJS.renderAbc(sheetContainer, currentCleanCode, {
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
                    editorApi.setCode(currentCleanCode);
                }
            };

            editorApi = criarAreaEdicaoMinimizada(currentCleanCode, (novoCodigo) => {
                renderPartitura(novoCodigo);
            });

            renderPartitura(rawCode);

            block.appendChild(editorApi.wrapper);
            block.appendChild(codeView);

            return block;
        }
    };
})();
