import bcrypt from  "bcrypt";
import jwt from   "jsonwebtoken";
import userRepository from "../repositories/userRepository.js";
import { logInfo, logError, logWarn } from "../utils/logger.js";
import dotenv from  'dotenv'
dotenv.config()

const SECRET = process.env.JWT_SECRET

const login =  async (email, senha) => {
    logInfo('Iniciando processo de autenticação no serviço', { email });
    
    try {
        logInfo('Buscando usuário no banco de dados', { email });
        const user = await userRepository.findByEmail(email);
        
        if(!user) {
            logWarn('Usuário não encontrado', { email });
            throw new Error("Usuario não encontrado");
        }

        logInfo('Usuário encontrado', { 
            userId: user.id, 
            email: user.email, 
            tipo: user.tipo 
        });

        // comparar senhas enviada com a do banco de dados
        logInfo('Verificando senha do usuário', { userId: user.id });
        const isPasswordValid = senha === user.senha;
        
        if(!isPasswordValid) {
            logWarn('Senha inválida fornecida', { 
                userId: user.id, 
                email: user.email 
            });
            throw new Error("Senha Invalida");
        }

        logInfo('Senha validada com sucesso', { userId: user.id });

        // gerar token JWT 
        logInfo('Gerando token JWT', { userId: user.id });
        const token = jwt.sign(
            {
                id: user.id, email: user.email, tipo: user.tipo
            },
            SECRET,
            {
                expiresIn: '30m'
            }
        );

        logInfo('Token JWT gerado com sucesso', { 
            userId: user.id, 
            tokenExpiry: '30m' 
        });

        const result = { 
            token, 
            user: { id: user.id, email: user.email }, 
            tipo: user.tipo 
        };

        logInfo('Processo de autenticação concluído com sucesso', {
            userId: user.id,
            email: user.email,
            tipo: user.tipo
        });

        return result;

    } catch (error) {
        logError('Erro durante processo de autenticação', error, { email });
        throw error;
    }
}

export default { login }
