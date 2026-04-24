<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Catálogo de Estudos de Piano</title>
<style>
body{font-family:Arial, sans-serif; background:#f4f4f4; padding:20px}
.container{max-width:1000px; margin:auto; background:white; padding:20px; border-radius:10px; box-shadow:0 0 10px rgba(0,0,0,0.1)}
h1{text-align:center}
input, select{width:100%; padding:8px; margin:5px 0 10px}
button{padding:10px; margin-top:5px; background:#4CAF50; color:white; border:none; cursor:pointer}
button:hover{background:#45a049}
.delete-btn{background:#e74c3c}
.edit-btn{background:#3498db}
.sort-btn{background:#9b59b6}
table{width:100%; border-collapse:collapse; margin-top:20px}
th, td{border:1px solid #ddd; padding:8px; text-align:center}
th{background:#333; color:white}
.hidden{display:none}
</style>
</head>
<body>
<div class="container">
<h1>Catálogo de Piano</h1>

<label>Música</label>
<input type="text" id="musica">

<label>Livro</label>
<input type="text" id="livro">

<label>Execução</label>
<select id="execucao" onchange="toggleCampos()">
<option value="MD">MD</option>
<option value="ME">ME</option>
<option value="MA">MA</option>
<option value="MJ">MJ</option>
<option value="MS">MS</option>
</select>

<div id="camposMaos" class="hidden">
<label>Notas MD</label>
<input type="text" id="mdNotas" placeholder="Ex: C D E">

<label>Notas ME</label>
<input type="text" id="meNotas" placeholder="Ex: A B C">
</div>

<label>Quantidade de Notas (QN)</label>
<input type="number" id="qn">

<label>Ritmo (R)</label>
<input type="text" id="ritmo" placeholder="Ex: 1,2 ou 1 2 3">

<label>Intervalo (I)</label>
<input type="text" id="intervalo">

<button onclick="adicionar()">Adicionar</button>
<button class="sort-btn" onclick="ordenar()">Ordenar por Dificuldade</button>

<table>
<thead>
<tr>
<th>Música</th>
<th>Livro</th>
<th>Execução</th>
<th>MD</th>
<th>ME</th>
<th>QN</th>
<th>R</th>
<th>I</th>
<th>Dificuldade</th>
<th>Ação</th>
</tr>
</thead>
<tbody id="tabela"></tbody>
</table>
</div>

<script>
let linhaEditando = null;

function toggleCampos(){
let exec = document.getElementById('execucao').value;
let campos = document.getElementById('camposMaos');
campos.classList.toggle('hidden', !(exec==='MA'||exec==='MJ'||exec==='MS'));
}

// NORMALIZA RITMO (aceita 1,2 ou 2 1 etc)
function normalizarRitmo(r){
return r.replace(/\s|,/g,'')
        .split('')
        .sort()
        .join('');
}

// ORDEM PEDAGÓGICA DEFINIDA POR VOCÊ
const ordemRitmo = [
"1","2","4","3",
"12","24","13",
"124","123","1234"
];

function calcularDificuldade(qn, ritmo, md, me){
let score = 0;

// quantidade de notas
score += Number(qn) || 0;

// variedade de notas
let totalNotas = (md + ' ' + me).trim().split(/\s+/).filter(n=>n).length;
score += totalNotas;

// dificuldade do ritmo baseada na sua ordem
let rNorm = normalizarRitmo(ritmo);
let pos = ordemRitmo.indexOf(rNorm);

if(pos !== -1){
score += pos * 2;
}else{
score += 10; // ritmo fora do padrão
}

return score;
}

function adicionar(){
let musica=document.getElementById('musica').value;
let livro=document.getElementById('livro').value;
let execucao=document.getElementById('execucao').value;
let mdNotas=document.getElementById('mdNotas').value;
let meNotas=document.getElementById('meNotas').value;
let qn=document.getElementById('qn').value;
let ritmo=document.getElementById('ritmo').value;
let intervalo=document.getElementById('intervalo').value;

let dificuldade = calcularDificuldade(qn, ritmo, mdNotas, meNotas);

if(linhaEditando){
linhaEditando.innerHTML = gerarLinha(musica,livro,execucao,mdNotas,meNotas,qn,ritmo,intervalo,dificuldade);
linhaEditando=null;
}else{
let linha=document.createElement('tr');
linha.innerHTML = gerarLinha(musica,livro,execucao,mdNotas,meNotas,qn,ritmo,intervalo,dificuldade);
document.getElementById('tabela').appendChild(linha);
}

limparCampos();
ordenar(); // ordena automaticamente
}

function gerarLinha(musica,livro,execucao,md,me,qn,ritmo,intervalo,dif){
return `
<td>${musica}</td>
<td>${livro}</td>
<td>${execucao}</td>
<td>${md||'-'}</td>
<td>${me||'-'}</td>
<td>${qn}</td>
<td>${ritmo}</td>
<td>${intervalo}</td>
<td>${dif}</td>
<td>
<button class="edit-btn" onclick="editarLinha(this)">Editar</button>
<button class="delete-btn" onclick="removerLinha(this)">Excluir</button>
</td>`;
}

function editarLinha(btn){
let t=btn.parentNode.parentNode.children;
linhaEditando=btn.parentNode.parentNode;

musica.value=t[0].innerText;
livro.value=t[1].innerText;
execucao.value=t[2].innerText;
mdNotas.value=t[3].innerText!=='-'?t[3].innerText:'';
meNotas.value=t[4].innerText!=='-'?t[4].innerText:'';
qn.value=t[5].innerText;
ritmo.value=t[6].innerText;
intervalo.value=t[7].innerText;

toggleCampos();
}

function removerLinha(btn){
btn.parentNode.parentNode.remove();
}

function ordenar(){
let tbody=document.getElementById('tabela');
let linhas=Array.from(tbody.rows);

linhas.sort((a,b)=>{
let da=Number(a.cells[8].innerText);
let db=Number(b.cells[8].innerText);
return da-db;
});

linhas.forEach(l=>tbody.appendChild(l));
}

function limparCampos(){
musica.value='';
livro.value='';
mdNotas.value='';
meNotas.value='';
qn.value='';
ritmo.value='';
intervalo.value='';
}
</script>
</body>
</html>
