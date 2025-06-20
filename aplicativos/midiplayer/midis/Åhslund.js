
if (window.midiDatabase) {
  midiDatabase["Åhslund"] = {
    name: "Åhslund",
    categories: [],
    midis: [
{ name: "ahslund_suite_1_swedish_folk_tunes_1_preludium", path: "midis/violão/ahslund_suite_1_swedish_folk_tunes_1_preludium.mid" },
{ name: "ahslund_suite_1_swedish_folk_tunes_2_jamtlandsk_brudmarsch", path: "midis/violão/ahslund_suite_1_swedish_folk_tunes_2_jamtlandsk_brudmarsch.mid" },
{ name: "ahslund_suite_1_swedish_folk_tunes_3_jamtlandsk_brudvals", path: "midis/violão/ahslund_suite_1_swedish_folk_tunes_3_jamtlandsk_brudvals.mid" },
{ name: "ahslund_suite_1_swedish_folk_tunes_4_trollmors_vaggsang", path: "midis/violão/ahslund_suite_1_swedish_folk_tunes_4_trollmors_vaggsang.mid" },
{ name: "ahslund_suite_1_swedish_folk_tunes_5_postludium", path: "midis/violão/ahslund_suite_1_swedish_folk_tunes_5_postludium.mid" }
  ],
    resumePath: "resumos_compositores/Åhslund.txt"
    
  };
}

if (!window.midiDatabase) {
  console.error('Erro: midiDatabase não foi definido. Verifique a ordem de carregamento dos scripts.');
}