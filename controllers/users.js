const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {transporter, gerarOTP} = require("./envmail");

module.exports = {
  async register(req, res) {
    const empresa = await prisma.empresa.create({data:req.body.empresa})
    req.body.endereco.empresaId = empresa.idEmpresa 
    const endereco = await prisma.endereco.create({data: req.body.endereco});
  
    const newUser = await prisma.usuarios.create({
      data: {
        nomeUsuario: req.body.usuario.nomeUsuario,
        emailUsuario: req.body.usuario.emailUsuario,
        senhaUsuario: req.body.usuario.senhaUsuario,
        prestadorId: undefined,
        enderecoId: endereco.idEndereco,
        empresaId: empresa.idEmpresa
      },
    });

    res.json(newUser);
  },
  async userexists(req, res, next) {
    const qtdUserWithData = await prisma.usuarios.count({
      where: {
        emailUsuario: req.body.emailUsuario,
        nomeUsuario: req.body.nomeUsuario,
      },
    });
    console.log(qtdUserWithData);

    if (qtdUserWithData > 0) {
      res.send("<h2>Usuário já existente, faça o login</h2>");
    } else {
      next();
    }
  },
  async otp(req, res, next) {
    var code = gerarOTP(6)
    prisma.codAuth.create({data:{
      codigo: code, 
      email: req.body.usuario.emailUsuario,
    }})
    var mailOptions = {
      from: "koauys23@gmail.com",
      to: req.body.usuario.emailUsuario,
      subject: "IshaveApp - Verificação de código",
      html: `<p>Olá ${req.body.usuario.nomeUsuario}! Seu código de vereficação é ${code}</p>`,
    };

    transporter.sendMail(mailOptions, (error, info)=>{
        if (error) {
            console.log(error);
            res.send("<h2>E-mail inválido.<h2>")
          } else {
            console.log('Email sent: ' + info.response);
            next()
          }
    });
  },
  async logar(req, res) {
    const user = await prisma.usuarios.count({
      where: {
        emailUsuario: req.body.emailUsuario,
        senhaUsuario: req.body.senhaUsuario,
      },
    });
    if (user == 1) {
      res.send("Conceder acesso");
    } else {
      res.send("Senha ou usuário inválidos");
    }
  },
};
