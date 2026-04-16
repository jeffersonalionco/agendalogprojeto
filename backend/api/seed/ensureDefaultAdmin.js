import User from '../models/User.js';
import { logInfo, logWarn } from '../utils/logger.js';

/**
 * garanto que exista pelo menos 1 admin no banco
 * se nao tiver nenhum admin, crio um com as credenciais do .env (ADMIN_EMAIL, ADMIN_PASSWORD)
 */
export async function ensureDefaultAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@agendalog.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    try {
        const adminExistente = await User.findOne({ where: { tipo: 'admin' } });
        if (adminExistente) {
            logInfo('Usuário admin já existe', { email: adminExistente.email });
            return;
        }

        await User.create({
            email: adminEmail,
            senha: adminPassword,
            tipo: 'admin',
            nome: 'Administrador'
        });
        logInfo('Usuário admin padrão criado. Faça login para criar outros usuários.', {
            email: adminEmail
        });
    } catch (error) {
        logWarn('Erro ao criar admin padrão (pode já existir)', { message: error?.message });
    }
}
