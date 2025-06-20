//


if (window.midiDatabase) {
  midiDatabase["Albert"] = {
    name: "Albert",
    categories: [],
    midis: [
{ name: "albert_heinrich_guitarre_etuden_heft1_01", path: "midis/violão/albert_heinrich_guitarre_etuden_heft1_01.mid" },
{ name: "albert_heinrich_guitarre_etuden_heft1_02", path: "midis/violão/albert_heinrich_guitarre_etuden_heft1_02.mid" },
{ name: "albert_heinrich_sonata_no1_1_energich_bewegt", path: "midis/violão/albert_heinrich_sonata_no1_1_energich_bewegt.mid" },
{ name: "albert_heinrich_sonata_no1_2_langsam", path: "midis/violão/albert_heinrich_sonata_no1_2_langsam.mid" },
{ name: "albert_heinrich_sonata_no1_3_schnell", path: "midis/violão/albert_heinrich_sonata_no1_3_schnell.mid" }

        
],
 resumePath: "resumos_compositores/Albert.txt"
    
  };
}

if (!window.midiDatabase) {
  console.error('Erro: midiDatabase não foi definido. Verifique a ordem de carregamento dos scripts.');
}