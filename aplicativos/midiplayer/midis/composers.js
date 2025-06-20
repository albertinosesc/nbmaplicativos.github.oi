// composers.js - Define a estrutura básica
const midiDatabase = {
  "": {
    name: "Todos os MIDIs",
    categories: ["Compositores"],
    midis: []
  },
  "Compositores": {
    name: "Compositores",
    categories: ["Aguado", "Åhslund", "Albéniz", "Albert", "Anido", "Beethoven", "Chopin"],
    midis: []
  }
};

// Torna acessível globalmente
window.midiDatabase = midiDatabase;

