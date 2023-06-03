const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  async store(req, res) {

    
    const prestador = await prisma.prestador.create({data: req.body.prestador});
    var message;
    if(req.body.idServices.length > 0){
      req.body.idServices.forEach( async (servicoId) => {
        await prisma.servico_prestador.create({
         data: {
           servicoId: servicoId,
           prestadorId: prestador.idPrestador
         }
       })
     });
     message = "Prestador cadastrado com sucesso!"
    }else{
     message = "Profissional cadastrado com sucesso. Atenção: nenhum servico foi associado a este este profissional ";
    }
     
    res.json({message});
    
  },
  async index(req, res) {
    const prestadores = await prisma.prestador.findMany();
    res.json(prestadores);
  },
};
