import './dotenv-loader.js';
import Express from 'express'
import sequelize from './api/db.js';
import cors from 'cors'
import authRoutes from './api/routes/authRoutes.js'
import pedidosRoutes from './api/routes/pedidosRoutes.js' // puxo as rotas de pedidos aqui
import produtosRoutes from './api/routes/produtosRoutes.js' // puxo as rotas de produtos aqui
import userRoutes from './api/routes/userRoutes.js' // puxo as rotas de usuario aqui
import { authMidlleware } from './api/midllewares/authMidllewares.js';
import { logInfo, logError, logWarn, requestLogger } from './api/utils/logger.js';
import { ensureDefaultAdmin } from './api/seed/ensureDefaultAdmin.js';
import { ensureDefaultProdutos } from './api/seed/ensureDefaultProdutos.js';

// crio uma instancia do express (basico do basico)
const app = Express();

logInfo('Iniciando aplicação AgendaLog Backend');

// cors lista separada por virgula em CORS_ORIGINS (ex http//localhost8080,http//192.168.x.x8080)
const corsOrigins = (process.env.CORS_ORIGINS
  || 'http://localhost:3027,http://127.0.0.1:3027,http://192.168.100.80:3027')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)
logInfo(`CORS configurado para origins: ${corsOrigins.join(', ')}`)

// middleware pra parsear json com limite maior pq tem base64 de img
app.use(Express.json({ limit: '10mb' }));
app.use(Express.urlencoded({ extended: true, limit: '10mb' }));
logInfo('Middleware de parsing JSON configurado (limite: 10mb)');

// middleware de log das requisicoes
app.use(requestLogger);
logInfo('Middleware de logging de requisições configurado');

// rotas de autenticacao
app.use('/api/auth', authRoutes);
logInfo('Rotas de autenticação configuradas em /api/auth');

// rotas de pedidos
app.use('/api/pedidos', pedidosRoutes);
logInfo('Rotas de pedidos configuradas em /api/pedidos');

// rotas de produtos
app.use('/api/produtos', produtosRoutes);
logInfo('Rotas de produtos configuradas em /api/produtos');

// rotas de usuario
app.use('/api/users', userRoutes);
logInfo('Rotas de usuário configuradas em /api/users');


app.post('/', (req, res) => {
    logInfo('Requisição POST recebida na rota raiz');
    res.send('passou');
});

app.get("/", authMidlleware, (req, res) => {
    logInfo('Requisição GET autenticada recebida na rota raiz', {
        userId: req.user?.id,
        userEmail: req.user?.email,
        authorization: req.headers['authorization']
    });
    
    res.send("Hello Mundo");
});



// inicio a conexao com o banco postgresql aqui
logInfo('Tentando conectar com o banco de dados PostgreSQL...');

sequelize.authenticate()
.then(() => {
    logInfo("Conexão com o banco realizada com sucesso", {
        database: sequelize.config.database,
        host: sequelize.config.host,
        dialect: sequelize.config.dialect
    });
    return sequelize.sync({ alter: false });
})
.then(() => {
    logInfo("Tabelas sincronizadas (criadas automaticamente se não existirem)");
    return ensureDefaultAdmin();
})
.then(() => ensureDefaultProdutos())
.then(() => {
    const PORT = process.env.PORT || 3009;
    app.listen(PORT, () => {
        logInfo(`Servidor rodando em http://localhost:${PORT}`, {
            port: PORT,
            environment: process.env.NODE_ENV || 'development'
        });
    });
})
.catch((err) => {
    logError("Erro de conexão com o banco de dados", err, {
        database: sequelize.config.database,
        host: sequelize.config.host,
        dialect: sequelize.config.dialect
    });
});
