import { Sequelize, DataTypes } from "sequelize";
import { logInfo, logError, logWarn } from "./utils/logger.js";

// Configuração de conexão com o banco de dados postgresql
const sequelize = new Sequelize('agendalog', 'postgres', 'postgres', {
    host: 'localhost',
    dialect: 'postgres',
    logging: (msg) => {
        // Log das queries SQL em modo debug
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

// Event listeners para conexão (usando sequelize.connectionManager se disponível)
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