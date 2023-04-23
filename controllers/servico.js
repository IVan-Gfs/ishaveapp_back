const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient;

module.exports = {
    async store(req, res){
        const servico = await prisma.servico.create({data: req.body})    
        res.json(servico)

    },

    async index(req, res){
        const servicos = await prisma.servico.findMany();
        res.json(servicos);
    }
}