const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {encryptPassword, verifyPassword, gerarURL, decryiptURL} = require('./cripto.js')
const transporter = require('../config/mailprovider.js')

module.exports = {
  async sendData(req, res){

    dados = req.body;
    dados.usuario.nomeUsuario = dados.empresa.nomeEmpresa

    const password = encryptPassword(dados.usuario.senhaUsuario);
    dados.usuario.senhaUsuario = password;
    url = gerarURL(dados)
    var mailOptions = {
      from: "koauys23@gmail.com",
      to: req.body.usuario.emailUsuario,
      subject: "IshaveApp - Confirmação de email",
      html: `<p>Olá ${req.body.usuario.nomeUsuario}! Seu acesse este link para confirmar seu cadastro em nosso sistema: <br> <a  href="http://${url}">Confirmar</a></p>`,
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
    res.send(gerarURL(dados))
  },
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
  },
  async verifyCod(req, res){
    const cod = await prisma.codAuth.findMany()
    if(cod[cod.length-1] === req.code){
      res.send("<h1>Código correto</h1>")
    }else{
      res.send("<h1>Código inválido</h1>")
    }

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
