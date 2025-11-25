// database.js
const { MongoClient } = require('mongodb');

let client;
let db;

async function connect() {
    if (db) return db; // Evita múltiplas conexões (serverless)

    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("❌ ERRO: MONGODB_URI não definida no ambiente da Vercel!");

    console.log("🌐 Tentando conectar ao MongoDB com URI:");
    console.log(process.env.MONGODB_URI ? "URI carregada com sucesso 🔒" : "❌ URI não encontrada!");


    client = new MongoClient(uri, { maxPoolSize: 10 });
    await client.connect();

    db = client.db('senac_sistema');
    console.log("✅ MongoDB Atlas conectado (serverless)");

    return db;
}

module.exports = { connect };
