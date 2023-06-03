const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
    async getUser(req, res) {
        //Obter dados do usuário ao logar
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
        //buscar os agendamento que pertencem a empresa do usuário
        const agendamento = await prisma.agendamento.findMany({
            where:{
                empresaId: usuario.empresa.idEmpresa
            }
        })
        
        //test srsr
        console.log({usuario, agendamento})
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