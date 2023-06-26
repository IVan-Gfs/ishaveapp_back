const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient;
const getID = require('./resource/pegarId');
module.exports = {
    async store(req, res) {
        //Resgatar id da empesa a qual pertence o agendamento
        const idE = await getID.empresa(req.body.idSession)
        console.log(req.body.idCliente)

        //Resgatar o id do cliente 
        let idC = req.body.idCliente

        // cadastrar agendamento
        const agendamento = await prisma.agendamento.create({
            data: {
                horarioAgendamento: req.body.data,
                observacao: req.body.observacao,
                clienteId: idC,
                prestadorId: req.body.idPrestador,
                empresaId: idE

            }
        })

        //associar um ou mais serviços ao agendamento 
        if (req.body.idServices) {
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

        //Obter o id da empresa que está logada 
        const idSession = parseInt(req.sessionID)
        const idE = await getID.empresa(idSession);
        

        //Tratativa de condições de consulta dos agendamentos
        var agendamentosBD = null
        if (req.query.data) {
            //Converter data 
            const data = req.query.data.split('/').reverse().join('-')
            if (data.length == 10) {//Buscar pela data completa (ex: 08/02/2024 )

                agendamentosBD = await prisma.$queryRaw`
            SELECT agendamento.*, cliente.nomeCliente
            FROM agendamento, cliente
            WHERE DATE(horarioAgendamento) = ${data} AND empresaId = ${idE} 
            AND agendamento.clienteId=cliente.idCliente
            ORDER BY horarioAgendamento DESC`

            } else if (data.length == 7) {//Buscar pelo mês em algum ano (ex: 02/2024)

                const [ano, mês] = data.split('-')
                agendamentosBD = await prisma.$queryRaw`
            SELECT agendamento.*, cliente.nomeCliente
            FROM agendamento, cliente
            WHERE MONTH(horarioAgendamento) = ${mês} AND YEAR(horarioAgendamento) = ${ano} AND empresaId = ${idE} 
            AND agendamento.clienteId=cliente.idCliente
           
            ORDER BY horarioAgendamento DESC`

            } else {//Buscar somente pelo ano (ex: 2024)

                agendamentosBD = await prisma.$queryRaw`
            SELECT agendamento.*, cliente.nomeCliente
            FROM agendamento, cliente
            WHERE YEAR(horarioAgendamento) = ${data} AND empresaId = ${idE} 
            AND agendamento.clienteId=cliente.idCliente
            ORDER BY horarioAgendamento DESC`
            }
        } else {
            const dataHora = new Date().toLocaleDateString()
            const dataDehoje = dataHora.split('/').reverse().join('-')

            //Buscar somente os agendamentos para o dia atual 
             agendamentosBD = await prisma.$queryRaw`
            SELECT agendamento.*, cliente.nomeCliente
            FROM agendamento, cliente
            WHERE empresaId = ${idE} 
            AND agendamento.clienteId=cliente.idCliente
            AND agendamento.estado = 'PENDENTE'
            ORDER BY horarioAgendamento DESC`
        }

        //Estruturar array de agendamentos filtrados
        const agendamentos = []
        for (agendamento of agendamentosBD) {

            const dataHora = agendamento.horarioAgendamento

            const data = new Date(dataHora).toLocaleDateString();
            const horario = new Date(dataHora).toISOString().substring(11, 16)

            const objAg = {//estrutura de objeto que representa cada agendamento
                nome: agendamento.nomeCliente,
                data: data,
                horario: horario,
                servicos: []
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

    },
    async delete(req, res){
        
        const idA = parseInt(req.query.idA)

        await prisma.agendamento.update({
            where:{
                idAgendamento: idA
            },
            data:{
                estado: 'CANCELADO'
            }
        })
        res.json({message:'Agendamento deletado com sucesso'})
    }
}