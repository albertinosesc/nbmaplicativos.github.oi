//JS
// ====================================================
//ATUALIZAÇÃO: 14-05-25
//====================================================

    const files = [
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
                { name: "Arquivos", path: "content/html/arquivo.html" }
            ]
        
        }
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

    searchInput.addEventListener("input", () => {
      const term = searchInput.value.toLowerCase();
      document.querySelectorAll("#file-list a").forEach(link => {
        const text = link.textContent.toLowerCase();
        link.parentElement.style.display = text.includes(term) ? "block" : "none";
      });
    });

    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("visible");
      overlay.classList.toggle("visible");
    });

    overlay.addEventListener("click", () => {
      sidebar.classList.remove("visible");
      overlay.classList.remove("visible");
    });

    // Carregar página principal
    iframe.src = "content/html/indice.html";
