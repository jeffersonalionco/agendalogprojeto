import express from "express";
import userController from "../controllers/userController.js";
import { authMidlleware } from "../midllewares/authMidllewares.js";
import { logInfo } from "../utils/logger.js";

const router = express.Router();

logInfo('Configurando rotas de autenticação');

router.post("/login", userController.login);
logInfo('Rota POST /login configurada');

// rota pra listar fornecedores (precisa autenticacao)
router.get("/fornecedores", authMidlleware, userController.listFornecedores);
logInfo('Rota GET /fornecedores configurada');

export default router;