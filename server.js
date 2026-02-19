const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DB_FILE = 'database.json';

app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());
app.use(express.static('public'));

const readDB = () => {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = { users: [], records: [] };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    const db = JSON.parse(fs.readFileSync(DB_FILE));
    db.users.forEach(u => { if (!u.history) u.history = []; });
    // Migración de records antiguos a historial (Código anterior mantenido)
    db.records.forEach(record => {
        const user = db.users.find(u => u.email === record.email);
        if (user) {
            const existsInHistory = user.history.some(h => (h.date === record.date && h.score === record.score) || (h.id === record.id));
            if (!existsInHistory) {
                user.history.push({
                    id: record.id || Date.now(),
                    date: record.date, device: record.device, score: record.score, bw: record.bw, video: record.video
                });
            }
        }
    });
    return db;
};

const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- API ENDPOINTS ---

app.get('/api/records', (req, res) => {
    const db = readDB();
    const sortedRecords = db.records.sort((a, b) => b.score - a.score);
    res.json(sortedRecords);
});

app.post('/api/get-profile', (req, res) => {
    const { email } = req.body;
    const db = readDB();

    const user = db.users.find(u => u.email === email);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const sortedRecords = db.records.sort((a, b) => b.score - a.score);
    const globalRank = sortedRecords.findIndex(r => r.email === email) + 1;
    const bestRecord = sortedRecords.find(r => r.email === email);

    res.json({
        name: user.name,
        country: user.country,
        bio: user.bio || "",
        instagram: user.instagram || "",
        youtube: user.youtube || "",
        avatar: user.avatar || "",
        // Devolvemos el peso actual del usuario. Si no tiene, usamos el de su mejor marca, si no, 0.
        bw: user.bw || (bestRecord ? bestRecord.bw : 0),
        history: user.history || [],
        globalRank: globalRank > 0 ? globalRank : "-",
        bestScore: bestRecord ? bestRecord.score : 0
    });
});

app.post('/api/profile/update', (req, res) => {
    const { email, bio, instagram, youtube, avatar, bw } = req.body; // AÑADIDO bw
    const db = readDB();
    const userIndex = db.users.findIndex(u => u.email === email);

    if (userIndex === -1) return res.status(404).json({ error: 'Usuario no encontrado' });

    db.users[userIndex].bio = bio;
    db.users[userIndex].instagram = instagram;
    db.users[userIndex].youtube = youtube;
    if (bw) db.users[userIndex].bw = parseFloat(bw); // Actualizamos peso
    if (avatar) db.users[userIndex].avatar = avatar;

    writeDB(db);
    res.json({ success: true });
});

app.post('/api/register', (req, res) => {
    const { email, password, name, country } = req.body;
    const db = readDB();

    if (db.users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const newUser = {
        id: Date.now(), email, password, name, country,
        history: [], bio: "", instagram: "", youtube: "", avatar: "", bw: 0
    };
    db.users.push(newUser);
    writeDB(db);
    res.json({ success: true, user: { name, country, email } });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.email === email && u.password === password);

    if (user) {
        res.json({ success: true, user: { name: user.name, country: user.country, email: user.email } });
    } else {
        res.status(401).json({ error: 'Credenciales incorrectas' });
    }
});

app.post('/api/upload', (req, res) => {
    const { userEmail, device, score, bw, video } = req.body;
    const db = readDB();

    const userIndex = db.users.findIndex(u => u.email === userEmail);
    if (userIndex === -1) return res.status(403).json({ error: 'Usuario no encontrado' });

    const now = Date.now();
    const todayDate = new Date().toISOString().split('T')[0];
    const scoreNum = parseFloat(score);
    const bwNum = parseFloat(bw);

    // Actualizamos el peso actual del usuario con el de la última marca subida
    db.users[userIndex].bw = bwNum;

    const newHistoryEntry = {
        id: now, date: todayDate, device, score: scoreNum, bw: bwNum, video
    };
    db.users[userIndex].history.push(newHistoryEntry);

    const existingRecordIndex = db.records.findIndex(r => r.email === userEmail);
    let isNewPR = false;

    if (existingRecordIndex > -1) {
        if (scoreNum > db.records[existingRecordIndex].score) {
            db.records[existingRecordIndex] = {
                ...db.records[existingRecordIndex],
                device, score: scoreNum, bw: bwNum, date: todayDate, timestamp: now, video, country: db.users[userIndex].country
            };
            isNewPR = true;
        }
    } else {
        db.records.push({
            id: now, email: userEmail, name: db.users[userIndex].name, country: db.users[userIndex].country,
            device, score: scoreNum, bw: bwNum, date: todayDate, timestamp: now, video
        });
        isNewPR = true;
    }

    writeDB(db);
    res.json({ success: true, isNewPR });
});

app.listen(PORT, () => {
    console.log(`GRIPZONE corriendo en http://localhost:${PORT}`);
});