const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { encryptPassword } = require('./resource/cripto')
const getID = require('./resource/pegarId');
const { verify } = require("../config/mailprovider");

module.exports = {
  async store(req, res) {
   const id = await getID.empresa(req.session.sessionId)

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
        empresaId: id
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

   const id = await getID.empresa(req.session.sessionId)
   console.log(id)
   const prestadorUser = await prisma.usuarios.findMany({
    where:{
      empresaId:{
        equals: id
      },
      prestadorId:{
        not: null
      } 
    },
    select:{
      prestador: true,
    }
   })
   const prestadores = []
   for (let i = 0; i < prestadorUser.length; i++ ) {

    const objP = {
      nome: prestadorUser[i].prestador.nomePrestador,
      telefone: prestadorUser[i].prestador.telPrestador,
      cpf: prestadorUser[i].prestador.cpfPrestador,
      dataDeNascimento: prestadorUser[i].prestador.dataNascPrestador,
      servicos:[]
    }
    const idP = prestadorUser[i].prestador.idPrestador
    const servicos = await prisma.$queryRaw`
    SELECT servico.* FROM servico, servico_prestador
    WHERE servico_prestador.servicoId =  servico.idServico
    AND servico_prestador.prestadorId = ${idP}`

    for(servico of servicos){
      objP.servicos.push(servico.nomeServico)
    }
    prestadores.push(objP)
   } 
  
  
  
    res.json({ prestadores})
    
  },
  async verify(req, res, next){
    const prestadorExiste = await prisma.usuarios.count({
      where: {
        emailUsuario: req.body.prestador.emailPrestador
      }
    })
    if(prestadorExiste){
      res.json({message:'Este email já está cadastrado'})
    }else{
      next()
    }
  }
}
