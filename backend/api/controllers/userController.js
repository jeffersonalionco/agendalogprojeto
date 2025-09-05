import authService from "../services/authService.js";

const login = async (req, res) =>{

    console.log("controller")

    try {
        const {email, senha} = req.body;

        const result = await authService.login(email, senha);
        res.json(result)
    } catch (error) {
        res.status(401).json({ error: error.message})        
    }
}

export default { login }