const express = require('express');
const router = require('./routes');
const session = require('express-session');


const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')
    res.setHeader('Access-Control-Allow-Methods', 'POST','GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    next()
})
app.use(session({
    secret: 'dhsdbsh_pqouans_ramdomss', 
    resave: false,
    saveUninitialized: true
  }));
app.use(router)


app.listen(8081);