require('dotenv').config(); // Cargar variables de entorno
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
const SECRET_KEY = process.env.JWT_SECRET; // Usamos la clave del .env

// Configuración Multer
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

// --- FUNCIÓN DE SEGURIDAD: CREAR ADMIN INICIAL ---
async function initializeAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPass = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME;
    const adminCountry = process.env.ADMIN_COUNTRY;

    db.get(`SELECT * FROM users WHERE email = ?`, [adminEmail], async (err, user) => {
        if (err) console.error(err);
        if (!user) {
            // No existe el admin, lo creamos
            console.log("⚠️ Admin no detectado. Creando cuenta de SuperAdmin...");
            const hashedPassword = await bcrypt.hash(adminPass, 10);

            // Forzamos el rol 'admin' directamente en la base de datos
            const sql = `INSERT INTO users (email, password, name, country, role, bio) VALUES (?, ?, ?, ?, 'admin', 'Official GripZone Judge')`;

            db.run(sql, [adminEmail, hashedPassword, adminName, adminCountry], (err) => {
                if (err) console.error("Error creando admin:", err.message);
                else console.log(`✅ SUPER ADMIN CREADO: ${adminEmail}`);
            });
        } else {
            console.log("✅ Sistema seguro: Admin ya existe.");
        }
    });
}

// Inicializar Admin al arrancar
initializeAdmin();

// --- API ENDPOINTS ---

// 1. REGISTRO (SEGURIDAD APLICADA: SIEMPRE ES USER)
app.post('/api/register', async (req, res) => {
    const { email, password, name, country } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // CORRECCIÓN DE SEGURIDAD:
        // Eliminamos cualquier lógica de detección de "admin" en el email.
        // Todos los registros web son 'user' por defecto.
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
        if (err || !user) return res.status(401).json({ error: 'Usuario no encontrado' });

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
        if (err || !user) return res.status(404).json({ error: 'Usuario no encontrado' });

        db.all(`SELECT * FROM history WHERE user_id = ? ORDER BY timestamp DESC`, [user.id], (err, history) => {
            db.all(`SELECT email, score, bw, status FROM records WHERE status = 'verified' OR email = ? ORDER BY score DESC`, [email], (err, records) => {
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
                    bestScore: bestRecord ? bestRecord.score : 0,
                    role: user.role
                });
            });
        });
    });
});

// 4. UPDATE PROFILE
app.post('/api/profile/update', upload.single('avatar'), (req, res) => {
    const { email, bio, instagram, youtube, bw } = req.body;
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
    const now = Date.now();
    const todayDate = new Date().toISOString().split('T')[0];
    const scoreNum = parseFloat(score);
    const bwNum = parseFloat(bw);

    db.get(`SELECT * FROM users WHERE email = ?`, [userEmail], (err, user) => {
        if (err || !user) return res.status(403).json({ error: 'Usuario no encontrado' });

        db.run(`UPDATE users SET bw = ? WHERE id = ?`, [bwNum, user.id]);
        db.run(`INSERT INTO history (user_id, date, device, score, bw, video, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user.id, todayDate, device, scoreNum, bwNum, video, now]);

        db.get(`SELECT * FROM records WHERE user_id = ?`, [user.id], (err, record) => {
            let isNewPR = false;
            // Si es el admin quien sube, se auto-verifica. Si no, pendiente.
            const initialStatus = user.role === 'admin' ? 'verified' : 'pending';

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

// 6. GET RANKING
app.get('/api/records', (req, res) => {
    db.all(`SELECT * FROM records ORDER BY score DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- ADMIN ENDPOINTS (PROTEGIDOS) ---

// 7. Ver Pendientes
app.post('/api/admin/pending', (req, res) => {
    const { userEmail } = req.body;
    // Verificamos rol de nuevo en DB por seguridad
    db.get(`SELECT role FROM users WHERE email = ?`, [userEmail], (err, user) => {
        if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado. Intento de intrusión registrado.' });

        db.all(`SELECT * FROM records WHERE status = 'pending' ORDER BY timestamp DESC`, [], (err, rows) => {
            res.json(rows);
        });
    });
});

// 8. Verificar
app.post('/api/admin/verify', (req, res) => {
    const { adminEmail, recordId, action } = req.body;

    db.get(`SELECT role FROM users WHERE email = ?`, [adminEmail], (err, user) => {
        if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });

        if (action === 'approve') {
            db.run(`UPDATE records SET status = 'verified' WHERE id = ?`, [recordId], (err) => {
                res.json({ success: true });
            });
        } else {
            db.run(`DELETE FROM records WHERE id = ?`, [recordId], (err) => {
                res.json({ success: true });
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`GRIPZONE corriendo en http://localhost:${PORT}`);
});