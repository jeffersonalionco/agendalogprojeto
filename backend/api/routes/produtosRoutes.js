import express from "express";
import produtosController from "../controllers/produtosController.js";
import { authMidlleware } from "../midllewares/authMidllewares.js";
import { logInfo } from "../utils/logger.js";

const router = express.Router();

logInfo('Configurando rotas de produtos');

// todas as rotas de produto precisa autenticacao
// rota pra buscar produto (com termo opcional)
router.get('/search', authMidlleware, produtosController.search);
// rota pra buscar todos os produtos
router.get('/', authMidlleware, produtosController.findAll);
// rota pra buscar produto por id
router.get('/:id', authMidlleware, produtosController.findById);
// rota pra criar produto (so admin)
router.post('/', authMidlleware, produtosController.create);
// rota pra atualizar produto (so admin)
router.put('/:id', authMidlleware, produtosController.update);
// rota pra deletar produto (so admin)
router.delete('/:id', authMidlleware, produtosController.remove);

export default router;

