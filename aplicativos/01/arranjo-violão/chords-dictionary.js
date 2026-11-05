/**
 * chords-dictionary.js
 * Dicionário harmônico com múltiplos baixos alternados (X1, X2, X3) e arpejos.
 */
const CHORD_DICTIONARY = {
  "C":   { 
    map: { "C": "C", "E": "E", "G": "G", "c": "c", "e": "e", "g": "g", "X1": "E,", "X2": "G,", "X3": "c" } 
  },
  "G":   { 
    map: { "C": "G,", "E": "D", "G": "G", "c": "B", "e": "d", "g": "g", "X1": "B,", "X2": "D", "X3": "g" } 
  },
  "Am":  { 
    map: { "C": "A,", "E": "E", "G": "A", "c": "c", "e": "e", "g": "a", "X1": "E,", "X2": "C", "X3": "e" } 
  },
  "F":   { 
    map: { "C": "F,", "E": "F", "G": "A", "c": "c", "e": "f", "g": "a", "X1": "A,", "X2": "C", "X3": "f" } 
  },
  "Dm":  { 
    map: { "C": "D", "E": "F", "G": "A", "c": "d", "e": "f", "g": "a", "X1": "A,", "X2": "F,", "X3": "d" } 
  },
  "Em":  { 
    map: { "C": "E,", "E": "E", "G": "G", "c": "B", "e": "e", "g": "g", "X1": "G,", "X2": "B,", "X3": "e" } 
  },
  "G7":  { 
    map: { "C": "G,", "E": "D", "G": "F", "c": "B", "e": "d", "g": "f", "X1": "B,", "X2": "D", "X3": "f" } 
  },
  "D7":  { 
    map: { "C": "D", "E": "^F", "G": "A", "c": "c", "e": "d", "g": "a", "X1": "A,", "X2": "C", "X3": "d" } 
  },
  "E7":  { 
    map: { "C": "E,", "E": "^G", "G": "B", "c": "d", "e": "e", "g": "g", "X1": "B,", "X2": "D", "X3": "e" } 
  },
  "A7":  { 
    map: { "C": "A,", "E": "^C", "G": "E", "c": "g", "e": "a", "g": "c'", "X1": "E,", "X2": "G,", "X3": "a" } 
  },
  "C7":  { 
    map: { "C": "C", "E": "E", "G": "_B", "c": "c", "e": "e", "g": "g", "X1": "E,", "X2": "G,", "X3": "_B" } 
  },
  "B7":  { 
    map: { "C": "B,", "E": "^D", "G": "^F", "c": "A", "e": "b", "g": "^f", "X1": "^F,", "X2": "A,", "X3": "b" } 
  }
};

function mapPatternToChord(pattern, chordName) {
  const chordData = CHORD_DICTIONARY[chordName] || CHORD_DICTIONARY["C"];
  const map = chordData.map;

  // Substitui C, E, G, X1, X2, X3, etc. conforme o dicionário do acorde
  return pattern.replace(/([A-Ga-gX0-9]+[,']?)/g, (match) => {
    if (map[match] !== undefined) {
      return map[match];
    }
    return match;
  });
}