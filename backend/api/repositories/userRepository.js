import User from "../models/User.js";
import { logInfo, logError, logWarn } from "../utils/logger.js";

// metodo pra buscar usuario na tabela users pelo email
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

// metodo pra buscar usuario na tabela users pelo id
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

// metodo pra criar usuario novo
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

// metodo pra atualizar usuario
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

// metodo pra deletar usuario
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

// metodo pra buscar todos os fornecedores
const findAllFornecedores = async () => {
    logInfo('Iniciando busca de todos os fornecedores');
    
    try {
        const fornecedores = await User.findAll({ 
            where: { tipo: 'fornecedor' },
            attributes: ['id', 'email'] // retorno so id e email (sem senha)
        });
        
        logInfo('Fornecedores encontrados no banco de dados', { total: fornecedores.length });
        return fornecedores;
    } catch (error) {
        logError('Erro ao buscar fornecedores', error);
        throw error;
    }
}

// metodo pra buscar perfil do usuario (sem senha)
const findProfileById = async (id) => {
    logInfo('Buscando perfil do usuário', { userId: id });
    
    try {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['senha'] } // tiro a senha do resultado
        });
        
        if (user) {
            logInfo('Perfil do usuário encontrado', { userId: user.id });
        } else {
            logWarn('Perfil do usuário não encontrado', { userId: id });
        }
        
        return user;
    } catch (error) {
        logError('Erro ao buscar perfil do usuário', error, { userId: id });
        throw error;
    }
}

// metodo pra buscar todos os usuarios (sem senha)
const findAll = async () => {
    logInfo('Buscando todos os usuários');
    
    try {
        const users = await User.findAll({
            attributes: { exclude: ['senha'] }, // tiro a senha do resultado
            order: [['id', 'ASC']]
        });
        
        logInfo('Usuários encontrados no banco de dados', { total: users.length });
        return users;
    } catch (error) {
        logError('Erro ao buscar usuários', error);
        throw error;
    }
}

// exporto todos os metodos daqui
export default { 
    findByEmail, 
    findById, 
    findAllFornecedores,
    findProfileById,
    findAll,
    create, 
    update, 
    remove 
}