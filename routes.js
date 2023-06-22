const express = require("express");
const router = express.Router();

const Cliente = require("./controllers/cliente");
const Servico = require("./controllers/servico");
const Prestador = require("./controllers/prestador");
const Agendamento = require("./controllers/agendamento");
const User = require("./controllers/users");
const Home = require("./controllers/home");


router.get("/", (req, res) => {
  res.json({ message: "Hello world2" });
});

//cliente routes
router.get('/filtrar-clientes', Cliente.filtrarClentes)
router.post("/cadastrar-cliente", Cliente.checkClient, Cliente.store);
router.get("/consultar-clientes", Cliente.index);

//servico routes
router.post("/cadastrar-servico", Servico.store);
router.get("/consultar-servicos", Servico.index);
router.get("/filtrar-servicos", Servico.filter)

//prestador routes
router.post("/cadastrar-prestador", Prestador.verify, Prestador.store);
router.get("/consultar-prestadores", Prestador.index);

//agendamento routes 
router.post('/agendar', Agendamento.store)
router.get('/filtrar-cliente', Cliente.filterCliente)
router.get('/consultar-agendamentos', Agendamento.agendamentosDia)
router.get('/filtrar-data', Agendamento.filtrarData)


//login routes
router.post("/sign-up", User.userexists, User.sendData);
router.get("/confirmMail", User.register);
router.get("/verify-cod", User.verifyCod);
router.post("/sign-in", User.logar);
router.delete("/logout", User.logout);
router.get("/home", Home.getDataHome);

// testUpload
const upload = require("./controllers/resource/multer");
const ctrlUp = require("./controllers/resource/picture");;
router.post("/upload", upload.single("file"), ctrlUp.ctrlUp);
module.exports = router;
