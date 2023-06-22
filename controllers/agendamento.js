const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient;
const getID = require('./resource/pegarId.js');
module.exports = {
    async store(req, res) {


        //Resgatar id da empesa a qual pertence o agendamento
        const idE = await getID.empresa(req.session.sessionId)

        console.log(req.body.idCliente)
        //Resgatar o id do cliente 
        let idC = req.body.idCliente
        

        //converter data e hora
        const data = req.body.data.split('/')
        const dataISO = `${data[2]}-${data[1]}-${data[0]}`;
        const dataHoraISO = `${dataISO}T${req.body.horario}:00.000Z`

        // cadastrar agendamento
        const agendamento = await prisma.agendamento.create({
            data: {
                horarioAgendamento: dataHoraISO,
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
        const agendamentos = await prisma.agendamento.findMany();
        res.json(agendamentos);
    },
    async filtrarData(req, res) {

        //Obter o id da empresa que está logada 
        const id = await getID.empresa(req.session.sessionId);

        //Converter data 
        const data = req.body.data.split('/').reverse().join('-')

        //Tratativa de condições de consulta dos agendamentos
        var agendamentosBD = null
        if (data.length == 10) {//Buscar pela data completa (ex: 08/02/2024 )

            agendamentosBD = await prisma.$queryRaw`
        SELECT agendamento.*, cliente.nomeCliente
        FROM agendamento, cliente
        WHERE DATE(horarioAgendamento) = ${data} AND empresaId = ${id} 
        AND agendamento.clienteId=cliente.idCliente
        ORDER BY horarioAgendamento DESC`

        } else if (data.length == 7) {//Buscar pelo mês em algum ano (ex: 02/2024)

            const [ano, mês] = data.split('-')
            agendamentosBD = await prisma.$queryRaw`
        SELECT agendamento.*, cliente.nomeCliente
        FROM agendamento, cliente
        WHERE MONTH(horarioAgendamento) = ${mês} AND YEAR(horarioAgendamento) = ${ano} AND empresaId = ${id} 
        AND agendamento.clienteId=cliente.idCliente
       
        ORDER BY horarioAgendamento DESC`

        } else {//Buscar somente pelo ano (ex: 2024)

            agendamentosBD = await prisma.$queryRaw`
        SELECT agendamento.*, cliente.nomeCliente
        FROM agendamento, cliente
        WHERE YEAR(horarioAgendamento) = ${data} AND empresaId = ${id} 
        AND agendamento.clienteId=cliente.idCliente
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
    async agendar(req, res) {

    },
    async agendamentosDia(req,res){
        console.log('rota agendamentos dias')
    const ID = await getID.empresa(req.session.sessionId)

    const dataHora = new Date().toLocaleDateString()
    const dataDehoje = dataHora.split('/').reverse().join('-')

    //Buscar somente os agendamentos para o dia atual 
    const agendamentosBD = await prisma.$queryRaw`
    SELECT agendamento.*, cliente.nomeCliente
    FROM agendamento, cliente
    WHERE DATE(horarioAgendamento) = ${dataDehoje} AND empresaId = ${ID} 
    AND agendamento.clienteId=cliente.idCliente

    ORDER BY horarioAgendamento DESC`   
    //Estruturar array de agendamentos que será enviado como resposta 
    const agendamentos = []
    for (const agendamento of agendamentosBD) {

        const dataHora = agendamento.horarioAgendamento
        
        const data = new Date(dataHora).toLocaleDateString();
        console.log(data)
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
            profissional: agendamento.nomeEmpresa
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
    res.status(200).json({agendamentos })
    }
}