class FileEditor {
    constructor() {
        this.codeEditor = document.getElementById('code-editor');
        this.previewFrame = document.getElementById('preview-frame');
        this.filenameInput = document.getElementById('filename');
        this.fileTypeSelect = document.getElementById('file-type');
        this.newFileBtn = document.getElementById('new-file-btn');
        this.saveFileBtn = document.getElementById('save-file-btn');
        this.openFileBtn = document.getElementById('open-file-btn');
        this.downloadFileBtn = document.getElementById('download-file-btn');
        this.fileInput = document.getElementById('file-input');
        this.savedFilesList = document.getElementById('saved-files-list');

        // New elements for file combining
        this.combineFilesBtn = document.getElementById('combine-files-btn');
        this.combineModal = document.getElementById('combine-modal');
        this.closeModal = document.querySelector('.close-modal');
        this.combinedFileList = document.getElementById('combine-file-list');
        this.executeCombineBtn = document.getElementById('execute-combine-btn');

        // New elements for renaming
        this.renameModal = document.getElementById('rename-modal');
        this.closeRenameModal = document.querySelector('.close-rename-modal');
        this.renameInput = document.getElementById('rename-input');
        this.confirmRenameBtn = document.getElementById('confirm-rename-btn');

        this.currentSelectedFile = null;

        this.setupEventListeners();
        this.loadSavedFiles();
        this.initializeResizers();
    }

    setupEventListeners() {
        this.codeEditor.addEventListener('input', () => this.updatePreview());
        
        this.newFileBtn.addEventListener('click', () => this.createNewFile());
        
        this.saveFileBtn.addEventListener('click', () => this.saveFile());
        
        this.openFileBtn.addEventListener('click', () => this.fileInput.click());
        
        this.fileInput.addEventListener('change', (e) => this.openFile(e));

        this.fileTypeSelect.addEventListener('change', () => this.updateFilenameSuffix());

        // Add download button event listener
        this.downloadFileBtn.addEventListener('click', () => this.downloadFile());

        // Add new event listeners
        this.combineFilesBtn.addEventListener('click', () => this.showCombineModal());
        this.closeModal.addEventListener('click', () => this.closeCombineModal());
        this.executeCombineBtn.addEventListener('click', () => this.executeCombineFiles());

        // Rename modal events
        this.closeRenameModal.addEventListener('click', () => this.closeRename());
        this.confirmRenameBtn.addEventListener('click', () => this.confirmRename());
    }

    updateFilenameSuffix() {
        const currentFilename = this.filenameInput.value;
        const currentType = this.fileTypeSelect.value;
        
        // Remove existing extension if present
        const filenameWithoutExt = currentFilename.replace(/\.(html|css|js|py|txt)$/, '');
        
        // Add new extension
        this.filenameInput.value = `${filenameWithoutExt}.${currentType}`;
    }

    updatePreview() {
        const code = this.codeEditor.value;
        const fileType = this.fileTypeSelect.value;

        switch (fileType) {
            case 'html':
                this.previewFrame.srcdoc = code;
                break;
            case 'css':
                this.previewFrame.srcdoc = `
                    <html>
                    <head>
                        <style>${code}</style>
                    </head>
                    <body>
                        <pre>${code}</pre>
                    </body>
                    </html>
                `;
                break;
            case 'js':
            case 'py':
            case 'txt':
                this.previewFrame.srcdoc = `
                    <html>
                    <head>
                        ${fileType === 'js' ? `<script>${code}</script>` : ''}
                    </head>
                    <body>
                        <pre>${code}</pre>
                    </body>
                    </html>
                `;
                break;
        }
    }

    createNewFile() {
        this.codeEditor.value = '';
        this.filenameInput.value = '';
        this.previewFrame.srcdoc = '';
    }

    saveFile() {
        const fileType = this.fileTypeSelect.value;
        const filename = this.filenameInput.value.trim() || `untitled.${fileType}`;
        const content = this.codeEditor.value;

        if (!content) {
            alert('O arquivo está vazio');
            return;
        }

        // Salvar no localStorage
        const savedFiles = JSON.parse(localStorage.getItem('webFiles') || '{}');
        savedFiles[filename] = {
            content: content,
            timestamp: Date.now()  // Add timestamp
        };
        localStorage.setItem('webFiles', JSON.stringify(savedFiles));

        this.loadSavedFiles();
        alert(`Arquivo ${filename} salvo com sucesso!`);
    }

    openFile(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Determine file type based on extension
        const fileExtension = file.name.split('.').pop().toLowerCase();
        this.fileTypeSelect.value = fileExtension;

        const reader = new FileReader();
        reader.onload = (event) => {
            this.codeEditor.value = event.target.result;
            this.filenameInput.value = file.name;
            this.updatePreview();
        };
        reader.readAsText(file);
    }

    loadSavedFiles() {
        const savedFiles = JSON.parse(localStorage.getItem('webFiles') || '{}');
        
        // Sort files by timestamp in descending order (newest first)
        const sortedFiles = Object.entries(savedFiles)
            .sort((a, b) => b[1].timestamp - a[1].timestamp);

        this.savedFilesList.innerHTML = '';

        sortedFiles.forEach(([filename, fileData]) => {
            const li = document.createElement('li');
            
            const filenameSpan = document.createElement('span');
            filenameSpan.textContent = filename;

            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('file-actions');

            const openBtn = document.createElement('button');
            openBtn.textContent = 'Abrir';
            openBtn.addEventListener('click', () => {
                // Determine file type from extension
                const fileType = filename.split('.').pop().toLowerCase();
                this.fileTypeSelect.value = fileType;
                
                this.codeEditor.value = fileData.content;
                this.filenameInput.value = filename;
                this.updatePreview();
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Excluir';
            deleteBtn.addEventListener('click', () => {
                delete savedFiles[filename];
                localStorage.setItem('webFiles', JSON.stringify(savedFiles));
                this.loadSavedFiles();
            });

            const renameBtn = document.createElement('button');
            renameBtn.textContent = 'Renomear';
            renameBtn.addEventListener('click', () => {
                this.currentSelectedFile = filename;
                this.renameInput.value = filename;
                this.renameModal.style.display = 'block';
            });

            // NEW: Individual download button for each file
            const downloadBtn = document.createElement('button');
            downloadBtn.textContent = 'Baixar';
            downloadBtn.addEventListener('click', () => {
                // Create a Blob with the file content
                const blob = new Blob([fileData.content], { type: 'text/plain' });
                
                // Create a temporary link to trigger the download
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                
                // Programmatically click the link to start download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });

            actionsDiv.appendChild(openBtn);
            actionsDiv.appendChild(deleteBtn);
            actionsDiv.appendChild(renameBtn);
            actionsDiv.appendChild(downloadBtn);  // Add download button

            li.appendChild(filenameSpan);
            li.appendChild(actionsDiv);

            this.savedFilesList.appendChild(li);
        });
    }

    downloadFile() {
        const content = this.codeEditor.value;
        const fileType = this.fileTypeSelect.value;
        let filename = this.filenameInput.value.trim() || `untitled.${fileType}`;

        // Ensure filename has correct extension
        if (!filename.endsWith(`.${fileType}`)) {
            filename = `${filename}.${fileType}`;
        }

        if (!content) {
            alert('O arquivo está vazio');
            return;
        }

        // Create a Blob with the file content
        const blob = new Blob([content], { type: 'text/plain' });
        
        // Create a temporary link to trigger the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        
        // Programmatically click the link to start download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    showCombineModal() {
        const savedFiles = JSON.parse(localStorage.getItem('webFiles') || '{}');
        this.combinedFileList.innerHTML = '';

        // Group files by type
        const filesByType = {
            html: [],
            css: [],
            js: [],
            py: [],  
            txt: []  
        };

        Object.keys(savedFiles).forEach(filename => {
            const fileType = filename.split('.').pop().toLowerCase();
            if (filesByType[fileType]) {
                filesByType[fileType].push(filename);
            }
        });

        // Create checkboxes for files
        Object.entries(filesByType).forEach(([type, files]) => {
            if (files.length > 0) {
                const typeHeader = document.createElement('h3');
                typeHeader.textContent = type.toUpperCase();
                this.combinedFileList.appendChild(typeHeader);

                files.forEach(filename => {
                    const label = document.createElement('label');
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.name = 'combine-file';
                    checkbox.value = filename;

                    label.appendChild(checkbox);
                    label.appendChild(document.createTextNode(filename));
                    this.combinedFileList.appendChild(label);
                });
            }
        });

        this.combineModal.style.display = 'block';
    }

    closeCombineModal() {
        this.combineModal.style.display = 'none';
    }

    executeCombineFiles() {
        const savedFiles = JSON.parse(localStorage.getItem('webFiles') || '{}');
        const selectedFiles = Array.from(
            this.combinedFileList.querySelectorAll('input[name="combine-file"]:checked')
        ).map(checkbox => checkbox.value);

        if (selectedFiles.length === 0) {
            alert('Selecione pelo menos um arquivo para combinar.');
            return;
        }

        let combinedHtml = '';
        let combinedCss = '';
        let combinedJs = '';
        let combinedPy = '';
        let combinedTxt = '';

        selectedFiles.forEach(filename => {
            const fileType = filename.split('.').pop().toLowerCase();
            const content = savedFiles[filename].content;

            switch (fileType) {
                case 'html':
                    // Existing HTML combination logic
                    if (combinedHtml) {
                        const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                        if (bodyMatch) {
                            combinedHtml = combinedHtml.replace(
                                /<\/body>/i, 
                                `${bodyMatch[1]}\n</body>`
                            );
                        }
                    } else {
                        combinedHtml = content;
                    }
                    break;
                case 'css':
                    combinedCss += `\n/* ${filename} */\n${content}`;
                    break;
                case 'js':
                    combinedJs += `\n// ${filename}\n${content}`;
                    break;
                case 'py':
                    combinedPy += `\n# ${filename}\n${content}`;
                    break;
                case 'txt':
                    combinedTxt += `\n--- ${filename} ---\n${content}\n`;
                    break;
            }
        });

        // If HTML exists, incorporate other file types
        if (combinedHtml) {
            if (combinedCss) {
                combinedHtml = combinedHtml.replace(
                    /<\/head>/i, 
                    `<style>${combinedCss}</style>\n</head>`
                );
            }

            if (combinedJs) {
                combinedHtml = combinedHtml.replace(
                    /<\/body>/i, 
                    `<script>${combinedJs}</script>\n</body>`
                );
            }

            // Add Python and text content to the HTML body as pre-formatted text
            if (combinedPy || combinedTxt) {
                combinedHtml = combinedHtml.replace(
                    /<\/body>/i, 
                    `<pre>${combinedPy || ''}${combinedTxt || ''}</pre>\n</body>`
                );
            }
        } else {
            // If no HTML, create a basic structure
            combinedHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>${combinedCss}</style>
                </head>
                <body>
                    <script>${combinedJs}</script>
                    <pre>${combinedPy || ''}${combinedTxt || ''}</pre>
                </body>
                </html>
            `;
        }

        // Save the combined file
        const savedCombinedFiles = JSON.parse(localStorage.getItem('webFiles') || '{}');
        savedCombinedFiles['combined.html'] = {
            content: combinedHtml,
            timestamp: Date.now()
        };
        localStorage.setItem('webFiles', JSON.stringify(savedCombinedFiles));

        // Update the saved files list and close the modal
        this.loadSavedFiles();
        this.closeCombineModal();

        // Optional: Notify user and show the combined file
        alert('Arquivos combinados com sucesso em combined.html');
        this.codeEditor.value = combinedHtml;
        this.filenameInput.value = 'combined.html';
        this.fileTypeSelect.value = 'html';
        this.updatePreview();
    }

    closeRename() {
        this.renameModal.style.display = 'none';
        this.currentSelectedFile = null;
    }

    confirmRename() {
        if (!this.currentSelectedFile) return;

        const savedFiles = JSON.parse(localStorage.getItem('webFiles') || '{}');
        const newFilename = this.renameInput.value.trim();

        if (!newFilename) {
            alert('Por favor, insira um novo nome de arquivo');
            return;
        }

        // Check if new filename already exists
        if (savedFiles[newFilename]) {
            alert('Já existe um arquivo com este nome');
            return;
        }

        // Rename the file
        savedFiles[newFilename] = savedFiles[this.currentSelectedFile];
        delete savedFiles[this.currentSelectedFile];

        localStorage.setItem('webFiles', JSON.stringify(savedFiles));
        this.loadSavedFiles();
        this.closeRename();
    }

    initializeResizers() {
        const container = document.querySelector('.editor-container');
        const editorWrapper = document.querySelector('.editor-wrapper');
        const previewWrapper = document.querySelector('.preview-wrapper');
        const resizer = document.getElementById('vertical-resizer');

        let isResizing = false;

        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isResizing = true;
            
            // Prevent text selection during resize
            document.body.style.userSelect = 'none';
            
            document.addEventListener('mousemove', handleResize);
            document.addEventListener('mouseup', stopResize);
        });

        const handleResize = (e) => {
            if (!isResizing) return;

            const containerRect = container.getBoundingClientRect();
            const containerWidth = containerRect.width;
            
            // Calculate the percentage of where the mouse is
            const xPercentage = ((e.clientX - containerRect.left) / containerWidth) * 100;
            
            // Constrain the resize between 10% and 90%
            const constrainedX = Math.max(10, Math.min(xPercentage, 90));
            
            editorWrapper.style.flexBasis = `${constrainedX}%`;
            previewWrapper.style.flexBasis = `${100 - constrainedX}%`;
        };

        const stopResize = () => {
            isResizing = false;
            
            // Restore text selection
            document.body.style.userSelect = '';
            
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', stopResize);
        };
    }

}

// Inicializar o editor quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new FileEditor();
});