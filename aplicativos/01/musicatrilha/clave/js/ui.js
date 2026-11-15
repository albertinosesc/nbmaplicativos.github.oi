// ===== Modal, toast, confetti, helpers de UI =====
// Depende de: nenhum

export function esc(s){
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

let modalOpen = false, modalOnClose = null;

export function openModal(html, opts){
  opts = opts || {};
  modalOpen = true;
  modalOnClose = opts.onClose || null;
  const root = document.getElementById('modalRoot');
  if(!root) return;
  root.innerHTML = '<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true">' + html + '</div></div>';
  if(window.injectIcons) injectIcons();
  const bd = root.querySelector('.modal-backdrop');
  if(bd) bd.addEventListener('pointerdown', e => { if(e.target === bd) closeModal(); });
}

export function closeModal(silent){
  if(!modalOpen) return;
  modalOpen = false;
  const root = document.getElementById('modalRoot');
  if(root) root.innerHTML = '';
  const cb = modalOnClose;
  modalOnClose = null;
  if(!silent && cb) cb();
}

export function toast(msg, opts){
  opts = opts || {};
  const t = document.createElement('div');
  t.className = 'toast ' + (opts.type || 'info');
  t.innerHTML = '<span>' + msg + '</span>';
  if(opts.action){
    const b = document.createElement('button');
    b.textContent = opts.action.label;
    b.onclick = () => { opts.action.fn(); t.remove(); };
    t.appendChild(b);
  }
  const host = document.getElementById('toasts');
  if(host) host.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, opts.duration || 4000);
}

// Confetti
const cvs = document.getElementById('confetti');
let cx = null;
if(cvs && cvs.getContext) cx = cvs.getContext('2d');
let confs = [], confRaf = 0, confUntil = 0;

export function resizeConf(){ if(!cvs) return; cvs.width = innerWidth; cvs.height = innerHeight; }

export function confettiBurst(){
  if(!cx) return;
  resizeConf();
  cvs.style.display = 'block';
  const colors = ['#FFC93C','#3CE68A','#4DA6FF','#E560FF','#FF5A5F','#2ED9C3','#FFFFFF'];
  confUntil = performance.now() + 3200;
  for(let i = 0; i < 170; i++){
    confs.push({ x: Math.random()*cvs.width, y:-20-Math.random()*cvs.height*0.35, vx:(Math.random()-0.5)*2.4, vy:2+Math.random()*3.6, s:5+Math.random()*7, r:Math.random()*Math.PI, vr:(Math.random()-0.5)*0.26, c:colors[i%colors.length], sh:i%3 });
  }
  if(confs.length > 420) confs = confs.slice(-420);
  if(!confRaf) confLoop();
}

export function confLoop(){
  confRaf = requestAnimationFrame(confLoop);
  if(!cx) return;
  cx.clearRect(0, 0, cvs.width, cvs.height);
  confs.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += 0.045; p.r += p.vr;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c;
    if(p.sh === 0) cx.fillRect(-p.s/2, -p.s/3, p.s, p.s*0.66);
    else if(p.sh === 1){ cx.beginPath(); cx.arc(0, 0, p.s/2.4, 0, 7); cx.fill(); }
    else cx.fillRect(-p.s/4, -p.s/2, p.s/2, p.s);
    cx.restore();
  });
  confs = confs.filter(p => p.y < cvs.height + 40);
  if(performance.now() > confUntil && !confs.length){
    cancelAnimationFrame(confRaf); confRaf = 0;
    cx.clearRect(0, 0, cvs.width, cvs.height);
    cvs.style.display = 'none';
  }
}

// Expor no window
window.esc = esc;
window.openModal = openModal;
window.closeModal = closeModal;
window.toast = toast;
window.confettiBurst = confettiBurst;
