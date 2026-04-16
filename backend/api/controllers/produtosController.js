import produtosRepository from "../repositories/produtosRepository.js";
import { logInfo, logError, logWarn } from "../utils/logger.js";

// metodo pra buscar todos os produtos
const findAll = async (req, res) => {
    logInfo('Buscando todos os produtos');
    try {
        const produtos = await produtosRepository.findAll();
        res.json(produtos);
    } catch (error) {
        logError('Erro ao buscar todos os produtos', error);
        res.status(500).json({ error: 'Erro ao buscar todos os produtos' });
    }
}

// metodo pra buscar produto por descricao (busca)
const search = async (req, res) => {
    const termo = req.query.termo || req.query.q || '';
    logInfo('Buscando produtos', { termo });
    
    try {
        let produtos;
        
        if (termo.trim() === '') {
            // se nao tem termo, volta tudo
            produtos = await produtosRepository.findAll();
        } else {
            // busca por descricao
            produtos = await produtosRepository.findByDescricao(termo);
        }
        
        res.json(produtos);
    } catch (error) {
        logError('Erro ao buscar produtos', error);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
}

// metodo pra buscar produto por id
const findById = async (req, res) => {
    logInfo('Buscando um produto por ID', { id: req.params.id });
    try {
        const produto = await produtosRepository.findById(req.params.id);
        
        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        
        res.json(produto);
    } catch (error) {
        logError('Erro ao buscar um produto por ID', error);
        res.status(500).json({ error: 'Erro ao buscar um produto por ID' });
    }
}

// metodo pra criar produto novo
const create = async (req, res) => {
    logInfo('Criando um novo produto', { produto: req.body });
    try {
        const produto = await produtosRepository.create(req.body);
        res.status(201).json(produto);
    } catch (error) {
        logError('Erro ao criar um novo produto', error);
        res.status(500).json({ error: 'Erro ao criar um novo produto' });
    }
}

// metodo pra atualizar produto
const update = async (req, res) => {
    logInfo('Atualizando um produto', { id: req.params.id, produto: req.body });
    try {
        const produto = await produtosRepository.update(req.params.id, req.body);
        
        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        
        res.json(produto);
    } catch (error) {
        logError('Erro ao atualizar um produto', error);
        res.status(500).json({ error: 'Erro ao atualizar um produto' });
    }
}

// metodo pra deletar produto
const remove = async (req, res) => {
    logInfo('Deletando um produto', { id: req.params.id });
    try {
        const resultado = await produtosRepository.remove(req.params.id);
        
        if (!resultado) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        
        res.json({ message: 'Produto deletado com sucesso' });
    } catch (error) {
        logError('Erro ao deletar um produto', error);
        res.status(500).json({ error: 'Erro ao deletar um produto' });
    }
}

export default {
    findAll,
    search,
    findById,
    create,
    update,
    remove
}

