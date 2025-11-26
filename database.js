// database.js
const { MongoClient } = require('mongodb');

let client;
let db;

async function connect() {
    if (db) return db; // Evita múltiplas conexões (serverless)

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("❌ ERRO: MONGODB_URI não definida no ambiente da Vercel!");
        throw new Error("MONGODB_URI não definida");
    }

    console.log("🌐 Tentando conectar ao MongoDB Atlas...");
    console.log("URI carregada:", process.env.MONGODB_URI ? "✅ URI carregada com sucesso" : "❌ URI não encontrada!");

    try {
        client = new MongoClient(uri, { 
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        
        await client.connect();
        
        // Testa a conexão
        await client.db('admin').command({ ping: 1 });
        
        db = client.db('senac_sistema');
        console.log("✅ MongoDB Atlas conectado com sucesso!");
        
        return db;
    } catch (error) {
        console.error('❌ Erro de conexão MongoDB:', error);
        throw error;
    }
}

// Função para desconectar (útil para desenvolvimento)
async function disconnect() {
    if (client) {
        await client.close();
        console.log('🔌 Conexão MongoDB fechada');
    }
}

module.exports = { connect, disconnect };