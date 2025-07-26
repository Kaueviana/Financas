const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("database.db");

// Criar tabela transacoes
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS transacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            descricao TEXT NOT NULL,
            valor REAL NOT NULL,
            tipo TEXT NOT NULL,
            data TEXT NOT NULL
        )
    `);
});

// Criar tabela de usuários
db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        usuario TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL
    )
`);


// Listar todas as transações
app.get("/transacoes", (req, res) => {
    db.all("SELECT * FROM transacoes", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post("/usuarios/cadastrar", (req, res) => {
    const { nome, email, usuario, senha } = req.body;

    if (!nome || !email || !usuario || !senha) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    db.run(
        "INSERT INTO usuarios (nome, email, usuario, senha) VALUES (?, ?, ?, ?)",
        [nome, email, usuario, senha],
        function (err) {
            if (err) {
                return res.status(500).json({ error: "Erro ao cadastrar usuário. Nome de usuário já pode existir." });
            }
            res.json({ id: this.lastID, nome, email, usuario });
        }
    );
});

app.post("/usuarios/login", (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).json({ error: "Usuário e senha obrigatórios" });
    }

    db.get(
        "SELECT * FROM usuarios WHERE usuario = ? AND senha = ?",
        [usuario, senha],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: "Erro interno no servidor" });
            }

            if (!row) {
                return res.status(401).json({ error: "Usuário ou senha inválidos" });
            }

            // Aqui você poderia retornar um token, mas por simplicidade:
            res.json({ message: "Login bem-sucedido", usuario: row.usuario });
        }
    );
});

// Listar todos os usuários
app.get("/usuarios", (req, res) => {
    db.all("SELECT id, nome, email, usuario FROM usuarios", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows); // mostra todos os usuários sem a senha
    });
});

// Excluir um usuário pelo ID
app.delete("/usuarios/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM usuarios WHERE id = ?";
  db.run(sql, [id], function (err) {
    if (err) {
      console.error("Erro ao excluir usuário:", err.message);
      return res.status(500).json({ error: "Erro ao excluir o usuário" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json({ message: "Usuário excluído com sucesso" });
  });
});


// Adicionar uma transação
app.post("/transacoes", (req, res) => {
    const { descricao, valor, tipo, data } = req.body;

    console.log("Recebido:", { descricao, valor, tipo, data });

    if (!descricao || !valor || !tipo || !data) {
        console.log("Campos faltando!");
        return res.status(400).json({ error: "Preencha todos os campos" });
    }

    db.run(
        "INSERT INTO transacoes (descricao, valor, tipo, data) VALUES (?, ?, ?, ?)",
        [descricao, valor, tipo, data],
        function (err) {
            if (err) {
                console.log("Erro ao inserir:", err.message);
                return res.status(500).json({ error: err.message });
            }
            console.log("Inserido com sucesso ID:", this.lastID);
            res.json({ id: this.lastID, descricao, valor, tipo, data });
        }
    );
});


// Excluir uma transação
app.delete("/transacoes/:id", (req, res) => {
    const { id } = req.params;

    db.run(
        "DELETE FROM transacoes WHERE id = ?",
        [id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) {
                return res.status(404).json({ error: "Transação não encontrada." });
            }
            res.json({ message: "Transação removida" });
        }
    );
});

// Iniciar o servidor
// Iniciar o servidor
app.listen(3000, '0.0.0.0', () => {
    console.log("Servidor rodando em http://0.0.0.0:3000");
});
