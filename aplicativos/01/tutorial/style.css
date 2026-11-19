* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Georgia', 'Times New Roman', serif;
    background: #f5f1e8;
    color: #2c2c2c;
    line-height: 1.7;
}

header {
    background: linear-gradient(135deg, #5d4037, #3e2723);
    color: #fff;
    padding: 1rem 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

header h1 {
    font-size: 1.45rem;
    flex: 1;
}

.sidebar-toggle,
.admin-btn {
    background: rgba(255,255,255,0.15);
    color: #fff;
    border: 1px solid rgba(255,255,255,0.35);
    padding: 0.45rem 0.9rem;
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.9rem;
    transition: all 0.2s;
}

.sidebar-toggle:hover,
.admin-btn:hover {
    background: rgba(255,255,255,0.3);
}

button.admin-btn.active {
    background: #fff;
    color: #3e2723;
    font-weight: bold;
}

/* LAYOUT PRINCIPAL: SIDEBAR À ESQUERDA + CONTEÚDO À DIREITA */
.app-layout {
    display: flex;
    align-items: flex-start;
    max-width: 1400px;
    margin: 1.2rem auto;
    padding: 0 1rem;
    gap: 1.2rem;
}

.sidebar {
    width: 320px;
    min-width: 280px;
    max-height: calc(100vh - 95px);
    position: sticky;
    top: 76px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid #e0d6c2;
}

.sidebar.collapsed {
    display: none;
}

.sidebar-header {
    padding: 0.85rem;
    background: #faf6ee;
    border-bottom: 1px solid #e0d6c2;
}

#lesson-search {
    width: 100%;
    padding: 0.5rem 0.7rem;
    border: 1px solid #cbbba0;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.sidebar-tree-actions {
    display: flex;
    gap: 0.4rem;
}

.sidebar-tree-actions button {
    flex: 1;
    background: #efebe9;
    border: 1px solid #d7ccc8;
    color: #4e342e;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.78rem;
    cursor: pointer;
    font-family: inherit;
}

.sidebar-tree-actions button:hover {
    background: #d7ccc8;
}

/* ÁRVORE DE TÓPICOS (PAI E FILHO) */
.lesson-tree {
    overflow-y: auto;
    padding: 0.5rem;
    flex: 1;
}

.tree-group {
    margin-bottom: 0.35rem;
    border-radius: 6px;
}

.tree-parent {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;
    background: #f5efe6;
    color: #3e2723;
    border: 1px solid #e6dccb;
    padding: 0.55rem 0.7rem;
    border-radius: 6px;
    font-family: inherit;
    font-weight: bold;
    font-size: 0.92rem;
    cursor: pointer;
    transition: background 0.15s;
}

.tree-parent:hover {
    background: #ebe0d0;
}

.tree-parent .parent-label {
    display: flex;
    align-items: center;
    gap: 0.45rem;
}

.tree-parent .badge-count {
    background: #8d6e63;
    color: #fff;
    font-size: 0.72rem;
    padding: 0.1rem 0.45rem;
    border-radius: 10px;
    font-weight: normal;
}

.tree-children {
    list-style: none;
    margin: 0.25rem 0 0.4rem 0.65rem;
    padding-left: 0.6rem;
    border-left: 2px solid #d7ccc8;
    display: none;
}

.tree-group.open > .tree-children {
    display: block;
}

.tree-child-btn {
    width: 100%;
    text-align: left;
    background: transparent;
    border: none;
    color: #3e2723;
    padding: 0.4rem 0.6rem;
    margin: 0.12rem 0;
    border-radius: 5px;
    font-family: inherit;
    font-size: 0.88rem;
    cursor: pointer;
    display: block;
    transition: all 0.15s;
}

.tree-child-btn:hover {
    background: #f3ece1;
}

.tree-child-btn.active {
    background: #5d4037;
    color: #fff;
    font-weight: bold;
}

main {
    flex: 1;
    min-width: 0;
    padding: 2rem;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

#lesson-content h2 {
    color: #5d4037;
    border-bottom: 2px solid #d7ccc8;
    padding-bottom: 0.5rem;
    margin: 1.5rem 0 1rem;
}

#lesson-content h3 {
    color: #6d4c41;
    margin: 1.2rem 0 0.8rem;
}

#lesson-content p {
    margin-bottom: 1rem;
    text-align: justify;
}

#lesson-content ul, #lesson-content ol {
    margin: 0.8rem 0 1rem 2rem;
}

#lesson-content li {
    margin-bottom: 0.4rem;
}

.abc-block {
    background: #fafafa;
    border: 1px solid #e0d6c2;
    border-left: 4px solid #8d6e63;
    border-radius: 6px;
    padding: 1rem;
    margin: 1.2rem 0;
}

.abc-sheet {
    overflow-x: auto;
    padding: 0.5rem 0;
}

.abc-controls {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.8rem;
    padding-top: 0.8rem;
    border-top: 1px dashed #d7ccc8;
}

.btn-play {
    background: #388e3c;
    color: white;
    border: none;
    padding: 0.5rem 1.2rem;
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    transition: background 0.2s;
}

.btn-play:hover {
    background: #2e7d32;
}

.btn-play:disabled {
    background: #9e9e9e;
    cursor: not-allowed;
}

.btn-stop {
    background: #c62828;
    color: white;
    border: none;
    padding: 0.5rem 1.2rem;
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.95rem;
    transition: background 0.2s;
}

.btn-stop:hover {
    background: #b71c1c;
}

.abc-code {
    background: #263238;
    color: #aed581;
    padding: 0.8rem 1rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;
    overflow-x: auto;
    margin-top: 0.8rem;
    white-space: pre-wrap;
}

.info-box {
    background: #fff3e0;
    border-left: 4px solid #ff9800;
    padding: 0.8rem 1rem;
    margin: 1rem 0;
    border-radius: 4px;
}

footer {
    text-align: center;
    padding: 1.5rem;
    color: #6d4c41;
    font-size: 0.9rem;
}

.loading {
    text-align: center;
    padding: 2rem;
    color: #8d6e63;
    font-style: italic;
}

.error {
    background: #ffebee;
    color: #c62828;
    padding: 1rem;
    border-radius: 6px;
    border-left: 4px solid #c62828;
}

/* PAINEL ADMIN */
.admin-panel {
    background: #f8f9fa;
    border: 1px solid #d0d7de;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
}

.admin-panel h2 {
    margin-top: 0;
}

.admin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
    margin-bottom: 12px;
}

.admin-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;
}

.admin-field label {
    font-weight: 600;
    font-size: 0.9rem;
}

.admin-field input,
.admin-field textarea {
    padding: 8px 10px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.95rem;
}

.admin-field textarea {
    min-height: 240px;
    font-family: Consolas, monospace;
}

.admin-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
}

.admin-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.admin-status {
    margin-top: 12px;
    padding: 10px;
    border-radius: 6px;
    font-size: 0.9rem;
}

.admin-status.ok {
    background: #dcfce7;
    color: #166534;
}

.admin-status.err {
    background: #fee2e2;
    color: #991b1b;
}

/* RESPONSIVO PARA TELAS MENORES */
@media (max-width: 820px) {
    .app-layout {
        flex-direction: column;
    }

    .sidebar {
        width: 100%;
        position: static;
        max-height: 360px;
    }
}
