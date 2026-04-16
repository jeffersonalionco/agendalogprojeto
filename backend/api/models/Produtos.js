import { DataTypes } from "sequelize";
import sequelize from "../db.js";

/**
 * modelo de produtos (sequelize)
 * @typedef {Object} Produtos
 * @property {number} id - id do produto
 * @property {string} codigo_interno - codigo interno do produto
 * @property {string} codigo_barras - codigo de barras
 * @property {string} descricao - descricao do produto
 * @property {number} valor_venda - valor de venda
 * @property {number} valor_custo - valor de custo
 * @property {number} quantidade_estoque - qtd no estoque
 */

const Produtos = sequelize.define('Produtos', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    codigo_interno: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    codigo_barras: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    descricao: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    valor_venda: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    valor_custo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    quantidade_estoque: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: "produtos",
    timestamps: false,
});

export default Produtos;

