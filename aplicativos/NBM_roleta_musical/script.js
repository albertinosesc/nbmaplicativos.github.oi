// Mapeamento das notas
const notas = {
    'C': new Audio('sons_notas/Dó.mp3'),
    'D': new Audio('sons_notas/RÉ.mp3'),
    'E': new Audio('sons_notas/MI.mp3'),
    'F': new Audio('sons_notas/FA.mp3'),
    'G': new Audio('sons_notas/SOL.mp3'),
    'A': new Audio('sons_notas/LA.mp3'),
    'B': new Audio('sons_notas/SI.mp3')
  };
  
  // Cores do arco-íris vibrantes
  const cores = {
    'C': '#FF0000',    // Vermelho - Dó
    'D': '#FF7F00',    // Laranja - Ré
    'E': '#FFFF00',    // Amarelo - Mi
    'F': '#00FF00',    // Verde - Fá
    'G': '#0000FF',    // Azul - Sol
    'A': '#4B0082',    // Índigo - Lá
    'B': '#BF00FF'     // Violeta Neon - Si
  };
  
  // Nome das notas
  const nomes = {
    'C': 'Dó',
    'D': 'Ré',
    'E': 'Mi',
    'F': 'Fá',
    'G': 'Sol',
    'A': 'Lá',
    'B': 'Si'
  };
  
  // Números das notas
  const numeros = {
    'C': '1',
    'D': '2',
    'E': '3',
    'F': '4',
    'G': '5',
    'A': '6',
    'B': '7'
  };
  
  // Mapeamento das imagens de frutas
  const imagensFrutas = {
    'C': 'images/frutas/tomate-do.png',      
    'D': 'images/frutas/laranja-re.png',   
    'E': 'images/frutas/banana-mi.png',  
    'F': 'images/frutas/abacate-fa.png',   
    'G': 'images/frutas/amora-sol.png',  
    'A': 'images/frutas/uva-la.png',  
    'B': 'images/frutas/Berinjela-ai.png' 
  };
  
  // Mapeamento das imagens musicais
  const imagensMusicais = {
    'C': 'images/notas/do.png',   
    'D': 'images/notas/re.png',
    'E': 'images/notas/mi.png',
    'F': 'images/notas/fa.png',
    'G': 'images/notas/sol.png',
    'A': 'images/notas/la.png',
    'B': 'images/notas/si.png'
  };
  
  let rotacaoAtual = 0;
  let setores = [];
  let somAtivado = true;
  
  // Função para atualizar a roleta com base na quantidade de notas
  function atualizarRoleta() {
    const roleta = document.getElementById('roleta');
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const todasNotas = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    setores = todasNotas.slice(0, quantidade);
    const anguloPorSetor = 360 / quantidade;
  
    // Atualiza o fundo da roleta com o gradiente de cores
    let gradiente = setores.map((nota, i) => {
      const start = i * anguloPorSetor;
      const end = (i + 1) * anguloPorSetor;
      return `${cores[nota]} ${start}deg ${end}deg`;
    }).join(', ');
    roleta.style.background = `conic-gradient(${gradiente})`;
  
    // Remove as labels antigas
    roleta.innerHTML = '';
  }
  
  // Função para exibir o resultado conforme a opção selecionada
  function exibirResultado(nota) {
    const tipoExibicao = document.querySelector('input[name="exibicao"]:checked').value;
    const resultadoContainer = document.getElementById('resultado-container');
    const textoResultado = document.getElementById('resultado');
    const imagemResultado = document.getElementById('imagem-resultado');
  
    // Esconder ambos inicialmente
    textoResultado.style.display = 'none';
    imagemResultado.style.display = 'none';
  
    switch(tipoExibicao) {
      case 'frutas':
        imagemResultado.src = imagensFrutas[nota];
        imagemResultado.alt = `Fruta representando a nota ${nota}`;
        imagemResultado.style.display = 'block';
        break;
      case 'pentagrama':
        imagemResultado.src = imagensMusicais[nota];
        imagemResultado.alt = `Nota ${nota} no pentagrama`;
        imagemResultado.style.display = 'block';
        break;
      case 'nome':
        textoResultado.textContent = nomes[nota];
        textoResultado.style.display = 'block';
        break;
      case 'numero':
        textoResultado.textContent = numeros[nota];
        textoResultado.style.display = 'block';
        break;
      case 'cifra':
        textoResultado.textContent = nota;
        textoResultado.style.display = 'block';
        break;
    }
  }
  
  // Evento para girar a roleta e sortear a nota
  function rodarRoleta() {
    const roleta = document.getElementById('roleta');
    const quantidade = setores.length;
    const anguloPorSetor = 360 / quantidade;
  
    const rotacoesCompletas = 5;
    const rotacaoAleatoria = Math.floor(Math.random() * 360);
    const novaRotacao = rotacoesCompletas * 360 + rotacaoAleatoria;
    rotacaoAtual += novaRotacao;
    roleta.style.transform = `rotate(${rotacaoAtual}deg)`;
  
    
    setTimeout(() => {
      const anguloFinal = rotacaoAtual % 360;
      const anguloSeta = (anguloFinal + 0) % 360;
      const indiceNota = Math.floor((360 - anguloSeta) / anguloPorSetor) % quantidade;
  
      const nota = setores[indiceNota];
      
      if (somAtivado) {
        notas[nota].play();
      }
  
      exibirResultado(nota);
    }, 3100);
  }
  
  // Configuração dos event listeners
  function configurarEventListeners() {
    document.getElementById('atualizar').addEventListener('click', atualizarRoleta);
    document.getElementById('botao').addEventListener('click', rodarRoleta);
    
    // Ocultar/mostrar resultado
    let resultadoVisivel = true;
    document.getElementById('ocultarResultado').addEventListener('click', function() {
      const resultadoDiv = document.getElementById('nota-sorteada');
      if (resultadoVisivel) {
        resultadoDiv.style.display = 'none';
        this.textContent = 'Mostrar Resultado';
      } else {
        resultadoDiv.style.display = 'block';
        this.textContent = 'Ocultar Resultado';
      }
      resultadoVisivel = !resultadoVisivel;
    });
  
    // Ativar/desativar som
    document.getElementById('toggleSom').addEventListener('click', function() {
      somAtivado = !somAtivado;
      this.textContent = somAtivado ? 'Desativar Som' : 'Ativar Som';
    });
  
    // Eventos de teclado
    document.addEventListener('keydown', function(event) {
      if (event.code === 'Space') {
        event.preventDefault();
        rodarRoleta();
      }
      
      if (event.code === 'Enter') {
        event.preventDefault();
        document.getElementById('ocultarResultado').click();
      }
    });
  
    // Atualizar exibição quando mudar o tipo
    document.querySelectorAll('input[name="exibicao"]').forEach(radio => {
      radio.addEventListener('change', function() {
        const notaAtual = document.getElementById('resultado').textContent;
        if (notaAtual && notaAtual !== '-') {
          const nota = Object.keys(nomes).find(key => 
            nomes[key] === notaAtual || 
            numeros[key] === notaAtual || 
            key === notaAtual
          );
          if (nota) exibirResultado(nota);
        }
      });
    });
  }
  
  // Inicialização
  function inicializar() {
    configurarEventListeners();
    atualizarRoleta();
  }
  
  // Inicia a aplicação quando o DOM estiver carregado
  document.addEventListener('DOMContentLoaded', inicializar);