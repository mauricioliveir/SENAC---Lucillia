const { MongoClient } = require('mongodb');

class MongoDB {
    constructor() {
        this.uri = "mongodb+srv://db_user_senac:30081409@cluster0.npzuxq6.mongodb.net/senac_sistema?retryWrites=true&w=majority";
        this.client = new MongoClient(this.uri);
        this.db = null;
    }

    async connect() {
        try {
            await this.client.connect();
            this.db = this.client.db('senac_sistema');
            console.log('✅ Conectado ao MongoDB Atlas');
            
            // Criar collections e índices
            await this.createCollections();
            return this.db;
        } catch (error) {
            console.error('❌ Erro ao conectar com MongoDB:', error);
            throw error;
        }
    }

    async createCollections() {
        const collections = ['users', 'funcionarios', 'tesouraria', 'contas_pagar', 'contas_receber', 'vendas', 'estoque'];
        
        for (const collectionName of collections) {
            const collection = this.db.collection(collectionName);
            
            // Criar índices únicos para evitar duplicatas
            if (collectionName === 'users') {
                await collection.createIndex({ email: 1 }, { unique: true });
            }
            if (collectionName === 'funcionarios') {
                await collection.createIndex({ cpf: 1 }, { unique: true });
                await collection.createIndex({ email: 1 }, { unique: true });
            }
            if (collectionName === 'vendas') {
                await collection.createIndex({ numeroNota: 1 }, { unique: true });
            }
            
            console.log(`✅ Collection ${collectionName} verificada/criada`);
        }
    }

    async disconnect() {
        await this.client.close();
        console.log('🔌 Conexão com MongoDB fechada');
    }
}

module.exports = new MongoDB();