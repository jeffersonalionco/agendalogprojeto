import Pedidos from "../models/Pedidos.js";
import { logInfo, logError, logWarn } from "../utils/logger.js";

// metodo pra buscar pedido na tabela pedidos pelo id
const findById = async (id) => {
    logInfo('Iniciando busca de pedido por ID', { pedidoId: id });
    
    try {
        const pedido = await Pedidos.findByPk(id);
        
        if (pedido) {
            logInfo('Pedido encontrado no banco de dados', {
                id: pedido.id,
                numero_pedido: pedido.numero_pedido,
            });
        } else {
            logWarn('Pedido não encontrado no banco de dados', { pedidoId: id });
        }
        
        return pedido;
    } catch (error) {
        logError('Erro ao buscar pedido por ID', error, { pedidoId: id });
        throw error;
    }
}

// metodo pra buscar todos os pedidos na tabela pedidos
const findAll = async () => {
    logInfo('Iniciando busca de todos os pedidos');
    
    try {
        const pedidos = await Pedidos.findAll();
        
        logInfo('Pedidos encontrados no banco de dados', { total: pedidos.length });
        return pedidos;

    } catch (error) {
        logError('Erro ao buscar todos os pedidos', error);
        throw error;
    }
}

// metodo pra buscar pedidos por id_usuario (pedido do cliente)
const findByUsuarioId = async (idUsuario) => {
    logInfo('Iniciando busca de pedidos por ID do usuário', { idUsuario });
    
    try {
        const pedidos = await Pedidos.findAll({ where: { id_usuario: idUsuario } });
        
        logInfo('Pedidos encontrados para o usuário', { 
            idUsuario, 
            total: pedidos.length 
        });
        return pedidos;

    } catch (error) {
        logError('Erro ao buscar pedidos por ID do usuário', error, { idUsuario });
        throw error;
    }
}

// metodo pra buscar pedidos por id_fornecedor (pedido do fornecedor)
const findByFornecedorId = async (idFornecedor) => {
    logInfo('Iniciando busca de pedidos por ID do fornecedor', { idFornecedor });
    
    try {
        const pedidos = await Pedidos.findAll({ where: { id_fornecedor: idFornecedor } });
        
        logInfo('Pedidos encontrados para o fornecedor', { 
            idFornecedor, 
            total: pedidos.length 
        });
        return pedidos;

    } catch (error) {
        logError('Erro ao buscar pedidos por ID do fornecedor', error, { idFornecedor });
        throw error;
    }
}

// metodo pra criar pedido novo
const create = async (pedidoData) => {
    logInfo('Iniciando criação de novo pedido', { numero_pedido: pedidoData.numero_pedido });
    
    try {
        const pedido = await Pedidos.create(pedidoData);
        
        logInfo('Pedido criado com sucesso', {
            id: pedido.id,
            numero_pedido: pedido.numero_pedido,
        });
        
        return pedido;
    } catch (error) {
        logError('Erro ao criar pedido', error, { numero_pedido: pedidoData.numero_pedido });
        throw error;
    }
}

// metodo pra atualizar pedido
const update = async (id, pedidoData) => {
    logInfo('Iniciando atualização de pedido', { pedidoId: id });
    
    try {
        const [updatedRowsCount] = await Pedidos.update(pedidoData, { where: { id } });
        
        if (updatedRowsCount > 0) {
            logInfo('Pedido atualizado com sucesso', { pedidoId: id });


            return await findById(id);
        } else {
            logWarn('Nenhum pedido foi atualizado', { pedidoId: id });
            return null;
        }
    } catch (error) {
        logError('Erro ao atualizar pedido', error, { pedidoId: id });
        throw error;
    }
}

// metodo pra deletar pedido
const remove = async (id) => {
    logInfo('Iniciando remoção de pedido', { pedidoId: id });
    
    try {
        const deletedRowsCount = await Pedidos.destroy({ where: { id } });
        
        if (deletedRowsCount > 0) {
            logInfo('Pedido removido com sucesso', { pedidoId: id });
            return true;
        } else {
            logWarn('Nenhum pedido foi removido', { pedidoId: id });
            return false;
        }
    } catch (error) {
        logError('Erro ao remover pedido', error, { pedidoId: id });
        throw error;
    }
}

// exporto todos os metodos desse arquivo
export default {
    findById,
    findAll,
    findByUsuarioId,
    findByFornecedorId,
    create,
    update,
    remove
}