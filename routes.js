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
router.get('/filtrar-clientes', Cliente.filtrarClentes)


//servico routes
router.post('/cadastrar-servico', Servico.store)
router.get('/consultar-servicos', Servico.index)

//prestador routes
router.post('/cadastrar-prestador', Prestador.verify, Prestador.store)
router.get('/consultar-prestadores', Prestador.index)

//agendamento routes 
router.post('/agendar',Cliente.noFilterCpf, Agendamento.store)
router.get('/filtrar-cliente', Agendamento.filterCliente)
router.get('/consultar-agendamentos', Agendamento.index)
router.get('/filtrar-data', Agendamento.filtrarData)


//login routes 
router.post('/sign-up', User.userexists, User.sendData)
router.get('/confirmMail', User.register)
router.get('/verify-cod', User.verifyCod);
router.post('/sign-in', User.logar)
router.delete('/logout', User.logout)
router.get('/home',Home.testSession, Home.getDataHome )

// testUpload
const upload = require('./controllers/resource/multer')
const ctrlUp = require('./controllers/resource/picture');
const agendamento = require('./controllers/agendamento');
router.post('/upload', upload.single('file'), ctrlUp.ctrlUp )


module.exports = router;
