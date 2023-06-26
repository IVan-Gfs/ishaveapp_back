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

//Rotas de Cliente
router.post("/cadastrar-cliente", Cliente.checkClient, Cliente.store);
router.get("/consultar-clientes", Cliente.index);
router.delete("/excluir-cliente", Cliente.delete)

//Rotas de Serviço 
router.post("/cadastrar-servico", Servico.store);
router.get("/consultar-servicos", Servico.index);
router.delete("/excluir-servico", Servico.delete)

//Rotas de Agendamento 
router.post('/agendar', Agendamento.store)
router.get('/agendamentos', Agendamento.index)
router.delete('/excluir-agendamento', Agendamento.delete)

//Rotas de Usuário 
router.post("/sign-up", User.userexists, User.sendData);
router.get("/confirmMail", User.register);
router.post("/sign-in", User.logar);
router.get("/home", Home.getDataHome);
router.delete("/logout", User.logout);


//FORA DE USO ATUALMENTE: 

//prestador routes
router.post("/cadastrar-prestador", Prestador.verify, Prestador.store);
router.get("/consultar-prestadores", Prestador.index);

// testUpload
const upload = require("./controllers/resource/multer");
const ctrlUp = require("./controllers/resource/picture");;
router.post("/upload", upload.single("file"), ctrlUp.ctrlUp);
module.exports = router;
