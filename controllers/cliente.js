const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const getID = require('./resource/pegarId')

module.exports = {
    async store(req, res){      
         const cliente = await prisma.cliente.create({data: req.body})
         
         res.json(cliente)           
    },
    async index(req, res){
        //Busca por todos os clientes que foram agendados alguma vez
        const id = await getID.empresa(req.session.sessionId)
        const clientes = await prisma.$queryRaw`
        SELECT cliente.* FROM cliente, agendamento
        WHERE cliente.idCliente=agendamento.clienteId
        AND agendamento.empresaId=${id}
        `
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
            res.json({message:'CPF equivalente!'})
        }
            
    },
    async filtrarClentes(req,res){
        const ID = await getID.empresa(req.session.sessionId)
        console.log(ID)
        const clientes = await prisma.$queryRaw`
        SELECT cliente.* FROM cliente, agendamento
        WHERE cliente.idCliente=agendamento.clienteId
        AND agendamento.empresaId=${ID}
        AND cliente.nomeCliente = ${req.body.nome }`

        
        res.json({clientes})
    },
    async noFilterCpf(req,res,next){//Caso o cpf seja informado sem filtrar, encontrá-lo e passar adiante
          if(req.body.cliente.cpf){
           
            const cliente = await prisma.cliente.findUnique({
                where:{ cpfCliente: req.body.cliente.cpf}
              })
              
              if(cliente){
                req.body.cliente.idCliente = cliente.idCliente

              } 
          }
          
          next() 

    }

    
}