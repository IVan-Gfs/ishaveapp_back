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
        if (req.query) {
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
            clientes = await prisma.$queryRaw`
            SELECT cliente.* FROM cliente, cliente_empresa
            WHERE cliente.idCliente=cliente_empresa.clienteId
            AND cliente_empresa.empresaId=${idE}
            `
        }

        res.json(clientes)

    },
    async filterCliente(req, res) {

        const filtro = req.body;
        var cliente = [];
        if (filtro.cpf) {
            console.log(filtro.cpf)
            cliente = await prisma.cliente.findUnique({
                where: { cpfCliente: filtro.cpf }
            })
        } else {
            cliente = await prisma.cliente.findMany({
                where: {
                    nomeCliente: {
                        startsWith: filtro.nome
                    }
                }
            })
        }
        const message = cliente.length ? 'Resultados correspondentes:' : 'Nenhum resultado correspondente.'
        res.json({ message, cliente })
    },
    async filtrarClentes(req, res) {
        const ID = await getID.empresa(req.session.sessionId)

        var message = clientes ? 'Resultados correspondentes: ' : 'Nenhum resultado correspondente :('

        res.json({ message, clientes })
    }


}