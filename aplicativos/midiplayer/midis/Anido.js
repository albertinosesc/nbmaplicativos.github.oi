//


if (window.midiDatabase) {
  midiDatabase["Anido"] = {
    name: "Anido",
    categories: [],
    midis: [
{ name: "anido_aire_de_vidalita", path: "midis/violão/anido_aire_de_vidalita.mid" },
{ name: "anido_aire_norteno", path: "midis/violão/anido_aire_norteno.mid" },
{ name: "anido_barcarola", path: "midis/violão/anido_barcarola.mid" },
{ name: "anido_cancion_del_yucatan", path: "midis/violão/anido_cancion_del_yucatan.mid" },
{ name: "anido_de_mi_tierra", path: "midis/violão/anido_de_mi_tierra.mid" },
{ name: "anido_el_misachico", path: "midis/violão/anido_el_misachico.mid" },
{ name: "anido_lejania", path: "midis/violão/anido_lejania.mid" },
{ name: "anido_nana", path: "midis/violão/anido_nana.mid" },
{ name: "anido_triste_no1", path: "midis/violão/anido_triste_no1.mid" }

        
],
 resumePath: "resumos_compositores/Anido.txt"
    
  };
}

if (!window.midiDatabase) {
  console.error('Erro: midiDatabase não foi definido. Verifique a ordem de carregamento dos scripts.');
}