
  const STORAGE_KEY = 'interactiveTablesData';
  let tables = [];
  let currentTableIndex = 0;

  function getCurrentTable() {
    return tables[currentTableIndex]?.table || null;
  }

  function updateTableSelector() {
    const select = document.getElementById('currentTableSelect');
    select.innerHTML = '';
    
    tables.forEach((tableData, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.text = tableData.title || `Tabela ${index + 1}`;
      if (index === currentTableIndex) option.selected = true;
      select.appendChild(option);
    });
  }

  function changeCurrentTable() {
    const select = document.getElementById('currentTableSelect');
    const newIndex = parseInt(select.value);
    if (!isNaN(newIndex) && newIndex >= 0 && newIndex < tables.length) {
      currentTableIndex = newIndex;
      tables.forEach(tableData => {
          document.getElementById(`wrapper-${tableData.id}`).style.display = 'none';
      });
      document.getElementById(`wrapper-${tables[currentTableIndex].id}`).style.display = 'block';

      updateSelectors();
      updateStickyButtonState();   
      adjustStickyHeaderPosition(); // Ajusta a posição ao trocar de tabela
    }
  }

  function createTableElement(tableId, tableTitle) {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';
    wrapper.id = `wrapper-${tableId}`;
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'table-title';
    
    const title = document.createElement('h3');
    title.textContent = tableTitle;
    title.id = `title-${tableId}`; // Adiciona um ID ao h3 para fácil acesso
    
    const actions = document.createElement('div');
    actions.className = 'table-actions';
    
    // Botão de remover tabela
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remover';
    removeBtn.onclick = () => removeTable(tableId);
    
    actions.appendChild(removeBtn);
    titleDiv.appendChild(title);
    titleDiv.appendChild(actions);
    wrapper.appendChild(titleDiv);
    
    const table = document.createElement('table');
    table.id = tableId;
    table.setAttribute('aria-label', 'Tabela interativa');
    
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    
    table.appendChild(thead);
    table.appendChild(tbody);
    wrapper.appendChild(table);
    
    return { wrapper, table };
  }

  function addNewTable() {
    const tableId = `dataTable-${Date.now()}`;
    const tableTitle = `Tabela ${tables.length + 1}`;
    
    const { wrapper, table } = createTableElement(tableId, tableTitle);
    
    tables.forEach(tableData => {
        document.getElementById(`wrapper-${tableData.id}`).style.display = 'none';
    });
    
    document.getElementById('tables-container').appendChild(wrapper);
    
    tables.push({
      id: tableId,
      table: table,
      title: tableTitle
    });
    
    currentTableIndex = tables.length - 1;
    
    initializeDefaultTable(table);
    
    updateTableSelector();
    updateSelectors();
    updateStickyButtonState();   
    adjustStickyHeaderPosition(); // Ajusta a posição ao adicionar nova tabela
    
    saveToLocalStorage();
    
    return table;
  }

  /**
   * Remove uma tabela pelo seu ID.
   * @param {string} tableId - O ID da tabela a ser removida.
   */
  function removeTable(tableId) {
    const index = tables.findIndex(t => t.id === tableId);
    if (index === -1) return; // Tabela não encontrada

    const wrapper = document.getElementById(`wrapper-${tableId}`);
    if (wrapper) wrapper.remove(); // Remove o elemento HTML da tabela

    tables.splice(index, 1); // Remove a tabela do array de tabelas

    // Ajusta o índice da tabela atual se a tabela removida era a ativa
    if (currentTableIndex >= index && currentTableIndex > 0) {
      currentTableIndex--;
    } else if (currentTableIndex === 0 && tables.length > 0) {
      // Se a primeira tabela foi removida e ainda há tabelas, a nova primeira é a ativa
      currentTableIndex = 0;
    }

    // Se não houver mais tabelas, cria uma nova tabela padrão
    if (tables.length === 0) {
      addNewTable();
    } else {
      // Mostra a tabela atualizada
      document.getElementById(`wrapper-${tables[currentTableIndex].id}`).style.display = 'block';
    }
    
    updateTableSelector();
    updateSelectors();
    updateStickyButtonState();   
    adjustStickyHeaderPosition(); // Ajusta a posição ao remover tabela
    
    saveToLocalStorage(); // Salva as alterações no Local Storage
  }

  function serializeTables() {
    const data = tables.map(tableData => {
      const table = tableData.table;
      const headers = Array.from(table.tHead.rows[0]?.cells || []).map(h => h.innerText);
      const rows = Array.from(table.tBodies[0]?.rows || []).map(row =>
        Array.from(row.cells).map(cell => cell.innerText)
      );
      return {
        id: tableData.id,
        title: tableData.title,
        headers,
        rows
      };
    });
    return JSON.stringify(data);
  }

  function deserializeTables(json) {
    try {
      const data = JSON.parse(json);
      if (!Array.isArray(data)) return false;
      
      document.getElementById('tables-container').innerHTML = '';
      tables = [];
      
      data.forEach((tableData, index) => {
        const tableId = tableData.id || `dataTable-${Date.now()}`;
        const tableTitle = tableData.title || `Tabela ${index + 1}`;
        
        const { wrapper, table } = createTableElement(tableId, tableTitle);
        document.getElementById('tables-container').appendChild(wrapper);
        
        tables.push({
          id: tableId,
          table: table,
          title: tableTitle
        });
        
        if (tableData.headers && tableData.rows) {
          const headerRow = table.tHead.insertRow();
          tableData.headers.forEach((header, i) => {
            const th = document.createElement('th');
            th.innerText = header;
            th.onclick = () => sortTable(i);
            headerRow.appendChild(th);
          });
          
          tableData.rows.forEach(rowData => {
            const row = table.tBodies[0].insertRow();
            rowData.forEach(cellText => {
              const cell = row.insertCell();
              cell.contentEditable = "true";
              cell.innerText = cellText;
              cell.addEventListener('input', saveToLocalStorage);
            });
          });
        }
      });
      
      if (tables.length > 0) {
        currentTableIndex = 0;
        tables.forEach((tableData, index) => {
            document.getElementById(`wrapper-${tableData.id}`).style.display = (index === currentTableIndex) ? 'block' : 'none';
        });
      } else {
        addNewTable();   
      }
      
      return true;
    } catch {
      return false;
    }
  }

  function saveToLocalStorage() {
    const data = serializeTables();
    localStorage.setItem(STORAGE_KEY, data);
  }

  function loadFromLocalStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return deserializeTables(data);
    }
    return false;
  }

  function initializeDefaultTable(table = null) {
    table = table || getCurrentTable();
    if (!table) return;
    
    if (table.tHead) {
      table.tHead.innerHTML = '';
    }
    if (table.tBodies.length > 0) {
      table.tBodies[0].innerHTML = '';
    } else {
      table.appendChild(document.createElement('tbody'));
    }
    
    const headerRow = table.tHead.insertRow();
    const headers = ["Nome", "Idade", "Cidade"];
    headers.forEach((h, i) => {
        const th = document.createElement('th');
        th.innerText = h;
        th.onclick = () => sortTable(i);
        headerRow.appendChild(th);
    });

    const defaultData = [
        ["Maria", "30", "São Paulo"],
        ["João", "25", "Rio de Janeiro"],
        ["Ana", "28", "Belo Horizonte"]
    ];

    defaultData.forEach(rowData => {
        const row = table.tBodies[0].insertRow();
        rowData.forEach(cellText => {
            const cell = row.insertCell();
            cell.contentEditable = "true";
            cell.innerText = cellText;
            cell.addEventListener('input', saveToLocalStorage);
        });
    });
    
    updateSelectors();
    saveToLocalStorage();
  }

  function updateSelectors() {
    const table = getCurrentTable();
    if (!table) return;
    
    const rowSelect = document.getElementById('deleteRowSelect');
    const colSelect = document.getElementById('deleteColumnSelect');
    const renameSelect = document.getElementById('renameHeaderSelect');

    rowSelect.innerHTML = '';
    colSelect.innerHTML = '';
    renameSelect.innerHTML = '';

    const rows = table.tBodies[0]?.rows.length || 0;
    for(let i=0; i < rows; i++) {
      let option = document.createElement('option');
      option.value = i;
      option.text = `Linha ${i+1}`;
      rowSelect.appendChild(option);
    }

    const cols = table.tHead.rows[0]?.cells.length || 0;
    for(let i=0; i < cols; i++) {
      let headerText = table.tHead.rows[0]?.cells[i]?.innerText || `Coluna ${i+1}`;

      let option1 = document.createElement('option');
      option1.value = i;
      option1.text = headerText;
      colSelect.appendChild(option1);

      let option2 = document.createElement('option');
      option2.value = i;
      option2.text = headerText;
      renameSelect.appendChild(option2);
    }
  }

  function addRow() {
    const table = getCurrentTable();
    if (!table) return;
    
    if (table.tBodies.length === 0) {
      table.appendChild(document.createElement('tbody'));
    }
    
    if (table.tHead.rows.length === 0 || table.tHead.rows[0].cells.length === 0) {
      addColumn();
    }
    
    const cols = table.tHead.rows[0].cells.length;
    const row = table.tBodies[0].insertRow();
    for(let i=0; i < cols; i++) {
      const cell = row.insertCell();
      cell.contentEditable = "true";
      cell.innerText = "";
      cell.addEventListener('input', saveToLocalStorage);
    }
    updateSelectors();
    saveToLocalStorage();
  }

  function addColumn() {
    const table = getCurrentTable();
    if (!table) return;
    
    let headerRow;
    if (table.tHead.rows.length === 0) {
      headerRow = table.tHead.insertRow();
    } else {
      headerRow = table.tHead.rows[0];
    }

    const newIndex = headerRow.cells.length;
    const th = document.createElement('th');
    th.innerText = `Coluna ${newIndex+1}`;
    th.onclick = () => sortTable(newIndex);
    headerRow.appendChild(th);

    if (table.tBodies.length === 0) {
      table.appendChild(document.createElement('tbody'));
    }
    
    for(let row of table.tBodies[0].rows) {
      const cell = row.insertCell();
      cell.contentEditable = "true";
      cell.innerText = "";
      cell.addEventListener('input', saveToLocalStorage);
    }
    updateSelectors();
    saveToLocalStorage();
  }

  function deleteRow() {
    const table = getCurrentTable();
    if (!table || table.tBodies.length === 0) return;
    
    const rowSelect = document.getElementById('deleteRowSelect');
    const index = parseInt(rowSelect.value);
    if (!isNaN(index) && table.tBodies[0].rows[index]) {
      table.tBodies[0].deleteRow(index);
      updateSelectors();
      saveToLocalStorage();
    }
  }

  function deleteColumn() {
    const table = getCurrentTable();
    if (!table || table.tHead.rows.length === 0) return;
    
    const colSelect = document.getElementById('deleteColumnSelect');
    const index = parseInt(colSelect.value);
    if (!isNaN(index) && table.tHead.rows[0].cells[index]) {
      table.tHead.rows[0].deleteCell(index);

      if (table.tBodies.length > 0) {
        for(let row of table.tBodies[0].rows) {
          if (row.cells[index]) {
            row.deleteCell(index);
          }
        }
      }
      updateSelectors();
      saveToLocalStorage();
    }
  }

  function renameHeader() {
    const table = getCurrentTable();
    if (!table || table.tHead.rows.length === 0) return;
    
    const renameSelect = document.getElementById('renameHeaderSelect');
    const index = parseInt(renameSelect.value);
    const newName = document.getElementById('newHeaderName').value.trim();
    if (!isNaN(index) && newName.length > 0 && table.tHead.rows[0].cells[index]) {
      table.tHead.rows[0].cells[index].innerText = newName;
      updateSelectors();
      saveToLocalStorage();
      document.getElementById('newHeaderName').value = '';
    }
  }

  /**
   * Renomeia a tabela atualmente selecionada.
   */
  function renameTable() {
    const currentTableData = tables[currentTableIndex];
    if (!currentTableData) {
      alert("Nenhuma tabela selecionada para renomear.");
      return;
    }

    const newTableNameInput = document.getElementById('newTableName');
    const newName = newTableNameInput.value.trim();

    if (newName.length === 0) {
      alert("Por favor, insira um novo nome para a tabela.");
      return;
    }

    currentTableData.title = newName; // Atualiza o título no array de tabelas
    document.getElementById(`title-${currentTableData.id}`).textContent = newName; // Atualiza o título no HTML
    updateTableSelector(); // Atualiza o seletor de tabelas para mostrar o novo nome
    saveToLocalStorage(); // Salva a alteração no localStorage
    newTableNameInput.value = ''; // Limpa o campo de input
    alert(`Tabela renomeada para "${newName}".`);
  }

  function clearTable() {
    const table = getCurrentTable();
    if (!table) return;
    
    if (table.tBodies.length > 0) {
      table.tBodies[0].innerHTML = '';
    }
    
    if (table.tHead.rows.length > 0) {
      table.tHead.rows[0].innerHTML = '';
    }
    
    updateSelectors();
    saveToLocalStorage();
  }

  function tableToCSV(table) {
    if (!table || table.tHead.rows.length === 0 || table.tHead.rows[0].cells.length === 0) {
      return null; // Return null if the table is empty
    }
    const headers = Array.from(table.tHead.rows[0].cells).map(h => `"${h.innerText.replace(/"/g, '""')}"`);
    const rows = [];
    
    if (table.tBodies.length > 0) {
      Array.from(table.tBodies[0].rows).forEach(row => {
        rows.push(Array.from(row.cells).map(cell => `"${cell.innerText.replace(/"/g, '""')}"`).join(','));
      });
    }
    return [headers.join(','), ...rows].join('\r\n');
  }

  function exportCurrentTableCSV() {
    const table = getCurrentTable();
    if (!table) {
        alert("Nenhuma tabela selecionada para exportar.");
        return;
    }
    const csvContent = tableToCSV(table);
    if (csvContent === null) {
      alert("A tabela atual está vazia. Não há dados para exportar.");
      return;
    }

    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${tables[currentTableIndex].title || 'tabela_atual'}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

  function exportAllTablesCSV() {
      if (tables.length === 0) {
          alert("Não há tabelas para exportar.");
          return;
      }

      let allCsvContent = [];

      tables.forEach(tableData => {
          const table = tableData.table;
          const csv = tableToCSV(table);
          if (csv) {
              allCsvContent.push(`### ${tableData.title || `Tabela ${tableData.id}`} ###\r\n`);
              allCsvContent.push(csv);
              allCsvContent.push('\r\n\r\n'); // Add some spacing between tables
          }
      });

      if (allCsvContent.length === 0) {
          alert("Todas as tabelas estão vazias. Não há dados para exportar.");
          return;
      }

      const combinedCsv = allCsvContent.join('');
      const blob = new Blob([combinedCsv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'todas_as_tabelas.csv');
  }

  async function exportAllTablesAsZip() {
      if (tables.length === 0) {
          alert("Não há tabelas para exportar.");
          return;
      }

      const zip = new JSZip();

      tables.forEach(tableData => {
          const table = tableData.table;
          const csv = tableToCSV(table);
          if (csv) {
              const filename = `${tableData.title.replace(/[^a-zA-Z0-9]/g, '_') || tableData.id}.csv`;
              zip.file(filename, csv);
          }
      });

      if (Object.keys(zip.files).length === 0) {
          alert("Todas as tabelas estão vazias. Não há dados para exportar.");
          return;
      }

      try {
          const content = await zip.generateAsync({ type: "blob" });
          saveAs(content, "tabelas_individuais.zip");
      } catch (error) {
          alert("Erro ao gerar o arquivo ZIP: " + error.message);
          console.error("Erro ao gerar ZIP:", error);
      }
  }


  function importCSV(event) {
    const table = getCurrentTable();
    if (!table) return;
    
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target.result;
      parseCSVToTable(text, table);
      event.target.value = '';
    };
    reader.readAsText(file);
  }

  function parseCSVLine(line) {
    const regex = /("([^"]|"")*"|[^,]*)(,|$)/g;
    const result = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      let val = match[1];
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      result.push(val);
      if (match.index + match[0].length >= line.length) break;
    }
    return result;
  }

  function parseCSVToTable(csvText, table = null) {
    table = table || getCurrentTable();
    if (!table) return;
    
    const lines = csvText.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length < 1) {
        alert("O arquivo CSV está vazio ou inválido.");
        return;
    }

    if (table.tHead) {
      table.tHead.innerHTML = '';
    }
    if (table.tBodies.length > 0) {
      table.tBodies[0].innerHTML = '';
    } else {
      table.appendChild(document.createElement('tbody'));
    }

    const headers = parseCSVLine(lines[0]);
    const headerRow = table.tHead.insertRow();
    headers.forEach((h, i) => {
      const th = document.createElement('th');
      th.innerText = h;
      th.onclick = () => sortTable(i);
      headerRow.appendChild(th);
    });

    for(let i=1; i < lines.length; i++) {
      const rowValues = parseCSVLine(lines[i]);
      const row = table.tBodies[0].insertRow();
      rowValues.forEach(val => {
        const cell = row.insertCell();
        cell.contentEditable = "true";
        cell.innerText = val;
        cell.addEventListener('input', saveToLocalStorage);
      });
    }
    updateSelectors();
    saveToLocalStorage();
  }

  function searchTable() {
    const table = getCurrentTable();
    if (!table || table.tBodies.length === 0) return;
    
    const query = document.getElementById('searchInput').value.toLowerCase();
    for(let row of table.tBodies[0].rows) {
      const rowText = row.innerText.toLowerCase();
      row.style.display = rowText.includes(query) ? '' : 'none';
    }
  }

  function sortTable(colIndex) {
    const table = getCurrentTable();
    if (!table || table.tBodies.length === 0) return;
    
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);

    const isNumeric = rows.length > 0 && rows.every(row => 
      row.cells[colIndex] && !isNaN(parseFloat(row.cells[colIndex].innerText.trim()))
    );

    rows.sort((a, b) => {
      const valA = a.cells[colIndex]?.innerText.trim() || '';
      const valB = b.cells[colIndex]?.innerText.trim() || '';

      if (isNumeric) {
        return parseFloat(valA) - parseFloat(valB);
      }
      return valA.localeCompare(valB);
    });

    if (table._lastSortedCol === colIndex) {
      rows.reverse();
      table._lastSortedCol = null;
    } else {
      table._lastSortedCol = colIndex;
    }

    for(let row of rows) {
      tbody.appendChild(row);
    }
    saveToLocalStorage();
  }
  
  function attachCellInputListeners() {
    tables.forEach(tableData => {
      const table = tableData.table;
      if (table.tBodies.length > 0) {
        for(let row of table.tBodies[0].rows) {
          for(let cell of row.cells) {
            cell.contentEditable = "true";
            cell.removeEventListener('input', saveToLocalStorage);
            cell.addEventListener('input', saveToLocalStorage);
          }
        }
      }
    });
  }
  
  // --- FUNÇÃO toggleSticky() E adjustStickyHeaderPosition() AJUSTADAS ---
  function adjustStickyHeaderPosition() {
    const currentTable = getCurrentTable();
    if (!currentTable || !currentTable.classList.contains('sticky-header')) {
        // Apenas ajusta se a tabela atual existir e o sticky header estiver ativado
        return;
    }

    const controlsRect = document.getElementById('controls').getBoundingClientRect();
    const toggleBtnRect = document.getElementById('toggleStickyBtn').getBoundingClientRect();
    const tableSelectorRect = document.getElementById('tableSelector').getBoundingClientRect();

    let maxBottom = Math.max(controlsRect.bottom, toggleBtnRect.bottom, tableSelectorRect.bottom);
    
    const offset = 10; 
    currentTable.tHead.style.top = `${maxBottom + offset}px`;
  }

  function toggleSticky() {
    const currentTable = getCurrentTable();   
    if (!currentTable) return;   

    currentTable.classList.toggle('sticky-header');   
    
    if (currentTable.classList.contains('sticky-header')) {
      adjustStickyHeaderPosition(); // Ajusta a posição quando ativado
      document.getElementById('toggleStickyBtn').innerText = 'Desativar Sticky Header';
    } else {
      currentTable.tHead.style.top = ''; // Remove o estilo inline quando desativado
      document.getElementById('toggleStickyBtn').innerText = 'Ativar Sticky Header';
    }
  }

  function updateStickyButtonState() {
      const currentTable = getCurrentTable();
      const btn = document.getElementById('toggleStickyBtn');
      if (currentTable && currentTable.classList.contains('sticky-header')) {
          btn.innerText = 'Desativar Sticky Header';
      } else {
          btn.innerText = 'Ativar Sticky Header';
      }
  }

  // Inicialização principal
  document.addEventListener('DOMContentLoaded', () => {
    const loaded = loadFromLocalStorage();
    
    if (!loaded) {
      addNewTable();
    }
    
    attachCellInputListeners();
    updateTableSelector();
    updateSelectors();
    updateStickyButtonState();   

    window.addEventListener('resize', adjustStickyHeaderPosition);

    document.getElementById('searchInput').addEventListener('input', searchTable);
  });

