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

    async function copyCode(codeText, btnCopy) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(codeText);
            } else {
                const ta = document.createElement('textarea');
                ta.value = codeText;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            const oldText = btnCopy.innerHTML;
            btnCopy.innerHTML = '✓ Copiado!';
            btnCopy.classList.add('copied');
            setTimeout(() => {
                btnCopy.innerHTML = oldText;
                btnCopy.classList.remove('copied');
            }, 1800);
        } catch (err) {
            alert('Não foi possível copiar: ' + err.message);
        }
    }

    window.AbcModule = {
        resetPlayback: stopCurrentPlayback,
        render(rawCode, blockId) {
            const block = document.createElement('div');
            block.className = 'abc-block';

            const hasPlay = /%%play\b/.test(rawCode);
            const cleanCode = rawCode.replace(/%%play\s*/g, '').trim();

            const sheetContainer = document.createElement('div');
            sheetContainer.className = 'abc-sheet';
            sheetContainer.id = `abc-sheet-${blockId}`;
            block.appendChild(sheetContainer);

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
                } else {
                    sheetContainer.innerHTML = '<div class="error">Biblioteca ABCJS não carregada.</div>';
                }
            } catch (error) {
                sheetContainer.innerHTML = `<div class="error">Erro ao renderizar ABC: ${error.message}</div>`;
            }

            if (hasPlay) {
                const controls = document.createElement('div');
                controls.className = 'abc-controls';

                const btnPlay = document.createElement('button');
                btnPlay.className = 'btn-play';
                btnPlay.innerHTML = '▶ Tocar';
                btnPlay.onclick = () => playAbc(cleanCode, btnPlay);

                const btnStop = document.createElement('button');
                btnStop.className = 'btn-stop';
                btnStop.innerHTML = '■ Parar';
                btnStop.style.display = 'none';
                btnStop.onclick = () => stopCurrentPlayback();

                controls.appendChild(btnPlay);
                controls.appendChild(btnStop);
                block.appendChild(controls);
            }

            const codeHeader = document.createElement('div');
            codeHeader.className = 'abc-code-header';

            const codeLabel = document.createElement('span');
            codeLabel.className = 'abc-code-label';
            codeLabel.textContent = 'Código ABC';

            const btnCopy = document.createElement('button');
            btnCopy.type = 'button';
            btnCopy.className = 'btn-copy';
            btnCopy.innerHTML = '📋 Copiar';
            btnCopy.onclick = () => copyCode(cleanCode, btnCopy);

            codeHeader.appendChild(codeLabel);
            codeHeader.appendChild(btnCopy);
            block.appendChild(codeHeader);

            const codeView = document.createElement('pre');
            codeView.className = 'abc-code';
            codeView.textContent = cleanCode;
            block.appendChild(codeView);

            return block;
        }
    };
})();
