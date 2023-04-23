const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient;

module.exports = {
    async store(req, res){
        const data = req.body.dataAgendamento.replaceAll('/','-')
        // O problema aqui é que o prisma não aceita string em um campo que está definido como datatime.
        // o padrão do mysql é "-", mas isso provavelmente virá com "/"

        
        const agendamento = await prisma.agendamento.create({
            data:{
                // Junta data e horario para um campo só na base de dados
                horarioAgendamento: data +" "+ req.body.horarioAgendamento,
                idCliente: req.body.idCliente,
                idSvcPtd: req.body.idSvcPtd 
            }
        })    
        res.json(agendamento)
    },

    async index(req, res){
        const agendamentos = await prisma.agendamento.findMany();
        res.json(agendamentos);
    }
}