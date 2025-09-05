import Express from 'express'
import sequelize from './api/db.js';
import cors from 'cors'
import authRoutes from './api/routes/authRoutes.js'
import { authMidlleware } from './api/midllewares/authMidllewares.js';

import dotenv from 'dotenv';
dotenv.config()




// Criando um instancia do express
const app = Express();
app.use(cors({ origin: ['http://localhost:8080'] }))
app.use(Express.json());

// Rotas de autenticação
app.use('/api/auth' ,authRoutes)


app.post('/', () =>{
    res.send('passou')
})
app.get("/", authMidlleware, (req, res) => {
    console.log(req.headers['authorization'])

    res.send("Hello Mundo")
})



// Inicializando conexeção com o banco de dados postgresql
sequelize.authenticate()
.then((ev) => {
    console.log("Conexão com o banco realizado com sucesso");
    app.listen(3009, () => {
    console.log(`Servidor rodando em http://localhost:3009`)
})
})
.catch((err) => {
    console.log("Erro de conexção com o banco de dados" + err)
})
