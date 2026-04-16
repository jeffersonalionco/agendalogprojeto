import { Op } from "sequelize";
import Duelos from "../models/Duelos.js";
import { logInfo, logError, logWarn } from "../utils/logger.js";

const findById = async (id) => {
    try {
        return await Duelos.findByPk(id);
    } catch (error) {
        logError('Erro ao buscar duelo por ID', error, { dueloId: id });
        throw error;
    }
};

const findOpenById = async (id) => {
    try {
        return await Duelos.findOne({
            where: { id, status: 'aguardando_jogador' }
        });
    } catch (error) {
        logError('Erro ao buscar duelo aberto por ID', error, { dueloId: id });
        throw error;
    }
};

const create = async (dueloData) => {
    try {
        const duelo = await Duelos.create(dueloData);
        logInfo('Duelo criado com sucesso', { dueloId: duelo.id });
        return duelo;
    } catch (error) {
        logError('Erro ao criar duelo', error, { dueloData });
        throw error;
    }
};

const update = async (id, dueloData) => {
    try {
        const [count] = await Duelos.update(dueloData, { where: { id } });
        if (!count) {
            logWarn('Nenhum duelo atualizado', { dueloId: id });
            return null;
        }
        return await findById(id);
    } catch (error) {
        logError('Erro ao atualizar duelo', error, { dueloId: id });
        throw error;
    }
};

const findByUser = async (userId) => {
    try {
        return await Duelos.findAll({
            where: {
                [Op.or]: [{ jogador_a_id: userId }, { jogador_b_id: userId }]
            },
            order: [['updated_at', 'DESC']]
        });
    } catch (error) {
        logError('Erro ao listar duelos do usuário', error, { userId });
        throw error;
    }
};

export default {
    findById,
    findOpenById,
    create,
    update,
    findByUser,
};
