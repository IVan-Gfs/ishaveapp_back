const express = require("express");
const router = require("./routes");
const session = require("express-session");
const cors = require("cors");

const app = express();
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: "http://localhost:5173" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control_Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST", "GET","DELETE", "PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.use(
  session({
    secret: "dhsdbsh_pqouans_ramdomss",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 3600000,
    },
  })
);

app.use((req, res, next)=>{
  idHeader = req.headers['x-session-id']
  const sessionId = idHeader ? idHeader : parseInt(req.query.id) 
  req.sessionID = sessionId
  next();
})
app.use(router);

app.listen(process.env.PORT || 5000);
