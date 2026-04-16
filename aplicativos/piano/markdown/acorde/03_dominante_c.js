// ============================================
// ACORDES MAIORES - TOM DE DÓ (C)
// ============================================

const ACORDES_DOMINANTE_C = {
    // Fundamentais
    'C': {
        nome: 'Dó Maior',
        cordas: [-1,3,2,0,1,0],
        dedos: ['','3','2','','1',''],
        pestana: false,
        casaInicial: 1,
        baixo: 'C'
    }
    
     
};

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ACORDES_DOMINANTE_C;
}

