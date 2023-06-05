const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient;

module.exports = {
    async store(req, res) {

        //resgatar id da empesa a qual pertence o agendamento
        const user = await prisma.usuarios.findFirst({
            where: {
                session: {
                    some: {
                        idSession: {
                            equals: req.session.sessionId
                        }
                    }
                }
            }, select: {
                empresa: {
                    select: {
                        idEmpresa: true
                    }
                }
            }
        })

        //converter data e hora
        const data = req.body.data.split('/')
        const dataISO = `${data[2]}-${data[1]}-${data[0]}`;
        const dataHoraISO = `${dataISO}T${req.body.horario}:00.000Z`

        // cadastrar agendamento
        const agendamento = await prisma.agendamento.create({
            data: {
                horarioAgendamento: dataHoraISO,
                clienteId: req.body.idCliente,
                prestadorId: req.body.idPrestador,
                empresaId: user.empresa.idEmpresa
            }
        })

        //associar um ou mais serviços ao agendamento 
        if (req.body.idServices.length > 0) {
            req.body.idServices.forEach(async (servicoId) => {
                await prisma.agendamento_servicos.create({
                    data: {
                        agendamentoId: agendamento.idAgendamento,
                        servicoId: servicoId
                    }
                })
            });
        }

        agendamento.Id_servicos = req.body.idServices
        res.json({ message: "Agendamento realizado com sucesso.", info_Ag: agendamento })
    },

    async index(req, res) {
        const agendamentos = await prisma.agendamento.findMany();
        res.json(agendamentos);
    },
    async filtrarData(req, res) {

        //Obter o id da empresa que está logada 
        const sessionId = req.session.sessionId
        const empresa = await prisma.$queryRaw`
        SELECT usuarios.empresaId FROM usuarios, session 
        WHERE usuarios.idUsuario = session.usuarioId
        AND session.idSession = ${sessionId}`
        const id = empresa[0].empresaId

        //Converter data 
        const data = req.body.data.split('/').reverse().join('-')

        //Tratativa de condições de consulta dos agendamentos
        var agendamentosBD = null
        if (data.length == 10) {//Buscar pela data completa (ex: 08/02/2024 )

        agendamentosBD = await prisma.$queryRaw`
        SELECT agendamento.*, cliente.nomeCliente, prestador.nomePrestador
        FROM agendamento, cliente, prestador
        WHERE DATE(horarioAgendamento) = ${data} AND empresaId = ${id} 
        AND agendamento.clienteId=cliente.idCliente
        AND agendamento.prestadorId=prestador.idPrestador
        ORDER BY horarioAgendamento DESC`

        } else if (data.length == 7) {//Buscar pelo mês em algum ano (ex: 02/2024)

            const [ano, mês] = data.split('-')
        agendamentosBD = await prisma.$queryRaw`
        SELECT agendamento.*, cliente.nomeCliente, prestador.nomePrestador
        FROM agendamento, cliente, prestador
        WHERE MONTH(horarioAgendamento) = ${mês} AND YEAR(horarioAgendamento) = ${ano} AND empresaId = ${id} 
        AND agendamento.clienteId=cliente.idCliente
        AND agendamento.prestadorId=prestador.idPrestador
       
        ORDER BY horarioAgendamento DESC`

        } else {//Buscar somente pelo ano (ex: 2024)

        agendamentosBD = await prisma.$queryRaw`
        SELECT agendamento.*, cliente.nomeCliente, prestador.nomePrestador
        FROM agendamento, cliente, prestador, servico
        WHERE YEAR(horarioAgendamento) = ${data} AND empresaId = ${id} 
        AND agendamento.clienteId=cliente.idCliente
        AND agendamento.prestadorId=prestador.idPrestador
        ORDER BY horarioAgendamento DESC`
        }

        //Estruturar array de agendamentos filtrados
        const agendamentos = []
        for (agendamento of agendamentosBD) {
            const dataHora = new Date(agendamento.horarioAgendamento)
            const dia = dataHora.getDate()
            const mês = dataHora.getMonth()
            const ano = dataHora.getFullYear()
            const data = `${dia}/${mês}/${ano}`
            const horario = `${dataHora.getHours()}:${dataHora.getMinutes()}`

            const objAg = {//estrutura de objeto que representa cada agendamento
                nome: agendamento.nomeCliente,
                data: data,
                horario: horario,
                servicos: [],
                profissional: agendamento.nomePrestador
            }
            const servicos = await prisma.$queryRaw`
              SELECT servico.* FROM servico, agendamento, agendamento_servicos
              WHERE agendamento_servicos.agendamentoId=agendamento.idAgendamento
              AND agendamento_servicos.servicoId=servico.idServico 
              AND agendamento_servicos.agendamentoId=${agendamento.idAgendamento}`

            for (let i = 0; i < servicos.length; i++) {

                const preco = parseFloat(servicos[i].precoServico)
                const servico = {
                    nome: servicos[i].nomeServico,
                    preco: preco.toFixed(2),
                    descricao: servicos[i].descricaoServico
                }   
                objAg.servicos.push(servico)
                  
            }
            agendamentos.push(objAg)        

        }

        // Enviar array de agendamentos filtrados
        res.json({ agendamentos })



    }
}