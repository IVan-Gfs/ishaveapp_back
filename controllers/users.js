const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {encryptPassword, verifyPassword, gerarURL, decryiptURL} = require('./cripto.js')
const transporter = require('../config/mailprovider.js')
const fs = require('fs')

module.exports = {
  async sendData(req, res){

    dados = req.body;
    dados.usuario.nomeUsuario = dados.empresa.nomeEmpresa
    const password = encryptPassword(dados.usuario.senhaUsuario);
    dados.usuario.senhaUsuario = password;

    const dataAtual = new Date();
    const experationTime = 0.25 * 60 * 60 * 1000;
    const expirationDate = new Date(dataAtual.getTime()+experationTime)
    const urlRecord = await prisma.urlConfirm.create({
      data:{
        url: gerarURL(dados),
        expires_at: expirationDate.toISOString()
      }
    })

    const css = require('./cssMail.js')
    var mailOptions = {
      from: "koauys23@gmail.com",
      to: req.body.usuario.emailUsuario,
      subject: "IshaveApp - Confirmação de email",
      html: `<html>
              <head><style>${css}</style></head>
              <body>
              <div class="corpo">
               <p class="info">Para confirmar seu cadastro, acesse o link clicando no botão abaixo:</P>
               <a class="btnConfirmar" href="http://${urlRecord.url}">Confirmar</a>
               </div>
              </body>
            </html>`,
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
    res.send('Enviamos um email de confirmação, verifique-o.')
  },
  async register(req, res) {

  const urlRecord = await prisma.urlConfirm.findMany({
    where:{
      url:{
        equals: req.body.url.substring('7')
      }
    }
  });
 
   const dataAtual = new Date().getTime();
   const expiresDate = Date.parse(urlRecord[0].expires_at)
   dados = JSON.stringify(urlRecord[0])

   var message = '';
   if(expiresDate > dataAtual){
    message = 'Cadastro Confirmado com sucesso, realize o login.'
    
    //Antes do cadastro, desencripitar os dados:
    const todosDados = decryiptURL(req.body.dados.dados, req.body.dados.iv)
    console.log(todosDados)
    // Realizar cadastro ---
    // const endereco = await prisma.endereco.create({data:{}})
    // const empresa = await prisma.endereco.create({data:{}})
    // const usuario = await prisma.usuarios.create({data: {}})
  
   
   }else{
    message = 'Ops.. Você demorou demais para confirmar seu cadastro. Realize o cadastro novamente.'
   }
   res.send({message})
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
