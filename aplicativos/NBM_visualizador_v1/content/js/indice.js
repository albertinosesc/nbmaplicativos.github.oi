
//======================================
//indice.js
//Atualização:23/05/25
//====================================


document.querySelectorAll('h2').forEach(titulo => {
    titulo.addEventListener('click', () => {
        const lista = titulo.nextElementSibling;
        const isOpen = lista.style.display === 'block';
        lista.style.display = isOpen ? 'none' : 'block';
        titulo.classList.toggle('open', !isOpen);
    });
});