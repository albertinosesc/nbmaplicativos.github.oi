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
    if (selectedType === 'music') {
        list = musicList;
    } else if (selectedType === 'abordagem') {
        list = abordagemList;
    } else {
        list = textList;
    }

    const filtered = list.filter(item => item.name.toLowerCase().includes(searchTerm));

    resultsDiv.innerHTML = filtered.map(item => {
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const highlighted = item.name.replace(regex, '<span class="highlight">$1</span>');
        return `<div class="result-item"><a href="${item.link}">${highlighted}</a></div>`;
    }).join('');

    if (!searchTerm) {
        resultsDiv.innerHTML = '';
    }
}
