import { Sequelize, DataTypes } from "sequelize";
import { logInfo, logError, logWarn } from "./utils/logger.js";

// config de conexao com o postgres (via env), deixei bem direto
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 5432;
const dbName = process.env.DB_NAME || 'agendalog';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = String(process.env.DB_PASSWORD ?? '');

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: (msg) => {
        // log das query sql em modo debug (so pra eu ver o q ta rolando)
        logInfo('SQL Query executada', { query: msg });
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    retry: {
        match: [
            /ETIMEDOUT/,
            /EHOSTUNREACH/,
            /ECONNRESET/,
            /ECONNREFUSED/,
            /ETIMEDOUT/,
            /ESOCKETTIMEDOUT/,
            /EHOSTUNREACH/,
            /EPIPE/,
            /EAI_AGAIN/,
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /SequelizeHostNotFoundError/,
            /SequelizeHostNotReachableError/,
            /SequelizeInvalidConnectionError/,
            /SequelizeConnectionTimedOutError/
        ],
        max: 3
    }
});

// event listeners da conexao (se tiver connectionManager, ai eu uso)
if (sequelize.connectionManager && typeof sequelize.connectionManager.on === 'function') {
    sequelize.connectionManager.on('connect', () => {
        logInfo('Nova conexão estabelecida com o banco de dados');
    });

    sequelize.connectionManager.on('disconnect', () => {
        logWarn('Conexão com banco de dados perdida');
    });

    sequelize.connectionManager.on('error', (err) => {
        logError('Erro na conexão com banco de dados', err);
    });
}

export default sequelize;