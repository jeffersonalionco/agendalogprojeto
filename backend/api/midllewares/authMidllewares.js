import jwt from 'jsonwebtoken';
import { logInfo, logError, logWarn } from '../utils/logger.js';

import dotenv from  'dotenv'
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

export async function authMidlleware(req, res, next) {
    logInfo('Middleware de autenticação iniciado', {
        url: req.url,
        method: req.method,
        ip: req.ip || req.connection.remoteAddress
    });

    const authHeader = req.headers['authorization'];

    // verificando se o campo authorization veio acompanhado no headers da requisição. junto com o token
    if (!authHeader) {
        logWarn('Tentativa de acesso sem token de autorização', {
            url: req.url,
            method: req.method,
            ip: req.ip || req.connection.remoteAddress
        });
        return res.status(401).json({ 
            error: "Por favor informe seu token de autorização, para continuar", 
            message: "Por favor informe seu token de autorização, para continuar" 
        });
    }

    // Verificar se veio no formato Bearer 'token' ou seja, se o argumento [1] é o token 
    const token = authHeader.split(" ")[1]; // Bearer token
    if(!token){
        logWarn('Formato de token inválido', {
            authHeader: authHeader,
            url: req.url,
            method: req.method
        });
        return res.status(401).json({ error: "authorization - Formato invalido"});
    }

    try {
        logInfo('Verificando token JWT', { token: token.substring(0, 20) + '...' });
        
        const decodificarToken = jwt.verify(token, JWT_SECRET); // Extraindo dados do token com a chave secreta 
        req.user = decodificarToken; // salvando na requisição para poder usar
        
        logInfo('Token JWT validado com sucesso', {
            userId: decodificarToken.id,
            email: decodificarToken.email,
            tipo: decodificarToken.tipo,
            url: req.url,
            method: req.method
        });
        
        next();

    } catch (error) {
        logError('Erro ao verificar token JWT', error, {
            token: token.substring(0, 20) + '...',
            url: req.url,
            method: req.method,
            errorMessage: error.message
        });
        
        return res.status(500).json( {
            error: error.message, 
            message: "Erro ao fazer requisição"
        });
    }
}