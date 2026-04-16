import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// config dos formato de log (pra nao ficar uma zona)
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        
        // adiciono infos extra se tiver
        if (Object.keys(meta).length > 0) {
            log += ` | Meta: ${JSON.stringify(meta)}`;
        }
        
        // boto stack trace quando for erro
        if (stack) {
            log += `\nStack: ${stack}`;
        }
        
        return log;
    })
);

// config do logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'agendalog-backend' },
    transports: [
        // transport pro console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        
        // transport pra arquivo (todos os logs)
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        
        // transport so pros erros
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        
        // transport pro log de acesso
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/access.log'),
            level: 'info',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    ],
});

// crio a pasta de logs se nao existir
import fs from 'fs';
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// metodos de atalho pra log (pra nao ficar chamando winston direto)
export const logInfo = (message, meta = {}) => {
    logger.info(message, meta);
};

export const logError = (message, error = null, meta = {}) => {
    if (error) {
        logger.error(message, { error: error.message, stack: error.stack, ...meta });
    } else {
        logger.error(message, meta);
    }
};

export const logWarn = (message, meta = {}) => {
    logger.warn(message, meta);
};

export const logDebug = (message, meta = {}) => {
    logger.debug(message, meta);
};

// middleware pra log de requisicao http
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // log da req recebida
    logInfo('Requisição recebida', {
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        body: req.method !== 'GET' ? req.body : undefined
    });
    
    // intercepto o res.end pra logar a resposta tbm
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
        const duration = Date.now() - start;
        
        logInfo('Resposta enviada', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            contentLength: res.get('Content-Length') || 0
        });
        
        originalEnd.call(this, chunk, encoding);
    };
    
    next();
};

export default logger;
