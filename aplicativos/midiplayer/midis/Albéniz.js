
if (window.midiDatabase) {
  midiDatabase["Albéniz"] = {
    name: "Albéniz",
    categories: [],
    midis: [
{ name: "albeniz_isaac_op012_pavane_caprichio_1", path: "midis/violão/albeniz_isaac_op012_pavane_caprichio_1.mid" },
{ name: "albeniz_isaac_op012_pavane_caprichio_2", path: "midis/violão/albeniz_isaac_op012_pavane_caprichio_2.mid" },
{ name: "albeniz_isaac_op047_no3_espanola_sevilla", path: "midis/violão/albeniz_isaac_op047_no3_espanola_sevilla.mid" },
{ name: "albeniz_isaac_op047_no5_espanola_asturias", path: "midis/violão/albeniz_isaac_op047_no5_espanola_asturias.mid" },
{ name: "albeniz_isaac_op047_no8_espanola_cuba", path: "midis/violão/albeniz_isaac_op047_no8_espanola_cuba.mid" },
{ name: "albeniz_isaac_op054_serenata_arabe", path: "midis/violão/albeniz_isaac_op054_serenata_arabe.mid" },
{ name: "albeniz_isaac_op165_no2_tango_in_d", path: "midis/violão/albeniz_isaac_op165_no2_tango_in_d.mid" },
{ name: "albeniz_isaac_op165_no5_capricho_catalan", path: "midis/violão/albeniz_isaac_op165_no5_capricho_catalan.mid" }
        
],
 resumePath: "resumos_compositores/Albéniz.txt"
    
  };
}

if (!window.midiDatabase) {
  console.error('Erro: midiDatabase não foi definido. Verifique a ordem de carregamento dos scripts.');
}