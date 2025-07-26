const sqlite3 = require("sqlite3").verbose();

// Conectar ao banco
const db = new sqlite3.Database("database.db", (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco:", err.message);
        return;
    }
    console.log("Conectado ao banco SQLite.");
});

// Consultar todas as transações
db.all("SELECT * FROM transacoes", [], (err, rows) => {
    if (err) {
        console.error("Erro ao consultar:", err.message);
        return;
    }
    console.log("Transações encontradas:");
    console.table(rows);  // Mostra bonitinho em formato de tabela
});

// Fechar a conexão
db.close((err) => {
    if (err) {
        console.error("Erro ao fechar o banco:", err.message);
    } else {
        console.log("Conexão encerrada.");
    }
});
