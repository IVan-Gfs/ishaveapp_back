const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { encryptPassword } = require('./cripto')

module.exports = {
  async store(req, res) {
    const user = await prisma.usuarios.findFirst({
      where: {
        session: {
          some: {
            idSession: {
              equals: req.session.sessionId
            }
          }
        }
      },
      include: { empresa: true }
    })

    const senha = req.body.prestador.senhaPrestador
    const email = req.body.prestador.emailPrestador
    delete req.body.prestador.senhaPrestador
    delete req.body.prestador.emailPrestador
    const prestador = await prisma.prestador.create({ data: req.body.prestador });
    const prestadorUser = await prisma.usuarios.create({
      data: {
        nomeUsuario: prestador.nomePrestador,
        emailUsuario: email,
        senhaUsuario: encryptPassword(senha),
        prestadorId: prestador.idPrestador,
        empresaId: user.empresaId
      }
    })
    console.log(prestadorUser)
    var message;
    if (req.body.idServices.length > 0) {
      req.body.idServices.forEach(async (servicoId) => {
        await prisma.servico_prestador.create({
          data: {
            servicoId: servicoId,
            prestadorId: prestador.idPrestador
          }
        })
      });
      message = "Prestador cadastrado com sucesso!"
    } else {
      message = "Profissional cadastrado com sucesso. Atenção: nenhum servico foi associado a este este profissional ";
    }

    res.json({ message });

  },
  async index(req, res) {
    const prestadores = await prisma.prestador.findMany();
    res.json(prestadores);
  },
};
