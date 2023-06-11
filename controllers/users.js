const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { encryptPassword, verifyPassword, gerarURL, decryiptURL } = require('./resource/cripto.js')
const transporter = require('../config/mailprovider.js')
const emailValidator = require('email-validator');




module.exports = {
  async sendData(req, res) {
    const dados = req.body;
    dados.usuario.nomeUsuario = dados.empresa.nomeEmpresa
    const password = encryptPassword(dados.usuario.senhaUsuario);
    dados.usuario.senhaUsuario = password;

    const dataAtual = new Date();
    const experationTime = 0.25 * 60 * 60 * 1000;
    const expirationDate = new Date(dataAtual.getTime() + experationTime)
    const dadosURL = gerarURL(dados)
    const urlRecord = await prisma.urlConfirm.create({
      data: {
        url: dadosURL.query,
        expires_at: expirationDate.toISOString()
      }
    })
   
    const css = require('../config/cssMail.js')
    var mailOptions = {
      from: "koauys23@gmail.com",
      to: dados.usuario.emailUsuario,
      subject: "IshaveApp - Confirmação de email",
      html: `<html>
              <head><style>${css}</style></head>
              <body>
              <div class="corpo">
               <p class="info">Para confirmar seu cadastro, acesse o link clicando no botão abaixo:</P>
               <a class="btnConfirmar" href="http://${dadosURL.url}">Confirmar</a>
               </div>
              </body>
            </html>`,
    };

    if(emailValidator.validate(req.body.usuario.emailUsuario)){
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.json({message:'Não foi possível efetuar o cadastro, verifique se seu e-mail está realmente válido'})
        }else {
          console.log('Email sent: ' + info.response);
          res.json({message:'Enviamos um E-mail para o endereço informado, para confirmar seu cadastro, verifique-o'})
        }
      });
    }else{
      res.json({message:'Endereço de e-mail inválido'})
    }    
    
  },
  async register(req, res) {
    

    //Antes do cadastro, desencripitar os dados:
    const todosDados = decryiptURL(req.query.d, req.query.v)
    //Checar existencia do usuário
    const usuarioExistente = await prisma.usuarios.count({
      where: {
        nomeUsuario: todosDados.usuario.nomeUsuario,
        emailUsuario: todosDados.usuario.emailUsuario,
        senhaUsuario: todosDados.usuario.senhaUsuario
      }
    })
    var message = '';
    var registered = true
    if (usuarioExistente > 0) {
      message = "Usuário já foi cadastrado, realize o login "
    } else {
      //Buscar por url no banco para determinar se está válida.
      const dadosURL = `d=${req.query.d}&v=${req.query.v}`
      const urlRecord = await prisma.urlConfirm.findMany({
        where: {
          url: {
            equals: dadosURL
          }
        }
      });

      //Converter datas para dados numéricos para comparação
      const dataAtual = new Date().getTime();
      const expiresDate = Date.parse(urlRecord[0].expires_at)

      //Tratativa final para registro de dados e resposta 
      if (expiresDate > dataAtual) {
        // Realizar cadastro ---
        const endereco = await prisma.endereco.create({ data: todosDados.endereco })
        todosDados.empresa.enderecoId = endereco.idEndereco
        const empresa = await prisma.empresa.create({ data: todosDados.empresa })
        todosDados.usuario.empresaId = empresa.idEmpresa
        const usuario = await prisma.usuarios.create({ data: todosDados.usuario })

        if (endereco && empresa && usuario) {
          message = 'Cadastro Confirmado com sucesso, realize o '
        } else {
          message = 'Algo inesperado aconteceu.'
          registered = false
        }
      } else {
        registered = false
        message = 'Ops.. Você demorou demais para confirmar seu cadastro. Realize o cadastro novamente.'
      }
    }

    res.send({ message, registered })
  },
  async userexists(req, res, next) {
    const qtdUserWithData = await prisma.usuarios.count({
      where: {
        emailUsuario: req.body.usuario.emailUsuario
      },
    });
    
    if (qtdUserWithData > 0) {
      res.json({message:'Usuário já existente, faça o login.'});
    } else {
      next();
    }
  },
  async otp(req, res, next) {
    var code = gerarOTP(6)

    prisma.codAuth.create({
      data: {
        codigo: code,
        email: req.body.usuario.emailUsuario,
      }
    })
  },
  async verifyCod(req, res) {
    const cod = await prisma.codAuth.findMany()
    if (cod[cod.length - 1] === req.code) {
      res.send("<h1>Código correto</h1>")
    } else {
      res.send("<h1>Código inválido</h1>")
    }

  },
  async logar(req, res) {
    const {emailUsuario: email, senhaUsuario: senha} = req.body
  
    const userdata = await prisma.usuarios.findUnique({
      where: {
        emailUsuario: email
        
      }
    })
    var message;
    var sessionID
    if(userdata){
      if(verifyPassword(senha, userdata.senhaUsuario)){
        message = 'Logado'
        const session = await prisma.session.create({
          data: {
           usuarioId: userdata.idUsuario
          }
        })
        req.session.sessionId = session.idSession;
        sessionID = session.idSession
       
      }else{
        message = 'Senha ou E-mail Inválido'
      }  
    }else{
      message = 'E-mail ou senha inválido'  
    }
    res.json({message, sessionID}) 
    
  },
  async logout(req,res){
    delete req.session.sessionId;
    res.json({message:'Logout efetuado'})
  }
};
