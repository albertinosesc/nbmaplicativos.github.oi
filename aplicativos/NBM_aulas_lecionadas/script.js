

// link para enviar os dadosna planilha google
const scriptURL = 'https://script.google.com/macros/s/AKfycbwO0c58tt4yVZyYnA3vjn8VHUe3x6HdMbZFdTV0TC3WZ7Lhq8yMvrqYk9o2I50PcmvKBA/exec'

const form = document.forms['contact-form']

form.addEventListener('submit', e => {
 e.preventDefault()
 fetch(scriptURL, { method: 'POST', body: new FormData(form)})
 .then(response => alert("Thank you! your form is submitted successfully." ))
 .then(() => { window.location.reload(); })
 .catch(error => console.error('Error!', error.message))
})