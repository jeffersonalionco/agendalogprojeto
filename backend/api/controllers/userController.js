import authService from "../services/authService.js";
import { logInfo, logError, logWarn } from "../utils/logger.js";

const login = async (req, res) => {
    logInfo('Tentativa de login iniciada', {
        email: req.body.email,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
    });

    try {
        const {email, senha} = req.body;

        // Validação básica dos dados de entrada
        if (!email || !senha) {
            logWarn('Tentativa de login com dados incompletos', {
                email: email ? 'fornecido' : 'ausente',
                senha: senha ? 'fornecido' : 'ausente'
            });
            return res.status(400).json({ error: "Email e senha são obrigatórios" });
        }

        logInfo('Chamando serviço de autenticação', { email });
        const result = await authService.login(email, senha);
        
        logInfo('Login realizado com sucesso', {
            userId: result.user.id,
            email: result.user.email,
            tipo: result.tipo
        });
        
        res.json(result);
    } catch (error) {
        logError('Erro durante tentativa de login', error, {
            email: req.body.email,
            errorMessage: error.message
        });
        
        res.status(401).json({ error: error.message});        
    }
}

export default { login }