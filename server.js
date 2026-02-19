const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const db = require('./database');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'gripzone_secret_key';

// Configuración Multer (Imágenes)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './public/uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// --- API ENDPOINTS ---

// 1. Registro
app.post('/api/register', async (req, res) => {
    const { email, password, name, country } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO users (email, password, name, country) VALUES (?, ?, ?, ?)`;
        db.run(sql, [email, hashedPassword, name, country], function (err) {
            if (err) return res.status(400).json({ error: 'El email ya existe' });
            const token = jwt.sign({ id: this.lastID, email }, SECRET_KEY);
            res.json({ success: true, token, user: { id: this.lastID, name, country, email } });
        });
    } catch (e) { res.status(500).json({ error: 'Error servidor' }); }
});

// 2. Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Usuario no encontrado' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY);
        res.json({ success: true, token, user: { id: user.id, name: user.name, country: user.country, email: user.email } });
    });
});

// 3. Get Profile
app.post('/api/get-profile', (req, res) => {
    const { email } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'Usuario no encontrado' });

        db.all(`SELECT * FROM history WHERE user_id = ? ORDER BY timestamp DESC`, [user.id], (err, history) => {
            db.all(`SELECT email, score, bw FROM records ORDER BY score DESC`, [], (err, records) => {
                const globalRank = records.findIndex(r => r.email === email) + 1;
                const bestRecord = records.find(r => r.email === email);

                res.json({
                    name: user.name,
                    country: user.country,
                    bio: user.bio || "Sin descripción",
                    instagram: user.instagram || "",
                    youtube: user.youtube || "",
                    avatar: user.avatar || "",
                    bw: user.bw || (bestRecord ? bestRecord.bw : 0),
                    history: history || [],
                    globalRank: globalRank > 0 ? globalRank : "-",
                    bestScore: bestRecord ? bestRecord.score : 0
                });
            });
        });
    });
});

// 4. Update Profile
app.post('/api/profile/update', upload.single('avatar'), (req, res) => {
    const { email, bio, instagram, youtube, bw } = req.body;
    const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;

    let sql = `UPDATE users SET bio = ?, instagram = ?, youtube = ?, bw = ?`;
    let params = [bio, instagram, youtube, parseFloat(bw)];

    if (avatarPath) {
        sql += `, avatar = ?`;
        params.push(avatarPath);
    }
    sql += ` WHERE email = ?`;
    params.push(email);

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// 5. Upload Score
app.post('/api/upload', (req, res) => {
    const { userEmail, device, score, bw, video } = req.body;
    const now = Date.now();
    const todayDate = new Date().toISOString().split('T')[0];
    const scoreNum = parseFloat(score);
    const bwNum = parseFloat(bw);

    db.get(`SELECT * FROM users WHERE email = ?`, [userEmail], (err, user) => {
        if (err || !user) return res.status(403).json({ error: 'Usuario no encontrado' });

        // Actualizar peso actual del usuario
        db.run(`UPDATE users SET bw = ? WHERE id = ?`, [bwNum, user.id]);

        // Guardar en Historial
        db.run(`INSERT INTO history (user_id, date, device, score, bw, video, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user.id, todayDate, device, scoreNum, bwNum, video, now]);

        // Gestionar Global
        db.get(`SELECT * FROM records WHERE user_id = ?`, [user.id], (err, record) => {
            let isNewPR = false;
            if (record) {
                if (scoreNum > record.score) {
                    db.run(`UPDATE records SET score=?, bw=?, date=?, timestamp=?, video=?, device=? WHERE id=?`,
                        [scoreNum, bwNum, todayDate, now, video, device, record.id]);
                    isNewPR = true;
                }
            } else {
                db.run(`INSERT INTO records (user_id, email, name, country, device, score, bw, date, timestamp, video) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [user.id, userEmail, user.name, user.country, device, scoreNum, bwNum, todayDate, now, video]);
                isNewPR = true;
            }
            res.json({ success: true, isNewPR });
        });
    });
});

// 6. Get Ranking
app.get('/api/records', (req, res) => {
    db.all(`SELECT * FROM records ORDER BY score DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`GRIPZONE corriendo en http://localhost:${PORT}`);
});