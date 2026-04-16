import { DataTypes } from "sequelize";
import sequelize from "../db.js";

// modelo de pedidos (sequelize)
/**
 * modelo de pedidos
 * @typedef {Object} Pedidos
 * @property {number} id - id do pedido
 * @property {number} id_usuario - id do usuario
 * @property {number} id_fornecedor - id do fornecedor
 * @property {string} numero_pedido - numero do pedido
 * @property {string} descricao - descricao do pedido
 */

const Pedidos = sequelize.define('Pedidos', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_fornecedor: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    numero_pedido: {
        type: DataTypes.STRING,
        allowNull: false, // obrigatorio, gerado automatico no controller
    },
    descricao: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    produtos: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    data_pedido: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    data_entrega: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: "pedidos",
    timestamps: false,
});

export default Pedidos;
