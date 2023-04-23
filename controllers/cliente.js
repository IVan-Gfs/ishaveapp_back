const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

module.exports = {
    async store(req, res){      
         const cliente = await prisma.cliente.create({data: req.body})
         
         res.json(cliente)           
    },
    async index(req, res){
        const clientes = await prisma.cliente.findMany()
        res.json(clientes)

    },

    async checkClient(req, res, next){
        const qtdClientWithCpf = await prisma.cliente.count({
            where:{
                cpfCliente: req.body.cpfCliente
            }
        }) 
        if(qtdClientWithCpf < 1){
            next()
        }else{
            res.send(`<h1>Cliente já cadastrado!</h1>`)
        }     
    }

    
}