document.addEventListener('DOMContentLoaded', () => {
    const fileListElement = document.getElementById('files-ul');
    const contentFrame = document.getElementById('content-frame');
    const searchInput = document.getElementById('search-input');

    // --- Lista de Arquivos ---
    // Simulação de uma lista potencialmente grande (mantenha os exemplos curtos por enquanto)
    // Em um cenário real com 11.000 arquivos, esta lista pode vir de um servidor ou ser gerada.
    const htmlFiles = [
        { name: "Página de Exemplo 1", path: "content/page1.html" },
        { name: "Outra Página (Exemplo 2)", path: "content/page2.html" },
        { name: "Documento Importante", path: "content/documento.html" },
        // Adicione mais arquivos aqui conforme necessário
        // Exemplo: { name: "Relatório Anual 2023", path: "content/reports/annual2023.html" },
    ];
    // -------------------------

    let listItems = []; // Store the list items for filtering
    let currentActiveLink = null;

    // Função para popular a lista na barra lateral
    function populateFileList(files) {
        fileListElement.innerHTML = ''; // Limpa a lista atual
        listItems = []; // Limpa o array de items

        files.forEach(file => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = file.path;
            link.textContent = file.name;
            link.title = file.name; // Show full name on hover

            link.addEventListener('click', (event) => {
                event.preventDefault();

                if (currentActiveLink) {
                    currentActiveLink.classList.remove('active');
                }
                contentFrame.src = link.href;
                link.classList.add('active');
                currentActiveLink = link;
            });

            listItem.appendChild(link);
            fileListElement.appendChild(listItem);
            listItems.push({ element: listItem, name: file.name.toLowerCase() }); // Store li and name for search
        });

         // Carrega o primeiro arquivo visível *após* a filtragem inicial (se houver)
         loadInitialFile();
    }

    // Função para filtrar a lista de arquivos
    function filterFiles() {
        const searchTerm = searchInput.value.toLowerCase();
        let firstVisibleLink = null; // Keep track of the first match

        listItems.forEach(item => {
            const isVisible = item.name.includes(searchTerm);
            item.element.classList.toggle('hidden', !isVisible);

             // Check if this is the first *visible* link found during filtering
             if (isVisible && !firstVisibleLink) {
                firstVisibleLink = item.element.querySelector('a');
            }
        });

        // Se o link ativo atual ficou escondido, desmarque-o
        if (currentActiveLink && currentActiveLink.closest('li').classList.contains('hidden')) {
            currentActiveLink.classList.remove('active');
            currentActiveLink = null;
            // Optionally load the first *visible* item after filtering
            if (firstVisibleLink) {
                 contentFrame.src = firstVisibleLink.href;
                 firstVisibleLink.classList.add('active');
                 currentActiveLink = firstVisibleLink;
            } else {
                // Se nada corresponde, limpa o iframe
                contentFrame.src = 'about:blank';
                // Poderia mostrar uma mensagem "Nenhum resultado encontrado" aqui
            }
        } else if (!currentActiveLink && firstVisibleLink) {
            // Se nenhum link estava ativo e encontramos um visível, ativa o primeiro
            contentFrame.src = firstVisibleLink.href;
            firstVisibleLink.classList.add('active');
            currentActiveLink = firstVisibleLink;
        } else if (listItems.length > 0 && !firstVisibleLink && searchTerm !== '') {
            // Se há itens mas nenhum corresponde à busca, limpa o iframe
            contentFrame.src = 'about:blank';
        } else if (listItems.length > 0 && searchTerm === '' && !currentActiveLink){
             // If search is cleared and nothing was active, load the actual first file
             loadInitialFile();
        }
    }

     // Função para carregar o primeiro arquivo (geralmente chamado no início)
     function loadInitialFile() {
        const firstItem = listItems.find(item => !item.element.classList.contains('hidden'));
        if (firstItem) {
            const firstLink = firstItem.element.querySelector('a');
            if (firstLink && !currentActiveLink) { // Only load if nothing is active yet
                 contentFrame.src = firstLink.href;
                 firstLink.classList.add('active');
                 currentActiveLink = firstLink;
            }
        } else if (htmlFiles.length > 0) {
             // Handle case where list might be initially filtered to empty
            contentFrame.src = 'about:blank';
        }
         else {
            // Se não houver arquivos na lista original
            const p = document.createElement('p');
            p.textContent = "Nenhum arquivo HTML encontrado na lista.";
            p.style.padding = "20px";
             // Wait for iframe to be ready, or use srcdoc if simple text
             contentFrame.onload = () => {
                 try { // Iframe might be on a different origin in some setups
                      contentFrame.contentDocument.body.innerHTML = ''; // Clear previous
                      contentFrame.contentDocument.body.appendChild(p);
                 } catch(e) {
                    console.warn("Cannot access iframe content, likely due to cross-origin restrictions or it not being loaded yet.");
                    contentFrame.srcdoc = `<p style='padding: 20px; font-family: sans-serif;'>Nenhum arquivo HTML encontrado na lista.</p>`;
                 }
                 contentFrame.onload = null; // Prevent recursion
             };
              // Trigger onload if src is about:blank
              if(contentFrame.src === 'about:blank') {
                  contentFrame.dispatchEvent(new Event('load'));
              }
        }
    }


    // --- Inicialização ---
    populateFileList(htmlFiles); // Popula a lista inicialmente

    // Adiciona o event listener para o campo de busca
    searchInput.addEventListener('input', filterFiles);

    // Nota: O carregamento inicial do primeiro arquivo agora é chamado dentro de populateFileList/filterFiles

});