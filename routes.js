const express = require('express');
const router = express.Router();

const Cliente = require('./controllers/cliente')
const Servico = require('./controllers/servico')
const Prestador = require('./controllers/prestador')
const Agendamento = require('./controllers/agendamento');
const User = require('./controllers/users');
const Home = require('./controllers/home')

//cliente routes
router.post('/cadastrar-cliente', Cliente.checkClient, Cliente.store)
router.get('/consultar-clientes', Cliente.index)


//servico routes
router.post('/cadastrar-servico', Servico.store)
router.get('/consultar-servicos', Servico.index)

//prestador routes
router.post('/cadastrar-prestador', Prestador.store)
router.get('/consultar-prestadores', Prestador.index)

//agendamento routes 
router.post('/agendar', Agendamento.store)
router.get('/consultar-agendamentos', Agendamento.index)

//login routes 

router.post('/sign-up', User.userexists, User.sendData)
router.post('/confirmMail', User.register)
router.get('/verify-cod', User.verifyCod);
router.post('/sign-in', User.logar)
router.delete('/logout', User.logout)


router.get('/home',Home.testSession, Home.getUser )
module.exports = router;
