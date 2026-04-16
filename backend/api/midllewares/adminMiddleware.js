import { logWarn } from "../utils/logger.js";

// middleware pra ver se o usuario e admin
export const adminMiddleware = (req, res, next) => {
    // confiro se o user ta autenticado e e admin
    if (!req.user) {
        logWarn('Tentativa de acesso sem autenticação', {
            url: req.url,
            method: req.method
        });
        return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (req.user.tipo !== 'admin') {
        logWarn('Tentativa de acesso não autorizado - usuário não é admin', {
            userId: req.user.id,
            tipo: req.user.tipo,
            url: req.url,
            method: req.method
        });
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    }

    next();
}

