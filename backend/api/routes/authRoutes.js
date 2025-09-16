import express from "express";
import userController from "../controllers/userController.js";
import { logInfo } from "../utils/logger.js";

const router = express.Router();

logInfo('Configurando rotas de autenticação');

router.post("/login", userController.login);
logInfo('Rota POST /login configurada');

export default router;