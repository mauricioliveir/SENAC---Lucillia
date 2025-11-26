require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const PDFDocument = require("pdfkit");
const path = require('path');
const moment = require("moment-timezone");
const { ObjectId } = require('mongodb');
const database = require('./database');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do transporte de e-mail com Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Middleware para permitir CORS e parsear JSON
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conectar ao MongoDB quando o servidor iniciar
let db;
let dbConnectionAttempted = false;

database.connect().then(database => {
    db = database;
    console.log('✅ Database conectada e pronta para uso');
}).catch(err => {
    console.error('❌ Erro ao conectar com database:', err);
});

// Rota para debug das variáveis de ambiente
app.get('/api/debug-env', (req, res) => {
    res.json({
        mongodb_uri: process.env.MONGODB_URI ? "DEFINIDA" : "NÃO DEFINIDA",
        node_env: process.env.NODE_ENV,
        vercel_url: process.env.VERCEL_URL,
        timestamp: new Date().toISOString()
    });
});

// Rota para registro de usuário
app.post('/api/register', async (req, res) => {
    const { nome, email, password } = req.body;
    try {
        const userExists = await db.collection('users').findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Usuário já cadastrado.' });
        }
        
        const result = await db.collection('users').insertOne({
            nome,
            email,
            password,
            createdAt: new Date()
        });
        
        res.json({ 
            success: true, 
            message: 'Usuário registrado com sucesso!', 
            user: { _id: result.insertedId, nome, email } 
        });
    } catch (err) {
        console.error('Erro ao registrar usuário:', err);
        res.status(500).json({ success: false, message: 'Erro no servidor.' });
    }
});

// Rota para login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    console.log('🔐 Tentativa de login:', { email });
    
    try {
        // Verifica se o database está conectado
        if (!db) {
            console.error('❌ Database não conectada');
            return res.status(500).json({ 
                success: false, 
                message: 'Servidor não conectado ao banco de dados' 
            });
        }

        const user = await db.collection('users').findOne({ email, password });
        
        if (user) {
            console.log('✅ Login bem-sucedido para:', email);
            res.json({ 
                success: true, 
                message: 'Login bem-sucedido!', 
                user: { 
                    _id: user._id, 
                    nome: user.nome, 
                    email: user.email 
                } 
            });
        } else {
            console.log('❌ Credenciais inválidas para:', email);
            res.status(401).json({ 
                success: false, 
                message: 'Credenciais inválidas.' 
            });
        }
    } catch (err) {
        console.error('💥 Erro ao fazer login:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor.',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Erro de conexão'
        });
    }
});

// Rota para solicitação de redefinição de senha
app.post('/api/reset-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await db.collection('users').findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'E-mail não encontrado.' });
        }

        const userPassword = user.password;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Recuperação de Senha',
            text: `Sua senha cadastrada é: ${userPassword}. Recomendamos que altere sua senha assim que possível.`,
        });

        res.json({ success: true, message: 'Senha enviada para seu e-mail!' });

    } catch (err) {
        console.error('Erro ao solicitar redefinição de senha:', err);
        res.status(500).json({ success: false, message: 'Erro no servidor.' });
    }
});

// Rota para cadastro de funcionário
app.post('/api/funcionarios', async (req, res) => {
    const { nome, cpf, rg, filiacao, cep, logradouro, numero, bairro, cidade, estado, telefone, email, cargo_admitido, salario, data_admissao } = req.body;

    try {
        const funcionarioExiste = await db.collection('funcionarios').findOne({
            $or: [{ cpf }, { email }]
        });

        if (funcionarioExiste) {
            return res.status(400).json({ success: false, message: 'Funcionário já cadastrado.' });
        }

        const result = await db.collection('funcionarios').insertOne({
            nome,
            cpf,
            rg,
            filiacao,
            cep,
            logradouro,
            numero,
            bairro,
            cidade,
            estado,
            telefone,
            email,
            cargo_admitido,
            salario: parseFloat(salario),
            data_admissao: data_admissao ? new Date(data_admissao) : new Date(),
            createdAt: new Date()
        });

        res.json({ 
            success: true, 
            message: 'Funcionário cadastrado com sucesso!', 
            funcionario: { _id: result.insertedId, ...req.body } 
        });
    } catch (err) {
        console.error('Erro ao cadastrar funcionário:', err);
        res.status(500).json({ success: false, message: 'Erro no servidor.' });
    }
});

// Rota para buscar funcionário por ID
app.get('/api/funcionarios/:id', async (req, res) => {
    try {
        const funcionario = await db.collection('funcionarios').findOne({ 
            _id: new ObjectId(req.params.id) 
        });
        
        if (!funcionario) {
            return res.status(404).json({ success: false, message: 'Funcionário não encontrado' });
        }
        
        res.json({ success: true, funcionario });
    } catch (err) {
        console.error('Erro ao buscar funcionário:', err);
        res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
});

// Rota para atualizar funcionário
app.put('/api/funcionarios/:id', async (req, res) => {
    try {
        const { nome, cpf, rg, filiacao, cep, logradouro, numero, bairro, cidade, estado, telefone, email, cargo_admitido, salario, data_admissao } = req.body;

        const result = await db.collection('funcionarios').updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $set: {
                    nome,
                    cpf,
                    rg,
                    filiacao,
                    cep,
                    logradouro,
                    numero,
                    bairro,
                    cidade,
                    estado,
                    telefone,
                    email,
                    cargo_admitido,
                    salario: parseFloat(salario),
                    data_admissao: new Date(data_admissao),
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Funcionário não encontrado' });
        }

        res.json({ success: true, message: 'Funcionário atualizado com sucesso!' });
    } catch (err) {
        console.error('Erro ao atualizar funcionário:', err);
        res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
});

// Rota para deletar funcionário
app.delete('/api/funcionarios/:id', async (req, res) => {
    try {
        const result = await db.collection('funcionarios').deleteOne({ 
            _id: new ObjectId(req.params.id) 
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Funcionário não encontrado' });
        }

        res.json({ success: true, message: 'Funcionário deletado com sucesso!' });
    } catch (err) {
        console.error('Erro ao deletar funcionário:', err);
        res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
});

// Rota para listar funcionários
app.get('/api/funcionarios', async (req, res) => {
    try {
        const funcionarios = await db.collection('funcionarios')
            .find()
            .sort({ nome: 1 })
            .toArray();
        res.json({ success: true, funcionarios });
    } catch (err) {
        console.error('Erro ao buscar funcionários:', err);
        res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
});

// Rota para estatísticas do dashboard
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const [
            totalFuncionarios,
            lancamentos,
            vendasHoje,
            totalEstoque
        ] = await Promise.all([
            db.collection('funcionarios').countDocuments(),
            db.collection('tesouraria').find().toArray(),
            db.collection('vendas').find({
                data: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    $lt: new Date(new Date().setHours(23, 59, 59, 999))
                }
            }).toArray(),
            db.collection('estoque').countDocuments()
        ]);

        let totalEntradas = 0;
        let totalSaidas = 0;

        lancamentos.forEach(item => {
            if (item.tipo === "entrada") totalEntradas += parseFloat(item.valor);
            else totalSaidas += parseFloat(item.valor);
        });

        const saldoAtual = totalEntradas - totalSaidas;
        const totalVendasHoje = vendasHoje.reduce((sum, venda) => sum + parseFloat(venda.valor), 0);

        res.json({
            success: true,
            stats: {
                totalFuncionarios,
                saldoAtual,
                totalVendasHoje: vendasHoje.length,
                itensEstoque: totalEstoque
            }
        });
    } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas' });
    }
});

// Rota para adicionar um lançamento financeiro
app.post("/api/tesouraria", async (req, res) => {
    const { tipo, valor, descricao } = req.body;
    
    if (!tipo || isNaN(valor) || valor <= 0 || !descricao) {
        return res.status(400).json({ success: false, message: "Dados inválidos" });
    }

    try {
        const result = await db.collection('tesouraria').insertOne({
            tipo,
            valor: parseFloat(valor),
            descricao,
            data: new Date()
        });
        
        res.json({ 
            success: true, 
            data: { 
                _id: result.insertedId, 
                tipo, 
                valor: parseFloat(valor), 
                descricao, 
                data: new Date() 
            } 
        });
    } catch (err) {
        console.error("Erro ao inserir dados:", err);
        res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
});

// Rota para buscar todos os lançamentos e calcular fluxo de caixa
app.get("/api/tesouraria", async (req, res) => {
    try {
        const lancamentos = await db.collection('tesouraria')
            .find()
            .sort({ data: -1 })
            .toArray();
            
        res.json({ success: true, lancamentos });
    } catch (err) {
        console.error("Erro ao buscar dados:", err);
        res.status(500).json({ success: false, message: "Erro ao buscar dados" });
    }
});

// Rota para contas a pagar
app.post("/api/contas-pagar", async (req, res) => {
    const { descricao, valor, vencimento } = req.body;
    
    try {
        const result = await db.collection('contas_pagar').insertOne({
            descricao,
            valor: parseFloat(valor),
            vencimento: new Date(vencimento),
            status: 'pendente',
            createdAt: new Date()
        });
        
        res.json({ 
            success: true, 
            conta: { 
                _id: result.insertedId, 
                descricao, 
                valor: parseFloat(valor), 
                vencimento: new Date(vencimento),
                status: 'pendente'
            } 
        });
    } catch (err) {
        console.error("Erro ao cadastrar conta a pagar:", err);
        res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
});

// Rota para listar contas a pagar
app.get("/api/contas-pagar", async (req, res) => {
    try {
        const contas = await db.collection('contas_pagar')
            .find()
            .sort({ vencimento: 1 })
            .toArray();
            
        res.json({ success: true, contas });
    } catch (err) {
        console.error("Erro ao buscar contas a pagar:", err);
        res.status(500).json({ success: false, message: "Erro ao buscar dados" });
    }
});

// Rota para contas a receber
app.post("/api/contas-receber", async (req, res) => {
    const { descricao, valor, vencimento } = req.body;
    
    try {
        const result = await db.collection('contas_receber').insertOne({
            descricao,
            valor: parseFloat(valor),
            vencimento: new Date(vencimento),
            status: 'pendente',
            createdAt: new Date()
        });
        
        res.json({ 
            success: true, 
            conta: { 
                _id: result.insertedId, 
                descricao, 
                valor: parseFloat(valor), 
                vencimento: new Date(vencimento),
                status: 'pendente'
            } 
        });
    } catch (err) {
        console.error("Erro ao cadastrar conta a receber:", err);
        res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
});

// Rota para listar contas a receber
app.get("/api/contas-receber", async (req, res) => {
    try {
        const contas = await db.collection('contas_receber')
            .find()
            .sort({ vencimento: 1 })
            .toArray();
            
        res.json({ success: true, contas });
    } catch (err) {
        console.error("Erro ao buscar contas a receber:", err);
        res.status(500).json({ success: false, message: "Erro ao buscar dados" });
    }
});

// Rota para vendas
app.post("/api/vendas", async (req, res) => {
    const { cliente, produto, valor } = req.body;
    
    try {
        const result = await db.collection('vendas').insertOne({
            cliente,
            produto,
            valor: parseFloat(valor),
            data: new Date(),
            numeroNota: `NF${Date.now()}`,
            createdAt: new Date()
        });
        
        res.json({ 
            success: true, 
            venda: { 
                _id: result.insertedId, 
                cliente, 
                produto, 
                valor: parseFloat(valor),
                numeroNota: `NF${Date.now()}`,
                data: new Date()
            } 
        });
    } catch (err) {
        console.error("Erro ao registrar venda:", err);
        res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
});

// Rota para listar vendas
app.get("/api/vendas", async (req, res) => {
    try {
        const vendas = await db.collection('vendas')
            .find()
            .sort({ data: -1 })
            .toArray();
            
        res.json({ success: true, vendas });
    } catch (err) {
        console.error("Erro ao buscar vendas:", err);
        res.status(500).json({ success: false, message: "Erro ao buscar dados" });
    }
});

// Rota para estoque
app.post("/api/estoque", async (req, res) => {
    const { produto, quantidade, valor_unitario, nota_fiscal } = req.body;
    
    try {
        const result = await db.collection('estoque').insertOne({
            produto,
            quantidade: parseInt(quantidade),
            valor_unitario: parseFloat(valor_unitario),
            nota_fiscal,
            data_entrada: new Date(),
            valor_total: parseFloat(quantidade) * parseFloat(valor_unitario),
            createdAt: new Date()
        });
        
        res.json({ 
            success: true, 
            entrada: { 
                _id: result.insertedId, 
                produto, 
                quantidade: parseInt(quantidade),
                valor_unitario: parseFloat(valor_unitario),
                nota_fiscal,
                valor_total: parseFloat(quantidade) * parseFloat(valor_unitario),
                data_entrada: new Date()
            } 
        });
    } catch (err) {
        console.error("Erro ao registrar entrada no estoque:", err);
        res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
});

// Rota para listar estoque
app.get("/api/estoque", async (req, res) => {
    try {
        const estoque = await db.collection('estoque')
            .find()
            .sort({ data_entrada: -1 })
            .toArray();
            
        res.json({ success: true, estoque });
    } catch (err) {
        console.error("Erro ao buscar estoque:", err);
        res.status(500).json({ success: false, message: "Erro ao buscar dados" });
    }
});

// Rota para gerar relatório financeiro em PDF
app.get("/api/relatorio-financeiro", async (req, res) => {
    try {
        const lancamentos = await db.collection('tesouraria')
            .find()
            .sort({ data: -1 })
            .toArray();
        
        let processedLancamentos = [];
        let totalEntradas = 0;
        let totalSaidas = 0;

        lancamentos.forEach(item => {
            const valor = parseFloat(item.valor);
            if (item.tipo === "entrada") totalEntradas += valor;
            else totalSaidas += valor;

            processedLancamentos.push({
                data: moment(item.data).tz("America/Sao_Paulo").format("DD/MM/YYYY - HH:mm"),
                tipo: item.tipo.toUpperCase(),
                descricao: item.descricao,
                valor: valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
                isEntrada: item.tipo === "entrada"
            });
        });

        const saldoFinal = totalEntradas - totalSaidas;

        // Configuração do PDF
        const doc = new PDFDocument({
            margin: 40,
            size: 'A4',
            font: 'Helvetica'
        });

        res.setHeader('Content-Disposition', `attachment; filename="relatorio-financeiro-${moment().format('YYYY-MM-DD')}.pdf"`);
        res.setHeader('Content-Type', 'application/pdf');
        doc.pipe(res);

        const colors = {
            primary: '#2c3e50',
            success: '#27ae60',
            danger: '#e74c3c',
            light: '#f5f5f5'
        };

        // Cabeçalho
        doc.image(path.join(__dirname, 'public', 'assets', 'senac-logo-0.png'), 40, 30, { width: 80 })
           .fontSize(18)
           .fillColor(colors.primary)
           .text('RELATÓRIO FINANCEIRO', 130, 45);

        // Resumo Financeiro
        doc.rect(40, 90, 515, 70)
           .fill(colors.light)
           .stroke(colors.primary);

        doc.fontSize(12)
           .fillColor(colors.primary)
           .text('RESUMO FINANCEIRO', 50, 100, { underline: true });

        const colWidth = 150;
        doc.fontSize(10)
           .text('Total Entradas', 50, 120)
           .text('Total Saídas', 50 + colWidth, 120)
           .text('Saldo Final', 50 + colWidth * 2, 120);

        doc.fontSize(12)
           .fillColor(colors.success)
           .text(`R$ ${totalEntradas.toFixed(2)}`, 50, 135)
           .fillColor(colors.danger)
           .text(`R$ ${totalSaidas.toFixed(2)}`, 50 + colWidth, 135)
           .fillColor(saldoFinal >= 0 ? colors.success : colors.danger)
           .text(`R$ ${Math.abs(saldoFinal).toFixed(2)}`, 50 + colWidth * 2, 135);

        // Tabela de Lançamentos
        const tableTop = 180;
        const titleText = 'LANÇAMENTOS';
        const titleWidth = doc.widthOfString(titleText);
        const centerX = (doc.page.width - titleWidth) / 2;
        
        doc.fontSize(14)
           .fillColor(colors.primary)
           .text(titleText, centerX, tableTop, { underline: true })
           .moveDown(1);

        if (processedLancamentos.length > 0) {
            // Cabeçalho da tabela
            doc.font('Helvetica-Bold')
               .fontSize(10)
               .fillColor('#fff')
               .rect(40, tableTop + 30, 515, 20)
               .fill(colors.primary);

            doc.fillColor('#ffffff')
               .text('Data', 45, tableTop + 35, { width: 100 })
               .text('Tipo', 155, tableTop + 35, { width: 70, align: "center" })
               .text('Descrição', 235, tableTop + 35, { width: 200 })
               .text('Valor (R$)', 445, tableTop + 35, { width: 100, align: "right" });

            // Linhas da tabela
            let y = tableTop + 50;
            processedLancamentos.forEach((item, index) => {
                doc.rect(40, y, 515, 20)
                   .fill(index % 2 === 0 ? '#fff' : colors.light);

                doc.fontSize(9)
                   .fillColor(colors.primary)
                   .text(item.data, 45, y + 5, { width: 100 })
                   .fillColor(item.isEntrada ? colors.success : colors.danger)
                   .text(item.tipo, 155, y + 5, { width: 70, align: "center" })
                   .fillColor(colors.primary)
                   .text(item.descricao, 235, y + 5, { width: 200 })
                   .fillColor(item.isEntrada ? colors.success : colors.danger)
                   .text(item.valor, 445, y + 5, { width: 100, align: "right" });

                y += 20;
            });
        } else {
            doc.fontSize(12)
               .fillColor(colors.primary)
               .text('Nenhum lançamento encontrado.', 50, tableTop + 50);
        }

        doc.end();
    } catch (err) {
        console.error('Erro ao gerar relatório:', err);
        res.status(500).json({ success: false, message: 'Erro ao gerar relatório' });
    }
});

// Rota de teste para validar funcionamento do sistema
app.get('/api/teste', async (req, res) => {
    try {
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(col => col.name);
        
        // Contar documentos em cada collection
        const counts = {};
        for (const collectionName of collectionNames) {
            counts[collectionName] = await db.collection(collectionName).countDocuments();
        }
        
        const systemStatus = {
            success: true,
            message: 'Sistema funcionando corretamente com MongoDB Atlas',
            timestamp: new Date().toISOString(),
            database: {
                connected: true,
                collections: collectionNames,
                documentCounts: counts
            },
            server: {
                port: port,
                environment: process.env.NODE_ENV || 'development'
            }
        };
        
        res.json(systemStatus);
    } catch (err) {
        console.error('Erro no teste do sistema:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao verificar sistema',
            error: err.message 
        });
    }
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para health check
app.get('/api/health', async (req, res) => {
    try {
        const healthStatus = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            server: {
                environment: process.env.NODE_ENV || 'development',
                node_version: process.version,
                uptime: process.uptime()
            },
            database: {
                connected: !!db,
                database_name: db ? 'senac_sistema' : 'disconnected'
            },
            environment: {
                mongodb_uri: process.env.MONGODB_URI ? 'DEFINIDA' : 'NÃO DEFINIDA',
                email_host: process.env.EMAIL_HOST ? 'DEFINIDO' : 'NÃO DEFINIDO'
            }
        };

        // Testa a conexão com o MongoDB se estiver conectado
        if (db) {
            try {
                await db.command({ ping: 1 });
                healthStatus.database.ping = 'OK';
            } catch (pingError) {
                healthStatus.database.ping = 'ERROR';
                healthStatus.database.ping_error = pingError.message;
                healthStatus.status = 'DEGRADED';
            }
        } else {
            healthStatus.status = 'ERROR';
            healthStatus.database.connection_error = 'Database não inicializada';
        }

        res.json(healthStatus);
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// Middleware de erro global
app.use('/api/*', (req, res, next) => {
    if (!db && req.method !== 'GET' && !req.path.includes('/health') && !req.path.includes('/debug')) {
        return res.status(503).json({
            success: false,
            message: 'Serviço temporariamente indisponível. Banco de dados não conectado.',
            timestamp: new Date().toISOString()
        });
    }
    next();
});

// Rota 404
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Rota não encontrada' 
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🛑 Encerrando servidor...');
    process.exit(0);
});

module.exports = app;