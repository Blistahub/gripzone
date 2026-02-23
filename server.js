require('dotenv').config();
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
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'dev_secret_key';

// Logger
const log = (msg) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);

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
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));

async function initializeAdmin() {
    if (!process.env.ADMIN_EMAIL) return;
    const adminEmail = process.env.ADMIN_EMAIL;
    db.get(`SELECT * FROM users WHERE email = ?`, [adminEmail], async (err, user) => {
        if (!user) {
            log("⚠️ Creando SuperAdmin...");
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
            const sql = `INSERT INTO users (email, password, name, country, role, bio) VALUES (?, ?, ?, ?, 'admin', 'Official Judge')`;
            db.run(sql, [adminEmail, hashedPassword, process.env.ADMIN_NAME, process.env.ADMIN_COUNTRY]);
        }
    });
}
initializeAdmin();

// --- API ENDPOINTS ---

// 1. REGISTER
app.post('/api/register', async (req, res) => {
    const { email, password, name, country } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = 'user';
        const sql = `INSERT INTO users (email, password, name, country, role) VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [email, hashedPassword, name, country, role], function (err) {
            if (err) return res.status(400).json({ error: 'El email ya existe' });
            const token = jwt.sign({ id: this.lastID, email, role }, SECRET_KEY);
            res.json({ success: true, token, user: { id: this.lastID, name, country, email, role } });
        });
    } catch (e) { res.status(500).json({ error: 'Error servidor' }); }
});

// 2. LOGIN
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY);
        res.json({ success: true, token, user: { id: user.id, name: user.name, country: user.country, email: user.email, role: user.role } });
    });
});

// 3. GET PROFILE
app.post('/api/get-profile', (req, res) => {
    const { email } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        db.all(`SELECT * FROM history WHERE user_id = ? AND status = 'verified' ORDER BY timestamp DESC`, [user.id], (err, history) => {
            db.all(`SELECT email, score, bw, status FROM records WHERE status = 'verified' OR email = ? ORDER BY score DESC`, [email], (err, records) => {
                const globalRank = records.findIndex(r => r.email === email) + 1;
                const bestVerifiedRecord = history.length > 0 ? history.reduce((prev, current) => (prev.score > current.score) ? prev : current) : null;
                const verifiedBestScore = bestVerifiedRecord ? bestVerifiedRecord.score : 0;
                const verifiedBW = bestVerifiedRecord ? bestVerifiedRecord.bw : (user.bw || 0);

                res.json({
                    name: user.name,
                    country: user.country,
                    bio: user.bio || "",
                    instagram: user.instagram || "",
                    youtube: user.youtube || "",
                    avatar: user.avatar || "",
                    bw: verifiedBW,
                    history: history || [],
                    globalRank: globalRank > 0 ? globalRank : "-",
                    bestScore: verifiedBestScore,
                    role: user.role
                });
            });
        });
    });
});

// 4. UPDATE PROFILE
app.post('/api/profile/update', upload.single('avatar'), (req, res) => {
    const { email, bio, instagram, youtube, bw } = req.body;
    if (parseFloat(bw) < 0) return res.status(400).json({ error: "El peso no puede ser negativo" });
    const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;
    let sql = `UPDATE users SET bio = ?, instagram = ?, youtube = ?, bw = ?`;
    let params = [bio, instagram, youtube, parseFloat(bw)];
    if (avatarPath) { sql += `, avatar = ?`; params.push(avatarPath); }
    sql += ` WHERE email = ?`;
    params.push(email);
    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// 5. UPLOAD SCORE
app.post('/api/upload', (req, res) => {
    const { userEmail, device, score, bw, video } = req.body;
    const scoreNum = parseFloat(score);
    const bwNum = parseFloat(bw);
    if (scoreNum < 0 || bwNum < 0) return res.status(400).json({ error: "Valores negativos no permitidos" });

    const now = Date.now();
    const todayDate = new Date().toISOString().split('T')[0];

    db.get(`SELECT * FROM users WHERE email = ?`, [userEmail], (err, user) => {
        if (!user) return res.status(403).json({ error: 'Usuario no encontrado' });

        db.run(`UPDATE users SET bw = ? WHERE id = ?`, [bwNum, user.id]);
        const initialStatus = user.role === 'admin' ? 'verified' : 'pending';

        db.run(`INSERT INTO history (user_id, date, device, score, bw, video, timestamp, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [user.id, todayDate, device, scoreNum, bwNum, video, now, initialStatus]);

        db.get(`SELECT * FROM records WHERE user_id = ?`, [user.id], (err, record) => {
            let isNewPR = false;
            if (record) {
                if (scoreNum > record.score) {
                    db.run(`UPDATE records SET score=?, bw=?, date=?, timestamp=?, video=?, device=?, status=? WHERE id=?`,
                        [scoreNum, bwNum, todayDate, now, video, device, initialStatus, record.id]);
                    isNewPR = true;
                }
            } else {
                db.run(`INSERT INTO records (user_id, email, name, country, device, score, bw, date, timestamp, video, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [user.id, userEmail, user.name, user.country, device, scoreNum, bwNum, todayDate, now, video, initialStatus]);
                isNewPR = true;
            }
            res.json({ success: true, isNewPR });
        });
    });
});

// 6. GET RECORDS (MODIFICADO: JOIN CON USUARIOS PARA AVATAR + LIKES)
app.post('/api/records', (req, res) => {
    const { currentUserId } = req.body;

    const query = `
        SELECT 
            r.*, 
            u.avatar,
            (SELECT COUNT(*) FROM respects WHERE record_id = r.id) as respect_count,
            (SELECT COUNT(*) FROM respects WHERE record_id = r.id AND user_id = ?) as has_respected
        FROM records r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.score DESC
    `;

    db.all(query, [currentUserId || -1], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 9. DAR/QUITAR RESPETO
app.post('/api/respect', (req, res) => {
    const { userEmail, recordId } = req.body;
    db.get(`SELECT id FROM users WHERE email = ?`, [userEmail], (err, user) => {
        if (!user) return res.status(403).json({ error: 'Usuario no encontrado' });

        db.get(`SELECT * FROM respects WHERE user_id = ? AND record_id = ?`, [user.id, recordId], (err, existing) => {
            if (existing) {
                db.run(`DELETE FROM respects WHERE user_id = ? AND record_id = ?`, [user.id, recordId], () => {
                    res.json({ success: true, action: 'removed' });
                });
            } else {
                db.run(`INSERT INTO respects (user_id, record_id) VALUES (?, ?)`, [user.id, recordId], () => {
                    res.json({ success: true, action: 'added' });
                });
            }
        });
    });
});

// --- ADMIN ENDPOINTS ---
app.post('/api/admin/pending', (req, res) => {
    const { userEmail } = req.body;
    db.get(`SELECT role FROM users WHERE email = ?`, [userEmail], (err, user) => {
        if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
        db.all(`SELECT * FROM records WHERE status = 'pending' ORDER BY timestamp DESC`, [], (err, rows) => {
            res.json(rows);
        });
    });
});

app.post('/api/admin/verify', (req, res) => {
    const { adminEmail, recordId, action } = req.body;
    db.get(`SELECT role FROM users WHERE email = ?`, [adminEmail], (err, admin) => {
        if (!admin || admin.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });

        db.get(`SELECT * FROM records WHERE id = ?`, [recordId], (err, currentRecord) => {
            if (!currentRecord) return res.status(404).json({ error: 'Record no encontrado' });
            const userId = currentRecord.user_id;
            const recordTimestamp = currentRecord.timestamp;

            if (action === 'approve') {
                db.run(`UPDATE records SET status = 'verified' WHERE id = ?`, [recordId]);
                db.run(`UPDATE history SET status = 'verified' WHERE user_id = ? AND timestamp = ?`, [userId, recordTimestamp]);
                db.run(`UPDATE users SET bw = ? WHERE id = ?`, [currentRecord.bw, userId]);
                res.json({ success: true });
            } else {
                db.run(`UPDATE history SET status = 'rejected' WHERE user_id = ? AND timestamp = ?`, [userId, recordTimestamp]);
                db.get(`SELECT * FROM history WHERE user_id = ? AND status = 'verified' ORDER BY score DESC LIMIT 1`, [userId], (err, bestHistory) => {
                    if (bestHistory) {
                        db.run(`UPDATE records SET score=?, bw=?, date=?, timestamp=?, video=?, device=?, status='verified' WHERE id=?`,
                            [bestHistory.score, bestHistory.bw, bestHistory.date, bestHistory.timestamp, bestHistory.video, bestHistory.device, recordId]);
                        db.run(`UPDATE users SET bw = ? WHERE id = ?`, [bestHistory.bw, userId]);
                    } else {
                        db.run(`DELETE FROM records WHERE id = ?`, [recordId]);
                    }
                    res.json({ success: true });
                });
            }
        });
    });
});

app.listen(PORT, () => {
    console.log(`🔥 GRIPZONE SERVER RUNNING ON PORT ${PORT} 🔥`);
});