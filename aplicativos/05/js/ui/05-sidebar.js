// ============================================
// RENDERIZAR LISTA DE AULAS (SIDEBAR)
// ============================================

function renderizarListaAulas() {
    const listaAulas = document.getElementById('listaAulas');
    if (!listaAulas) return;
    listaAulas.innerHTML = '';

    const novaListaBtn = document.createElement('button');
    novaListaBtn.textContent = '+ Nova Lista';
    novaListaBtn.style.background = '#e94560';
    novaListaBtn.style.marginBottom = '15px';
    novaListaBtn.style.width = '100%';
    novaListaBtn.style.padding = '10px';
    novaListaBtn.style.cursor = 'pointer';
    novaListaBtn.style.border = 'none';
    novaListaBtn.style.borderRadius = '5px';
    novaListaBtn.style.color = 'white';
    novaListaBtn.style.fontWeight = 'bold';
    novaListaBtn.onclick = () => criarLista(null);
    listaAulas.appendChild(novaListaBtn);

    if (!dados.listas || dados.listas.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.textContent = '📭 Nenhuma lista. Clique em "+ Nova Lista" para começar.';
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.padding = '20px';
        emptyMsg.style.color = '#999';
        listaAulas.appendChild(emptyMsg);
        return;
    }

    function renderizarListaRecursiva(lista, caminho, nivel = 0) {
        const listaDiv = document.createElement('div');
        listaDiv.style.marginBottom = '10px';
        listaDiv.style.marginLeft = `${nivel * 15}px`;
        if (nivel > 0) {
            listaDiv.style.borderLeft = '2px solid #e94560';
            listaDiv.style.paddingLeft = '10px';
        }

        const headerDiv = document.createElement('div');
        headerDiv.style.display = 'flex';
        headerDiv.style.justifyContent = 'space-between';
        headerDiv.style.alignItems = 'center';
        headerDiv.style.padding = '8px';
        headerDiv.style.background = nivel === 0 ? '#0f3460' : '#1a1a3e';
        headerDiv.style.borderRadius = '5px';
        headerDiv.style.cursor = 'pointer';
        headerDiv.style.marginTop = '5px';

        const tituloSpan = document.createElement('span');
        tituloSpan.style.fontWeight = 'bold';
        tituloSpan.style.color = '#e94560';

        const pathKey = obterChaveDoCaminho(caminho);
        const isExpanded = expandedPaths.has(pathKey);
        tituloSpan.innerHTML = isExpanded ? `📂 ${lista.nome}` : `📁 ${lista.nome}`;

        const botoesDiv = document.createElement('div');
        botoesDiv.style.display = 'flex';
        botoesDiv.style.gap = '5px';

        const addSubListBtn = document.createElement('button');
        addSubListBtn.textContent = '📁+';
        addSubListBtn.style.padding = '4px 8px';
        addSubListBtn.style.background = '#f39c12';
        addSubListBtn.style.border = 'none';
        addSubListBtn.style.borderRadius = '3px';
        addSubListBtn.style.cursor = 'pointer';
        addSubListBtn.style.color = 'white';
        addSubListBtn.style.fontSize = '11px';
        addSubListBtn.onclick = (e) => { e.stopPropagation(); criarLista(caminho); };

        const addCardBtn = document.createElement('button');
        addCardBtn.textContent = '+';
        addCardBtn.style.padding = '4px 10px';
        addCardBtn.style.background = '#2ecc71';
        addCardBtn.style.border = 'none';
        addCardBtn.style.borderRadius = '3px';
        addCardBtn.style.cursor = 'pointer';
        addCardBtn.style.color = 'white';
        addCardBtn.onclick = (e) => { e.stopPropagation(); criarCartao(caminho); };

        const editListBtn = document.createElement('button');
        editListBtn.textContent = '✏️';
        editListBtn.style.padding = '4px 8px';
        editListBtn.style.background = '#3a86ff';
        editListBtn.style.border = 'none';
        editListBtn.style.borderRadius = '3px';
        editListBtn.style.cursor = 'pointer';
        editListBtn.style.color = 'white';
        editListBtn.onclick = (e) => { e.stopPropagation(); renomearLista(caminho); };

        const deleteListBtn = document.createElement('button');
        deleteListBtn.textContent = '🗑️';
        deleteListBtn.style.padding = '4px 8px';
        deleteListBtn.style.background = '#e94560';
        deleteListBtn.style.border = 'none';
        deleteListBtn.style.borderRadius = '3px';
        deleteListBtn.style.cursor = 'pointer';
        deleteListBtn.style.color = 'white';
        deleteListBtn.onclick = (e) => { e.stopPropagation(); excluirLista(caminho); };

        botoesDiv.appendChild(addSubListBtn);
        botoesDiv.appendChild(addCardBtn);
        botoesDiv.appendChild(editListBtn);
        botoesDiv.appendChild(deleteListBtn);
        headerDiv.appendChild(tituloSpan);
        headerDiv.appendChild(botoesDiv);

        const contentContainer = document.createElement('div');
        contentContainer.className = 'cards-container';
        contentContainer.style.paddingLeft = '10px';
        contentContainer.style.marginTop = '5px';
        contentContainer.style.display = isExpanded ? 'block' : 'none';

        if (lista.cards && lista.cards.length > 0) {
            for (let cardIdx = 0; cardIdx < lista.cards.length; cardIdx++) {
                const card = lista.cards[cardIdx];
                const cardDiv = document.createElement('div');
                cardDiv.className = 'cartao';
                cardDiv.style.display = 'flex';
                cardDiv.style.justifyContent = 'space-between';
                cardDiv.style.alignItems = 'center';
                cardDiv.style.background = '#1a1a2e';
                cardDiv.style.borderLeft = '3px solid #e94560';
                cardDiv.style.padding = '6px 8px';
                cardDiv.style.margin = '3px 0';
                cardDiv.style.borderRadius = '3px';
                cardDiv.style.cursor = 'pointer';

                const cardTitle = document.createElement('span');
                cardTitle.textContent = `📄 ${card.texto}`;
                cardTitle.style.fontSize = '12px';
                cardTitle.style.flex = '1';

                const cardActions = document.createElement('div');
                cardActions.style.display = 'flex';
                cardActions.style.gap = '5px';

                const editCardBtn = document.createElement('button');
                editCardBtn.textContent = '✏️';
                editCardBtn.style.padding = '2px 6px';
                editCardBtn.style.background = '#3a86ff';
                editCardBtn.style.border = 'none';
                editCardBtn.style.borderRadius = '3px';
                editCardBtn.style.cursor = 'pointer';
                editCardBtn.style.color = 'white';
                editCardBtn.style.fontSize = '10px';
                editCardBtn.onclick = (e) => { e.stopPropagation(); renomearCartao(caminho, cardIdx); };

                const deleteCardBtn = document.createElement('button');
                deleteCardBtn.textContent = '🗑️';
                deleteCardBtn.style.padding = '2px 6px';
                deleteCardBtn.style.background = '#e94560';
                deleteCardBtn.style.border = 'none';
                deleteCardBtn.style.borderRadius = '3px';
                deleteCardBtn.style.cursor = 'pointer';
                deleteCardBtn.style.color = 'white';
                deleteCardBtn.style.fontSize = '10px';
                deleteCardBtn.onclick = (e) => { e.stopPropagation(); excluirCartao(caminho, cardIdx); };

                cardActions.appendChild(editCardBtn);
                cardActions.appendChild(deleteCardBtn);
                cardDiv.appendChild(cardTitle);
                cardDiv.appendChild(cardActions);
                cardDiv.onclick = () => carregarAula(caminho, cardIdx);
                contentContainer.appendChild(cardDiv);
            }
        }

        if (lista.sublistas && lista.sublistas.length > 0) {
            for (let subIdx = 0; subIdx < lista.sublistas.length; subIdx++) {
                const subPath = [...caminho, subIdx];
                const subDiv = renderizarListaRecursiva(lista.sublistas[subIdx], subPath, nivel + 1);
                contentContainer.appendChild(subDiv);
            }
        }

        if ((!lista.cards || lista.cards.length === 0) && (!lista.sublistas || lista.sublistas.length === 0)) {
            const emptyMsg = document.createElement('div');
            emptyMsg.textContent = '📭 Nenhum conteúdo. Clique em "+" para adicionar cartão ou "📁+" para sub-lista.';
            emptyMsg.style.padding = '8px';
            emptyMsg.style.color = '#888';
            emptyMsg.style.fontSize = '11px';
            emptyMsg.style.textAlign = 'center';
            contentContainer.appendChild(emptyMsg);
        }

        headerDiv.onclick = (e) => {
            if (e.target.tagName === 'BUTTON') return;
            if (expandedPaths.has(pathKey)) {
                expandedPaths.delete(pathKey);
                contentContainer.style.display = 'none';
                tituloSpan.innerHTML = `📁 ${lista.nome}`;
            } else {
                expandedPaths.add(pathKey);
                contentContainer.style.display = 'block';
                tituloSpan.innerHTML = `📂 ${lista.nome}`;
            }
        };

        listaDiv.appendChild(headerDiv);
        listaDiv.appendChild(contentContainer);
        return listaDiv;
    }

    dados.listas.forEach((lista, idx) => {
        const listaDiv = renderizarListaRecursiva(lista, [idx], 0);
        listaDiv.setAttribute('data-lista-idx', idx);
        listaAulas.appendChild(listaDiv);
    });
}

console.log('✅ Sidebar carregada');
