const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient;

module.exports = {
    async store(req, res){

        //resgatar id da empesa a qual pertence o agendamento
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
        
        // cadastrar agendamento
        const agendamento = await prisma.agendamento.create({
            data:{
                horarioAgendamento: dataHoraISO,
                clienteId: req.body.idCliente,
                prestadorId: req.body.idPrestador,
                empresaId: user.empresa.idEmpresa
            }
        })

        //associar um ou mais serviços ao agendamento 
        if(req.body.idServices.length > 0){
            req.body.idServices.forEach(async (servicoId) => {
                await prisma.agendamento_servicos.create({data:{
                   agendamentoId: agendamento.idAgendamento,
                   servicoId: servicoId
                }})
               });
        }
        
        agendamento.Id_servicos = req.body.idServices
        res.json({message:"Agendamento realizado com sucesso.",info_Ag: agendamento}) 
    },

    async index(req, res){
        const agendamentos = await prisma.agendamento.findMany();
        res.json(agendamentos);
    }
}