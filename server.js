const cors = require('cors')

const express = require('express');
const router = require('./routes');
const session = require('express-session');


const app = express();
app.use(express.json())
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next)=>{
    next()
})
app.use(session({
    secret: 'dhsdbsh_pqouans_ramdomss', 
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 3600000
    }
  }));
app.use(router)


app.listen(8081);