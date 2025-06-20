//


if (window.midiDatabase) {
  midiDatabase["nome"] = {
    name: "nome",
    categories: [],
    midis: [

//{ name: "anido_barcarola", path: "midis/violão/anido_barcarola.mid" },
//{ name: "anido_cancion_del_yucatan", path: "midis/violão/anido_cancion_del_yucatan.mid" }

],
 resumePath: "resumos_compositores/nome.txt"
    
  };
}

if (!window.midiDatabase) {
  console.error('Erro: midiDatabase não foi definido. Verifique a ordem de carregamento dos scripts.');
}