const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
    async getDataHome(req, res) { 
        const idSession = parseInt(req.sessionID)
        console.log(idSession)
        
        //Obter dados do usuario ao logar
        const usuario = await prisma.usuarios.findFirst({
            where: {
                session: {
                    some: {
                        idSession: {
                            equals: idSession
                        }
                    }
                }
            },
            select: {
                nomeUsuario: true,
                empresa: true
            }
        })
        //Buscar todos os agendamentos
        console.log('ID da empresa: '+idE)
        const idE = usuario.empresa.idEmpresa
        const agendamentosBD = await prisma.$queryRaw`
        SELECT agendamento.*, cliente.nomeCliente
        FROM agendamento, cliente
        WHERE  empresaId = ${idE} 
        AND agendamento.clienteId=cliente.idCliente
        AND agendamento.estado = 'PENDENTE'
        ORDER BY horarioAgendamento DESC`   
        //Estruturar array de agendamentos que será enviado como resposta 
        const agendamentos = []
        for (const agendamento of agendamentosBD) {

            const dataHora = agendamento.horarioAgendamento
            const data = dataHora.toLocaleDateString('pt-br');
            const horario = dataHora.toLocaleTimeString('pt-br').substring(0,5)     

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
                idA: agendamento.idAgendamento,
                nome: agendamento.nomeCliente,
                data: data,
                horario: horario,
                servicos: []
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

