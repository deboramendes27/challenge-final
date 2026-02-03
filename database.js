const sqlite3 = require('sqlite3').verbose();

// Cria ou abre o arquivo do banco de dados
const db = new sqlite3.Database('./mel_recensement.db', (err) => {
    if (err) console.error('Erro BD:', err.message);
    else console.log('Conectado ao banco de dados MEL.');
});

db.serialize(() => {
    // 1. Tabela de Usuários
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT UNIQUE,
        senha TEXT
    )`);

    // 2. Tabela de Mobiliário Urbano
    db.run(`CREATE TABLE IF NOT EXISTS mobilier (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL,
        estado TEXT NOT NULL,
        lat REAL,
        lng REAL,
        comentario TEXT,
        usuario_id INTEGER,
        data_registo DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    )`);
    
    // Cria um usuário de teste (se não existir)
    db.run(`INSERT OR IGNORE INTO usuarios (nome, email, senha) 
            VALUES ('Agente 01', 'agente@mel.fr', '1234')`);
});

module.exports = db;