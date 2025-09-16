import Express from 'express'
import sequelize from './api/db.js';
import cors from 'cors'
import authRoutes from './api/routes/authRoutes.js'
import { authMidlleware } from './api/midllewares/authMidllewares.js';
import { logInfo, logError, logWarn, requestLogger } from './api/utils/logger.js';

import dotenv from 'dotenv';
dotenv.config()




// Criando um instancia do express
const app = Express();

logInfo('Iniciando aplicação AgendaLog Backend');

// Configuração de CORS
app.use(cors({ origin: ['http://localhost:8080'] }));
logInfo('CORS configurado para origin: http://localhost:8080');

// Middleware para parsing de JSON
app.use(Express.json());
logInfo('Middleware de parsing JSON configurado');

// Middleware de logging de requisições
app.use(requestLogger);
logInfo('Middleware de logging de requisições configurado');

// Rotas de autenticação
app.use('/api/auth', authRoutes);
logInfo('Rotas de autenticação configuradas em /api/auth');


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



// Inicializando conexão com o banco de dados postgresql
logInfo('Tentando conectar com o banco de dados PostgreSQL...');

sequelize.authenticate()
.then((ev) => {
    logInfo("Conexão com o banco realizada com sucesso", {
        database: sequelize.config.database,
        host: sequelize.config.host,
        dialect: sequelize.config.dialect
    });
    
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
