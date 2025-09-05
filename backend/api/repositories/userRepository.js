import User from "../models/User.js";

// Metodo para buscar um usuario na tabela users pelo email
const findByEmail = async (email) => {
    return await User.findOne({ where : { email }});

}

// exporta todos os metodo declarado
export default { findByEmail }