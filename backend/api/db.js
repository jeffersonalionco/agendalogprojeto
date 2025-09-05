import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize('agendalog', 'postgres', 'postgres', {
    host: 'localhost',
    dialect: 'postgres'
});

export default sequelize;