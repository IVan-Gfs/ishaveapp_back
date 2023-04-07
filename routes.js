const express = require('express');
const router = express.Router();

const Cliente = require('./controllers/cliente')

router.post('/cadastrar-cliente', Cliente.store)
router.get('/consultar-clientes', Cliente.index)

module.exports = router;
