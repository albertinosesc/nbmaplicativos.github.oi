/**
 * GitHub Integration Module
 * Usa a API REST do GitHub para backup de dados
 */
const GitHub = (() => {
    const API_BASE = 'https://api.github.com';

    function getConfig() {
        const settings = DB.getSettings();
        return settings.github || {};
    }

    function saveConfig(config) {
        const settings = DB.getSettings();
        settings.github = config;
        DB.saveSettings(settings);
    }

    function validateConfig(config) {
        if (!config.user || !config.repo || !config.token || !config.path) {
            throw new Error('Configuração incompleta. Preencha todos os campos.');
        }
        return true;
    }

    function getHeaders(token) {
        return {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
    }

    async function getCurrentFileSha(config) {
        try {
            const url = `${API_BASE}/repos/${config.user}/${config.repo}/contents/${config.path}`;
            const response = await fetch(url, {
                headers: getHeaders(config.token)
            });
            if (response.status === 404) return null;
            if (!response.ok) throw new Error('Erro ao consultar arquivo');
            const data = await response.json();
            return data.sha;
        } catch (e) {
            return null;
        }
    }

    async function pushBackup() {
        const config = getConfig();
        validateConfig(config);

        const content = DB.exportJSON();
        const encoded = btoa(unescape(encodeURIComponent(content)));
        const sha = await getCurrentFileSha(config);

        const url = `${API_BASE}/repos/${config.user}/${config.repo}/contents/${config.path}`;
        const body = {
            message: `Backup automático - ${new Date().toLocaleString('pt-BR')}`,
            content: encoded,
            branch: 'main'
        };
        if (sha) body.sha = sha;

        const response = await fetch(url, {
            method: 'PUT',
            headers: getHeaders(config.token),
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Erro ao enviar backup');
        }

        const result = await response.json();
        const settings = DB.getSettings();
        settings.githubLastBackup = new Date().toISOString();
        DB.saveSettings(settings);

        return result;
    }

    async function pullBackup() {
        const config = getConfig();
        validateConfig(config);

        const url = `${API_BASE}/repos/${config.user}/${config.repo}/contents/${config.path}`;
        const response = await fetch(url, {
            headers: getHeaders(config.token)
        });

        if (!response.ok) {
            if (response.status === 404) throw new Error('Arquivo não encontrado no repositório');
            throw new Error('Erro ao recuperar backup');
        }

        const data = await response.json();
        const decoded = decodeURIComponent(escape(atob(data.content)));
        return decoded;
    }

    function getLastBackupInfo() {
        const settings = DB.getSettings();
        return settings.githubLastBackup || null;
    }

    return {
        getConfig, saveConfig, pushBackup, pullBackup, getLastBackupInfo
    };
})();