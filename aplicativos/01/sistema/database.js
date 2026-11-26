/**
 * Database Module - Gerenciamento de dados com LocalStorage
 */
const DB = (() => {
    const STORAGE_KEY = 'musicaltrack_db_v1';
    const SETTINGS_KEY = 'musicaltrack_settings_v1';

    // Estrutura padrão do banco
    const defaultData = {
        students: [],           // {id, name, birthDate, entryDate, mainInstrument, secondaryInstruments, level, teacher, notes}
        instruments: [],        // {id, name, icon, description}
        levels: [],             // {id, instrumentId, name, order, description}
        contents: [],           // {id, levelId, name, description, objective, difficulty, order, prerequisites, suggestions, notes}
        repertoire: [],         // {id, levelId, sheetId, title, composer, abc, order, notes}
        progress: {},           // {studentId: {instrumentId: {levelId: {contentId: {status, date, observation}}}}}
        repertoireProgress: {}, // {studentId: {instrumentId: {levelId: {songId: {completed, date}}}}}
        customContents: {},     // {studentId: {instrumentId: [{id, name, status, levelName, date}]}}
        history: [],            // {id, date, studentId, instrumentId, levelId, contentId, contentName, oldStatus, newStatus, observation}
        version: 3
    };

    let data = null;

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                data = JSON.parse(raw);
                Object.keys(defaultData).forEach(key => {
                    if (data[key] === undefined) {
                        data[key] = JSON.parse(JSON.stringify(defaultData[key]));
                    }
                });
            } else {
                data = JSON.parse(JSON.stringify(defaultData));
                save();
            }
        } catch (e) {
            console.error('Erro ao carregar DB:', e);
            data = JSON.parse(JSON.stringify(defaultData));
        }
        return data;
    }

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            localStorage.setItem('musicaltrack_lastSave', new Date().toISOString());
            return true;
        } catch (e) {
            console.error('Erro ao salvar DB:', e);
            return false;
        }
    }

    function getData() {
        if (!data) load();
        return data;
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    // ====== ALUNOS ======
    function addStudent(student) {
        student.id = generateId();
        student.createdAt = new Date().toISOString();
        data.students.push(student);
        save();
        return student;
    }

    function updateStudent(id, updates) {
        const idx = data.students.findIndex(s => s.id === id);
        if (idx >= 0) {
            data.students[idx] = { ...data.students[idx], ...updates };
            save();
            return data.students[idx];
        }
        return null;
    }

    function deleteStudent(id) {
        data.students = data.students.filter(s => s.id !== id);
        delete data.progress[id];
        delete data.repertoireProgress[id];
        delete data.customContents[id];
        data.history = data.history.filter(h => h.studentId !== id);
        save();
    }

    function getStudent(id) {
        return data.students.find(s => s.id === id);
    }

    // ====== INSTRUMENTOS ======
    function addInstrument(instrument) {
        instrument.id = generateId();
        data.instruments.push(instrument);
        save();
        return instrument;
    }

    function updateInstrument(id, updates) {
        const idx = data.instruments.findIndex(i => i.id === id);
        if (idx >= 0) {
            data.instruments[idx] = { ...data.instruments[idx], ...updates };
            save();
            return data.instruments[idx];
        }
        return null;
    }

    function deleteInstrument(id) {
        const levelIds = data.levels.filter(l => l.instrumentId === id).map(l => l.id);
        data.levels = data.levels.filter(l => l.instrumentId !== id);
        data.contents = data.contents.filter(c => !levelIds.includes(c.levelId));
        data.repertoire = data.repertoire.filter(r => !levelIds.includes(r.levelId));
        data.instruments = data.instruments.filter(i => i.id !== id);

        Object.keys(data.progress).forEach(sid => {
            if (data.progress[sid][id]) delete data.progress[sid][id];
        });
        Object.keys(data.repertoireProgress).forEach(sid => {
            if (data.repertoireProgress[sid][id]) delete data.repertoireProgress[sid][id];
        });
        save();
    }

    function getInstrument(id) {
        return data.instruments.find(i => i.id === id);
    }

    // ====== NÍVEIS ======
    function addLevel(level) {
        level.id = generateId();
        data.levels.push(level);
        save();
        return level;
    }

    function updateLevel(id, updates) {
        const idx = data.levels.findIndex(l => l.id === id);
        if (idx >= 0) {
            data.levels[idx] = { ...data.levels[idx], ...updates };
            save();
            return data.levels[idx];
        }
        return null;
    }

    function deleteLevel(id) {
        data.contents = data.contents.filter(c => c.levelId !== id);
        data.repertoire = data.repertoire.filter(r => r.levelId !== id);
        data.levels = data.levels.filter(l => l.id !== id);
        save();
    }

    function getLevelsByInstrument(instrumentId) {
        return data.levels
            .filter(l => l.instrumentId === instrumentId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    // ====== CONTEÚDOS ======
    function addContent(content) {
        content.id = generateId();
        data.contents.push(content);
        save();
        return content;
    }

    function updateContent(id, updates) {
        const idx = data.contents.findIndex(c => c.id === id);
        if (idx >= 0) {
            data.contents[idx] = { ...data.contents[idx], ...updates };
            save();
            return data.contents[idx];
        }
        return null;
    }

    function deleteContent(id) {
        data.contents = data.contents.filter(c => c.id !== id);
        save();
    }

    function getContentsByLevel(levelId) {
        return data.contents
            .filter(c => c.levelId === levelId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    // ====== REPERTÓRIO POR NÍVEL ======
    function addRepertoireSong(song) {
        song.id = generateId();
        data.repertoire.push(song);
        save();
        return song;
    }

    function updateRepertoireSong(id, updates) {
        const idx = data.repertoire.findIndex(r => r.id === id);
        if (idx >= 0) {
            data.repertoire[idx] = { ...data.repertoire[idx], ...updates };
            save();
            return data.repertoire[idx];
        }
        return null;
    }

    function deleteRepertoireSong(id) {
        data.repertoire = data.repertoire.filter(r => r.id !== id);
        Object.keys(data.repertoireProgress).forEach(sid => {
            Object.keys(data.repertoireProgress[sid]).forEach(iid => {
                Object.keys(data.repertoireProgress[sid][iid]).forEach(lid => {
                    if (data.repertoireProgress[sid][iid][lid] && data.repertoireProgress[sid][iid][lid][id]) {
                        delete data.repertoireProgress[sid][iid][lid][id];
                    }
                });
            });
        });
        save();
    }

    function getRepertoireByLevel(levelId) {
        return data.repertoire
            .filter(r => r.levelId === levelId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    // ====== PROGRESSO DE CONTEÚDOS ======
    function setProgress(studentId, instrumentId, levelId, contentId, status, observation = '') {
        if (!data.progress[studentId]) data.progress[studentId] = {};
        if (!data.progress[studentId][instrumentId]) data.progress[studentId][instrumentId] = {};
        if (!data.progress[studentId][instrumentId][levelId]) data.progress[studentId][instrumentId][levelId] = {};

        const old = data.progress[studentId][instrumentId][levelId][contentId];
        const oldStatus = old ? old.status : null;

        data.progress[studentId][instrumentId][levelId][contentId] = {
            status,
            date: new Date().toISOString(),
            observation
        };

        const content = data.contents.find(c => c.id === contentId);
        if (content && oldStatus !== status) {
            data.history.push({
                id: generateId(),
                date: new Date().toISOString(),
                studentId,
                instrumentId,
                levelId,
                contentId,
                contentName: content.name,
                oldStatus,
                newStatus: status,
                observation
            });
        }

        save();
    }

    function getProgress(studentId, instrumentId, levelId) {
        return (data.progress[studentId] || {})[instrumentId] || {};
    }

    function getContentStatus(studentId, instrumentId, levelId, contentId) {
        const levelProgress = getProgress(studentId, instrumentId, levelId);
        return (levelProgress[levelId] || {})[contentId] || null;
    }

    // ====== PROGRESSO DE REPERTÓRIO ======
    function toggleRepertoireSong(studentId, instrumentId, levelId, songId, completed) {
        if (!data.repertoireProgress[studentId]) data.repertoireProgress[studentId] = {};
        if (!data.repertoireProgress[studentId][instrumentId]) data.repertoireProgress[studentId][instrumentId] = {};
        if (!data.repertoireProgress[studentId][instrumentId][levelId]) data.repertoireProgress[studentId][instrumentId][levelId] = {};

        const prev = data.repertoireProgress[studentId][instrumentId][levelId][songId];
        const wasCompleted = prev ? !!prev.completed : false;

        data.repertoireProgress[studentId][instrumentId][levelId][songId] = {
            completed: !!completed,
            date: new Date().toISOString()
        };

        const song = data.repertoire.find(r => r.id === songId);
        if (song && wasCompleted !== !!completed) {
            data.history.push({
                id: generateId(),
                date: new Date().toISOString(),
                studentId,
                instrumentId,
                levelId,
                contentId: songId,
                contentName: `🎼 ${song.title}`,
                oldStatus: wasCompleted ? 'known' : 'pending',
                newStatus: completed ? 'known' : 'pending',
                observation: completed ? 'Música concluída no repertório' : 'Música desmarcada no repertório'
            });
        }

        save();
    }

    function isSongCompleted(studentId, instrumentId, levelId, songId) {
        const levelRep = (((data.repertoireProgress[studentId] || {})[instrumentId] || {})[levelId]) || {};
        return !!(levelRep[songId] && levelRep[songId].completed);
    }

    // ====== CONTEÚDOS PERSONALIZADOS ======
    function addCustomContent(studentId, instrumentId, content) {
        if (!data.customContents[studentId]) data.customContents[studentId] = {};
        if (!data.customContents[studentId][instrumentId]) data.customContents[studentId][instrumentId] = [];

        content.id = generateId();
        content.date = new Date().toISOString();
        data.customContents[studentId][instrumentId].push(content);
        save();
        return content;
    }

    function updateCustomContent(studentId, instrumentId, contentId, updates) {
        const list = (data.customContents[studentId] || {})[instrumentId] || [];
        const idx = list.findIndex(c => c.id === contentId);
        if (idx >= 0) {
            list[idx] = { ...list[idx], ...updates };
            save();
        }
    }

    function deleteCustomContent(studentId, instrumentId, contentId) {
        if (data.customContents[studentId] && data.customContents[studentId][instrumentId]) {
            data.customContents[studentId][instrumentId] =
                data.customContents[studentId][instrumentId].filter(c => c.id !== contentId);
            save();
        }
    }

    function getCustomContents(studentId, instrumentId) {
        return (data.customContents[studentId] || {})[instrumentId] || [];
    }

    // ====== HISTÓRICO ======
    function getHistory(studentId) {
        return data.history
            .filter(h => h.studentId === studentId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    function getAllHistory() {
        return [...data.history].sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // ====== EXPORTAR / IMPORTAR ======
    function exportJSON() {
        return JSON.stringify(data, null, 2);
    }

    function importJSON(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            if (!imported.students || !imported.instruments) {
                throw new Error('Formato inválido');
            }
            data = imported;
            Object.keys(defaultData).forEach(key => {
                if (data[key] === undefined) {
                    data[key] = JSON.parse(JSON.stringify(defaultData[key]));
                }
            });
            save();
            return true;
        } catch (e) {
            console.error('Erro ao importar:', e);
            return false;
        }
    }

    function clearAll() {
        data = JSON.parse(JSON.stringify(defaultData));
        save();
    }

    // ====== CONFIGURAÇÕES ======
    function getSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function saveSettings(settings) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }

    // ====== ESTATÍSTICAS ======
    function getStats() {
        const students = data.students;
        const totalStudents = students.length;

        const byInstrument = {};
        data.instruments.forEach(inst => {
            byInstrument[inst.id] = {
                name: inst.name,
                count: students.filter(s =>
                    s.mainInstrument === inst.id ||
                    (s.secondaryInstruments || []).includes(inst.id)
                ).length
            };
        });

        const byLevel = {};
        data.levels.forEach(lvl => {
            byLevel[lvl.id] = {
                name: lvl.name,
                count: students.filter(s => s.level === lvl.id).length
            };
        });

        let known = 0, learning = 0, pending = 0, notStarted = 0;
        let totalContents = data.contents.length;

        Object.values(data.progress).forEach(studentProgress => {
            Object.values(studentProgress).forEach(instProgress => {
                Object.values(instProgress).forEach(levelProgress => {
                    Object.values(levelProgress).forEach(item => {
                        if (item.status === 'known') known++;
                        else if (item.status === 'learning') learning++;
                        else if (item.status === 'pending') pending++;
                    });
                });
            });
        });

        const totalPossible = students.length * totalContents;
        notStarted = Math.max(0, totalPossible - (known + learning + pending));

        const attention = students.filter(s => {
            const studentProgress = data.progress[s.id] || {};
            let total = 0, done = 0;
            Object.values(studentProgress).forEach(instProgress => {
                Object.values(instProgress).forEach(levelProgress => {
                    Object.values(levelProgress).forEach(item => {
                        total++;
                        if (item.status === 'known') done++;
                    });
                });
            });
            return total === 0 || (done / total) < 0.2;
        });

        return {
            totalStudents,
            totalInstruments: data.instruments.length,
            totalLevels: data.levels.length,
            totalContents,
            byInstrument,
            byLevel,
            known,
            learning,
            pending,
            notStarted,
            attention
        };
    }

    return {
        load, save, getData, generateId,
        addStudent, updateStudent, deleteStudent, getStudent,
        addInstrument, updateInstrument, deleteInstrument, getInstrument,
        addLevel, updateLevel, deleteLevel, getLevelsByInstrument,
        addContent, updateContent, deleteContent, getContentsByLevel,
        addRepertoireSong, updateRepertoireSong, deleteRepertoireSong, getRepertoireByLevel,
        setProgress, getProgress, getContentStatus,
        toggleRepertoireSong, isSongCompleted,
        addCustomContent, updateCustomContent, deleteCustomContent, getCustomContents,
        getHistory, getAllHistory,
        exportJSON, importJSON, clearAll,
        getSettings, saveSettings,
        getStats
    };
})();