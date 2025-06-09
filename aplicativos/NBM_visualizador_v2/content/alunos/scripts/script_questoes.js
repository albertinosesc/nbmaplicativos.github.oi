//script_questoes.js
// IMPORTANTE: Este script assume que `questoesData` está disponível globalmente,
// vindo do arquivo `../../questao/text/questao.js`.

document.addEventListener('DOMContentLoaded', () => {
    const filtroAno = document.getElementById('filtro-ano');
    const filtroTipo = document.getElementById('filtro-tipo');
    const filtroMetodo = document.getElementById('filtro-metodo');
    const btnBuscar = document.getElementById('btn-buscar');
    const resultadosQuestoesDiv = document.getElementById('resultados-questoes'); 
    const listaDeQuestoesDiv = document.getElementById('lista-de-questoes'); 

    // Funções para o Modal de Edição (básico)
    const modalEdicao = document.getElementById('modal-edicao');
    const fecharModalBtn = modalEdicao.querySelector('.fechar-modal');
    const cancelarModalBtn = modalEdicao.querySelector('.btn-cancelar');
    const formEdicao = document.getElementById('form-edicao');

    // Função para abrir o modal e preencher com dados da questão
    function abrirModal(questionId) {
        const questao = questoesData.find(q => q.id === questionId);
        if (questao) {
            document.getElementById('id-questao').textContent = questao.id;
            document.getElementById('editar-id').value = questao.id;
            document.getElementById('editar-ano').value = questao.ano;
            document.getElementById('editar-tipo').value = questao.tipo;
            document.getElementById('editar-titulo').value = questao.titulo;
            document.getElementById('editar-enunciado').value = questao.enunciadoCurto;
            document.getElementById('editar-nivel').value = questao.nivelDificuldade || 'Médio'; 
            document.getElementById('editar-metodo').value = questao.metodo;
            
            const editarEnunciado = document.getElementById('editar-enunciado');
            const contadorEnunciado = document.getElementById('contador-enunciado');
            if (editarEnunciado && contadorEnunciado) {
                contadorEnunciado.textContent = editarEnunciado.value.length;
            }
        }
        modalEdicao.style.display = 'flex';
    }

    // Função para fechar o modal
    function fecharModal() {
        modalEdicao.style.display = 'none';
        formEdicao.reset();
    }

    // Event listeners para o modal
    fecharModalBtn.addEventListener('click', fecharModal);
    cancelarModalBtn.addEventListener('click', fecharModal);
    modalEdicao.addEventListener('click', (event) => {
        if (event.target === modalEdicao) {
            fecharModal();
        }
    });

    // Função para renderizar uma única questão como um card
    function criarCardQuestao(questao) {
        const divQuestao = document.createElement('div');
        divQuestao.classList.add('item-questao');
        divQuestao.dataset.questionId = questao.id; 

        divQuestao.innerHTML = `
            <h3>${questao.titulo || `Questão ${questao.id}`}</h3>
            <p><strong>ID:</strong> ${questao.id}</p>
            <p><strong>Ano:</strong> ${questao.ano}</p>
            <p><strong>Tipo:</strong> ${questao.tipo}</p>
            <p><strong>Método:</strong> ${questao.metodo}</p>
            <p><strong>Dificuldade:</strong> ${questao.nivelDificuldade || 'N/A'}</p>
            <p>${questao.enunciadoCurto || 'Clique para ver o enunciado completo.'}</p>
            <div class="botoes-acao">
                <button class="btn-visualizar" data-id="${questao.id}">Visualizar</button>
                <button class="btn-editar" data-id="${questao.id}">Editar</button>
                <button class="btn-excluir" data-id="${questao.id}">Excluir</button>
            </div>
        `;

        // Adiciona event listener para o botão "Visualizar"
        const btnVisualizar = divQuestao.querySelector('.btn-visualizar');
btnVisualizar.addEventListener('click', () => {
    window.location.href = 'questao.html?id=' + questao.id; // Ou o nome correto do arquivo
});

        // Adiciona event listener para o botão "Editar"
        const btnEditar = divQuestao.querySelector('.btn-editar');
        btnEditar.addEventListener('click', () => {
            abrirModal(questao.id);
        });

        // Adiciona event listener para o botão "Excluir"
        const btnExcluir = divQuestao.querySelector('.btn-excluir');
        btnExcluir.addEventListener('click', () => {
            if (confirm(`Tem certeza que deseja excluir a questão ${questao.id}?`)) {
                const index = questoesData.findIndex(q => q.id === questao.id);
                if (index > -1) {
                    questoesData.splice(index, 1); 
                    carregarTodasQuestoes(); 
                    alert(`Questão ${questao.id} "excluída" (apenas visualmente/localmente).`);
                }
            }
        });

        return divQuestao;
    }

    // Função para exibir questões (filtradas ou todas)
    function exibirQuestoes(questoesParaExibir, containerDiv) {
        containerDiv.innerHTML = ''; 

        if (questoesParaExibir.length === 0) {
            containerDiv.innerHTML = '<p class="sem-resultados">Nenhuma questão encontrada com os filtros selecionados.</p>';
            return;
        }

        questoesParaExibir.forEach(questao => {
            containerDiv.appendChild(criarCardQuestao(questao));
        });
    }

    // Função para filtrar as questões
    function filtrarQuestoes() {
        const anoSelecionado = filtroAno.value;
        const tipoSelecionado = filtroTipo.value;
        const metodoSelecionado = filtroMetodo.value;

        const questoesFiltradas = questoesData.filter(questao => {
            const anoCorresponde = !anoSelecionado || questao.ano == anoSelecionado;
            const tipoCorresponde = !tipoSelecionado || questao.tipo === tipoSelecionado;
            const metodoCorresponde = !metodoSelecionado || questao.metodo === metodoSelecionado;
            return anoCorresponde && tipoCorresponde && metodoCorresponde;
        });

        exibirQuestoes(questoesFiltradas, resultadosQuestoesDiv);

        // Limpa a lista de todas as questões se houver resultados de filtro
        if (anoSelecionado || tipoSelecionado || metodoSelecionado) {
            listaDeQuestoesDiv.innerHTML = ''; 
        } else {
            carregarTodasQuestoes(); 
        }
    }

    // Função para carregar todas as questões na seção "Todas as Questões Disponíveis"
    function carregarTodasQuestoes() {
        resultadosQuestoesDiv.innerHTML = '<p class="sem-resultados">Nenhuma questão encontrada. Utilize os filtros acima.</p>';
        filtroAno.value = "";
        filtroTipo.value = "";
        filtroMetodo.value = "";

        exibirQuestoes(questoesData, listaDeQuestoesDiv);
    }

    // Event Listeners
    btnBuscar.addEventListener('click', filtrarQuestoes);

    // Carregar todas as questões quando a página é carregada pela primeira vez
    carregarTodasQuestoes();

    // Event listener para o formulário de edição (apenas um exemplo)
    formEdicao.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('editar-id').value;
        const ano = document.getElementById('editar-ano').value;
        const tipo = document.getElementById('editar-tipo').value;
        const titulo = document.getElementById('editar-titulo').value;
        const enunciado = document.getElementById('editar-enunciado').value;
        const nivel = document.getElementById('editar-nivel').value;
        const metodo = document.getElementById('editar-metodo').value;
        
        console.log('Dados da questão a serem "salvos":', { id, ano, tipo, titulo, enunciado, nivel, metodo });
        
        const index = questoesData.findIndex(q => q.id === id);
        if (index > -1) {
            questoesData[index].ano = parseInt(ano);
            questoesData[index].tipo = tipo;
            questoesData[index].titulo = titulo;
            questoesData[index].enunciadoCurto = enunciado;
            questoesData[index].nivelDificuldade = nivel;
            questoesData[index].metodo = metodo;
        }
        
        alert('Lógica de salvar implementada no console e atualização local. Isso precisa ser conectado ao seu backend/sistema de dados para ser permanente.');
        fecharModal();
        carregarTodasQuestoes(); 
    });

    // Lógica para contador de caracteres do enunciado (dentro do modal)
    const editarEnunciado = document.getElementById('editar-enunciado');
    const contadorEnunciado = document.getElementById('contador-enunciado');

    if (editarEnunciado && contadorEnunciado) {
        editarEnunciado.addEventListener('input', () => {
            contadorEnunciado.textContent = editarEnunciado.value.length;
        });
    }
});

