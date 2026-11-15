// ===== Firestore wrapper =====
// Depende de: nenhum

export const DB = { turmas: [], alunos: {}, contasGlobais: {}, compras: [], loaded: false };

export const FB = {
  _ready: null,
  async init(){
    if(this._ready) return this._ready;
    this._ready = (async () => {
      const svc = window.FirebaseService;
      if(!svc) throw new Error('FirebaseService não carregou');
      const { auth, signInAnonymously, onAuthStateChanged } = svc;
      await new Promise(resolve => {
        if(auth.currentUser){ resolve(); return; }
        const unsub = onAuthStateChanged(auth, user => { if(user){ unsub(); resolve(); } });
        signInAnonymously(auth).catch(() => {});
      });
    })();
    return this._ready;
  },
  async read(){
    await this.init();
    const { db, doc, getDoc } = window.FirebaseService;
    const snap = await getDoc(doc(db, 'clave', 'dados'));
    return snap.exists() ? snap.data() : null;
  },
  async write(obj){
    await this.init();
    const { db, doc, setDoc } = window.FirebaseService;
    await setDoc(doc(db, 'clave', 'dados'), obj, { merge: false });
  }
};

export async function dbLoad(){
  try{
    const data = await FB.read();
    DB.turmas        = (data && data.turmas)        || [];
    DB.alunos        = (data && data.alunos)        || {};
    DB.contasGlobais = (data && data.contasGlobais && !Array.isArray(data.contasGlobais)) ? data.contasGlobais : {};
    DB.compras       = (data && data.compras)       || [];
    DB.loaded = true;
  }catch(e){
    DB.loaded = true;
    console.warn('dbLoad:', e);
  }
}

export async function dbSave(msg){
  const payload = {
    turmas: DB.turmas,
    alunos: DB.alunos,
    contasGlobais: DB.contasGlobais,
    compras: DB.compras
  };
  await FB.write(payload);
  if(msg) console.log('dbSave:', msg);
}

let dbSaveTimer = 0;
export function scheduleDbSave(msg){
  clearTimeout(dbSaveTimer);
  dbSaveTimer = setTimeout(async () => {
    try{ await dbSave(msg); }
    catch(e){ console.warn('dbSave:', e.message); }
  }, 1500);
}

window.DB = DB;
window.FB = FB;
window.dbLoad = dbLoad;
window.dbSave = dbSave;
window.scheduleDbSave = scheduleDbSave;
