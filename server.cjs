const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// AUMENTAR LIMITE: Fotos em base64 são pesadas
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());

// Banco de Dados
const db = new sqlite3.Database('./mel_recensement.db', (err) => {
    if (err) console.error('Erro BD:', err.message);
    else console.log('Conectado ao banco de dados MEL.');
});

// Inicialização das Tabelas (Schema atualizado para Bureau/Terrain)
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT UNIQUE,
        senha TEXT
    )`);

    // Tabela atualizada com distributeur e description_technique
    db.run(`CREATE TABLE IF NOT EXISTS mobilier (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        category TEXT,
        state TEXT,
        latitude REAL,
        longitude REAL,
        gestionnaire TEXT,
        criticite TEXT,
        commentaire TEXT,
        photo TEXT,
        agent TEXT,
        distributeur TEXT,
        description_technique TEXT,
        dateRecensement DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Usuário padrão
    db.run(`INSERT OR IGNORE INTO usuarios (nome, email, senha) 
            VALUES ('Agente MEL', 'agente@mel.fr', '1234')`);
});

// --- ROTAS ---

// 1. Login
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;
    // Validação simples para demo
    if (!email.endsWith('@mel.fr') && email !== 'admin') {
        return res.status(403).json({ erro: "Domínio inválido (use @mel.fr)" });
    }
    if (senha === '1234') {
        res.json({ usuario: { nome: 'Agente MEL', email } });
    } else {
        res.status(401).json({ erro: "Senha incorreta" });
    }
});

// 2. Listar Mobiliário
app.get('/api/mobilier', (req, res) => {
    db.all("SELECT * FROM mobilier ORDER BY dateRecensement DESC", [], (err, rows) => {
        if (err) res.status(500).json({ erro: err.message });
        else {
            // Converte ID numérico para string (necessário para o frontend)
            const formatado = rows.map(r => ({...r, id: r.id.toString()}));
            res.json(formatado);
        }
    });
});

// 3. Criar ou Atualizar Mobiliário (Lógica Híbrida Terrain/Bureau)
app.post('/api/mobilier', (req, res) => {
    const { 
        id, type, category, state, latitude, longitude, 
        gestionnaire, criticite, commentaire, photo, agent,
        distributeur, description_technique 
    } = req.body;

    // Se tem ID e não começa com 'mob-' (ID temporário), é ATUALIZAÇÃO (Bureau)
    if (id && !id.toString().startsWith('mob-')) { 
        const sql = `UPDATE mobilier SET state=?, criticite=?, commentaire=?, photo=?, distributeur=?, description_technique=?, dateRecensement=CURRENT_TIMESTAMP WHERE id=?`;
        
        db.run(sql, [state, criticite, commentaire, photo, distributeur || '', description_technique || '', id], function(err) {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ status: "ATUALIZADO", id });
        });
    } else {
        // Novo Registo (Terrain)
        const sql = `INSERT INTO mobilier (type, category, state, latitude, longitude, gestionnaire, criticite, commentaire, photo, agent, distributeur, description_technique) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;
        
        db.run(sql, [type, category, state, latitude, longitude, gestionnaire, criticite, commentaire, photo, agent, distributeur || '', description_technique || ''], function(err) {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ status: "CRIADO", id: this.lastID.toString() });
        });
    }
});

app.listen(PORT, () => {
    console.log(`SERVIDOR LIGADO: http://localhost:${PORT}`);
});