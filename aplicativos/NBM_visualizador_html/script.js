//====================================================
//ATUALIZAÇÃO: 01-05-25
//====================================================

document.addEventListener('DOMContentLoaded', () => {
    const fileListElement = document.getElementById('files-ul');
    const contentFrame = document.getElementById('content-frame');
    const searchInput = document.getElementById('search-input');
    const htmlFiles = [
        { 
            name: "NBM - Alunos - Lista", 
            path: "content/nbm_alunos_lista.html",
            subpages: [
               
                { 
                    name: "Jerfesson", 
                    path: "content/.html",
                    subpages: [
                        { name: "1 - Jerfesson Violão Popular", path: "content/html/nbm_jefferson_violãopopular.html" },
                        { name: "2 - Jerfesson Violino ", path: "content/.html" },
                        { name: "3 - Jerfesson Teclado", path: "content/.html" },
                        { name: "4 - Jerfesson Saxofone Alto", path: "content/.html" },
                        { name: "5 - Jerfesson Flauta Doce Soprano", path: "content/.html" },
                        { name: "6 - Jerfesson Violão Classico ", path: "content/.html" },
                        { name: "7 - Jerfesson Ukulele", path: "content/.html" },
                        { name: "8 - Jerfesson Trompete", path: "content/.html" },
                        { name: "9 - Jerfesson Canto Coral", path: "content/.html" },
                        { name: "10 - Jerfesson Canto", path: "content/.html" },
                        { name: "11 - Jerfesson Arranjo/Composição", path: "content/.html" },
                        { name: "12 - Jerfesson Harmonia", path: "content/.html" },
                        { name: "13 - Jerfesson Improvisação", path: "content/.html" },
                        { name: "14 - Jerfesson Notação Musical-ABC", path: "content/.html" },
                        { name: "15 - Jerfesson Piano", path: "content/page1/section3/item2.html" }
                    ]

                },

                {
                    name: "Gervásio", 
                    path: "content/Repertório.html",
                    subpages: [
                        { name: "Melodia", path: "content/html/Repertório1.html" },
                        { name: "Harmonia", path: "content/html/Repertório1.html" },
                        { name: "Ritmo", path: "content/html/Repertório1.html" },
                        { name: "Repertório - Cifra", path: "content/html/Repertório2.html" },
                        { name: "Repertório - Cifra e Letra", path: "content/html/Repertório2.html" }
                    ]
                },

                {
                    name: "Hanna", 
                    path: "content/Repertório.html",
                    subpages: [
                        { name: "Melodia", path: "content/html/Repertório1.html" },
                        { name: "Harmonia", path: "content/html/Repertório1.html" },
                        { name: "Ritmo", path: "content/html/Repertório1.html" },
                        { name: "Repertório - Cifra", path: "content/html/Repertório2.html" },
                        { name: "Repertório - Cifra e Letra", path: "content/html/Repertório2.html" },
                        { name: "Repertório - Partitura", path: "content/html/Repertório2.html" }
                    ]
                }
            ]
        },
      
       /* { 
            name: "Outra Página (Exemplo 2)", 
            path: "content/documento.html",
            subpages: [
                { name: "Subpágina 2.1", path: "content/page2/subpage1.html" }
            ]
        },
*/
        {   
            name: "Arquivos - Lista", 
            path: "content/html/listadearquivos.html",
            subpages: [
                { name: "Arquivos", path: "content/html/arquivos_geral.html" }
            ]
        
        }
    ];
    let listItems = [];
    let currentActiveLink = null;
    function createListItem(file, parentElement, level = 0) {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = file.path;
        link.textContent = file.name;
        link.title = file.name;
        link.addEventListener('click', (event) => {
            event.preventDefault();
            if (file.subpages) {
                const parentLi = event.target.closest('li');
                parentLi.classList.toggle('collapsed');
                const subpagesUl = parentLi.querySelector('ul');
                if (subpagesUl) {
                    subpagesUl.style.display = parentLi.classList.contains('collapsed') ? 'none' : 'block';
                }
                contentFrame.src = file.path;
                if (currentActiveLink) {
                    currentActiveLink.classList.remove('active');
                }
                link.classList.add('active');
                currentActiveLink = link;
            } else {
                if (currentActiveLink) {
                    currentActiveLink.classList.remove('active');
                }
                contentFrame.src = link.href;
                link.classList.add('active');
                currentActiveLink = link;
            }
        });
        listItem.appendChild(link);
        if (file.subpages) {
            listItem.classList.add('has-subpages', 'collapsed');
            const subpagesUl = document.createElement('ul');
            subpagesUl.className = 'subpages';
            file.subpages.forEach(subFile => {
                createListItem(subFile, subpagesUl, level + 1);
            });
            listItem.appendChild(subpagesUl);
        }
        parentElement.appendChild(listItem);
        listItems.push({ 
            element: listItem, 
            name: file.name.toLowerCase(),
            level: level
        });
    }
    function populateFileList(files) {
        fileListElement.innerHTML = '';
        listItems = [];
        files.forEach(file => {
            createListItem(file, fileListElement);
        });
        loadInitialFile();
    }
    function filterFiles() {
        const searchTerm = searchInput.value.toLowerCase();
        let hasVisibleItems = false;
        listItems.forEach(item => {
            const isVisible = item.name.includes(searchTerm);
            const isParentVisible = item.level === 0 || 
                                    Array.from(item.element.parentNode.children).some(
                                        child => !child.classList.contains('hidden')
                                    );
            item.element.classList.toggle('hidden', !(isVisible || isParentVisible));
            if (isVisible || isParentVisible) {
                hasVisibleItems = true;
                 if (item.element.querySelector('ul')) {
                    item.element.classList.remove('collapsed');
                    item.element.querySelector('ul').style.display = 'block';
                }
            }
        });
        updateActiveLinkAfterFilter();
    }
    function updateActiveLinkAfterFilter() {
        if (currentActiveLink && currentActiveLink.closest('li').classList.contains('hidden')) {
            currentActiveLink.classList.remove('active');
            currentActiveLink = null;
        }
        const firstVisibleItem = listItems.find(item => !item.element.classList.contains('hidden'));
        if (firstVisibleItem && !currentActiveLink) {
            const firstLink = firstVisibleItem.element.querySelector('a');
            if (firstLink) {
                contentFrame.src = firstLink.href;
                firstLink.classList.add('active');
                currentActiveLink = firstLink;
            }
        } else if (!hasVisibleItems(listItems) && searchInput.value !== '') {
            contentFrame.src = 'about:blank';
        }
    }
    function hasVisibleItems(items) {
        return items.some(item => !item.element.classList.contains('hidden'));
    }
    function loadInitialFile() {
        const firstItem = listItems.find(item => item.level === 0);
        if (firstItem) {
            const firstLink = firstItem.element.querySelector('a');
            if (firstLink && !currentActiveLink) {
                contentFrame.src = firstLink.href;
                firstLink.classList.add('active');
                currentActiveLink = firstLink;
            }
        }
    }
    populateFileList(htmlFiles);
    searchInput.addEventListener('input', filterFiles);
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
        }
    });
});