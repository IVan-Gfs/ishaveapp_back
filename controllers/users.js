const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {transporter, gerarOTP} = require("./envmail");

module.exports = {
  async register(req, res) {
    const newUser = await prisma.usuarios.create({
      data: {
        nomeUsuario: req.body.nomeUsuario,
        emailUsuario: req.body.emailUsuario,
        senhaUsuario: req.body.senhaUsuario,
        prestador: req.body.adm ? undefined : req.body.prestadorId,
        enderecoId: req.body.enderecoId,
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
    var mailOptions = {
      from: "ishaveemail@gmail.com",
      to: req.body.emailUsuario,
      subject: "IshaveApp - Verificação de código",
      html: `<p>Olá ${req.body.nomeUsuario}! Seu código de vereficação é ${gerarOTP(6)}</p>`,
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
