const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
    async getUser(req,res){
        const session = await prisma.session.findUnique({
            where:{
                idSession: req.session.sessionId
            }
        })
        const user = await prisma.usuarios.findUnique({
            where:{
                idUsuario: session.idUsuario
            }
        })
        const empresa = await prisma.empresa.findUnique({
            where: {
                idEmpresa: user.empresaId
            }
        })
        const agendamento = await prisma.agendamento.findMany({
            where:{
                empresaId: empresa.idEmpresa
            }
        })
        const objTest = {
            empresa: empresa,
            agendamentos: agendamento
        }
        console.log(objTest)
        res.send(`<h2>Bem-vindo, <u >${user.nomeUsuario}</u>. Nós mantivemos você logado para facilitar sua vida.</h2>`)
    },
    async testSession(req,res, next){
        if(req.session.sessionId){
            next()
        }else{
            res.json({message:'Vá para página inicial'})
        }
    }
}