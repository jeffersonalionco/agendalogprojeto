import authService from "../services/authService.js";
import userRepository from "../repositories/userRepository.js";
import { logInfo, logError, logWarn } from "../utils/logger.js";

const login = async (req, res) => {
    logInfo('Tentativa de login iniciada', {
        email: req.body.email,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
    });

    try {
        const {email, senha} = req.body;

        // validacao basica dos dados de entrada
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

const listFornecedores = async (req, res) => {
    logInfo('Buscando lista de fornecedores');
    
    try {
        const fornecedores = await userRepository.findAllFornecedores();
        res.json(fornecedores);
    } catch (error) {
        logError('Erro ao buscar fornecedores', error);
        res.status(500).json({ error: 'Erro ao buscar fornecedores' });
    }
}

const getPerfil = async (req, res) => {
    logInfo('Buscando perfil do usuário', { userId: req.user?.id });
    
    try {
        // vejo se req.user existe
        if (!req.user || !req.user.id) {
            logWarn('Usuário não autenticado na requisição de perfil');
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        const user = await userRepository.findProfileById(req.user.id);
        
        if (!user) {
            logWarn('Perfil não encontrado', { userId: req.user.id });
            return res.status(404).json({ error: 'Perfil não encontrado' });
        }
        
        logInfo('Perfil encontrado com sucesso', { userId: user.id });
        res.json(user);
    } catch (error) {
        logError('Erro ao buscar perfil', error, { userId: req.user?.id });
        res.status(500).json({ 
            error: 'Erro ao buscar perfil',
            message: error.message || 'Erro desconhecido'
        });
    }
}

const updatePerfil = async (req, res) => {
    logInfo('Atualizando perfil do usuário', { userId: req.user?.id });
    
    try {
        // Verifica se req.user existe
        if (!req.user || !req.user.id) {
            logWarn('Usuário não autenticado na requisição de atualização de perfil');
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        const { nome, data_nascimento, telefone, imagem_perfil } = req.body;
        
        // campos que pode atualizar (nao deixo mexer em email/senha/tipo)
        const dadosAtualizacao = {};
        
        if (nome !== undefined) dadosAtualizacao.nome = nome;
        if (data_nascimento !== undefined) dadosAtualizacao.data_nascimento = data_nascimento;
        if (telefone !== undefined) dadosAtualizacao.telefone = telefone;
        if (imagem_perfil !== undefined) dadosAtualizacao.imagem_perfil = imagem_perfil;
        
        // atualizo o updated_at aqui
        dadosAtualizacao.updated_at = new Date();
        
        const userAtualizado = await userRepository.update(req.user.id, dadosAtualizacao);
        
        if (!userAtualizado) {
            logWarn('Nenhum perfil foi atualizado', { userId: req.user.id });
            return res.status(404).json({ error: 'Perfil não encontrado' });
        }
        
        // retorno o perfil atualizado sem a senha
        const perfilAtualizado = await userRepository.findProfileById(req.user.id);
        
        logInfo('Perfil atualizado com sucesso', { userId: req.user.id });
        res.json(perfilAtualizado);
    } catch (error) {
        logError('Erro ao atualizar perfil', error, { userId: req.user?.id });
        res.status(500).json({ 
            error: 'Erro ao atualizar perfil',
            message: error.message || 'Erro desconhecido'
        });
    }
}

const listarUsuarios = async (req, res) => {
    logInfo('Buscando lista de todos os usuários', { adminId: req.user.id });
    
    try {
        const usuarios = await userRepository.findAll();
        logInfo('Lista de usuários retornada com sucesso', { total: usuarios.length });
        res.json(usuarios);
    } catch (error) {
        logError('Erro ao buscar lista de usuários', error, { adminId: req.user.id });
        res.status(500).json({ error: 'Erro ao buscar lista de usuários' });
    }
}

const criarUsuario = async (req, res) => {
    logInfo('Criando novo usuário', { adminId: req.user.id });
    
    try {
        const { email, senha, tipo, nome, telefone, data_nascimento } = req.body;

        // validacoes
        if (!email || !senha || !tipo) {
            return res.status(400).json({ error: 'Email, senha e tipo são obrigatórios' });
        }

        // valido tipo de usuario
        const tiposValidos = ['admin', 'cliente', 'fornecedor'];
        if (!tiposValidos.includes(tipo)) {
            return res.status(400).json({ error: `Tipo inválido. Tipos válidos: ${tiposValidos.join(', ')}` });
        }

        // vejo se o email ja existe
        const usuarioExistente = await userRepository.findByEmail(email);
        if (usuarioExistente) {
            logWarn('Tentativa de criar usuário com email já existente', { email, adminId: req.user.id });
            return res.status(400).json({ error: 'Este email já está cadastrado' });
        }

        // preparo os dados do usuario
        const dadosUsuario = {
            email,
            senha, // Por enquanto, senha em texto plano (conforme sistema atual)
            tipo,
            nome: nome || null,
            telefone: telefone || null,
            data_nascimento: data_nascimento || null
        };

        // crio o usuario
        const novoUsuario = await userRepository.create(dadosUsuario);

        // retorno o usuario criado sem a senha
        const usuarioSemSenha = await userRepository.findProfileById(novoUsuario.id);

        logInfo('Usuário criado com sucesso', { 
            userId: novoUsuario.id, 
            email: novoUsuario.email,
            tipo: novoUsuario.tipo,
            adminId: req.user.id 
        });

        res.status(201).json(usuarioSemSenha);
    } catch (error) {
        logError('Erro ao criar usuário', error, { adminId: req.user.id });
        res.status(500).json({ 
            error: 'Erro ao criar usuário',
            message: error.message || 'Erro desconhecido'
        });
    }
}

const atualizarUsuario = async (req, res) => {
    logInfo('Atualizando usuário', { userId: req.params.id, adminId: req.user.id });
    
    try {
        const { id } = req.params;
        const { email, senha, tipo, nome, telefone, data_nascimento } = req.body;

        // vejo se o usuario existe
        const usuarioExistente = await userRepository.findById(id);
        if (!usuarioExistente) {
            logWarn('Tentativa de atualizar usuário inexistente', { userId: id, adminId: req.user.id });
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // preparo dados pra atualizar
        const dadosAtualizacao = {};
        
        if (email !== undefined) {
            // vejo se o email ja ta em uso por outro usuario
            const emailEmUso = await userRepository.findByEmail(email);
            if (emailEmUso && emailEmUso.id !== parseInt(id)) {
                logWarn('Tentativa de atualizar com email já existente', { email, userId: id, adminId: req.user.id });
                return res.status(400).json({ error: 'Este email já está cadastrado' });
            }
            dadosAtualizacao.email = email;
        }
        
        if (senha !== undefined && senha !== '') {
            dadosAtualizacao.senha = senha;
        }
        
        if (tipo !== undefined) {
            const tiposValidos = ['admin', 'cliente', 'fornecedor'];
            if (!tiposValidos.includes(tipo)) {
                return res.status(400).json({ error: `Tipo inválido. Tipos válidos: ${tiposValidos.join(', ')}` });
            }
            dadosAtualizacao.tipo = tipo;
        }
        
        if (nome !== undefined) dadosAtualizacao.nome = nome;
        if (telefone !== undefined) dadosAtualizacao.telefone = telefone;
        if (data_nascimento !== undefined) dadosAtualizacao.data_nascimento = data_nascimento;
        
        // atualizo o updated_at
        dadosAtualizacao.updated_at = new Date();

        const usuarioAtualizado = await userRepository.update(id, dadosAtualizacao);
        
        if (!usuarioAtualizado) {
            logWarn('Nenhum usuário foi atualizado', { userId: id, adminId: req.user.id });
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // retorno o usuario atualizado sem a senha
        const usuarioSemSenha = await userRepository.findProfileById(id);

        logInfo('Usuário atualizado com sucesso', { 
            userId: id, 
            adminId: req.user.id 
        });

        res.json(usuarioSemSenha);
    } catch (error) {
        logError('Erro ao atualizar usuário', error, { userId: req.params.id, adminId: req.user.id });
        res.status(500).json({ 
            error: 'Erro ao atualizar usuário',
            message: error.message || 'Erro desconhecido'
        });
    }
}

const excluirUsuario = async (req, res) => {
    logInfo('Excluindo usuário', { userId: req.params.id, adminId: req.user.id });
    
    try {
        const { id } = req.params;

        // vejo se o usuario existe
        const usuarioExistente = await userRepository.findById(id);
        if (!usuarioExistente) {
            logWarn('Tentativa de excluir usuário inexistente', { userId: id, adminId: req.user.id });
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // nao deixo excluir ele msm
        if (parseInt(id) === req.user.id) {
            logWarn('Tentativa de excluir próprio usuário', { userId: id, adminId: req.user.id });
            return res.status(400).json({ error: 'Você não pode excluir seu próprio usuário' });
        }

        const removido = await userRepository.remove(id);
        
        if (!removido) {
            logWarn('Nenhum usuário foi excluído', { userId: id, adminId: req.user.id });
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        logInfo('Usuário excluído com sucesso', { 
            userId: id, 
            adminId: req.user.id 
        });

        res.json({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
        logError('Erro ao excluir usuário', error, { userId: req.params.id, adminId: req.user.id });
        res.status(500).json({ 
            error: 'Erro ao excluir usuário',
            message: error.message || 'Erro desconhecido'
        });
    }
}

export default { login, listFornecedores, getPerfil, updatePerfil, listarUsuarios, criarUsuario, atualizarUsuario, excluirUsuario }