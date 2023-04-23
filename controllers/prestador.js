const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  async store(req, res) {
    const prestador = await prisma.prestador.create({
      data: {
        nomePrestador: req.body.nomePrestador,
        telPrestador: req.body.telPrestador,
        cpfPrestador: req.body.cpfPrestador,
        emailPrestador: req.body.emailPrestador,
        dataNascPrestador: req.body.dataNascPrestador       
      },
    });

    await prisma.servico_prestador.create({
      data: {
        prestadorId: prestador.idPrestador,
        servicoId:  req.body.idServico
      },
    });

    res.json(prestador);
  },
  async index(req, res) {
    const prestadores = await prisma.prestador.findMany();
    res.json(prestadores);
  },
};
