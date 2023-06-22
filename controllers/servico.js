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

        const ID = await getID.empresa(req.session.sessionId)
        req.body.empresaId = ID
        const servico = await prisma.servico.create({data: req.body})    
        res.json(servico)
    },

    async index(req, res){
        //Consultar todos os serviços de uma determinada empresa
        const ID = await getID.empresa(req.session.sessionId) 
        const servicos = await prisma.servico.findMany({
            where:{
                empresaId: ID
            }
        })
        res.json(servicos);
    },
    async filter(req, res){
        const ID = await getID.empresa(req.session.sessionId) 
        const filtro = req.body
        var servicos = []
        if(filtro.nome){
             servicos = await prisma.servico.findMany({
                where:{
                    empresaId: ID,
                    nomeServico:{
                        startsWith: filtro.nome
                    }
                }
            })
        }else{
            servicos = await prisma.servico.findMany({
                where:{
                    empresaId: ID,
                    categoriaServico: {
                        equals: filtro.categoria
                    }
                }
            })
        }
        var message = servicos ? 'Resultados correspondentes: ' : 'Nenhum resultado correspondente :('
        res.json({message, servicos})
    }
}