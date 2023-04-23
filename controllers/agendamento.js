const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient;

module.exports = {
    async store(req, res){

        const data = req.body.dataAgendamento.replaceAll('/',' ') 
        //junta data e hora e salvo num só campo no banco
        const dataHorarioStr = data +" "+req.body.horarioAgendamento+" UTC-3" 
        const dataHorario = new Date(dataHorarioStr)
        
        const agendamento = await prisma.agendamento.create({
            data:{
                horarioAgendamento: dataHorario,
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