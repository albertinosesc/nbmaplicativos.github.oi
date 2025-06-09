//script1.js corrigido
const searchInput = document.getElementById('search');
const resultsDiv = document.getElementById('results');

// Adiciona os listeners para o campo de busca e os rádios de tipo
searchInput.addEventListener('input', updateResults);
document.querySelectorAll('input[name="type"]').forEach(radio => {
    radio.addEventListener('change', updateResults);
});

// Permite navegar para o primeiro resultado ao pressionar Enter
searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const firstLink = resultsDiv.querySelector('a');
        if (firstLink) {
            window.location.href = firstLink.href;
        }
    }
});

function updateResults() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedType = document.querySelector('input[name="type"]:checked').value;

    let list = []; 
    let linkPrefix = ''; 
    let itemTitleProperty = 'name'; 
    let itemLinkProperty = 'link'; 

    if (selectedType === 'music') {
        list = musicList; 
        itemTitleProperty = 'title';
        itemLinkProperty = 'link';
    } else if (selectedType === 'abordagem') {
        list = abordagemList; 
        itemTitleProperty = 'title';
        itemLinkProperty = 'link';
    } else if (selectedType === 'questao') {
        list = questoesData; 
        itemTitleProperty = 'titulo';
        itemLinkProperty = 'id';
        // CORREÇÃO AQUI - caminho relativo correto para questao.html
        linkPrefix = '../Lista_Geral_Arquivo/questao.html?id=';
    } else if (selectedType === 'text') { 
        list = textList; 
        itemTitleProperty = 'title';
        itemLinkProperty = 'link';
    }

    const filtered = list.filter(item => 
        item[itemTitleProperty] && item[itemTitleProperty].toLowerCase().includes(searchTerm)
        || (selectedType === 'questao' && item.enunciadoCurto && item.enunciadoCurto.toLowerCase().includes(searchTerm))
    );

    resultsDiv.innerHTML = filtered.map(item => {
        const itemText = item[itemTitleProperty] || item.id; 
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const highlighted = itemText.replace(regex, '<span class="highlight">$1</span>');
        
        let itemLink;
        if (selectedType === 'questao') {
            itemLink = `${linkPrefix}${item[itemLinkProperty]}`; 
        } else {
            itemLink = item[itemLinkProperty]; 
        }

        return `<div class="result-item"><a href="${itemLink}">${highlighted}</a></div>`;
    }).join('');

    if (!searchTerm) {
        resultsDiv.innerHTML = '';
    }
}
