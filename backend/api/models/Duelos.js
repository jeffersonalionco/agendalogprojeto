import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Duelos = sequelize.define('Duelos', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'aguardando_jogador',
    },
    jogador_a_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    jogador_b_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    jogada_a: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    jogada_b: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    vencedor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    empate: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: "duelos",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

export default Duelos;
