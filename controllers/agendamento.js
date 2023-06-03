const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient;

module.exports = {
    async store(req, res){

        //resgatar id da empesa da qual pertence o agendamento
        const user = await prisma.usuarios.findFirst({
            where:{
                session:{
                    some:{
                        idSession:{
                            equals: req.session.sessionId
                        }
                    }
                }
            },select:{
                empresa:{
                    select:{
                        idEmpresa: true
                    }
                }
            }
        })

        //converter data e hora
         const data = req.body.data.split('/')
         const dataISO = `${data[2]}-${data[1]}-${data[0]}`;
         const dataHoraISO = `${dataISO}T${req.body.horario}:00.000Z`
        
        //cadastrar agendamento
        const agendamento = await prisma.agendamento.create({
            data:{
                horarioAgendamento: dataHoraISO,
                idCliente: req.body.idCliente,
                idSvcPtd: 1,
                empresaId: user.empresa.idEmpresa 
            }
        })    
        res.json(agendamento) 
    },

    async index(req, res){
        const agendamentos = await prisma.agendamento.findMany();
        res.json(agendamentos);
    }
}