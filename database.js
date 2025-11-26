// database.js
const { MongoClient } = require('mongodb');

let client;
let db;

async function connect() {
    if (db) {
        console.log('♻️  Usando conexão existente do MongoDB');
        return db;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("❌ ERRO CRÍTICO: MONGODB_URI não definida no ambiente!");
        console.log("Variáveis de ambiente disponíveis:", Object.keys(process.env));
        throw new Error("MONGODB_URI não definida no Vercel");
    }

    console.log("🌐 Tentando conectar ao MongoDB Atlas...");
    
    try {
        client = new MongoClient(uri, { 
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
        });
        
        console.log('⏳ Conectando ao MongoDB...');
        await client.connect();
        
        // Testa a conexão
        console.log('🔍 Testando conexão...');
        await client.db('admin').command({ ping: 1 });
        
        db = client.db('senac_sistema');
        console.log("✅ MongoDB Atlas conectado com sucesso!");
        console.log("📊 Database:", db.databaseName);
        
        return db;
    } catch (error) {
        console.error('❌ Erro de conexão MongoDB:', error);
        console.error('🔍 Detalhes do erro:', {
            name: error.name,
            message: error.message,
            code: error.code
        });
        throw new Error(`Falha na conexão com MongoDB: ${error.message}`);
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