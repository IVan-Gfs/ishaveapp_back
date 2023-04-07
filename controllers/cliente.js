const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

module.exports = {
    async store(req, res){      
         const newClient = await prisma.cliente.create({data: req.body})
         res.json(newClient)
         console.log(req.body)

       
    },
    async index(req, res){
        const clients = await prisma.cliente.findMany()
        res.json(clients)
        
    }
}