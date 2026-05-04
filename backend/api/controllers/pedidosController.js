import pedidosRepository from "../repositories/pedidosRepository.js";
import { logInfo, logError, logWarn } from "../utils/logger.js";

// funcao pra gerar numero unico do pedido (pra nao bater)
const gerarNumeroPedido = () => {
    const agora = new Date();
    const ano = String(agora.getFullYear()).slice(-2); // ultimos 2 digitos do ano (ex 24)
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const hora = String(agora.getHours()).padStart(2, '0');
    const minuto = String(agora.getMinutes()).padStart(2, '0');
    
    // formato PED-YYMMDD-HHMM (sem segundos, mais curto)
    return `PED-${ano}${mes}${dia}-${hora}${minuto}`;
};

// agrega contagens para o gráfico (pendente / aguardando+enviado / entregue) — cliente e fornecedor
const agregarResumoStatusPedidos = (pedidos) => {
    let pendente = 0;
    let aguardando = 0;
    let entregue = 0;
    for (const p of pedidos) {
        const s = p.status;
        if (s === 'pendente') pendente++;
        else if (s === 'aguardando envio' || s === 'enviado') aguardando++;
        else if (s === 'entregue') entregue++;
    }
    return { pendente, aguardando, entregue };
};

// GET /pedidos/resumo-status — cliente ou fornecedor (mesmas regras do gráfico no frontend)
const resumoStatus = async (req, res) => {
    const user = req.user;
    logInfo('Resumo de pedidos por status', { userId: user.id, tipo: user.tipo });

    try {
        let pedidos;
        if (user.tipo === 'cliente') {
            pedidos = await pedidosRepository.findByUsuarioId(user.id);
        } else if (user.tipo === 'fornecedor') {
            pedidos = await pedidosRepository.findByFornecedorId(user.id);
        } else {
            return res.status(403).json({ error: 'Resumo disponível apenas para clientes e fornecedores' });
        }
        res.json(agregarResumoStatusPedidos(pedidos));
    } catch (error) {
        logError('Erro ao montar resumo de pedidos', error);
        res.status(500).json({ error: 'Erro ao montar resumo de pedidos' });
    }
};

// metodo pra buscar todos os pedidos (filtra por tipo do user)
const findAll = async (req, res) => {
    const user = req.user; // vem do middleware de autenticacao
    logInfo('Buscando pedidos', { userId: user.id, tipo: user.tipo });
    
    try {
        let pedidos;
        
        if (user.tipo === 'admin') {
            // admin ve todos os pedidos
            pedidos = await pedidosRepository.findAll();
        } else if (user.tipo === 'cliente') {
            // cliente ve so os pedidos dele
            pedidos = await pedidosRepository.findByUsuarioId(user.id);
        } else if (user.tipo === 'fornecedor') {
            // fornecedor ve so os pedidos dele
            pedidos = await pedidosRepository.findByFornecedorId(user.id);
        } else {
            return res.status(403).json({ error: 'Tipo de usuário não autorizado' });
        }
        
        res.json(pedidos);
    } catch (error) {
        logError('Erro ao buscar pedidos', error);
        res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
}

// metodo pra buscar pedido por id (com verificacao de permissao)
const findById = async (req, res) => {
    const user = req.user; // vem do middleware de autenticacao
    const pedidoId = req.params.id;
    logInfo('Buscando um pedido por ID', { pedidoId, userId: user.id, tipo: user.tipo });
    
    try {
        const pedido = await pedidosRepository.findById(pedidoId);
        
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }
        
        // confiro permissoes
        if (user.tipo === 'admin') {
            // admin pode ver qualquer pedido
            return res.json(pedido);
        } else if (user.tipo === 'cliente') {
            // cliente so ve os pedidos dele
            if (pedido.id_usuario !== user.id) {
                return res.status(403).json({ error: 'Você não tem permissão para ver este pedido' });
            }
            return res.json(pedido);
        } else if (user.tipo === 'fornecedor') {
            // fornecedor so ve pedido atribuido pra ele
            if (pedido.id_fornecedor !== user.id) {
                return res.status(403).json({ error: 'Você não tem permissão para ver este pedido' });
            }
            return res.json(pedido);
        }
        
        return res.status(403).json({ error: 'Tipo de usuário não autorizado' });
    } catch (error) {
        logError('Erro ao buscar um pedido por ID', error);
        res.status(500).json({ error: 'Erro ao buscar um pedido por ID' });
    }
}

// metodo pra criar pedido novo (so cliente)
const create = async (req, res) => {
    const user = req.user; // vem do middleware de autenticacao
    logInfo('Tentativa de criar pedido', { userId: user.id, tipo: user.tipo });
    
    // so cliente pode criar pedido
    if (user.tipo !== 'cliente') {
        logWarn('Tentativa de criar pedido por usuário não autorizado', { 
            userId: user.id, 
            tipo: user.tipo 
        });
        return res.status(403).json({ error: 'Apenas clientes podem criar pedidos' });
    }
    
    try {
        // gero o numero do pedido automatico (mesmo se vier no body eu ignoro)
        const numeroPedido = gerarNumeroPedido();
        
        // garanto que id_usuario seja o user logado
        // removo numero_pedido do body se tiver (sempre gero no sistema)
        const { numero_pedido, ...bodySemNumeroPedido } = req.body;
        
        const pedidoData = {
            ...bodySemNumeroPedido,
            id_usuario: user.id,
            numero_pedido: numeroPedido, // sempre gerado automatico pelo sistema
            status: 'pendente', // status inicial sempre pendente
            data_pedido: new Date()
        };
        
        // validacao garanto que numero_pedido saiu
        if (!pedidoData.numero_pedido || pedidoData.numero_pedido.trim() === '') {
            logError('Erro ao gerar número do pedido', new Error('Número do pedido não foi gerado'));
            return res.status(500).json({ error: 'Erro ao gerar número do pedido' });
        }
        
        // validacao basica
        if (!pedidoData.id_fornecedor) {
            return res.status(400).json({ error: 'id_fornecedor é obrigatório' });
        }
        if (!pedidoData.descricao) {
            return res.status(400).json({ error: 'descricao é obrigatória' });
        }
        
        const pedido = await pedidosRepository.create(pedidoData);
        logInfo('Pedido criado com sucesso', { pedidoId: pedido.id, userId: user.id });
        res.status(201).json(pedido);
    } catch (error) {
        logError('Erro ao criar um novo pedido', error);
        res.status(500).json({ error: 'Erro ao criar um novo pedido' });
    }
}

// metodo pra atualizar pedido (fornecedor mexe status, admin faz tudo)
const update = async (req, res) => {
    const user = req.user; // vem do middleware de autenticacao
    const pedidoId = req.params.id;
    logInfo('Tentativa de atualizar pedido', { 
        pedidoId, 
        userId: user.id, 
        tipo: user.tipo 
    });
    
    try {
        // busco o pedido pra ver permissoes
        const pedidoExistente = await pedidosRepository.findById(pedidoId);
        
        if (!pedidoExistente) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }
        
        // admin pode atualizar quase tudo, menos numero_pedido (gerado automatico)
        if (user.tipo === 'admin') {
            // tiro numero_pedido se vier (nao pode alterar)
            const dadosAtualizacao = { ...req.body };
            delete dadosAtualizacao.numero_pedido;
            
            const pedido = await pedidosRepository.update(pedidoId, dadosAtualizacao);
            logInfo('Pedido atualizado por admin', { pedidoId, userId: user.id });
            return res.json(pedido);
        }
        
        // fornecedor so pode atualizar status dos pedidos dele
        if (user.tipo === 'fornecedor') {
            // confiro se o pedido e do fornecedor
            if (pedidoExistente.id_fornecedor !== user.id) {
                logWarn('Fornecedor tentou atualizar pedido de outro fornecedor', {
                    pedidoId,
                    fornecedorId: user.id,
                    pedidoFornecedorId: pedidoExistente.id_fornecedor
                });
                return res.status(403).json({ 
                    error: 'Você só pode atualizar pedidos atribuídos a você' 
                });
            }
            
            // fornecedor so pode mexer no campo status
            if (Object.keys(req.body).length > 1 || !req.body.status) {
                return res.status(400).json({ 
                    error: 'Fornecedor só pode atualizar o campo status' 
                });
            }
            
            // validacao fornecedor so muda de pendente pra aguardando envio
            if (pedidoExistente.status !== 'pendente') {
                return res.status(400).json({ 
                    error: 'Só é possível atualizar pedidos com status "pendente"' 
                });
            }
            
            if (req.body.status !== 'aguardando envio') {
                return res.status(400).json({ 
                    error: 'Fornecedor só pode mudar status de "pendente" para "aguardando envio"' 
                });
            }
            
            const pedido = await pedidosRepository.update(pedidoId, { 
                status: 'aguardando envio' 
            });
            logInfo('Status do pedido atualizado por fornecedor', { 
                pedidoId, 
                fornecedorId: user.id,
                novoStatus: 'aguardando envio'
            });
            return res.json(pedido);
        }
        
        // cliente so atualiza os pedidos dele
        if (user.tipo === 'cliente') {
            // confiro se o pedido e do cliente
            if (pedidoExistente.id_usuario !== user.id) {
                logWarn('Cliente tentou atualizar pedido de outro cliente', {
                    pedidoId,
                    clienteId: user.id,
                    pedidoClienteId: pedidoExistente.id_usuario
                });
                return res.status(403).json({ 
                    error: 'Você só pode atualizar seus próprios pedidos' 
                });
            }
            
            // se o cliente ta confirmando entrega (status entregue)
            if (req.body.status === 'entregue') {
                // pode confirmar se tiver enviado ou aguardando envio
                if (pedidoExistente.status !== 'enviado' && pedidoExistente.status !== 'aguardando envio') {
                    return res.status(400).json({ 
                        error: 'Só é possível confirmar entrega de pedidos com status "enviado" ou "aguardando envio"' 
                    });
                }
                
                // atualizo status pra entregue e seto data_entrega
                const pedido = await pedidosRepository.update(pedidoId, { 
                    status: 'entregue',
                    data_entrega: new Date()
                });
                logInfo('Entrega confirmada por cliente', { 
                    pedidoId, 
                    clienteId: user.id
                });
                return res.json(pedido);
            }
            
            // cliente so edita pedido pendente
            if (pedidoExistente.status !== 'pendente') {
                return res.status(400).json({ 
                    error: 'Só é possível editar pedidos com status "pendente"' 
                });
            }
            
            // cliente pode mexer descricao, produtos, valor, id_fornecedor
            // mas nao pode mexer status direto nem numero_pedido (gerado automatico)
            const camposPermitidos = ['descricao', 'produtos', 'valor', 'id_fornecedor'];
            const dadosAtualizacao = {};
            
            for (const campo of camposPermitidos) {
                if (req.body[campo] !== undefined) {
                    dadosAtualizacao[campo] = req.body[campo];
                }
            }
            
            if (Object.keys(dadosAtualizacao).length === 0) {
                return res.status(400).json({ 
                    error: 'Nenhum campo válido para atualização' 
                });
            }
            
            const pedido = await pedidosRepository.update(pedidoId, dadosAtualizacao);
            logInfo('Pedido atualizado por cliente', { 
                pedidoId, 
                clienteId: user.id,
                camposAtualizados: Object.keys(dadosAtualizacao)
            });
            return res.json(pedido);
        }
        
        return res.status(403).json({ 
            error: 'Tipo de usuário não autorizado' 
        });
        
    } catch (error) {
        logError('Erro ao atualizar um pedido', error);
        res.status(500).json({ error: 'Erro ao atualizar um pedido' });
    }
}

// metodo pra deletar pedido (admin qualquer, cliente so dele)
const remove = async (req, res) => {
    const user = req.user; // vem do middleware de autenticacao
    const pedidoId = req.params.id;
    logInfo('Tentativa de deletar pedido', { pedidoId, userId: user.id, tipo: user.tipo });
    
    try {
        // busco o pedido pra ver permissoes
        const pedidoExistente = await pedidosRepository.findById(pedidoId);
        
        if (!pedidoExistente) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }
        
        // admin pode deletar qualquer pedido
        if (user.tipo === 'admin') {
            const resultado = await pedidosRepository.remove(pedidoId);
            if (resultado) {
                logInfo('Pedido deletado por admin', { pedidoId, userId: user.id });
                return res.json({ message: 'Pedido deletado com sucesso' });
            } else {
                return res.status(404).json({ error: 'Pedido não encontrado' });
            }
        }
        
        // cliente so deleta os pedidos dele
        if (user.tipo === 'cliente') {
            // confiro se o pedido e do cliente
            if (pedidoExistente.id_usuario !== user.id) {
                logWarn('Cliente tentou deletar pedido de outro cliente', {
                    pedidoId,
                    clienteId: user.id,
                    pedidoClienteId: pedidoExistente.id_usuario
                });
                return res.status(403).json({ 
                    error: 'Você só pode deletar seus próprios pedidos' 
                });
            }
            
            // cliente so deleta pedido pendente
            if (pedidoExistente.status !== 'pendente') {
                return res.status(400).json({ 
                    error: 'Só é possível deletar pedidos com status "pendente"' 
                });
            }
            
            const resultado = await pedidosRepository.remove(pedidoId);
            if (resultado) {
                logInfo('Pedido deletado por cliente', { pedidoId, clienteId: user.id });
                return res.json({ message: 'Pedido deletado com sucesso' });
            } else {
                return res.status(404).json({ error: 'Pedido não encontrado' });
            }
        }
        
        // fornecedor nao pode deletar pedido
        return res.status(403).json({ error: 'Você não tem permissão para deletar pedidos' });
        
    } catch (error) {
        logError('Erro ao deletar um pedido', error);
        res.status(500).json({ error: 'Erro ao deletar um pedido' });
    }
}

/*
 * exporto tudo que tem nesse arquivo
 * @typedef {Object} PedidosController
 * @property {function} findAll - busca todos os pedidos
 * @property {function} findById - busca um pedido por id
 * @property {function} create - cria um pedido
 * @property {function} update - atualiza um pedido
 * @property {function} remove - deleta um pedido
 */
export default {
    findAll,
    findById,
    create,
    update,
    remove,
    resumoStatus
}