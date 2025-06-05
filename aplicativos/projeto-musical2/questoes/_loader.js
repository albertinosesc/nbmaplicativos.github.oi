// /questoes/_loader.js

// Importe cada questão individualmente.
// O caminho é relativo ao próprio _loader.js
import { questao as q101 } from './1-ano/Q101.js';
import { questao as q102 } from './1-ano/Q102.js';
import { questao as q201 } from './2-ano/Q201.js';
// Consolide todas as questões em um array
export const todasAsQuestoes = [
    q101,
    q102,
    q201

    // Adicione aqui todas as suas questões importadas
];