// ============================================
// FUNÇÕES PARA ACORDES DINÂMICOS
// ============================================

function salvarAcordeDinamicoNaBiblioteca() {
    const formato = prompt(
        '💾 SALVAR ACORDE DINÂMICO NA BIBLIOTECA\n\n' +
        'Digite o formato do acorde sonoro que você quer salvar:\n\n' +
        'Exemplo: 1;3 (Sol Maior)\n' +
        'Exemplo: 2;5 (Lá Menor)\n\n' +
        'Formato:'
    );
    if (!formato) return;
    const convertido = converterDinamicoParaEditavel(formato);
    if (!convertido) return;

    const novoNome = prompt(`Nome do acorde na biblioteca (ou Enter para manter "${convertido.nome}"):`, convertido.nome);
    if (novoNome && novoNome.trim()) {
        convertido.acorde.nome = novoNome.trim();
        convertido.linha = convertido.linha.replace(convertido.nome, novoNome.trim());
    }

    if (typeof bibliotecaAcordes !== 'undefined') {
        const partes = convertido.linha.split('/').map(p => p.trim());
        const siglaNome = partes[0];
        const doisPontos = siglaNome.indexOf(':');
        const sigla = siglaNome.substring(0, doisPontos).trim();

        bibliotecaAcordes[sigla] = {
            nome: convertido.acorde.nome,
            cordas: convertido.acorde.cordas,
            dedos: convertido.acorde.dedos,
            pestana: convertido.acorde.pestanaCordas || convertido.acorde.pestana || false,
            casaInicial: convertido.acorde.casaInicial,
            baixo: convertido.acorde.baixo || sigla
        };
        localStorage.setItem('biblioteca_acordes', JSON.stringify(bibliotecaAcordes));
        if (typeof atualizarBibliotecaVisual === 'function') atualizarBibliotecaVisual();
        alert(`✅ Acorde "${sigla}" salvo na biblioteca!\n\nUse [Acorde:${sigla}] no editor.`);
    } else {
        alert('Erro: biblioteca de acordes não disponível');
    }
}

function adicionarBotaoSalvarDinamico() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        const btn = document.createElement('button');
        btn.innerHTML = '🔄 Conversor Dinâmico';
        btn.style.background = '#9b59b6';
        btn.style.marginTop = '10px';
        btn.onclick = salvarAcordeDinamicoNaBiblioteca;
        const editorBtn = document.querySelector('#sidebar button[onclick="abrirEditorAcordes()"]');
        if (editorBtn) {
            editorBtn.insertAdjacentElement('afterend', btn);
        } else {
            sidebar.querySelector('.sidebar-content')?.appendChild(btn);
        }
    }
}

function converterDinamicoParaEditavel(formato) {
    if (typeof window.processarAcordeDinamico !== 'function') {
        alert('Módulo de acordes sonoros não carregado!');
        return null;
    }
    const acorde = window.processarAcordeDinamico(formato, '');
    if (!acorde) {
        alert(`Formato "${formato}" inválido!`);
        return null;
    }
    const pestanaStr = acorde.pestana ? (Array.isArray(acorde.pestanaCordas) && acorde.pestanaCordas.length > 0 ? JSON.stringify(acorde.pestanaCordas) : 'true') : 'false';
    const cordasStr = acorde.cordas.join(',');
    const dedosStr = acorde.dedos.join(',');
    const linha = `${formato}: ${acorde.nome} / ${cordasStr} / ${dedosStr} / ${pestanaStr} / ${acorde.casaInicial} / ${acorde.baixo || ''}`;
    return { linha, acorde, formato, nome: acorde.nome };
}

function editarAcordeDinamico() {
    const formato = prompt(
        '🎸 EDITAR ACORDE DINÂMICO\n\n' +
        'Digite o formato do acorde sonoro que você quer editar:\n\n' +
        'Exemplos:\n' +
        '• 1;3 = Sol Maior\n' +
        '• 2;5 = Lá Menor\n' +
        '• 1;3;5 = Dó Maior (corda base 5)\n\n' +
        'Formato:'
    );
    if (!formato) return;
    const convertido = converterDinamicoParaEditavel(formato);
    if (!convertido) return;
    abrirEditorAcordesComDados(convertido.linha, convertido.nome);
}

function abrirEditorAcordesComDados(linha, nomeSugerido) {
    const modal = document.getElementById('modalAcordes');
    if (!modal) {
        alert('Editor de acordes não encontrado!');
        return;
    }
    if (typeof carregarBiblioteca === 'function') carregarBiblioteca();
    modal.style.display = 'block';
    const inputField = document.getElementById('acordeInput');
    if (inputField) {
        inputField.value = linha;
    }
    setTimeout(() => {
        if (inputField) {
            inputField.focus();
            inputField.select();
        }
    }, 100);
    setTimeout(() => {
        if (typeof gerarPreviewAcordes === 'function') gerarPreviewAcordes();
    }, 200);
    alert(`✅ Acorde dinâmico convertido!\n\nAgora você pode editar e salvar na biblioteca.`);
}

function inserirCodigoAcorde(codigo) {
    const editor = document.getElementById('editor');
    const start = editor.selectionStart;
    editor.value = editor.value.substring(0, start) + codigo + editor.value.substring(start);
    renderizar();
    salvarAulaAtual();
}

function inserirAcorde() {
    const opcao = prompt(
        '🎸 INSERIR ACORDE\n\n' +
        '1 - Biblioteca Básica (C, G, Am, F, D, Em)\n' +
        '2 - Minha Biblioteca (acordes salvos)\n' +
        '3 - Acorde Dinâmico (1;3 = Sol Maior)\n' +
        '4 - Editor de Acordes\n\n' +
        'Digite o número da opção:'
    );

    if (opcao === '1') {
        const sigla = prompt('Digite a sigla do acorde (C, G, D, Am, Em, F):', 'C');
        if (sigla && window.ACORDES && window.ACORDES[sigla]) {
            inserirCodigoAcorde(`[Acorde:${sigla}]${window.ACORDES[sigla].nome}[/Acorde]`);
        } else if (sigla) {
            alert(`❌ Acorde "${sigla}" não encontrado! Use: C, G, D, Am, Em, F`);
        }
    } else if (opcao === '2') {
        if (typeof bibliotecaAcordes !== 'undefined' && Object.keys(bibliotecaAcordes).length > 0) {
            const lista = Object.entries(bibliotecaAcordes)
                .map(([sigla, acorde]) => `${sigla} - ${acorde.nome}`)
                .join('\n');
            const sigla = prompt(`📚 SEUS ACORDES SALVOS:\n\n${lista}\n\nDigite a sigla:`, '');
            if (sigla && bibliotecaAcordes[sigla]) {
                inserirCodigoAcorde(`[Acorde:${sigla}]${bibliotecaAcordes[sigla].nome}[/Acorde]`);
            } else if (sigla) {
                alert(`❌ Acorde "${sigla}" não encontrado!`);
            }
        } else {
            alert('📭 Nenhum acorde salvo! Use a opção 4 para criar.');
        }
    } else if (opcao === '3') {
        const formato = prompt(
            '🎸 Acorde Dinâmico\n\n' +
            'Formatos:\n' +
            '• 1;3 = Sol Maior (forma maior, casa 3)\n' +
            '• 2;5 = Lá Menor (forma menor, casa 5)\n' +
            '• 1;3;5 = Dó Maior (corda base 5)\n\n' +
            'Digite o formato:'
        );
        if (formato && typeof window.processarAcordeDinamico === 'function') {
            const acordeTemp = window.processarAcordeDinamico(formato, '');
            if (acordeTemp) {
                inserirCodigoAcorde(`[Acorde:${formato}]${acordeTemp.nome}[/Acorde]`);
            } else {
                alert(`❌ Formato "${formato}" inválido! Exemplo: 1;3`);
            }
        } else if (formato) {
            alert('❌ Módulo de acordes sonoros não carregado!');
        }
    } else if (opcao === '4') {
        abrirEditorAcordes();
    } else if (opcao !== null) {
        alert('Opção inválida! Digite 1, 2, 3 ou 4');
    }
}
