const tonalidadesLista = [
"C","G","D","A","E","B","F#","C#",
"F","Bb","Eb","Ab","Db","Gb","Cb",
"Cm","Gm","Dm","Am","Em","Bm","F#m","C#m",
"Fm","Bbm","Ebm","Abm","Dbm","Gbm","Cbm"
];

function getLivros(){
  return JSON.parse(localStorage.getItem("livros")) || [];
}

function salvarLivros(livros){
  localStorage.setItem("livros", JSON.stringify(livros));
}

function adicionarLivro(){
  const nome = document.getElementById("nomeLivro").value;
  const instrumento = document.getElementById("instrumento").value;

  if(!nome) return;

  const livros = getLivros();
  livros.push({
    id: Date.now(),
    nome,
    instrumento,
    estudos:[]
  });

  salvarLivros(livros);
  location.reload();
}

function carregarLivros(){
  const container = document.getElementById("livros");
  if(!container) return;

  const livros = getLivros();
  container.innerHTML = "";

  livros.forEach(livro=>{
    container.innerHTML += `
      <div class="card">
        <strong>${livro.nome}</strong> - ${livro.instrumento}
        <br>
        <a href="livro.html?id=${livro.id}">Abrir</a>
        <button onclick="excluirLivro(${livro.id})">Excluir</button>
      </div>
    `;
  });
}

function excluirLivro(id){
  let livros = getLivros();
  livros = livros.filter(l=>l.id !== id);
  salvarLivros(livros);
  location.reload();
}

function getLivroAtual(){
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  const livros = getLivros();
  return livros.find(l=>l.id === id);
}

function salvarLivroAtual(livroAtual){
  let livros = getLivros();
  livros = livros.map(l=>l.id === livroAtual.id ? livroAtual : l);
  salvarLivros(livros);
}

function carregarLivro(){
  const livro = getLivroAtual();
  if(!livro) return;

  document.getElementById("tituloLivro").innerText =
    livro.nome + " - " + livro.instrumento;

  const tonalidadesDiv = document.getElementById("tonalidades");

  tonalidadesLista.forEach(t=>{
    tonalidadesDiv.innerHTML += `
      <label>
        <input type="checkbox" value="${t}"> ${t}
      </label>
    `;
  });

  atualizarHistorico();
}

function registrarEstudo(){
  const livro = getLivroAtual();
  if(!livro) return;

  const exercicio = document.getElementById("exercicio").value;
  const bpm = document.getElementById("bpm").value;
  const tempo = document.getElementById("tempo").value;

  const checks = document.querySelectorAll("#tonalidades input:checked");
  const tonalidades = Array.from(checks).map(c=>c.value);

  livro.estudos.push({
    data: new Date().toLocaleDateString(),
    exercicio,
    bpm,
    tempo,
    tonalidades
  });

  salvarLivroAtual(livro);
  location.reload();
}

function atualizarHistorico(){
  const livro = getLivroAtual();
  const historico = document.getElementById("historico");

  historico.innerHTML = "";

  livro.estudos.forEach(e=>{
    historico.innerHTML += `
      <div class="card">
        <strong>${e.data}</strong><br>
        Exercício: ${e.exercicio}<br>
        BPM: ${e.bpm}<br>
        Tempo: ${e.tempo} min<br>
        Tons: ${e.tonalidades.join(", ")}
      </div>
    `;
  });
}

carregarLivros();
carregarLivro();
