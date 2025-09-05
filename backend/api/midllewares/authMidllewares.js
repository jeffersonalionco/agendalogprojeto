import jwt from 'jsonwebtoken';

import dotenv from  'dotenv'
dotenv.config()


const JWT_SECRET = process.env.JWT_SECRET

export async function authMidlleware(req, res, next) {

    const authHeader = req.headers['authorization'];

    // verificando se o campo authorization venho acompanhado no headers da requisição. junto com o token
    if (!authHeader) {
        return res.status(401).json({ error: "Por favor informe seu token de autorização, para continuar", message: "Por favor informe seu token de autorização, para continuar" })
    }


    // Verrificar se veio no formato Bearer 'token' ou seja, se o argumento [1] é o token 
    const token = authHeader.split(" ")[1] // Bearer token
    if(!token){
        return res.status(401).json({ error: "authorization - Formato invalido"})
    }

    try {

    const decodificarToken = jwt.verify(token, JWT_SECRET) // Extraindo dados do token com a chave secreta 
    req.user = decodificarToken; // salvando na requisição para poder usar
    next()


    } catch (error) {
        return res.status(500).json( {error: error, message: "Erro ao fazer requisição"})
    }


}