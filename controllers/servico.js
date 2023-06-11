const { PrismaClient } = require("@prisma/client");
const getID = require("./resource/pegarId")

const prisma = new PrismaClient;

module.exports = {
    async store(req, res){
        const ID = await getID.empresa(req.session.sessionId)
        req.body.empresaId = ID
        console.log(req.body)
        const servico = await prisma.servico.create({data: req.body})    
        res.json(servico)
    },

    async index(req, res){
        //Consultar todos os serviços de uma determinada empresa
        const ID = await getID.empresa(req.session.sessionId) 
        const servicos = await prisma.servico.findMany({
            where:{
                empresaId: ID
            }
        })
        res.json(servicos);
    }
}