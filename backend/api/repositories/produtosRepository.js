import Produtos from "../models/Produtos.js";
import { logInfo, logError, logWarn } from "../utils/logger.js";
import { Op } from "sequelize";

// metodo pra buscar todos os produtos
const findAll = async () => {
    logInfo('Iniciando busca de todos os produtos');
    
    try {
        const produtos = await Produtos.findAll({
            order: [['descricao', 'ASC']]
        });
        
        logInfo('Produtos encontrados no banco de dados', { total: produtos.length });
        return produtos;
    } catch (error) {
        logError('Erro ao buscar todos os produtos', error);
        throw error;
    }
}

// metodo pra buscar produto por descricao (busca parcial)
const findByDescricao = async (termo) => {
    logInfo('Iniciando busca de produtos por descrição', { termo });
    
    try {
        const produtos = await Produtos.findAll({
            where: {
                descricao: {
                    [Op.iLike]: `%${termo}%` // busca case-insensitive
                }
            },
            order: [['descricao', 'ASC']],
            limit: 50 // limite de resultado pra nao matar performance
        });
        
        logInfo('Produtos encontrados por descrição', { 
            termo, 
            total: produtos.length 
        });
        return produtos;
    } catch (error) {
        logError('Erro ao buscar produtos por descrição', error, { termo });
        throw error;
    }
}

// metodo pra buscar produto por codigo interno
const findByCodigoInterno = async (codigo) => {
    logInfo('Iniciando busca de produto por código interno', { codigo });
    
    try {
        const produto = await Produtos.findOne({
            where: { codigo_interno: codigo }
        });
        
        if (produto) {
            logInfo('Produto encontrado por código interno', { codigo });
        } else {
            logWarn('Produto não encontrado por código interno', { codigo });
        }
        
        return produto;
    } catch (error) {
        logError('Erro ao buscar produto por código interno', error, { codigo });
        throw error;
    }
}

// metodo pra buscar produto por codigo de barras
const findByCodigoBarras = async (codigo) => {
    logInfo('Iniciando busca de produto por código de barras', { codigo });
    
    try {
        const produto = await Produtos.findOne({
            where: { codigo_barras: codigo }
        });
        
        if (produto) {
            logInfo('Produto encontrado por código de barras', { codigo });
        } else {
            logWarn('Produto não encontrado por código de barras', { codigo });
        }
        
        return produto;
    } catch (error) {
        logError('Erro ao buscar produto por código de barras', error, { codigo });
        throw error;
    }
}

// metodo pra buscar produto por id
const findById = async (id) => {
    logInfo('Iniciando busca de produto por ID', { produtoId: id });
    
    try {
        const produto = await Produtos.findByPk(id);
        
        if (produto) {
            logInfo('Produto encontrado por ID', { produtoId: id });
        } else {
            logWarn('Produto não encontrado por ID', { produtoId: id });
        }
        
        return produto;
    } catch (error) {
        logError('Erro ao buscar produto por ID', error, { produtoId: id });
        throw error;
    }
}

// metodo pra criar produto novo
const create = async (produtoData) => {
    logInfo('Iniciando criação de novo produto', { codigo_interno: produtoData.codigo_interno });
    
    try {
        const produto = await Produtos.create(produtoData);
        
        logInfo('Produto criado com sucesso', {
            id: produto.id,
            codigo_interno: produto.codigo_interno,
        });
        
        return produto;
    } catch (error) {
        logError('Erro ao criar produto', error, { codigo_interno: produtoData.codigo_interno });
        throw error;
    }
}

// metodo pra atualizar produto
const update = async (id, produtoData) => {
    logInfo('Iniciando atualização de produto', { produtoId: id });
    
    try {
        const [updatedRowsCount] = await Produtos.update(produtoData, { where: { id } });
        
        if (updatedRowsCount > 0) {
            logInfo('Produto atualizado com sucesso', { produtoId: id });
            return await findById(id);
        } else {
            logWarn('Nenhum produto foi atualizado', { produtoId: id });
            return null;
        }
    } catch (error) {
        logError('Erro ao atualizar produto', error, { produtoId: id });
        throw error;
    }
}

// metodo pra deletar produto
const remove = async (id) => {
    logInfo('Iniciando remoção de produto', { produtoId: id });
    
    try {
        const deletedRowsCount = await Produtos.destroy({ where: { id } });
        
        if (deletedRowsCount > 0) {
            logInfo('Produto removido com sucesso', { produtoId: id });
            return true;
        } else {
            logWarn('Nenhum produto foi removido', { produtoId: id });
            return false;
        }
    } catch (error) {
        logError('Erro ao remover produto', error, { produtoId: id });
        throw error;
    }
}

// exporto todos os metodos desse arquivo
export default {
    findAll,
    findByDescricao,
    findByCodigoInterno,
    findByCodigoBarras,
    findById,
    create,
    update,
    remove
}

