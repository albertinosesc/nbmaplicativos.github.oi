const searchInput = document.getElementById('search');
const resultsDiv = document.getElementById('results');

searchInput.addEventListener('input', updateResults);
document.querySelectorAll('input[name="type"]').forEach(radio => {
    radio.addEventListener('change', updateResults);
});

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
    
    let list;
    let itemTitleProperty = 'name';
    let itemLinkProperty = 'link';
    let linkPrefix = '';
    
    if (selectedType === 'music') {
        list = musicList;
    } else if (selectedType === 'abordagem') {
        list = abordagemList;
    } else if (selectedType === 'questao') {
        list = typeof questoesData !== 'undefined' ? questoesData : [];
        itemTitleProperty = 'titulo';
        itemLinkProperty = 'id';
        linkPrefix = '../Lista_Geral_Arquivo/questao.html?id=';
        console.log("Questão List loaded:", list.length > 0);
    } else {
        list = textList;
    }

    // If list is empty after selecting a type, it's a problem with script loading or variable name
    if (list.length === 0 && selectedType !== 'questao') {
        console.warn(`List for type '${selectedType}' is empty or not loaded.`);
        resultsDiv.innerHTML = ''; // Clear results if list is empty
        return; // Exit the function early
    }

    const filtered = list.filter(item => {
        const titleMatch = item[itemTitleProperty] && item[itemTitleProperty].toLowerCase().includes(searchTerm);
        const enunciadoMatch = selectedType === 'questao' && item.enunciadoCurto && item.enunciadoCurto.toLowerCase().includes(searchTerm);
        return titleMatch || enunciadoMatch;
    });

    console.log("Filtered Results Count:", filtered.length);

    resultsDiv.innerHTML = filtered.map(item => {
        const itemText = item[itemTitleProperty] || '';
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const highlighted = itemText.replace(regex, '<span class="highlight">$1</span>');
        
        let itemLink;
        if (selectedType === 'questao') {
            itemLink = `${linkPrefix}${item[itemLinkProperty]}`;
        } else {
            itemLink = item[itemLinkProperty];
        }
        console.log(`Generated link for ${itemText}: ${itemLink}`);

        return `<div class="result-item"><a href="${itemLink}">${highlighted}</a></div>`;
    }).join('');

    if (!searchTerm) {
        resultsDiv.innerHTML = '';
    }
}
