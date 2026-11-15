// ===== SVG icons + mascote =====
// Depende de: nenhum

export const P = {
note:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
star:'<path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z"/>',
check:'<path d="M20 6L9 17l-5-5"/>',
heart:'<path fill="currentColor" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
flame:'<path fill="currentColor" stroke="none" d="M12 2c.8 3.9-2.4 5.6-2.4 8.6a2.4 2.4 0 0 0 4.8 0c0-1.1-.5-2-.9-2.9 1.9 1.2 4.5 3.4 4.5 6.3a6 6 0 0 1-12 0c0-4.9 4.6-7.3 6-12z"/>',
bolt:'<path fill="currentColor" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
gem:'<path fill="currentColor" d="M6 3h12l4 6-10 12L2 9l4-6z"/><path d="M2 9h20M12 21L8 9l4-6 4 6-4 12" stroke="rgba(255,255,255,.45)" stroke-width="1"/>',
play:'<path fill="currentColor" d="M6 4l14 8-14 8z"/>',
stop:'<rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor"/>',
refresh:'<path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
trash:'<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
x:'<path d="M18 6L6 18M6 6l12 12"/>',
arrowR:'<path d="M5 12h14M12 5l7 7-7 7"/>',
volume:'<path d="M11 5L6 9H2v6h4l5 4z" fill="currentColor" stroke="none"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>',
mute:'<path d="M11 5L6 9H2v6h4l5 4z" fill="currentColor" stroke="none"/><path d="M23 9l-6 6M17 9l6 6"/>',
trophy:'<path d="M7 4h10v6a5 5 0 0 1-10 0V4z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/><path d="M12 15v4M8 21h8"/>',
book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
route:'<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
search:'<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',
info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
spark:'<path fill="currentColor" stroke="none" d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path fill="currentColor" stroke="none" d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/>',
user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
};

export const I = {};
for(const k in P){
  I[k] = '<svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[k] + '</svg>';
}

export function injectIcons(){
  document.querySelectorAll('[data-icon]').forEach(n => {
    n.innerHTML = I[n.dataset.icon] || '';
  });
}

export function mascotSVG(uid){
  return '<svg viewBox="0 0 130 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
    + '<defs><linearGradient id="mg'+uid+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE08A"/><stop offset=".55" stop-color="#FFC93C"/><stop offset="1" stop-color="#F0A627"/></linearGradient></defs>'
    + '<ellipse cx="62" cy="141" rx="30" ry="6" fill="rgba(0,0,0,.28)"/>'
    + '<text x="10" y="44" font-size="17" fill="#FFC93C" opacity=".85">♪</text><text x="104" y="28" font-size="14" fill="#E560FF" opacity=".8">♫</text>'
    + '<path d="M86 20c15 7 21 22 12 40-1-13-6-21-12-26z" fill="#F0A627"/>'
    + '<rect x="79" y="18" width="7" height="84" rx="3.5" fill="url(#mg'+uid+')"/>'
    + '<ellipse cx="60" cy="106" rx="27" ry="20" transform="rotate(-16 60 106)" fill="url(#mg'+uid+')" stroke="#C98F1B" stroke-width="2"/>'
    + '<circle cx="23" cy="93" r="7.5" fill="#FFFDF7" stroke="#D9CDB8" stroke-width="1.5"/><circle cx="100" cy="75" r="7.5" fill="#FFFDF7" stroke="#D9CDB8" stroke-width="1.5"/>'
    + '<circle cx="50" cy="100" r="6.6" fill="#fff"/><circle cx="68" cy="96" r="6.6" fill="#fff"/>'
    + '<circle cx="51.5" cy="101" r="3.1" fill="#2A1B4E"/><circle cx="69.5" cy="97" r="3.1" fill="#2A1B4E"/>'
    + '<circle cx="53" cy="99" r="1.1" fill="#fff"/><circle cx="71" cy="95" r="1.1" fill="#fff"/>'
    + '<path d="M52 112Q60 118 68 110" stroke="#7A4E12" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>';
}

window.P = P;
window.I = I;
window.injectIcons = injectIcons;
window.mascotSVG = mascotSVG;
