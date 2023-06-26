const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const getID = require('./resource/pegarId');

module.exports = {
    async store(req, res) {
        var cliente
        var message
        const idSession = parseFloat(req.sessionID)
        console.log("session: " + idSession)
        const idE = await getID.empresa(idSession)
        const nomeCompleto = req.body.nome + ' ' + req.body.sobrenome

        try {
            cliente = await prisma.cliente.create({
                data: {
                    nomeCliente: nomeCompleto,
                    telCliente: req.body.telefone,
                    cpfCliente: req.body.cpf,
                    emailCliente: req.body.email
                }
            })
            await prisma.cliente_empresa.create({
                data: {
                    clienteId: cliente.idCliente,
                    empresaId: idE
                }
            })

            message = 'Cliente cadastrado com sucesso'
        } catch (e) {

            message = 'Algo deu errado, Cliente não cadastrado'
        }

        res.json({ message, cliente })
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
        const idSession = parseInt(req.sessionID);
        const idE = await getID.empresa(idSession)
        var clientes = []
        
        if (req.query.nome || req.query.cpf) {
            console.log('test1')
            var clientes;
            if (req.query.nome) {
                
                clientes = await prisma.cliente_empresa.findMany({
                    where: {
                        empresaId: {
                            equals: idE
                        },
                        cliente: {
                            nomeCliente: {
                                startsWith: req.query.cpf
                            }
                        }
                    },
                    select:{
                        cliente: true
                    }
                        
                    
                })
            } else {
                clientes = await prisma.cliente_empresa.findMany({
                    where: {
                        empresaId: {
                            equals: idE
                        },
                        cliente: {
                            nomeCliente: {
                                equals: req.query.cpf
                            }
                        }
                    },
                    select:{
                        cliente: true
                    }                  
                })
            }
        } else {
           var idClientes = await prisma.$queryRaw`
            SELECT * FROM cliente_empresa 
            WHERE empresaId = ${idE}
            `  
            for(let idCliente of idClientes ){
               var cliente = await prisma.$queryRaw`
                SELECT * FROM cliente 
                WHERE idCliente = ${idCliente.clienteId}
                AND estado = 'A'
                `
                if(cliente.length){
                    clientes.push(cliente[0])
                }
            
            }
        }
        res.json(clientes)

    },
    async delete(req, res){

        const idC = parseInt(req.query.idC);

        await prisma.cliente.update({
            where:{
                idCliente: idC
            },
            data:{
                estado: 'I'
            }
        })
        res.json({message:"Cliente excluido com sucesso"})
    }

}
<<<<<<< HEAD



=======
>>>>>>> cabe05c10a7effd05a37e7d0db9dc156ac3c3cb5
