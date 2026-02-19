const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'gripzone.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error al abrir la base de datos', err.message);
    else console.log('Conectado a la base de datos SQLite.');
});

db.serialize(() => {
    // Tabla Usuarios
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        country TEXT,
        bio TEXT,
        instagram TEXT,
        youtube TEXT,
        avatar TEXT,
        bw REAL DEFAULT 0
    )`);

    // Tabla Récords (Ranking Global - Solo la mejor marca)
    db.run(`CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        email TEXT,
        name TEXT,
        country TEXT,
        device TEXT,
        score REAL,
        bw REAL,
        date TEXT,
        timestamp INTEGER,
        video TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Tabla Historial (Todas las marcas personales)
    db.run(`CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        date TEXT,
        device TEXT,
        score REAL,
        bw REAL,
        video TEXT,
        timestamp INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
});

module.exports = db;