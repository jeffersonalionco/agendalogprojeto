import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const User = sequelize.define('Users', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    data_nascimento: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    telefone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    imagem_perfil: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    }
},
    {
        tableName: "users",
        timestamps: false
    });

export default User;