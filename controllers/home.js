const { PrismaClient } = require("@prisma/client");
const agendamento = require("./agendamento");
const prisma = new PrismaClient();

module.exports = {
    //NOTA: existe a posibilidade de migrar esse código para o controller de agendamento.
    //Mas por enquanto, vamos deixar aqui.
    async getDataHome(req, res) {
        //Obter dados do usuario ao logar
        const usuario = await prisma.usuarios.findFirst({
            where: {
                session: {
                    some: {
                        idSession: {
                            equals: req.session.sessionId
                        }
                    }
                }
            },
            select: {
                nomeUsuario: true,
                empresa: true
            }
        })

        

        //Buscar os agendamentos que pertencem a empresa do usuário (duas formas)
        
        //Buscar somente os agendamentos para o dia atual 

        //A data de hoje será usada como condição para filtrar agendamentos do dia
        const dataHora = new Date()
        const dataDehoje = `${dataHora.getFullYear()}-${dataHora.getMonth()}-${dataHora.getDate()}`

        const id = usuario.empresa.idEmpresa
        agendamentosBD = await prisma.$queryRaw`
        SELECT agendamento.*, cliente.nomeCliente, prestador.nomePrestador
        FROM agendamento, cliente, prestador, servico
        WHERE DATE(horarioAgendamento) = ${dataDehoje} AND empresaId = ${id} 
        AND agendamento.clienteId=cliente.idCliente
        AND agendamento.prestadorId=prestador.idPrestador
        ORDER BY horarioAgendamento DESC`
        console.log(agendamentosBD)

        //Buscar todos os agendamentos
        const dadosAgends = await prisma.agendamento.findMany({
            where: {
                empresaId: usuario.empresa.idEmpresa,
            },
            include: {
                cliente: true,
                prestador: {
                    include: {
                        usuario: {
                            where: {
                                empresaId: usuario.empresa.idEmpresa
                            }
                        }
                    }
                }

            }
        })


        //Estruturar array de agendamentos que será enviado como resposta 
        const agendamentos = []
        for (const agendamento of dadosAgends) {
            const dataHora = new Date(agendamento.horarioAgendamento);
            const dia = dataHora.getDate()
            const mês = dataHora.getMonth()
            const ano = dataHora.getFullYear()
            const data = dia + "/" + mês + "/" + ano
            const horario = dataHora.getHours() + ":" + dataHora.getMinutes()

            const servicos = await prisma.agendamento_servicos.findMany({
                where: {
                    agendamentoId: agendamento.idAgendamento
                },
                include: {
                    servico: {
                        select: {
                            nomeServico: true,
                            precoServico: true,
                            descricaoServico: true
                        }
                    }
                }
            })

            const objAg = {
                nome: agendamento.cliente.nomeCliente,
                data: data,
                horario: horario,
                servicos: [],
                profissional: agendamento.prestador.nomePrestador
            }

            for (let i = 0; i < servicos.length; i++) {
                const preco = parseFloat(servicos[i].servico.precoServico)
                const servico = {
                    nome: servicos[i].servico.nomeServico,
                    preco: preco.toFixed(2),
                    descricao: servicos[i].servico.descricaoServico,
                }

                objAg.servicos.push(servico)
            }
            agendamentos.push(objAg)
        }
        //Enviar os dados para a home
        res.status(200).json({ usuario, agendamentos })

    },
    async testSession(req, res, next) {
        if (req.session.sessionId) {
            next()
        } else {
            res.json({ message: 'Vá para página inicial' })
        }
    }
}
