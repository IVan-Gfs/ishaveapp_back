const express = require("express");
const router = require("./routes");
const session = require("express-session");
const cors = require("cors");
const serverless = require("serverless-http");

const app = express();
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control_Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST", "GET");
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

app.use(router);

app.listen(8081);

module.exports.handler = serverless(app);
