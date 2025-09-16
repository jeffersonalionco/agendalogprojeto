import User from "../models/User.js";
import { logInfo, logError, logWarn } from "../utils/logger.js";

// Método para buscar um usuario na tabela users pelo email
const findByEmail = async (email) => {
    logInfo('Iniciando busca de usuário por email', { email });
    
    try {
        const user = await User.findOne({ where: { email } });
        
        if (user) {
            logInfo('Usuário encontrado no banco de dados', {
                userId: user.id,
                email: user.email,
                tipo: user.tipo
            });
        } else {
            logWarn('Usuário não encontrado no banco de dados', { email });
        }
        
        return user;
    } catch (error) {
        logError('Erro ao buscar usuário por email', error, { email });
        throw error;
    }
}

// Método para buscar um usuario na tabela users pelo ID
const findById = async (id) => {
    logInfo('Iniciando busca de usuário por ID', { userId: id });
    
    try {
        const user = await User.findByPk(id);
        
        if (user) {
            logInfo('Usuário encontrado por ID', {
                userId: user.id,
                email: user.email,
                tipo: user.tipo
            });
        } else {
            logWarn('Usuário não encontrado por ID', { userId: id });
        }
        
        return user;
    } catch (error) {
        logError('Erro ao buscar usuário por ID', error, { userId: id });
        throw error;
    }
}

// Método para criar um novo usuário
const create = async (userData) => {
    logInfo('Iniciando criação de novo usuário', { email: userData.email });
    
    try {
        const user = await User.create(userData);
        
        logInfo('Usuário criado com sucesso', {
            userId: user.id,
            email: user.email,
            tipo: user.tipo
        });
        
        return user;
    } catch (error) {
        logError('Erro ao criar usuário', error, { email: userData.email });
        throw error;
    }
}

// Método para atualizar um usuário
const update = async (id, userData) => {
    logInfo('Iniciando atualização de usuário', { userId: id });
    
    try {
        const [updatedRowsCount] = await User.update(userData, { where: { id } });
        
        if (updatedRowsCount > 0) {
            logInfo('Usuário atualizado com sucesso', { userId: id });
            return await findById(id);
        } else {
            logWarn('Nenhum usuário foi atualizado', { userId: id });
            return null;
        }
    } catch (error) {
        logError('Erro ao atualizar usuário', error, { userId: id });
        throw error;
    }
}

// Método para deletar um usuário
const remove = async (id) => {
    logInfo('Iniciando remoção de usuário', { userId: id });
    
    try {
        const deletedRowsCount = await User.destroy({ where: { id } });
        
        if (deletedRowsCount > 0) {
            logInfo('Usuário removido com sucesso', { userId: id });
            return true;
        } else {
            logWarn('Nenhum usuário foi removido', { userId: id });
            return false;
        }
    } catch (error) {
        logError('Erro ao remover usuário', error, { userId: id });
        throw error;
    }
}

// exporta todos os metodos declarados
export default { 
    findByEmail, 
    findById, 
    create, 
    update, 
    remove 
}