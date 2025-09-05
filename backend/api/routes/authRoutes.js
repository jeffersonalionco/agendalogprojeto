import express from "express";
import userController from "../controllers/userController.js";

const router = express.Router();

console.log("entrou na rota")
router.post("/login", userController.login);

export default router;