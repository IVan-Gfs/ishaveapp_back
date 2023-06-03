const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
    async getUser(req, res) {
        const usuario = await prisma.usuarios.findFirst({
            where: {
                session: {
                    some:{
                        idSession:{
                            equals: req.session.sessionId
                        }
                    }
                }
            },
            include:{empresa:true}
        })
        

        console.log(usuario)
        res.send(`<h2>Bem-vindo, <u >${usuario.nomeUsuario}</u>. Nós mantivemos você logado para facilitar sua vida.</h2>`)
    },
    async testSession(req, res, next) {
        if (req.session.sessionId) {
            next()
        } else {
            res.json({ message: 'Vá para página inicial' })
        }
    }
}