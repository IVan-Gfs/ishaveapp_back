const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  async store(req, res) {
    const prestador = await prisma.prestador.create({data: req.body.prestador});

    req.body.idServices.forEach(idServico => {
       prisma.servico_prestador.create({
        data: {
          prestadorId: prestador.idPrestador,
          servicoId: idServico
        },
      });
    });
    
    res.json({message:"Prestador cadastrado com sucesso"});
  },
  async index(req, res) {
    const prestadores = await prisma.prestador.findMany();
    res.json(prestadores);
  },
};
