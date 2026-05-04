import express from "express";
import pedidosController from "../controllers/pedidosController.js";
import { authMidlleware } from "../midllewares/authMidllewares.js";
import { logInfo } from "../utils/logger.js";

const router = express.Router();

logInfo('Configurando rotas de pedidos');

// todas as rotas de pedidos precisa de autenticacao
// rota pra buscar todos os pedidos (filtra por tipo do user)
router.get('/', authMidlleware, pedidosController.findAll);
// resumo por status (cliente ou fornecedor) — antes de /:id pra nao confundir com id
router.get('/resumo-status', authMidlleware, pedidosController.resumoStatus);
// rota pra buscar pedido por id
router.get('/:id', authMidlleware, pedidosController.findById);
// rota pra criar pedido (so cliente)
router.post('/', authMidlleware, pedidosController.create);
// rota pra atualizar pedido (cliente edita pendente, fornecedor mexe status, admin faz tudo)
router.put('/:id', authMidlleware, pedidosController.update);
// rota pra deletar pedido (cliente so pendente, admin qualquer um)
router.delete('/:id', authMidlleware, pedidosController.remove);   

export default router;