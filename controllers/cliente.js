const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const getID = require('./resource/pegarId');
const agendamento = require('./agendamento');

module.exports = {
    async store(req, res) {
        var cliente
        var message
        var id = 0
        const nomeCompleto = req.body.nome + ' ' + req.body.sobrenome
        try {
            cliente = await prisma.cliente.create({
                data: {
                    nomeCliente: nomeCompleto,
                    telCliente: req.body.telefone,
                    cpfCliente: req.body.cpf,
                    emailCliente: req.body.email,
                    dataNascCliente: req.body.dataNasc
                }
            })
            message = 'Cliente cadastrado com sucesso'
            id = cliente.idCliente
        } catch (e) {
            message = 'Algo deu errado, Cliente não cadastrado'
        }

        res.json({ message, id })
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
        const clientesQuery = await prisma.$queryRaw`
        SELECT DISTINCT cliente.* FROM cliente, agendamento
        WHERE cliente.idCliente=agendamento.clienteId  
        AND agendamento.empresaId=${id}
        `

        res.json(clientesQuery)

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
        var clientes;
        if (req.body.nome) {

            clientes = await prisma.cliente.findMany({
                where: {
                    agendamento: {
                        some: {
                            empresaId: ID
                        }
                    },
                    nomeCliente: {
                        startsWith: req.body.nome
                    }
                }
            });

        } else if (req.body.telefone) {
            clientes = await prisma.cliente.findMany({
                where: {
                    agendamento: {
                        some: {
                            empresaId: ID
                        }
                    },
                    telCliente: {
                        startsWith: req.body.telefone
                    }
                }
            });
        } else {

            clientes = await prisma.cliente.findFirst({
                where: {
                    agendamento: {
                        some: {
                            empresaId: ID
                        }
                    },
                    cpfCliente: {
                        equals: req.body.cpf
                    }
                }
            });
        }
        var message = clientes ? 'Resultados correspondentes: ' : 'Nenhum resultado correspondente :('

        res.json({ message, clientes })
    }


}