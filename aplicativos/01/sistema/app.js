/**
 * App Module - Lógica principal da aplicação
 */
const App = (() => {
    let currentTab = 'students';
    let currentTrackingStudent = null;
    let currentTrackingInstrument = null;
    let currentTrackingLevel = null;
    // Guarda os IDs das seções minimizadas para manter o estado ao atualizar a tela
    const collapsedSections = new Set();

    const SHEET_ID = '1znn4G-Nogi4Ff8gefTWvTpltivVuZv1y22ETHkOL95U';
    const SHEET_GID = '0';

    // Repositório público de PDFs (conta 1)
    const PDF_REPO_OWNER = 'musicanplay3-sudo';
    const PDF_REPO_NAME = 'm-pav';
    const PDF_REPO_BRANCH = 'main';
    const PDF_FOLDER_PATH = 'partituras';

    // Repositório do sistema e dados (conta 2)
    const SYSTEM_DEFAULT_GH = {
        user: 'albertinosesc',
        repo: 'nbmaplicativos.github.oi',
        path: 'aplicativos/01/sistema/dados/musical-data.json'
    };

    let githubPdfCache = null;

    // ============ INICIALIZAÇÃO ============
    function init() {
        DB.load();
        setupNavigation();
        setupEvents();
        renderCurrentTab();
        updateLastSave();
        setInterval(updateLastSave, 30000);
    }

    function updateLastSave() {
        const last = localStorage.getItem('musicaltrack_lastSave');
        const el = document.getElementById('lastSave');
        if (last && el) {
            const d = new Date(last);
            el.textContent = `Salvo: ${d.toLocaleString('pt-BR')}`;
        }
    }

    // ============ NAVEGAÇÃO ============
    function setupNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                switchTab(tab);
            });
        });

        document.getElementById('mobileMenu').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        document.getElementById('toggleSidebar').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
    }

    function switchTab(tab) {
        currentTab = tab;
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.nav-btn[data-tab="${tab}"]`).classList.add('active');
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');

        const titles = {
            students: 'Cadastro de Alunos',
            instruments: 'Instrumentos',
            curriculum: 'Conteúdos e Níveis',
            tracking: 'Acompanhamento Individual',
            reports: 'Relatórios e Análises',
            backup: 'Backup e Configurações'
        };
        document.getElementById('pageTitle').textContent = titles[tab];

        // Fechar sidebar no mobile
        document.getElementById('sidebar').classList.remove('open');

        renderCurrentTab();
    }

    function renderCurrentTab() {
        switch (currentTab) {
            case 'students': renderStudents(); break;
            case 'instruments': renderInstruments(); break;
            case 'curriculum': renderCurriculum(); break;
            case 'tracking': renderTracking(); break;
            case 'reports': renderReports(); break;
            case 'backup': renderBackup(); break;
        }
    }

    // ============ EVENTOS ============
    function setupEvents() {
        // Alunos
        document.getElementById('btnNewStudent').addEventListener('click', () => openStudentModal());
        document.getElementById('searchStudent').addEventListener('input', renderStudents);

        // Instrumentos
        document.getElementById('btnNewInstrument').addEventListener('click', () => openInstrumentModal());
        document.getElementById('searchInstrument').addEventListener('input', renderInstruments);

        // Currículo
        document.getElementById('curriculumInstrument').addEventListener('change', renderCurriculum);
        document.getElementById('btnNewLevel').addEventListener('click', () => {
            const instId = document.getElementById('curriculumInstrument').value;
            if (!instId) { toast('Selecione um instrumento primeiro', 'warning'); return; }
            openLevelModal(instId);
        });

        // Acompanhamento
        document.getElementById('trackingStudent').addEventListener('change', updateTrackingLevel);
        document.getElementById('trackingInstrument').addEventListener('change', updateTrackingLevel);
        document.getElementById('trackingLevel').addEventListener('change', renderTrackingContent);
        document.getElementById('btnCustomContent').addEventListener('click', openCustomContentModal);

        // Relatórios
        document.getElementById('reportStudent').addEventListener('change', renderReports);
        document.getElementById('btnExportReport').addEventListener('click', exportReportTXT);

        // Backup
        document.getElementById('btnExportJSON').addEventListener('click', exportJSON);
        document.getElementById('btnImportJSON').addEventListener('click', () => {
            document.getElementById('fileImportJSON').click();
        });
        document.getElementById('fileImportJSON').addEventListener('change', importJSON);
        document.getElementById('btnExportTXT').addEventListener('click', exportAllTXT);
        document.getElementById('btnSaveGSheet').addEventListener('click', saveGSheetConfig);
        document.getElementById('btnSyncGSheet').addEventListener('click', syncGSheet);
        document.getElementById('btnSaveGH').addEventListener('click', saveGitHubConfig);
        document.getElementById('btnPushGH').addEventListener('click', pushToGitHub);
        document.getElementById('btnPullGH').addEventListener('click', pullFromGitHub);
        document.getElementById('btnClearAll').addEventListener('click', clearAllData);

        // Modal
        document.getElementById('modalClose').addEventListener('click', closeModal);
        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') closeModal();
        });
    }

    // ============ PLANILHA GOOGLE SHEETS, NOTAÇÃO ABC & PDF GITHUB ============
    function extractCellText(cell) {
        if (!cell) return '';
        if (typeof cell.f === 'string' && cell.f.length > 0) return cell.f;
        if (cell.v === null || cell.v === undefined) return '';
        return String(cell.v);
    }

    function normalizeCode(rawCode) {
        const str = String(rawCode || '').trim();
        if (!str) return '';
        const stripped = str.replace(/^0+/, '');
        return stripped || '0';
    }

    function extractSongCode(sheetId, title) {
        if (sheetId && String(sheetId).trim()) {
            return String(sheetId).trim();
        }
        const match = String(title || '').trim().match(/^0*(\d+)\b/);
        return match ? match[1] : '';
    }

    function fetchSongFromSheet(rawId) {
        return new Promise((resolve, reject) => {
            const cleanId = String(rawId || '').trim();
            if (!cleanId) {
                reject(new Error('ID vazio'));
                return;
            }

            const callbackName = '__gvizAbcCb_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
            const escapedId = cleanId.replace(/'/g, "\\'");
            const isNumeric = /^\d+$/.test(cleanId);
            const whereClause = isNumeric
                ? `where A = '${escapedId}' or A = ${cleanId}`
                : `where A = '${escapedId}'`;

            const tq = encodeURIComponent(`select A, B, C, D, E, F, G, H ${whereClause} limit 1`);
            const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${SHEET_GID}&tq=${tq}&tqx=out:json;responseHandler:${callbackName}`;

            const script = document.createElement('script');
            const timeout = setTimeout(() => {
                cleanup();
                reject(new Error('Tempo esgotado ao consultar a planilha. Verifique se ela está pública para leitura.'));
            }, 10000);

            function cleanup() {
                clearTimeout(timeout);
                delete window[callbackName];
                if (script.parentNode) script.parentNode.removeChild(script);
            }

            window[callbackName] = (response) => {
                cleanup();
                try {
                    if (!response || response.status === 'error') {
                        const msg = (response && response.errors && response.errors[0] && response.errors[0].detailed_message)
                            || 'Erro ao ler dados da planilha';
                        reject(new Error(msg));
                        return;
                    }

                    const rows = (response.table && response.table.rows) || [];
                    if (!rows.length) {
                        reject(new Error(`Música com ID "${cleanId}" não encontrada na coluna A.`));
                        return;
                    }

                    const cells = rows[0].c || [];
                    const idVal = extractCellText(cells[0]) || cleanId;
                    const titleVal = extractCellText(cells[1]).trim();
                    const abcVal = extractCellText(cells[7]).trim();

                    resolve({
                        sheetId: String(idVal).trim(),
                        title: titleVal,
                        abc: abcVal
                    });
                } catch (err) {
                    reject(err);
                }
            };

            script.src = url;
            script.onerror = () => {
                cleanup();
                reject(new Error('Falha ao conectar ao Google Sheets. Confirme se a planilha está compartilhada como "Qualquer pessoa com o link pode ver".'));
            };

            document.body.appendChild(script);
        });
    }

    async function collectAllPdfsInFolder(folderPath, depth = 0) {
        if (depth > 3) return [];
        const encodedPath = folderPath
            .split('/')
            .filter(Boolean)
            .map(encodeURIComponent)
            .join('/');
        const apiUrl = `https://api.github.com/repos/${PDF_REPO_OWNER}/${PDF_REPO_NAME}/contents/${encodedPath}?ref=${PDF_REPO_BRANCH}`;
        const resp = await fetch(apiUrl);
        if (!resp.ok) {
            throw new Error(`Não foi possível acessar a pasta "${folderPath}" no GitHub.`);
        }
        const items = await resp.json();
        if (!Array.isArray(items)) return [];

        let pdfs = [];
        for (const item of items) {
            if (item.type === 'file' && /\.pdf$/i.test(item.name)) {
                pdfs.push(item);
            } else if (item.type === 'dir') {
                const subPdfs = await collectAllPdfsInFolder(item.path, depth + 1);
                pdfs = pdfs.concat(subPdfs);
            }
        }
        return pdfs;
    }

    async function findPdfInGitHub(sheetId, title) {
        if (!githubPdfCache) {
            githubPdfCache = await collectAllPdfsInFolder(PDF_FOLDER_PATH, 0);
        }

        if (!githubPdfCache.length) return null;

        const rawCode = extractSongCode(sheetId, title);
        if (!rawCode) return null;

        const targetNorm = normalizeCode(rawCode);
        const targetExact = String(rawCode).trim().toLowerCase();

        // 1. Correspondência exata pelo nome do arquivo sem .pdf (ex.: "10" === "10" ou "2145" === "2145")
        const exactMatch = githubPdfCache.find(file => {
            const baseName = file.name.replace(/\.pdf$/i, '').trim().toLowerCase();
            return baseName === targetExact || normalizeCode(baseName) === targetNorm;
        });

        return exactMatch || null;
    }

    async function lookupSheetSong() {
        const input = document.getElementById('f_songSheetId');
        const statusEl = document.getElementById('f_sheetLookupStatus');
        const titleInput = document.getElementById('f_songTitle');
        const abcInput = document.getElementById('f_songAbc');

        if (!input) return;
        const idVal = input.value.trim();
        if (!idVal) {
            toast('Informe o ID da música (Coluna A)', 'warning');
            return;
        }

        if (statusEl) statusEl.textContent = 'Buscando na planilha...';
        try {
            const result = await fetchSongFromSheet(idVal);
            if (result.title && titleInput) titleInput.value = result.title;
            if (abcInput) abcInput.value = result.abc;
            if (statusEl) {
                statusEl.textContent = result.abc
                    ? '✓ Música e notação ABC carregadas da planilha!'
                    : '✓ Nome carregado da planilha (coluna H sem ABC — use o botão PDF se houver partitura)';
            }
            toast('Dados carregados da planilha!', 'success');
        } catch (err) {
            if (statusEl) statusEl.textContent = `⚠ ${err.message}`;
            toast(err.message, 'error');
        }
    }

    async function openAbcInNewTab(songId) {
        const song = DB.getData().repertoire.find(r => r.id === songId);
        if (!song) {
            toast('Música não encontrada', 'error');
            return;
        }

        let abcCode = (song.abc || '').trim();
        let currentTitle = song.title || '';

        if (!abcCode && song.sheetId) {
            toast('Consultando planilha...', 'info');
            try {
                const fetched = await fetchSongFromSheet(song.sheetId);
                abcCode = (fetched.abc || '').trim();
                if (!currentTitle && fetched.title) currentTitle = fetched.title;
                if (abcCode || fetched.title) {
                    DB.updateRepertoireSong(song.id, {
                        abc: abcCode || song.abc || '',
                        title: song.title || fetched.title
                    });
                }
            } catch (err) {
                toast(err.message, 'error');
                return;
            }
        }

        if (!abcCode) {
            toast('Esta música não possui notação ABC na coluna H da planilha.', 'warning');
            return;
        }

        const win = window.open('', '_blank');
        if (!win) {
            toast('Permita pop-ups/novas guias no navegador para abrir a partitura ABC.', 'warning');
            return;
        }

        const safeTitle = escapeHtml(currentTitle || `ID ${song.sheetId || 'ABC'}`);
        const safeComposer = song.composer ? `<p style="margin:4px 0 0;color:#555;">Compositor: ${escapeHtml(song.composer)}</p>` : '';
        const safeSheetTag = song.sheetId ? `<span style="background:#eef2ff;color:#3730a3;padding:2px 8px;border-radius:12px;font-size:12px;">ID Planilha: ${escapeHtml(song.sheetId)}</span>` : '';
        const serializedAbc = JSON.stringify(abcCode);

        win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Partitura — ${safeTitle}</title>
<script src="https://cdn.jsdelivr.net/npm/abcjs@6.4.4/dist/abcjs-basic-min.js"><\/script>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 24px; background: #f8fafc; color: #0f172a; }
  .wrap { max-width: 960px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 10px rgba(0,0,0,.06); }
  .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; flex-wrap: wrap; }
  .btn { border: 1px solid #cbd5e1; background: #fff; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 14px; }
  .btn:hover { background: #f1f5f9; }
  #sheet { overflow-x: auto; padding: 12px 0; }
  @media print { .no-print { display: none; } body { background: #fff; padding: 0; } .wrap { box-shadow: none; } }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div>
      <h1 style="margin:0;font-size:22px;">🎼 ${safeTitle}</h1>
      ${safeComposer}
      <div style="margin-top:8px;">${safeSheetTag}</div>
    </div>
    <div class="no-print" style="display:flex;gap:8px;">
      <button class="btn" id="btnCopyAbc">📋 Copiar</button>
      <button class="btn" onclick="window.print()">🖨️ Imprimir</button>
    </div>
  </div>
  <div id="sheet"></div>
</div>
<script>
  const abcNotation = ${serializedAbc};
  if (window.ABCJS) {
    ABCJS.renderAbc('sheet', abcNotation, { responsive: 'resize' });
  }
  document.getElementById('btnCopyAbc').addEventListener('click', () => {
    navigator.clipboard.writeText(abcNotation).then(() => alert('Copiado!'));
  });
<\/script>
</body>
</html>`);
        win.document.close();
    }

    async function openPdfInNewTab(songId) {
        const song = DB.getData().repertoire.find(r => r.id === songId);
        if (!song) {
            toast('Música não encontrada', 'error');
            return;
        }

        let currentTitle = song.title || '';
        if (!currentTitle && song.sheetId) {
            try {
                const fetched = await fetchSongFromSheet(song.sheetId);
                if (fetched.title) {
                    currentTitle = fetched.title;
                    DB.updateRepertoireSong(song.id, { title: fetched.title });
                }
            } catch (_) {
                // segue buscando pelo sheetId mesmo se não conseguir o título
            }
        }

        toast('Carregando PDF no navegador...', 'info');
        try {
            const pdfFile = await findPdfInGitHub(song.sheetId, currentTitle);
            if (!pdfFile) {
                toast('Nenhum PDF correspondente encontrado na pasta partituras do GitHub.', 'warning');
                return;
            }

            const rawUrl = pdfFile.download_url;
            if (!rawUrl) {
                toast('Link bruto do PDF indisponível.', 'warning');
                return;
            }

            // Abre a aba antecipadamente para não ser bloqueada por bloqueador de pop-ups
            const pdfTab = window.open('', '_blank');
            if (!pdfTab) {
                toast('Permita pop-ups/novas guias no navegador para visualizar o PDF.', 'warning');
                return;
            }

            const resp = await fetch(rawUrl);
            if (!resp.ok) {
                throw new Error('Falha ao obter o arquivo PDF.');
            }

            const arrayBuffer = await resp.arrayBuffer();
            const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(pdfBlob);

            pdfTab.location.href = blobUrl;
            toast(`Visualizando ${pdfFile.name} no navegador`, 'success');

            // Libera o Blob URL após um tempo para evitar vazamento de memória
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        } catch (err) {
            toast(err.message || 'Erro ao abrir PDF no navegador.', 'error');
        }
    }

    // ============ MINIMIZAR / EXPANDIR ============
    function toggleCollapse(sectionKey) {
        if (collapsedSections.has(sectionKey)) {
            collapsedSections.delete(sectionKey);
        } else {
            collapsedSections.add(sectionKey);
        }

        const body = document.getElementById(`collapse-body-${sectionKey}`);
        const btn = document.getElementById(`collapse-btn-${sectionKey}`);
        if (body && btn) {
            const isCollapsed = collapsedSections.has(sectionKey);
            body.style.display = isCollapsed ? 'none' : 'block';
            btn.textContent = isCollapsed ? '▶' : '▼';
            btn.title = isCollapsed ? 'Expandir' : 'Minimizar';
        }
    }

    // ============ ALUNOS ============
    function renderStudents() {
        const search = document.getElementById('searchStudent').value.toLowerCase();
        const students = DB.getData().students.filter(s =>
            s.name.toLowerCase().includes(search) ||
            (s.teacher || '').toLowerCase().includes(search)
        );

        const tbody = document.getElementById('studentsTableBody');
        if (students.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><div class="icon">👥</div><p>Nenhum aluno cadastrado</p></td></tr>`;
            return;
        }

        tbody.innerHTML = students.map(s => {
            const inst = DB.getInstrument(s.mainInstrument);
            const level = DB.getData().levels.find(l => l.id === s.level);
            return `
                <tr>
                    <td><strong>${escapeHtml(s.name)}</strong></td>
                    <td>${inst ? escapeHtml(inst.name) : '-'}</td>
                    <td>${level ? `<span class="badge badge-primary">${escapeHtml(level.name)}</span>` : '-'}</td>
                    <td>${escapeHtml(s.teacher || '-')}</td>
                    <td>${s.entryDate ? formatDate(s.entryDate) : '-'}</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-secondary" onclick="App.goToStudent('${s.id}')">📋 Ficha</button>
                        <button class="btn btn-sm btn-secondary" onclick="App.openStudentModal('${s.id}')">✏️</button>
                        <button class="btn btn-sm btn-danger" onclick="App.confirmDeleteStudent('${s.id}')">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function openStudentModal(id = null) {
        const student = id ? DB.getStudent(id) : null;
        const instruments = DB.getData().instruments;
        const levels = DB.getData().levels;

        const body = `
            <div class="form-group">
                <label>Nome completo *</label>
                <input type="text" id="f_name" class="input-field" value="${student ? escapeHtml(student.name) : ''}" required>
            </div>
            <div class="form-group">
                <label>Data de nascimento</label>
                <input type="date" id="f_birthDate" class="input-field" value="${student ? student.birthDate || '' : ''}">
            </div>
            <div class="form-group">
                <label>Data de ingresso</label>
                <input type="date" id="f_entryDate" class="input-field" value="${student ? student.entryDate || '' : new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
                <label>Instrumento principal</label>
                <select id="f_mainInstrument" class="input-field">
                    <option value="">Selecione...</option>
                    ${instruments.map(i => `<option value="${i.id}" ${student && student.mainInstrument === i.id ? 'selected' : ''}>${escapeHtml(i.name)}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Instrumentos secundários</label>
                <select id="f_secondaryInstruments" class="input-field" multiple size="3">
                    ${instruments.map(i => `<option value="${i.id}" ${student && (student.secondaryInstruments || []).includes(i.id) ? 'selected' : ''}>${escapeHtml(i.name)}</option>`).join('')}
                </select>
                <small>Segure Ctrl/Cmd para selecionar vários</small>
            </div>
            <div class="form-group">
                <label>Nível atual</label>
                <select id="f_level" class="input-field">
                    <option value="">Selecione...</option>
                    ${levels.map(l => `<option value="${l.id}" ${student && student.level === l.id ? 'selected' : ''}>${escapeHtml(l.name)}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Professor responsável</label>
                <input type="text" id="f_teacher" class="input-field" value="${student ? escapeHtml(student.teacher || '') : ''}">
            </div>
            <div class="form-group">
                <label>Observações</label>
                <textarea id="f_notes" class="input-field">${student ? escapeHtml(student.notes || '') : ''}</textarea>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="App.saveStudent('${id || ''}')">💾 Salvar</button>
        `;

        openModal(id ? 'Editar Aluno' : 'Novo Aluno', body, footer);
    }

    function saveStudent(id) {
        const name = document.getElementById('f_name').value.trim();
        if (!name) { toast('Nome é obrigatório', 'error'); return; }

        const secondary = Array.from(document.getElementById('f_secondaryInstruments').selectedOptions).map(o => o.value);

        const data = {
            name,
            birthDate: document.getElementById('f_birthDate').value || null,
            entryDate: document.getElementById('f_entryDate').value || null,
            mainInstrument: document.getElementById('f_mainInstrument').value || null,
            secondaryInstruments: secondary,
            level: document.getElementById('f_level').value || null,
            teacher: document.getElementById('f_teacher').value.trim(),
            notes: document.getElementById('f_notes').value.trim()
        };

        if (id) {
            DB.updateStudent(id, data);
            toast('Aluno atualizado!', 'success');
        } else {
            DB.addStudent(data);
            toast('Aluno cadastrado!', 'success');
        }
        closeModal();
        renderStudents();
    }

    function confirmDeleteStudent(id) {
        const s = DB.getStudent(id);
        if (!confirm(`Excluir o aluno "${s.name}"?\nTodo o histórico será removido.`)) return;
        DB.deleteStudent(id);
        toast('Aluno excluído', 'success');
        renderStudents();
    }

    function goToStudent(id) {
        switchTab('tracking');
        document.getElementById('trackingStudent').value = id;
        const student = DB.getStudent(id);
        if (student && student.mainInstrument) {
            document.getElementById('trackingInstrument').value = student.mainInstrument;
            updateTrackingLevel();
            if (student.level) {
                document.getElementById('trackingLevel').value = student.level;
                renderTrackingContent();
            }
        }
    }

    // ============ INSTRUMENTOS (EM LISTA) ============
    function renderInstruments() {
        const search = document.getElementById('searchInstrument').value.toLowerCase();
        const instruments = DB.getData().instruments.filter(i =>
            i.name.toLowerCase().includes(search) ||
            (i.description || '').toLowerCase().includes(search)
        );

        const tbody = document.getElementById('instrumentsTableBody');
        if (instruments.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="empty-state"><div class="icon">🎹</div><p>Nenhum instrumento cadastrado</p></td></tr>`;
            return;
        }

        tbody.innerHTML = instruments.map(i => {
            const levels = DB.getLevelsByInstrument(i.id);
            const studentsCount = DB.getData().students.filter(s =>
                s.mainInstrument === i.id || (s.secondaryInstruments || []).includes(i.id)
            ).length;
            return `
                <tr>
                    <td><strong>${i.icon || '🎵'} ${escapeHtml(i.name)}</strong></td>
                    <td>${escapeHtml(i.description || '-')}</td>
                    <td><span class="badge badge-primary">${levels.length} níveis</span></td>
                    <td><span class="badge badge-success">${studentsCount} alunos</span></td>
                    <td class="actions">
                        <button class="btn btn-sm btn-secondary" onclick="App.goToInstrumentCurriculum('${i.id}')">📚 Níveis</button>
                        <button class="btn btn-sm btn-secondary" onclick="App.openInstrumentModal('${i.id}')">✏️</button>
                        <button class="btn btn-sm btn-danger" onclick="App.confirmDeleteInstrument('${i.id}')">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function openInstrumentModal(id = null) {
        const inst = id ? DB.getInstrument(id) : null;
        const body = `
            <div class="form-group">
                <label>Nome do instrumento *</label>
                <input type="text" id="f_instName" class="input-field" value="${inst ? escapeHtml(inst.name) : ''}">
            </div>
            <div class="form-group">
                <label>Ícone (emoji)</label>
                <input type="text" id="f_instIcon" class="input-field" value="${inst ? escapeHtml(inst.icon || '') : '🎵'}" maxlength="4">
            </div>
            <div class="form-group">
                <label>Descrição</label>
                <textarea id="f_instDesc" class="input-field">${inst ? escapeHtml(inst.description || '') : ''}</textarea>
            </div>
        `;
        const footer = `
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="App.saveInstrument('${id || ''}')">💾 Salvar</button>
        `;
        openModal(id ? 'Editar Instrumento' : 'Novo Instrumento', body, footer);
    }

    function saveInstrument(id) {
        const name = document.getElementById('f_instName').value.trim();
        if (!name) { toast('Nome é obrigatório', 'error'); return; }
        const data = {
            name,
            icon: document.getElementById('f_instIcon').value.trim() || '🎵',
            description: document.getElementById('f_instDesc').value.trim()
        };
        if (id) {
            DB.updateInstrument(id, data);
            toast('Instrumento atualizado!', 'success');
        } else {
            DB.addInstrument(data);
            toast('Instrumento cadastrado!', 'success');
        }
        closeModal();
        renderInstruments();
    }

    function confirmDeleteInstrument(id) {
        const inst = DB.getInstrument(id);
        if (!confirm(`Excluir "${inst.name}"?\nTodos os níveis, conteúdos e progressos serão removidos.`)) return;
        DB.deleteInstrument(id);
        toast('Instrumento excluído', 'success');
        renderInstruments();
    }

    function goToInstrumentCurriculum(id) {
        switchTab('curriculum');
        document.getElementById('curriculumInstrument').value = id;
        renderCurriculum();
    }

    // ============ CURRÍCULO ============
    function renderCurriculum() {
        const select = document.getElementById('curriculumInstrument');
        const instruments = DB.getData().instruments;
        const current = select.value;
        select.innerHTML = '<option value="">Selecione um instrumento</option>' +
            instruments.map(i => `<option value="${i.id}" ${i.id === current ? 'selected' : ''}>${escapeHtml(i.name)}</option>`).join('');

        const instId = select.value;
        const container = document.getElementById('curriculumContent');

        if (!instId) {
            container.innerHTML = '<div class="empty-state"><div class="icon">📚</div><p>Selecione um instrumento para ver seus níveis e conteúdos</p></div>';
            return;
        }

        const levels = DB.getLevelsByInstrument(instId);
        if (levels.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="icon">📋</div><p>Nenhum nível cadastrado. Clique em "+ Novo Nível" para começar.</p></div>';
            return;
        }

        container.innerHTML = levels.map(level => {
            const contents = DB.getContentsByLevel(level.id);
            const songs = DB.getRepertoireByLevel(level.id);
            const sectionKey = `curr_${level.id}`;
            const repSectionKey = `curr_rep_${level.id}`;
            const isCollapsed = collapsedSections.has(sectionKey);
            const isRepCollapsed = collapsedSections.has(repSectionKey);

            return `
                <div class="tracking-section">
                    <h3 style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                        <span style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;" onclick="App.toggleCollapse('${sectionKey}')">
                            <button type="button" class="btn btn-sm btn-secondary" id="collapse-btn-${sectionKey}" title="${isCollapsed ? 'Expandir' : 'Minimizar'}">${isCollapsed ? '▶' : '▼'}</button>
                            <span>📖 ${escapeHtml(level.name)} <small style="color:var(--text-light);font-weight:normal;">(${contents.length} conteúdos • ${songs.length} músicas)</small></span>
                        </span>
                        <div style="display:flex;gap:0.35rem;flex-wrap:wrap;">
                            <button class="btn btn-sm btn-secondary" onclick="App.openLevelModal('${instId}', '${level.id}')">✏️ Editar Nível</button>
                            <button class="btn btn-sm btn-primary" onclick="App.openContentModal('${level.id}')">+ Conteúdo</button>
                            <button class="btn btn-sm btn-primary" onclick="App.openRepertoireModal('${level.id}')">+ Música</button>
                            <button class="btn btn-sm btn-danger" onclick="App.confirmDeleteLevel('${level.id}')">🗑️</button>
                        </div>
                    </h3>
                    <div id="collapse-body-${sectionKey}" style="display:${isCollapsed ? 'none' : 'block'};margin-top:0.75rem;">
                        ${level.description ? `<p style="color:var(--text-light);margin-bottom:1rem;">${escapeHtml(level.description)}</p>` : ''}

                        <h4 style="margin:0.5rem 0;">📚 Conteúdos</h4>
                        ${contents.length === 0 ? '<p style="color:var(--text-light);margin-bottom:1rem;">Nenhum conteúdo cadastrado</p>' : ''}
                        ${contents.map(c => `
                            <div class="content-item">
                                <div style="flex:1;">
                                    <div class="content-name">
                                        ${escapeHtml(c.name)}
                                        ${c.difficulty ? `<span class="badge badge-warning">${escapeHtml(c.difficulty)}</span>` : ''}
                                    </div>
                                    ${c.description ? `<div class="content-desc">${escapeHtml(c.description)}</div>` : ''}
                                    ${c.objective ? `<div class="content-desc"><strong>Objetivo:</strong> ${escapeHtml(c.objective)}</div>` : ''}
                                </div>
                                <div class="content-actions">
                                    <button class="btn btn-sm btn-secondary" onclick="App.openContentModal('${level.id}', '${c.id}')">✏️</button>
                                    <button class="btn btn-sm btn-danger" onclick="App.confirmDeleteContent('${c.id}')">🗑️</button>
                                </div>
                            </div>
                        `).join('')}

                        <div style="margin-top:1.25rem;padding-top:1rem;border-top:1px solid var(--border, #e5e7eb);">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                                <h4 style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;margin:0;" onclick="App.toggleCollapse('${repSectionKey}')">
                                    <button type="button" class="btn btn-sm btn-secondary" id="collapse-btn-${repSectionKey}" title="${isRepCollapsed ? 'Expandir' : 'Minimizar'}">${isRepCollapsed ? '▶' : '▼'}</button>
                                    <span>🎼 Repertório do Nível (${songs.length})</span>
                                </h4>
                                <button class="btn btn-sm btn-secondary" onclick="App.openRepertoireModal('${level.id}')">+ Adicionar Música</button>
                            </div>
                            <div id="collapse-body-${repSectionKey}" style="display:${isRepCollapsed ? 'none' : 'block'};">
                                ${songs.length === 0 ? '<p style="color:var(--text-light);">Nenhuma música cadastrada no repertório deste nível</p>' : ''}
                                ${songs.map(song => `
                                    <div class="content-item">
                                        <div style="flex:1;">
                                            <div class="content-name">
                                                ${song.sheetId ? `<span class="badge badge-primary">#${escapeHtml(song.sheetId)}</span>` : ''}
                                                🎵 ${escapeHtml(song.title)}
                                                ${song.composer ? `<span class="badge badge-warning">${escapeHtml(song.composer)}</span>` : ''}
                                            </div>
                                            ${song.notes ? `<div class="content-desc">${escapeHtml(song.notes)}</div>` : ''}
                                        </div>
                                        <div class="content-actions">
                                            <button type="button" class="btn btn-sm btn-secondary" onclick="App.openAbcInNewTab('${song.id}')">🎼 ABC</button>
                                            <button type="button" class="btn btn-sm btn-secondary" onclick="App.openPdfInNewTab('${song.id}')">📄 PDF</button>
                                            <button class="btn btn-sm btn-secondary" onclick="App.openRepertoireModal('${level.id}', '${song.id}')">✏️</button>
                                            <button class="btn btn-sm btn-danger" onclick="App.confirmDeleteRepertoireSong('${song.id}')">🗑️</button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function openLevelModal(instrumentId, levelId = null) {
        const level = levelId ? DB.getData().levels.find(l => l.id === levelId) : null;
        const body = `
            <div class="form-group">
                <label>Nome do nível *</label>
                <input type="text" id="f_levelName" class="input-field" value="${level ? escapeHtml(level.name) : ''}" placeholder="Ex: Pré-A, Iniciante, Intermediário">
            </div>
            <div class="form-group">
                <label>Ordem de apresentação</label>
                <input type="number" id="f_levelOrder" class="input-field" value="${level ? level.order || 0 : 0}">
            </div>
            <div class="form-group">
                <label>Descrição</label>
                <textarea id="f_levelDesc" class="input-field">${level ? escapeHtml(level.description || '') : ''}</textarea>
            </div>
        `;
        const footer = `
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="App.saveLevel('${instrumentId}', '${levelId || ''}')">💾 Salvar</button>
        `;
        openModal(levelId ? 'Editar Nível' : 'Novo Nível', body, footer);
    }

    function saveLevel(instrumentId, levelId) {
        const name = document.getElementById('f_levelName').value.trim();
        if (!name) { toast('Nome é obrigatório', 'error'); return; }
        const data = {
            instrumentId,
            name,
            order: parseInt(document.getElementById('f_levelOrder').value) || 0,
            description: document.getElementById('f_levelDesc').value.trim()
        };
        if (levelId) {
            DB.updateLevel(levelId, data);
            toast('Nível atualizado!', 'success');
        } else {
            DB.addLevel(data);
            toast('Nível criado!', 'success');
        }
        closeModal();
        renderCurriculum();
    }

    function confirmDeleteLevel(id) {
        if (!confirm('Excluir este nível e todos os seus conteúdos e repertório?')) return;
        DB.deleteLevel(id);
        toast('Nível excluído', 'success');
        renderCurriculum();
    }

    function openContentModal(levelId, contentId = null) {
        const content = contentId ? DB.getData().contents.find(c => c.id === contentId) : null;
        const body = `
            <div class="form-group">
                <label>Nome do conteúdo *</label>
                <input type="text" id="f_contentName" class="input-field" value="${content ? escapeHtml(content.name) : ''}">
            </div>
            <div class="form-group">
                <label>Descrição</label>
                <textarea id="f_contentDesc" class="input-field">${content ? escapeHtml(content.description || '') : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Objetivo de aprendizagem</label>
                <textarea id="f_contentObj" class="input-field">${content ? escapeHtml(content.objective || '') : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Nível de dificuldade</label>
                <select id="f_contentDiff" class="input-field">
                    <option value="">-</option>
                    <option value="Básico" ${content && content.difficulty === 'Básico' ? 'selected' : ''}>Básico</option>
                    <option value="Intermediário" ${content && content.difficulty === 'Intermediário' ? 'selected' : ''}>Intermediário</option>
                    <option value="Avançado" ${content && content.difficulty === 'Avançado' ? 'selected' : ''}>Avançado</option>
                </select>
            </div>
            <div class="form-group">
                <label>Ordem</label>
                <input type="number" id="f_contentOrder" class="input-field" value="${content ? content.order || 0 : 0}">
            </div>
            <div class="form-group">
                <label>Pré-requisitos</label>
                <textarea id="f_contentPre" class="input-field">${content ? escapeHtml(content.prerequisites || '') : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Sugestões de atividades</label>
                <textarea id="f_contentSug" class="input-field">${content ? escapeHtml(content.suggestions || '') : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Observações pedagógicas</label>
                <textarea id="f_contentNotes" class="input-field">${content ? escapeHtml(content.notes || '') : ''}</textarea>
            </div>
        `;
        const footer = `
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="App.saveContent('${levelId}', '${contentId || ''}')">💾 Salvar</button>
        `;
        openModal(contentId ? 'Editar Conteúdo' : 'Novo Conteúdo', body, footer);
    }

    function saveContent(levelId, contentId) {
        const name = document.getElementById('f_contentName').value.trim();
        if (!name) { toast('Nome é obrigatório', 'error'); return; }
        const data = {
            levelId,
            name,
            description: document.getElementById('f_contentDesc').value.trim(),
            objective: document.getElementById('f_contentObj').value.trim(),
            difficulty: document.getElementById('f_contentDiff').value,
            order: parseInt(document.getElementById('f_contentOrder').value) || 0,
            prerequisites: document.getElementById('f_contentPre').value.trim(),
            suggestions: document.getElementById('f_contentSug').value.trim(),
            notes: document.getElementById('f_contentNotes').value.trim()
        };
        if (contentId) {
            DB.updateContent(contentId, data);
            toast('Conteúdo atualizado!', 'success');
        } else {
            DB.addContent(data);
            toast('Conteúdo criado!', 'success');
        }
        closeModal();
        renderCurriculum();
    }

    function confirmDeleteContent(id) {
        if (!confirm('Excluir este conteúdo?')) return;
        DB.deleteContent(id);
        toast('Conteúdo excluído', 'success');
        renderCurriculum();
    }

    // ============ REPERTÓRIO (COM ID DA PLANILHA & ABC) ============
    function openRepertoireModal(levelId, songId = null) {
        const song = songId ? DB.getData().repertoire.find(r => r.id === songId) : null;
        const body = `
            <div class="form-group">
                <label>ID da música na planilha (Coluna A)</label>
                <div style="display:flex;gap:0.5rem;">
                    <input type="text" id="f_songSheetId" class="input-field" value="${song ? escapeHtml(song.sheetId || '') : ''}" placeholder="Ex: 84" onchange="App.lookupSheetSong()">
                    <button type="button" class="btn btn-secondary" onclick="App.lookupSheetSong()">🔍 Buscar</button>
                </div>
                <small id="f_sheetLookupStatus" style="color:var(--text-light);"></small>
            </div>
            <div class="form-group">
                <label>Nome / Título da música (Coluna B) *</label>
                <input type="text" id="f_songTitle" class="input-field" value="${song ? escapeHtml(song.title) : ''}" placeholder="Carrega automaticamente ao informar o ID">
            </div>
            <div class="form-group">
                <label>Notação ABC (Coluna H)</label>
                <textarea id="f_songAbc" class="input-field" rows="4" placeholder="Carrega automaticamente da coluna H ou cole aqui...">${song ? escapeHtml(song.abc || '') : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Compositor / Autor</label>
                <input type="text" id="f_songComposer" class="input-field" value="${song ? escapeHtml(song.composer || '') : ''}" placeholder="Opcional">
            </div>
            <div class="form-group">
                <label>Ordem</label>
                <input type="number" id="f_songOrder" class="input-field" value="${song ? song.order || 0 : 0}">
            </div>
            <div class="form-group">
                <label>Observações / Tonalidade</label>
                <textarea id="f_songNotes" class="input-field">${song ? escapeHtml(song.notes || '') : ''}</textarea>
            </div>
        `;
        const footer = `
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="App.saveRepertoireSong('${levelId}', '${songId || ''}')">💾 Salvar</button>
        `;
        openModal(songId ? 'Editar Música do Repertório' : 'Nova Música no Repertório', body, footer);
    }

    function saveRepertoireSong(levelId, songId) {
        const title = document.getElementById('f_songTitle').value.trim();
        if (!title) { toast('Nome da música é obrigatório', 'error'); return; }
        const data = {
            levelId,
            sheetId: document.getElementById('f_songSheetId').value.trim(),
            title,
            abc: document.getElementById('f_songAbc').value.trim(),
            composer: document.getElementById('f_songComposer').value.trim(),
            order: parseInt(document.getElementById('f_songOrder').value) || 0,
            notes: document.getElementById('f_songNotes').value.trim()
        };
        if (songId) {
            DB.updateRepertoireSong(songId, data);
            toast('Música atualizada!', 'success');
        } else {
            DB.addRepertoireSong(data);
            toast('Música adicionada ao repertório!', 'success');
        }
        closeModal();
        renderCurriculum();
    }

    function confirmDeleteRepertoireSong(id) {
        if (!confirm('Excluir esta música do repertório?')) return;
        DB.deleteRepertoireSong(id);
        toast('Música excluída', 'success');
        renderCurriculum();
    }

    // ============ ACOMPANHAMENTO ============
    function renderTracking() {
        const studentSelect = document.getElementById('trackingStudent');
        const instSelect = document.getElementById('trackingInstrument');
        const levelSelect = document.getElementById('trackingLevel');

        const currentStudent = studentSelect.value;
        const currentInst = instSelect.value;
        const currentLevel = levelSelect.value;

        studentSelect.innerHTML = '<option value="">Selecione um aluno</option>' +
            DB.getData().students.map(s => `<option value="${s.id}" ${s.id === currentStudent ? 'selected' : ''}>${escapeHtml(s.name)}</option>`).join('');

        const student = DB.getStudent(currentStudent);
        let instruments = DB.getData().instruments;
        if (student) {
            const ids = [student.mainInstrument, ...(student.secondaryInstruments || [])].filter(Boolean);
            if (ids.length > 0) instruments = instruments.filter(i => ids.includes(i.id));
        }
        instSelect.innerHTML = '<option value="">Selecione um instrumento</option>' +
            instruments.map(i => `<option value="${i.id}" ${i.id === currentInst ? 'selected' : ''}>${escapeHtml(i.name)}</option>`).join('');

        updateTrackingLevel();
        if (currentLevel) levelSelect.value = currentLevel;
        renderTrackingContent();
    }

    function updateTrackingLevel() {
        const instId = document.getElementById('trackingInstrument').value;
        const levelSelect = document.getElementById('trackingLevel');
        const currentLevel = levelSelect.value;
        const levels = DB.getLevelsByInstrument(instId);
        levelSelect.innerHTML = '<option value="">Selecione um nível</option>' +
            levels.map(l => `<option value="${l.id}" ${l.id === currentLevel ? 'selected' : ''}>${escapeHtml(l.name)}</option>`).join('');

        const studentId = document.getElementById('trackingStudent').value;
        const student = DB.getStudent(studentId);
        if (student && student.level && levels.find(l => l.id === student.level) && !currentLevel) {
            levelSelect.value = student.level;
        }
        renderTrackingContent();
    }

    function renderTrackingContent() {
        const studentId = document.getElementById('trackingStudent').value;
        const instId = document.getElementById('trackingInstrument').value;
        const levelId = document.getElementById('trackingLevel').value;
        const container = document.getElementById('trackingContent');

        if (!studentId || !instId || !levelId) {
            container.innerHTML = '<div class="empty-state"><div class="icon">✅</div><p>Selecione aluno, instrumento e nível para iniciar o acompanhamento</p></div>';
            return;
        }

        const student = DB.getStudent(studentId);
        const inst = DB.getInstrument(instId);
        const level = DB.getData().levels.find(l => l.id === levelId);
        const contents = DB.getContentsByLevel(levelId);
        const songs = DB.getRepertoireByLevel(levelId);
        const customContents = DB.getCustomContents(studentId, instId);

        let known = 0, learning = 0, pending = 0;

        contents.forEach(c => {
            const p = DB.getContentStatus(studentId, instId, levelId, c.id);
            if (p) {
                if (p.status === 'known') known++;
                else if (p.status === 'learning') learning++;
                else if (p.status === 'pending') pending++;
            }
        });

        let completedSongs = 0;
        songs.forEach(song => {
            if (DB.isSongCompleted(studentId, instId, levelId, song.id)) {
                completedSongs++;
                known++;
            } else {
                pending++;
            }
        });

        customContents.forEach(c => {
            if (c.status === 'known') known++;
            else if (c.status === 'learning') learning++;
            else if (c.status === 'pending') pending++;
        });

        const total = contents.length + songs.length + customContents.length;
        const progressPct = total > 0 ? Math.round((known / total) * 100) : 0;
        const repertoireFinished = songs.length > 0 && completedSongs === songs.length;

        let html = `
            <div class="card" style="margin-bottom:1rem;">
                <h3>👤 ${escapeHtml(student.name)} • ${inst.icon || '🎵'} ${escapeHtml(inst.name)} • 📖 ${escapeHtml(level.name)}</h3>
                <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:0.5rem;align-items:center;">
                    <span class="badge badge-success">✓ ${known} dominados</span>
                    <span class="badge badge-warning">⏳ ${learning} aprendendo</span>
                    <span class="badge badge-danger">○ ${pending} pendentes</span>
                    ${songs.length > 0 ? `<span class="badge ${repertoireFinished ? 'badge-success' : 'badge-primary'}">🎼 Repertório: ${completedSongs}/${songs.length} ${repertoireFinished ? '(Finalizado!)' : ''}</span>` : ''}
                </div>
                <div class="progress-bar" style="margin-top:1rem;">
                    <div class="progress-fill" style="width:${progressPct}%"></div>
                </div>
                <small style="color:var(--text-light);">${progressPct}% de domínio</small>
            </div>
        `;

        if (contents.length === 0 && songs.length === 0 && customContents.length === 0) {
            html += '<div class="empty-state"><div class="icon">📋</div><p>Nenhum conteúdo ou música cadastrado para este nível</p></div>';
        } else {
            if (contents.length > 0) {
                const levelKey = `track_lvl_${levelId}`;
                const isLevelCollapsed = collapsedSections.has(levelKey);

                html += `
                    <div class="tracking-section">
                        <h3 style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;" onclick="App.toggleCollapse('${levelKey}')">
                            <button type="button" class="btn btn-sm btn-secondary" id="collapse-btn-${levelKey}" title="${isLevelCollapsed ? 'Expandir' : 'Minimizar'}">${isLevelCollapsed ? '▶' : '▼'}</button>
                            <span>📚 Conteúdos do Nível: ${escapeHtml(level.name)} <small style="color:var(--text-light);font-weight:normal;">(${contents.length})</small></span>
                        </h3>
                        <div id="collapse-body-${levelKey}" style="display:${isLevelCollapsed ? 'none' : 'block'};margin-top:0.75rem;">
                `;
                contents.forEach(c => {
                    const p = DB.getContentStatus(studentId, instId, levelId, c.id);
                    const status = p ? p.status : null;
                    html += `
                        <div class="content-item">
                            <div style="flex:1;">
                                <div class="content-name">${escapeHtml(c.name)}</div>
                                ${c.description ? `<div class="content-desc">${escapeHtml(c.description)}</div>` : ''}
                            </div>
                            <div class="status-buttons">
                                <button class="status-btn known ${status === 'known' ? 'active' : ''}" onclick="App.setStatus('${studentId}','${instId}','${levelId}','${c.id}','known')">✓ Já sabe</button>
                                <button class="status-btn learning ${status === 'learning' ? 'active' : ''}" onclick="App.setStatus('${studentId}','${instId}','${levelId}','${c.id}','learning')">⏳ Aprendendo</button>
                                <button class="status-btn pending ${status === 'pending' ? 'active' : ''}" onclick="App.setStatus('${studentId}','${instId}','${levelId}','${c.id}','pending')">○ Precisa</button>
                            </div>
                        </div>
                    `;
                });
                html += '</div></div>';
            }

            if (songs.length > 0) {
                const repKey = `track_rep_${levelId}`;
                const isRepCollapsed = collapsedSections.has(repKey);

                html += `
                    <div class="tracking-section">
                        <h3 style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                            <span style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;" onclick="App.toggleCollapse('${repKey}')">
                                <button type="button" class="btn btn-sm btn-secondary" id="collapse-btn-${repKey}" title="${isRepCollapsed ? 'Expandir' : 'Minimizar'}">${isRepCollapsed ? '▶' : '▼'}</button>
                                <span>🎼 Repertório (${completedSongs}/${songs.length})</span>
                            </span>
                            ${repertoireFinished ? '<span class="badge badge-success">🏆 Repertório Finalizado</span>' : ''}
                        </h3>
                        <div id="collapse-body-${repKey}" style="display:${isRepCollapsed ? 'none' : 'block'};margin-top:0.75rem;">
                `;
                songs.forEach(song => {
                    const checked = DB.isSongCompleted(studentId, instId, levelId, song.id);
                    html += `
                        <div class="content-item" style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
                            <label style="cursor:pointer;display:flex;align-items:center;gap:0.75rem;flex:1;margin:0;min-width:220px;">
                                <input type="checkbox"
                                    ${checked ? 'checked' : ''}
                                    onchange="App.onToggleRepertoireSong('${studentId}','${instId}','${levelId}','${song.id}', this.checked)"
                                    style="width:18px;height:18px;cursor:pointer;">
                                <div style="flex:1;">
                                    <div class="content-name" style="${checked ? 'text-decoration:line-through;opacity:0.75;' : ''}">
                                        ${song.sheetId ? `<span class="badge badge-primary">#${escapeHtml(song.sheetId)}</span>` : ''}
                                        ${escapeHtml(song.title)}
                                        ${song.composer ? `<span class="badge badge-warning">${escapeHtml(song.composer)}</span>` : ''}
                                    </div>
                                    ${song.notes ? `<div class="content-desc">${escapeHtml(song.notes)}</div>` : ''}
                                </div>
                            </label>
                            <div class="content-actions" style="display:flex;align-items:center;gap:0.35rem;">
                                <button type="button" class="btn btn-sm btn-secondary" onclick="App.openAbcInNewTab('${song.id}')">🎼 ABC</button>
                                <button type="button" class="btn btn-sm btn-secondary" onclick="App.openPdfInNewTab('${song.id}')">📄 PDF</button>
                                <span class="badge ${checked ? 'badge-success' : 'badge-warning'}">${checked ? '✓ Concluída' : '○ Pendente'}</span>
                            </div>
                        </div>
                    `;
                });
                html += '</div></div>';
            }

            if (customContents.length > 0) {
                const customKey = `track_custom_${studentId}_${instId}`;
                const isCustomCollapsed = collapsedSections.has(customKey);

                html += `
                    <div class="tracking-section">
                        <h3 style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;" onclick="App.toggleCollapse('${customKey}')">
                            <button type="button" class="btn btn-sm btn-secondary" id="collapse-btn-${customKey}" title="${isCustomCollapsed ? 'Expandir' : 'Minimizar'}">${isCustomCollapsed ? '▶' : '▼'}</button>
                            <span>⭐ Conteúdos Personalizados <small style="color:var(--text-light);font-weight:normal;">(${customContents.length})</small></span>
                        </h3>
                        <div id="collapse-body-${customKey}" style="display:${isCustomCollapsed ? 'none' : 'block'};margin-top:0.75rem;">
                `;
                customContents.forEach(c => {
                    html += `
                        <div class="content-item">
                            <div style="flex:1;">
                                <div class="content-name">${escapeHtml(c.name)} <span class="badge badge-primary">${escapeHtml(c.levelName || 'Personalizado')}</span></div>
                            </div>
                            <div class="status-buttons">
                                <button class="status-btn known ${c.status === 'known' ? 'active' : ''}" onclick="App.setCustomStatus('${studentId}','${instId}','${c.id}','known')">✓ Já sabe</button>
                                <button class="status-btn learning ${c.status === 'learning' ? 'active' : ''}" onclick="App.setCustomStatus('${studentId}','${instId}','${c.id}','learning')">⏳ Aprendendo</button>
                                <button class="status-btn pending ${c.status === 'pending' ? 'active' : ''}" onclick="App.setCustomStatus('${studentId}','${instId}','${c.id}','pending')">○ Precisa</button>
                            </div>
                            <div class="content-actions">
                                <button class="btn btn-sm btn-danger" onclick="App.deleteCustomContent('${studentId}','${instId}','${c.id}')">🗑️</button>
                            </div>
                        </div>
                    `;
                });
                html += '</div></div>';
            }
        }

        const history = DB.getHistory(studentId).filter(h => h.instrumentId === instId).slice(0, 15);
        if (history.length > 0) {
            const histKey = `track_hist_${studentId}_${instId}`;
            const isHistCollapsed = collapsedSections.has(histKey);

            html += `
                <div class="tracking-section">
                    <h3 style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;" onclick="App.toggleCollapse('${histKey}')">
                        <button type="button" class="btn btn-sm btn-secondary" id="collapse-btn-${histKey}" title="${isHistCollapsed ? 'Expandir' : 'Minimizar'}">${isHistCollapsed ? '▶' : '▼'}</button>
                        <span>📜 Histórico Recente <small style="color:var(--text-light);font-weight:normal;">(${history.length})</small></span>
                    </h3>
                    <div id="collapse-body-${histKey}" style="display:${isHistCollapsed ? 'none' : 'block'};margin-top:0.75rem;">
            `;
            history.forEach(h => {
                const statusLabel = { known: '✓ Dominado', learning: '⏳ Aprendendo', pending: '○ Precisa aprender' };
                html += `
                    <div class="history-item">
                        <div class="history-date">${formatDateTime(h.date)}</div>
                        <div class="history-content">
                            <strong>${escapeHtml(h.contentName)}</strong>: ${statusLabel[h.newStatus] || h.newStatus}
                            ${h.oldStatus ? ` (era: ${statusLabel[h.oldStatus] || h.oldStatus})` : ' (iniciado)'}
                        </div>
                        ${h.observation ? `<div class="content-desc">💬 ${escapeHtml(h.observation)}</div>` : ''}
                    </div>
                `;
            });
            html += '</div></div>';
        }

        container.innerHTML = html;
    }

    function onToggleRepertoireSong(studentId, instId, levelId, songId, completed) {
        DB.toggleRepertoireSong(studentId, instId, levelId, songId, completed);
        renderTrackingContent();

        const songs = DB.getRepertoireByLevel(levelId);
        const allDone = songs.length > 0 && songs.every(s => DB.isSongCompleted(studentId, instId, levelId, s.id));
        if (allDone && completed) {
            toast('🏆 Repertório do nível finalizado!', 'success');
        }
    }

    function setStatus(studentId, instId, levelId, contentId, status) {
        const obs = prompt('Observação (opcional):') || '';
        DB.setProgress(studentId, instId, levelId, contentId, status, obs);
        renderTrackingContent();
    }

    function setCustomStatus(studentId, instId, contentId, status) {
        DB.updateCustomContent(studentId, instId, contentId, { status, date: new Date().toISOString() });
        renderTrackingContent();
    }

    function deleteCustomContent(studentId, instId, contentId) {
        if (!confirm('Excluir este conteúdo personalizado?')) return;
        DB.deleteCustomContent(studentId, instId, contentId);
        renderTrackingContent();
    }

    function openCustomContentModal() {
        const studentId = document.getElementById('trackingStudent').value;
        const instId = document.getElementById('trackingInstrument').value;
        if (!studentId || !instId) {
            toast('Selecione aluno e instrumento primeiro', 'warning');
            return;
        }
        const body = `
            <div class="form-group">
                <label>Nome do conteúdo *</label>
                <input type="text" id="f_ccName" class="input-field">
            </div>
            <div class="form-group">
                <label>Nível/Contexto</label>
                <input type="text" id="f_ccLevel" class="input-field" placeholder="Ex: Aula especial, Repertório">
            </div>
            <div class="form-group">
                <label>Estado inicial</label>
                <select id="f_ccStatus" class="input-field">
                    <option value="pending">Precisa aprender</option>
                    <option value="learning">Está aprendendo</option>
                    <option value="known">Já sabe</option>
                </select>
            </div>
        `;
        const footer = `
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="App.saveCustomContent('${studentId}','${instId}')">💾 Salvar</button>
        `;
        openModal('Conteúdo Personalizado', body, footer);
    }

    function saveCustomContent(studentId, instId) {
        const name = document.getElementById('f_ccName').value.trim();
        if (!name) { toast('Nome é obrigatório', 'error'); return; }
        DB.addCustomContent(studentId, instId, {
            name,
            levelName: document.getElementById('f_ccLevel').value.trim(),
            status: document.getElementById('f_ccStatus').value
        });
        toast('Conteúdo adicionado!', 'success');
        closeModal();
        renderTrackingContent();
    }

    // ============ RELATÓRIOS ============
    function renderReports() {
        const select = document.getElementById('reportStudent');
        const current = select.value;
        select.innerHTML = '<option value="">Relatório Geral</option>' +
            DB.getData().students.map(s => `<option value="${s.id}" ${s.id === current ? 'selected' : ''}>${escapeHtml(s.name)}</option>`).join('');

        const container = document.getElementById('reportContent');

        if (!current) {
            const stats = DB.getStats();
            let html = '<div class="card"><h3>📊 Relatório Geral</h3>';
            html += `<p><strong>Total de alunos:</strong> ${stats.totalStudents}</p>`;
            html += `<p><strong>Total de instrumentos:</strong> ${stats.totalInstruments}</p>`;
            html += `<p><strong>Total de níveis:</strong> ${stats.totalLevels}</p>`;
            html += `<p><strong>Total de conteúdos:</strong> ${stats.totalContents}</p>`;
            html += '</div>';

            html += '<div class="card"><h3>🎹 Alunos por Instrumento</h3>';
            Object.values(stats.byInstrument).forEach(i => {
                if (i.count > 0) html += `<p>${escapeHtml(i.name)}: <strong>${i.count}</strong></p>`;
            });
            html += '</div>';

            html += '<div class="card"><h3>📈 Evolução Geral</h3>';
            html += `<p>Conteúdos dominados: <strong style="color:var(--success)">${stats.known}</strong></p>`;
            html += `<p>Em desenvolvimento: <strong style="color:var(--warning)">${stats.learning}</strong></p>`;
            html += `<p>Pendentes: <strong style="color:var(--danger)">${stats.pending}</strong></p>`;
            html += '</div>';

            container.innerHTML = html;
        } else {
            const student = DB.getStudent(current);
            const inst = DB.getInstrument(student.mainInstrument);
            const level = DB.getData().levels.find(l => l.id === student.level);

            let html = '<div class="card">';
            html += `<h3>👤 Relatório Individual: ${escapeHtml(student.name)}</h3>`;
            html += `<p><strong>Instrumento:</strong> ${inst ? escapeHtml(inst.name) : '-'}</p>`;
            html += `<p><strong>Nível:</strong> ${level ? escapeHtml(level.name) : '-'}</p>`;
            html += `<p><strong>Professor:</strong> ${escapeHtml(student.teacher || '-')}</p>`;
            html += `<p><strong>Ingresso:</strong> ${student.entryDate ? formatDate(student.entryDate) : '-'}</p>`;
            if (student.notes) html += `<p><strong>Observações:</strong> ${escapeHtml(student.notes)}</p>`;
            html += '</div>';

            const instruments = [student.mainInstrument, ...(student.secondaryInstruments || [])].filter(Boolean);
            instruments.forEach(instId => {
                const instrument = DB.getInstrument(instId);
                if (!instrument) return;
                const levels = DB.getLevelsByInstrument(instId);
                levels.forEach(lvl => {
                    const contents = DB.getContentsByLevel(lvl.id);
                    const songs = DB.getRepertoireByLevel(lvl.id);
                    let known = 0, learning = 0, pending = 0;
                    contents.forEach(c => {
                        const p = DB.getContentStatus(current, instId, lvl.id, c.id);
                        if (p) {
                            if (p.status === 'known') known++;
                            else if (p.status === 'learning') learning++;
                            else if (p.status === 'pending') pending++;
                        }
                    });
                    songs.forEach(song => {
                        if (DB.isSongCompleted(current, instId, lvl.id, song.id)) known++;
                        else pending++;
                    });
                    const total = contents.length + songs.length;
                    const pct = total > 0 ? Math.round((known / total) * 100) : 0;

                    html += `
                        <div class="card">
                            <h3>${instrument.icon || '🎵'} ${escapeHtml(instrument.name)} - ${escapeHtml(lvl.name)}</h3>
                            <p>Dominados: <strong style="color:var(--success)">${known}</strong> | Aprendendo: <strong style="color:var(--warning)">${learning}</strong> | Pendentes: <strong style="color:var(--danger)">${pending}</strong></p>
                            <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
                            <small>${pct}% de domínio</small>
                        </div>
                    `;
                });
            });

            const history = DB.getHistory(current);
            if (history.length > 0) {
                html += '<div class="card"><h3>📜 Histórico Completo</h3>';
                history.slice(0, 50).forEach(h => {
                    const statusLabel = { known: '✓ Dominado', learning: '⏳ Aprendendo', pending: '○ Precisa aprender' };
                    html += `
                        <div class="history-item">
                            <div class="history-date">${formatDateTime(h.date)}</div>
                            <div class="history-content">
                                <strong>${escapeHtml(h.contentName)}</strong>: ${statusLabel[h.newStatus] || h.newStatus}
                            </div>
                            ${h.observation ? `<div class="content-desc">💬 ${escapeHtml(h.observation)}</div>` : ''}
                        </div>
                    `;
                });
                html += '</div>';
            }

            container.innerHTML = html;
        }
    }

    function exportReportTXT() {
        const studentId = document.getElementById('reportStudent').value;
        const text = generateReportText(studentId);
        downloadFile(`relatorio_${studentId ? DB.getStudent(studentId).name : 'geral'}_${Date.now()}.txt`, text, 'text/plain');
        toast('Relatório exportado!', 'success');
    }

    function generateReportText(studentId) {
        let text = '========================================\n';
        text += '   RELATÓRIO - SISTEMA MUSICAL\n';
        text += '   Gerado em: ' + new Date().toLocaleString('pt-BR') + '\n';
        text += '========================================\n\n';

        if (!studentId) {
            const stats = DB.getStats();
            text += `Total de alunos: ${stats.totalStudents}\n`;
            text += `Total de instrumentos: ${stats.totalInstruments}\n`;
            text += `Total de conteúdos: ${stats.totalContents}\n\n`;
            text += '--- ALUNOS POR INSTRUMENTO ---\n';
            Object.values(stats.byInstrument).forEach(i => {
                text += `${i.name}: ${i.count}\n`;
            });
            text += '\n--- LISTA DE ALUNOS ---\n';
            DB.getData().students.forEach(s => {
                const inst = DB.getInstrument(s.mainInstrument);
                text += `• ${s.name} - ${inst ? inst.name : '-'}\n`;
            });
        } else {
            const s = DB.getStudent(studentId);
            const inst = DB.getInstrument(s.mainInstrument);
            const level = DB.getData().levels.find(l => l.id === s.level);
            text += `ALUNO: ${s.name}\n`;
            text += `Instrumento: ${inst ? inst.name : '-'}\n`;
            text += `Nível: ${level ? level.name : '-'}\n`;
            text += `Professor: ${s.teacher || '-'}\n`;
            text += `Ingresso: ${s.entryDate ? formatDate(s.entryDate) : '-'}\n\n`;

            const instruments = [s.mainInstrument, ...(s.secondaryInstruments || [])].filter(Boolean);
            instruments.forEach(instId => {
                const instrument = DB.getInstrument(instId);
                if (!instrument) return;
                text += `\n--- ${instrument.name.toUpperCase()} ---\n`;
                const levels = DB.getLevelsByInstrument(instId);
                levels.forEach(lvl => {
                    text += `\n  Nível: ${lvl.name}\n`;
                    const contents = DB.getContentsByLevel(lvl.id);
                    contents.forEach(c => {
                        const p = DB.getContentStatus(studentId, instId, lvl.id, c.id);
                        const status = p ? ({ known: '[✓] JÁ SABE', learning: '[~] APRENDENDO', pending: '[ ] PRECISA' }[p.status] || '[ ]') : '[ ]';
                        text += `    ${status} ${c.name}\n`;
                    });
                    const songs = DB.getRepertoireByLevel(lvl.id);
                    if (songs.length > 0) {
                        text += `    Repertório:\n`;
                        songs.forEach(song => {
                            const done = DB.isSongCompleted(studentId, instId, lvl.id, song.id);
                            text += `      ${done ? '[✓]' : '[ ]'} ${song.title}\n`;
                        });
                    }
                });
            });

            text += '\n--- HISTÓRICO ---\n';
            DB.getHistory(studentId).forEach(h => {
                const statusLabel = { known: 'Dominado', learning: 'Aprendendo', pending: 'Precisa aprender' };
                text += `${formatDateTime(h.date)} - ${h.contentName}: ${statusLabel[h.newStatus]}\n`;
            });
        }

        return text;
    }

    // ============ BACKUP ============
    function renderBackup() {
        const settings = DB.getSettings();
        if (settings.gsheet) {
            document.getElementById('gsheetURL').value = settings.gsheet.url || '';
        }
        const gh = settings.github || {};
        document.getElementById('ghUser').value = gh.user || SYSTEM_DEFAULT_GH.user;
        document.getElementById('ghRepo').value = gh.repo || SYSTEM_DEFAULT_GH.repo;
        document.getElementById('ghPath').value = gh.path || SYSTEM_DEFAULT_GH.path;
        document.getElementById('ghToken').value = gh.token || '';

        const lastBackup = GitHub.getLastBackupInfo();
        const info = document.getElementById('lastBackupInfo');
        if (lastBackup) {
            info.textContent = `Último backup: ${formatDateTime(lastBackup)}`;
        } else {
            info.textContent = 'Nenhum backup realizado ainda';
        }
    }

    function exportJSON() {
        const json = DB.exportJSON();
        downloadFile(`musicaltrack_backup_${Date.now()}.json`, json, 'application/json');
        toast('Backup JSON exportado!', 'success');
    }

    function importJSON(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (!confirm('Isso substituirá todos os dados atuais. Continuar?')) return;
            if (DB.importJSON(e.target.result)) {
                toast('Dados importados com sucesso!', 'success');
                renderCurrentTab();
            } else {
                toast('Erro ao importar arquivo', 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    function exportAllTXT() {
        const text = generateReportText(null);
        let fullText = text + '\n\n========================================\n';
        fullText += '   REGISTROS DETALHADOS\n';
        fullText += '========================================\n\n';
        DB.getData().students.forEach(s => {
            fullText += generateReportText(s.id) + '\n\n';
        });
        downloadFile(`musicaltrack_completo_${Date.now()}.txt`, fullText, 'text/plain');
        toast('Arquivo TXT gerado!', 'success');
    }

    function saveGSheetConfig() {
        const url = document.getElementById('gsheetURL').value.trim();
        const settings = DB.getSettings();
        settings.gsheet = { url };
        DB.saveSettings(settings);
        toast('Configuração salva!', 'success');
    }

    async function syncGSheet() {
        const settings = DB.getSettings();
        if (!settings.gsheet || !settings.gsheet.url) {
            toast('Configure a URL do Google Apps Script primeiro', 'warning');
            return;
        }
        try {
            toast('Enviando dados...', 'info');
            await fetch(settings.gsheet.url, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: DB.exportJSON()
            });
            toast('Dados enviados ao Google Sheets!', 'success');
        } catch (e) {
            toast('Erro ao sincronizar: ' + e.message, 'error');
        }
    }

    function saveGitHubConfig() {
        const config = {
            user: document.getElementById('ghUser').value.trim(),
            repo: document.getElementById('ghRepo').value.trim(),
            path: document.getElementById('ghPath').value.trim(),
            token: document.getElementById('ghToken').value.trim()
        };
        if (!config.user || !config.repo || !config.path) {
            toast('Preencha usuário, repositório e caminho', 'warning');
            return;
        }
        GitHub.saveConfig(config);
        toast('Configuração do GitHub salva!', 'success');
        renderBackup();
    }

    async function pushToGitHub() {
        try {
            toast('Enviando backup para o GitHub...', 'info');
            await GitHub.pushBackup();
            toast('Backup enviado com sucesso!', 'success');
            renderBackup();
        } catch (e) {
            toast('Erro: ' + e.message, 'error');
        }
    }

    async function pullFromGitHub() {
        if (!confirm('Isso substituirá os dados atuais pelos dados do GitHub. Continuar?')) return;
        try {
            toast('Recuperando backup...', 'info');
            const json = await GitHub.pullBackup();
            if (DB.importJSON(json)) {
                toast('Dados recuperados com sucesso!', 'success');
                renderCurrentTab();
                renderBackup();
            } else {
                toast('Erro ao processar dados', 'error');
            }
        } catch (e) {
            toast('Erro: ' + e.message, 'error');
        }
    }

    function clearAllData() {
        if (!confirm('ATENÇÃO: Isso apagará TODOS os dados do sistema.\n\nTem certeza?')) return;
        if (!confirm('Última chance! Deseja realmente apagar tudo?')) return;
        DB.clearAll();
        toast('Todos os dados foram apagados', 'success');
        renderCurrentTab();
    }

    // ============ MODAL ============
    function openModal(title, body, footer) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = body;
        document.getElementById('modalFooter').innerHTML = footer || '';
        document.getElementById('modal').classList.add('active');
    }

    function closeModal() {
        document.getElementById('modal').classList.remove('active');
    }

    // ============ UTILITÁRIOS ============
    function toast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        const icons = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };
        t.innerHTML = `<span>${icons[type] || ''}</span> ${escapeHtml(message)}`;
        container.appendChild(t);
        setTimeout(() => {
            t.style.opacity = '0';
            setTimeout(() => t.remove(), 300);
        }, 3000);
    }

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-BR');
    }

    function formatDateTime(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleString('pt-BR');
    }

    function downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return {
        init,
        switchTab,
        toggleCollapse,
        lookupSheetSong,
        openAbcInNewTab,
        openPdfInNewTab,
        openStudentModal, saveStudent, confirmDeleteStudent, goToStudent,
        openInstrumentModal, saveInstrument, confirmDeleteInstrument, goToInstrumentCurriculum,
        openLevelModal, saveLevel, confirmDeleteLevel,
        openContentModal, saveContent, confirmDeleteContent,
        openRepertoireModal, saveRepertoireSong, confirmDeleteRepertoireSong,
        onToggleRepertoireSong,
        setStatus, setCustomStatus, deleteCustomContent,
        openCustomContentModal, saveCustomContent,
        closeModal,
        exportReportTXT
    };
})();

document.addEventListener('DOMContentLoaded', App.init);