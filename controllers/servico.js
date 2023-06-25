const { PrismaClient } = require("@prisma/client");
const getID = require("./resource/pegarId")


const prisma = new PrismaClient;

module.exports = {
    async store(req, res){

        if(req.body.precoServico.includes(',')){
            const [real, centavo] = req.body.precoServico.split(',')
            const preco = real+'.'+centavo
            req.body.precoServico = parseFloat(preco)
        }

        const idSession = parseInt(req.query.id)
        console.log(idSession)
        const idE = await getID.empresa(idSession)
        req.body.empresaId = idE
        const servico = await prisma.servico.create({data: req.body})    
        res.json(servico)
    },
    async index(req, res){
        //Consultar todos os serviços de uma determinada empresa
        const idSession = parseInt(req.sessionID)
        console.log('Session: '+idSession)
        const idE = await getID.empresa(idSession) 
        var servicos = []
        var message;
        if(req.query){
            const filtro = req.query
            if(filtro.nome){
                 servicos = await prisma.servico.findMany({
                    where:{
                        empresaId: idE,
                        nomeServico:{
                            startsWith: filtro.nome
                        }
                    }
                })
            }else{
                servicos = await prisma.servico.findMany({
                    where:{
                        empresaId: idE,
                        categoriaServico: {
                            equals: filtro.categoria
                        }
                    }
                })
            }
        }else{
             servicos = await prisma.servico.findMany({
                where:{
                    empresaId: idE
                }
            })
            message = !servicos ? 'Você ainda não cadastrou nenhum servico.' : ''
        }
         message = servicos ? 'Resultados correspondentes: ' : 'Nenhum resultado correspondente :('
        res.json(servicos);
    },
    async delete(req, res){

        const idSession = parseInt(req.query.id)
        const idS = parseInt(req.query.idS);
        const idE = await getID.empresa(idSession);

        await prisma.servico.delete({
            where:{
                empresaId: idE,
                idServico: idS
            }
        })

        res.json({message: "Serviço deletado com sucesso."})


    }
}