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
  
        //A data de hoje será usada como condição para filtrar agendamentos do dia
        const dataHora = new Date().toLocaleDateString()
        const dataDehoje = dataHora.split('/').reverse().join('-')

        //Buscar somente os agendamentos para o dia atual 
        const id = usuario.empresa.idEmpresa
        const agendamentosBD = await prisma.$queryRaw`
        SELECT agendamento.*, cliente.nomeCliente
        FROM agendamento, cliente
        WHERE DATE(horarioAgendamento) = ${dataDehoje} AND empresaId = ${id} 
        AND agendamento.clienteId=cliente.idCliente
        ORDER BY horarioAgendamento DESC`   
        //Estruturar array de agendamentos que será enviado como resposta 
        const agendamentos = []
        for (const agendamento of agendamentosBD) {

            const dataHora = agendamento.horarioAgendamento
            const data = new Date(dataHora).toLocaleDateString();
            const horario = new Date(dataHora).toISOString().substring(11,16)     

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
                nome: agendamento.nomeCliente,
                data: data,
                horario: horario,
                servicos: [],
                profissional: agendamento.nomePrestador
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
