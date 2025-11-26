// database.js - VERSÃO CORRIGIDA PARA VERCEL
const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connect() {
    // Se já temos conexão cacheada, retorna
    if (cachedDb) {
        console.log('♻️  Usando conexão MongoDB cacheada');
        return cachedDb;
    }

    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
        console.error("❌ MONGODB_URI não definida!");
        console.log("Variáveis disponíveis:", Object.keys(process.env));
        throw new Error("MONGODB_URI não configurada no Vercel");
    }

    console.log("🌐 Conectando ao MongoDB Atlas...");
    console.log("📋 URI:", uri ? "✅ Presente" : "❌ Ausente");

    try {
        // Configurações otimizadas para Vercel
        const client = new MongoClient(uri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            retryWrites: true,
            w: 'majority'
        });

        console.log('⏳ Estabelecendo conexão...');
        await client.connect();
        
        console.log('🔍 Testando conexão com ping...');
        await client.db('admin').command({ ping: 1 });
        console.log('✅ Ping bem-sucedido!');

        const db = client.db('senac_sistema');
        
        // Cache das conexões
        cachedClient = client;
        cachedDb = db;
        
        console.log("🎉 MongoDB Atlas conectado com sucesso!");
        console.log("📊 Database:", db.databaseName);
        
        return db;
        
    } catch (error) {
        console.error('💥 ERRO DE CONEXÃO MONGODB:');
        console.error('🔧 Tipo:', error.name);
        console.error('📝 Mensagem:', error.message);
        console.error('🏷️ Código:', error.code);
        
        if (error.name === 'MongoServerSelectionError') {
            console.error('🌐 Problema de rede/DNS');
        } else if (error.name === 'MongoAuthenticationError') {
            console.error('🔐 Problema de autenticação');
        } else if (error.name === 'MongoTimeoutError') {
            console.error('⏰ Timeout na conexão');
        }
        
        throw new Error(`Falha na conexão MongoDB: ${error.message}`);
    }
}

// Função para verificar status
async function getStatus() {
    return {
        connected: !!cachedDb,
        client: cachedClient ? 'connected' : 'disconnected',
        db: cachedDb ? 'connected' : 'disconnected'
    };
}

module.exports = { connect, getStatus };