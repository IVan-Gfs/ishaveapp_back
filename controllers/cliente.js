const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const getID = require('./resource/pegarId')

module.exports = {
    async store(req, res) {
        var cliente
        var message
        var id = 0
        const nomeCompleto = req.body.nome+' '+req.body.sobrenome
        try{
            cliente = await prisma.cliente.create({ 
                data:{
                    nomeCliente: nomeCompleto,
                    telCliente: req.body.telefone,
                    cpfCliente: req.body.cpf,
                    emailCliente: req.body.email,
                    dataNascCliente: req.body.dataNasc
                }
             })
            message = 'Cliente cadastrado com sucesso'
            id = cliente.idCliente
        }catch(e){
            message = 'Algo deu errado, Cliente não cadastrado'
        }
       
        res.json({ message, id})
    },
    async checkClient(req, res, next) {
        const qtdClientWithCpf = await prisma.cliente.count({
            where: {
                cpfCliente: req.body.cpf
            }
        })
        if (qtdClientWithCpf < 1) {
            next()
        } else {
            res.json({ message: 'CPF equivalente!' })
            console.log(qtdClientWithCpf)
        }

    },
    async index(req, res) {
        //Busca por todos os clientes que foram agendados alguma vez
        const id = await getID.empresa(req.session.sessionId)
        const clientes = await prisma.$queryRaw`
        SELECT DISTINCT cliente.* FROM cliente, agendamento
        WHERE cliente.idCliente=agendamento.clienteId  
        AND agendamento.empresaId=${id}
        `
        res.json(clientes)

    },
    async filterCliente(req, res) {

        filtro = req.body;
        var clienteQuery = null;
        var cliente = null

        if (filtro.cpf) {
            clienteQuery = await prisma.cliente.findUnique({
                where: { cpfCliente: filtro.cpf }
            })
            cliente = clienteQuery
        } else {
            clienteQuery = await prisma.cliente.findMany({
                where: { telCliente: filtro.telefone }
            })
            cliente = clienteQuery[clienteQuery.length - 1]
            
        }
        res.json({ cliente })
    },
    async filtrarClentes(req, res) {
        const ID = await getID.empresa(req.session.sessionId)
        var clientes;
        if (req.body.nome) {
        
          clientes = await prisma.empresa.findMany({
            where:{
                idEmpresa: ID
            }
          })
          clientes = await  prisma.cliente.findMany({
                where: {
                  nomeCliente: {
                    startsWith: req.body.nome
                  }
                }
              })

         } else if(req.body.telefone){
            
            clientes = await prisma.cliente.findMany({
                where:{
                    telCliente:{
                        startsWith: req.body.telefone
                    }
                }
            })
         }else{
            clientes = await prisma.cliente.findMany({
                where:{
                    cpfCliente:{
                        startsWith: req.body.cpf
                    }
                }
            })
         }
         var message = clientes.length ? 'Resultados correspondentes: ' : 'Nenhum resultado correspondente :('
         
        res.json({message, clientes })
    },
    async noFilterCpf(req, res, next) {//Caso o cpf seja informado sem filtrar, encontrá-lo e passar adiante
        if (req.body.cliente.cpf) {

            const cliente = await prisma.cliente.findUnique({
                where: { cpfCliente: req.body.cliente.cpf }
            })

            if (cliente) {
                req.body.cliente.idCliente = cliente.idCliente

            }
        }

        next()

    }


}