const express = require("express");
const mongoose = require("mongoose");
require('dotenv').config()
const app = express();
app.use(express.json())
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const uri = process.env.mongodb_uri;
mongoose.connect(uri);

const tabelaMensagens = new mongoose.Schema({
  mensagem: {
    type: String,
    required: true
  },
  usuario: {
    type: String,
    required: true
  }
});

const colecaoMensagem = mongoose.model("mensagens", tabelaMensagens);

app.post("/api/message", (req, res) => {
  console.log(req.body)
  const mensagem = req.body.mensagem;
  const usuario = req.body.usuario;
  if (!mensagem || !usuario) {
    return res.status(400).send({ error: "Both mensagem and usuario are required" });
  }
  new colecaoMensagem({
    mensagem: mensagem,
    usuario: usuario,
  }).save();
  res.sendStatus(200);
})

app.listen(8003, (req, res) => {
  console.log("Server ligado na porta 8003!");
})