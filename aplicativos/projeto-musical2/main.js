// main.js

import { todasAsQuestoes } from './questoes/_loader.js';

let bancoQuestoes = {
    questoes: [...todasAsQuestoes]
};

// Elementos do DOM
const modalEdicao = document.getElementById('modal-edicao');
const formEdicao = document.getElementById('form-edicao');
const btnBuscar = document.getElementById('btn-buscar');
const resultadosContainer = document.getElementById('resultados');

// --- Funções Principais ---

function carregarQuestoes(filtros = {}) {
    const { ano, tipo, metodo } = filtros; // 'metodo' é o que estamos usando agora

    return bancoQuestoes.questoes.filter(questao => {
        const anoMatch = !ano || questao.ano == ano;
        const tipoMatch = !tipo || questao.tipo.toLowerCase() === tipo.toLowerCase();
        const metodoMatch = !metodo || (questao.metodo && questao.metodo.toLowerCase() === metodo.toLowerCase()); // Verifica se metodo existe
        return anoMatch && tipoMatch && metodoMatch;
    });
}

// Função para exibir recursos no modal de edição
function exibirRecursosModal(recursos) {
    const container = document.getElementById('lista-recursos');
    container.innerHTML = '';

    recursos.forEach((recurso, index) => {
        const item = document.createElement('div');
        item.className = 'recurso-item';
        // Ajustado para 'recurso.path'
        const nomeArquivo = recurso.path.split('/').pop();
        item.innerHTML = `
            <span>${nomeArquivo}</span>
            <button type="button" class="remover-recurso-btn" data-index="${index}">×</button>
        `;
        container.appendChild(item);
    });

    container.querySelectorAll('.remover-recurso-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            recursos.splice(index, 1);
            exibirRecursosModal(recursos);
        });
    });
}

// Função para abrir o modal de edição
function abrirModalEdicao(id) {
    const questao = bancoQuestoes.questoes.find(q => q.id === id);

    if (questao) {
        document.getElementById('editar-id').value = questao.id;
        document.getElementById('id-questao').textContent = questao.id;
        document.getElementById('editar-ano').value = questao.ano;
        document.getElementById('editar-tipo').value = questao.tipo;
        document.getElementById('editar-enunciado').value = questao.enunciado;
        // Ajustado para questao.resposta.valor
        document.getElementById('editar-resposta').value = questao.resposta ? questao.resposta.valor : '';
        // Ajustado para questao.metodo
        document.getElementById('editar-metodo').value = questao.metodo;

        const recursosEditaveis = [...questao.recursos];
        exibirRecursosModal(recursosEditaveis);

        const uploadRecursoInput = document.getElementById('upload-recurso');
        const oldUploadListener = uploadRecursoInput._currentListener;
        if (oldUploadListener) {
            uploadRecursoInput.removeEventListener('change', oldUploadListener);
        }

        const newUploadListener = function(e) {
            Array.from(e.target.files).forEach(file => {
                const tipoRecurso = file.type.startsWith('audio/') ? 'audio' : 'imagem';
                const caminho = `./assets/${tipoRecurso === 'audio' ? 'audios' : 'imagens'}/${file.name}`;
                recursosEditaveis.push({ tipo: tipoRecurso, path: caminho }); // Armazena como objeto
            });
            exibirRecursosModal(recursosEditaveis);
            e.target.value = '';
        };
        uploadRecursoInput.addEventListener('change', newUploadListener);
        uploadRecursoInput._currentListener = newUploadListener;

        const textareaEnunciado = document.getElementById('editar-enunciado');
        const contadorEnunciado = document.getElementById('contador-enunciado');
        textareaEnunciado.oninput = function() {
            contadorEnunciado.textContent = this.value.length;
        };
        contadorEnunciado.textContent = textareaEnunciado.value.length;

        modalEdicao.style.display = 'flex'; // Use flex para centralizar
        modalEdicao.dataset.recursosEditaveis = JSON.stringify(recursosEditaveis);
    }
}

// Função para validar formulário
function validarFormulario() {
    let valido = true;
    const camposObrigatorios = [
        'editar-enunciado',
        'editar-resposta',
        'editar-ano'
    ];

    camposObrigatorios.forEach(id => {
        const campo = document.getElementById(id);
        if (!campo.value.trim()) {
            campo.classList.add('invalido');
            valido = false;
        } else {
            campo.classList.remove('invalido');
        }
    });
    return valido;
}

// Função para salvar edição
function salvarEdicao(e) {
    e.preventDefault();

    if (!validarFormulario()) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }

    const id = document.getElementById('editar-id').value;
    const questaoIndex = bancoQuestoes.questoes.findIndex(q => q.id === id);

    if (questaoIndex !== -1) {
        const recursosEditaveis = JSON.parse(modalEdicao.dataset.recursosEditaveis);

        bancoQuestoes.questoes[questaoIndex] = {
            ...bancoQuestoes.questoes[questaoIndex],
            ano: parseInt(document.getElementById('editar-ano').value),
            tipo: document.getElementById('editar-tipo').value,
            enunciado: document.getElementById('editar-enunciado').value,
            // Salva a resposta no novo formato de objeto
            resposta: {
                tipo: "texto", // Presumindo tipo texto para edição no modal
                valor: document.getElementById('editar-resposta').value
            },
            metodo: document.getElementById('editar-metodo').value, // Ajustado para 'metodo'
            recursos: recursosEditaveis
        };

        modalEdicao.style.display = 'none';
        buscarQuestoes();
        localStorage.setItem('bancoQuestoes', JSON.stringify(bancoQuestoes));
        console.log('Questão salva!', bancoQuestoes.questoes[questaoIndex]);
    }
}

function buscarQuestoes() {
    const ano = document.getElementById('filtro-ano').value;
    const tipo = document.getElementById('filtro-tipo').value;
    const metodo = document.getElementById('filtro-metodo').value; // Ajustado para 'metodo'

    const questoesFiltradas = carregarQuestoes({ ano, tipo, metodo });
    exibirQuestoes(questoesFiltradas);
}

// Função para exibir as questões na interface principal
function exibirQuestoes(questoes) {
    resultadosContainer.innerHTML = '';

    if (questoes.length === 0) {
        resultadosContainer.innerHTML = '<p class="sem-resultados">Nenhuma questão encontrada com esses filtros.</p>';
        return;
    }

    questoes.forEach(questao => {
        const card = document.createElement('div');
        card.className = 'card-questao';
        card.innerHTML = `
            <h3>${questao.id} - ${questao.tipo.toUpperCase()} (${questao.ano}º Ano)</h3>
            <p><strong>Habilidade BNCC:</strong> ${questao.habilidadeBNCC || 'N/A'}</p>
            <p><strong>Enunciado:</strong> ${questao.enunciado}</p>
            ${gerarRecursosHTML(questao.recursos)}
            <p><strong>Resposta Esperada:</strong> ${questao.resposta ? questao.resposta.valor : 'N/A'}</p>
            <p><strong>Método:</strong> ${questao.metodo}</p>
            <div class="acoes">
                <button class="btn-editar" data-id="${questao.id}">Editar</button>
            </div>
        `;
        resultadosContainer.appendChild(card);
    });

    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', function() {
            abrirModalEdicao(this.getAttribute('data-id'));
        });
    });
}

// Função auxiliar para gerar o HTML dos recursos (áudio/imagem)
function gerarRecursosHTML(recursos) {
    if (!recursos || recursos.length === 0) return '';
    return recursos.map(recurso => {
        // Agora 'recurso' é um objeto { tipo: "audio", path: "..." }
        if (recurso.tipo === 'audio') {
            return `<audio controls src="${recurso.path}" class="recurso-audio"></audio>`;
        } else if (recurso.tipo === 'imagem') {
            return `<img src="${recurso.path}" alt="Recurso visual" class="recurso-imagem">`;
        }
        return '';
    }).join('');
}

// --- Event Listeners Globais ---

document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('bancoQuestoes');
    if (saved) {
        const parsedSaved = JSON.parse(saved);
        if (parsedSaved && Array.isArray(parsedSaved.questoes)) {
            bancoQuestoes = parsedSaved;
        } else {
            console.warn("Dados salvos no localStorage não estão no formato esperado. Recarregando do _loader.js.");
            bancoQuestoes.questoes = [...todasAsQuestoes];
        }
    } else {
        bancoQuestoes.questoes = [...todasAsQuestoes];
    }

    buscarQuestoes();

    btnBuscar.addEventListener('click', buscarQuestoes);

    document.querySelector('.fechar-modal').addEventListener('click', () => {
        modalEdicao.style.display = 'none';
    });

    document.querySelector('.btn-cancelar').addEventListener('click', () => {
        modalEdicao.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modalEdicao) {
            modalEdicao.style.display = 'none';
        }
    });

    formEdicao.addEventListener('submit', salvarEdicao);
});