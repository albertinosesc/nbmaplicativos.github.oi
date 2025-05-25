registerSong({
  id: 'music016',
  title: 'The bonnie boy',
  abc: `X:16
T:016 - The bonnie boy
M:C|
L:1/8
K:A
(ed)|\
"A"cBAa ((3fga) ec|"D"dfec "E"B2(Bd)|\
"A"cBAa ((3fga) ec|"E"dfec "A"A2(Ad)|
`
});

function formatSong(text) {
  return text.replace(/\[([^\]]+)\]/g, '<span style="color:red;">$1</span>');
}

const pre = document.createElement('pre');
pre.innerHTML = formatSong(`
        [C7]           [F]      [C7]         [F]        
Unhum, unhum unhum, unhum a saudade no coração
        [C7]           [F]      [C7]         [F]        
Unhum, unhum unhum, unhum a saudade no coração
`);

// Insere no container
const container = document.querySelector('.container');
const filhos = container.children;
const meio = Math.floor(filhos.length / 2);

container.insertBefore(pre, filhos[meio]);
