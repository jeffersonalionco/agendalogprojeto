import express from "express";
import userController from "../controllers/userController.js";
import { authMidlleware } from "../midllewares/authMidllewares.js";
import { adminMiddleware } from "../midllewares/adminMiddleware.js";
import { logInfo } from "../utils/logger.js";

const router = express.Router();

logInfo('Configurando rotas de usuário');

// rota pra buscar perfil do usuario autenticado
router.get("/perfil", authMidlleware, userController.getPerfil);
logInfo('Rota GET /perfil configurada');

// rota pra atualizar perfil do usuario autenticado
router.put("/perfil", authMidlleware, userController.updatePerfil);
logInfo('Rota PUT /perfil configurada');

// rotas so pra admin
// rota pra listar todos os usuarios
router.get("/", authMidlleware, adminMiddleware, userController.listarUsuarios);
logInfo('Rota GET / (listar usuários) configurada - apenas admin');

// rota pra criar usuario novo
router.post("/", authMidlleware, adminMiddleware, userController.criarUsuario);
logInfo('Rota POST / (criar usuário) configurada - apenas admin');

// rota pra atualizar usuario
router.put("/:id", authMidlleware, adminMiddleware, userController.atualizarUsuario);
logInfo('Rota PUT /:id (atualizar usuário) configurada - apenas admin');

// rota pra excluir usuario
router.delete("/:id", authMidlleware, adminMiddleware, userController.excluirUsuario);
logInfo('Rota DELETE /:id (excluir usuário) configurada - apenas admin');

export default router;

