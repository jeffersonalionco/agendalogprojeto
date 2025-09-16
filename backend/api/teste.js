import User from "./models/User.js";

User.create({
    email: "teste@gmail.com",
    senha: "123456",
    tipo: "admin"
});


async function teste() {
    const user = await User.findOne({
        where: {
            email: "teste@gmail.com"
        }
    });
    console.log(user);
}

teste();