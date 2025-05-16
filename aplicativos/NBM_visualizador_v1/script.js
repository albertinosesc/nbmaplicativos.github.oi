// ====================================================
// ATUALIZAÇÃO: 16-05-25
// ====================================================

const files = [
    { 
        name: "NBM - Alunos - Lista", 
        path: "",
        subpages: [
            { 
                name: "Jerfesson", 
                path: "content/.html",
                subpages: [
                    { name: "1 - Jerfesson Violão Popular", path: "content/alunos/.html"},
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
                path: "",
                subpages: [
                    { name: "Gervásio_Teclado - 2", path: "content/alunos/.html"}
                ]
            },
            {
                name: "Hanna", 
                path: "",
                subpages: [
                    { name: "Hanna_Teclado - 1", path: "content/alunos/.html"}
                ]
            }
        ]
    },
    
        
];

const fileList = document.getElementById("file-list");
const iframe = document.getElementById("viewer");
const searchInput = document.getElementById("search-input");
const sidebar = document.getElementById("sidebar");
const overlay = document.querySelector(".mobile-overlay");
const toggle = document.querySelector(".menu-toggle");

function createList(items, parentUl) {
    items.forEach(item => {
        const li = document.createElement("li");

        if (item.subpages) {
            li.classList.add("folder");
            const span = document.createElement("span");
            span.textContent = item.name;
            span.onclick = () => li.classList.toggle("open");
            li.appendChild(span);

            const subUl = document.createElement("ul");
            subUl.classList.add("subpages");
            createList(item.subpages, subUl);
            li.appendChild(subUl);
        } else {
            const link = document.createElement("a");
            link.href = "#";
            link.textContent = item.name;
            link.onclick = (e) => {
                e.preventDefault();
                iframe.src = item.path;
                document.querySelectorAll("a").forEach(a => a.classList.remove("active"));
                link.classList.add("active");
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove("visible");
                    overlay.classList.remove("visible");
                }
            };
            li.appendChild(link);
        }

        parentUl.appendChild(li);
    });
}

createList(files, fileList);

// Ativar o link correspondente à página inicial
function activateInitialLink() {
    const initialPath = "content/alunos/Lista_Geral_Arquivo/Lista_Geral_Arquivo.html";
    const links = document.querySelectorAll('#file-list a');
    
    links.forEach(link => {
        if (link.closest('li').querySelector(`a[path="${initialPath}"]`) || 
            link.textContent.includes("Lista Geral") || 
            link.getAttribute('href') === `#${initialPath}`) {
            link.click();
        }
    });
}

// ====================================================
// ATUALIZAÇÃO: SISTEMA DE BUSCA MELHORADO
// ====================================================

searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase().trim();
    
    // Se o campo de busca estiver vazio, mostrar todos os itens
    if (term === "") {
        document.querySelectorAll("#file-list li").forEach(item => {
            item.style.display = "block";
            if (item.classList.contains("folder")) {
                item.classList.remove("force-open");
            }
        });
        return;
    }
    
    // Buscar em todos os elementos
    document.querySelectorAll("#file-list li").forEach(item => {
        let shouldDisplay = false;
        
        // Verificar o texto do item atual
        const textElement = item.querySelector("span, a");
        if (textElement && textElement.textContent.toLowerCase().includes(term)) {
            shouldDisplay = true;
        }
        
        // Verificar se algum subitem corresponde à busca
        if (item.classList.contains("folder")) {
            const subItems = item.querySelectorAll("li");
            let hasVisibleSubItems = false;
            
            subItems.forEach(subItem => {
                const subTextElement = subItem.querySelector("span, a");
                if (subTextElement && subTextElement.textContent.toLowerCase().includes(term)) {
                    hasVisibleSubItems = true;
                }
            });
            
            if (hasVisibleSubItems) {
                shouldDisplay = true;
                item.classList.add("force-open"); // Forçar abertura da pasta
            } else {
                item.classList.remove("force-open");
            }
        }
        
        // Aplicar visibilidade
        item.style.display = shouldDisplay ? "block" : "none";
    });
});

// Adicionar estilo para pastas forçadas a abrir
const style = document.createElement("style");
style.textContent = `
    li.folder.force-open > ul.subpages {
        display: block !important;
    }
    li.folder.force-open > span::before {
        content: "📂 ";
    }
`;
document.head.appendChild(style);

toggle.addEventListener("click", () => {
    sidebar.classList.toggle("visible");
    overlay.classList.toggle("visible");
});

overlay.addEventListener("click", () => {
    sidebar.classList.remove("visible");
    overlay.classList.remove("visible");
});

// Carregar página principal
iframe.src = "content/alunos/Lista_Geral_Arquivo/Lista_Geral_Arquivo.html";

// Ativar o link correspondente após o carregamento
window.addEventListener('load', activateInitialLink);
