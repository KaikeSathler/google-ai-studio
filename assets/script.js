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
  },
  mensagem_user: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now 
  }
});

const colecaoMensagem = mongoose.model("mensagens", tabelaMensagens);

app.post("/api/message", (req, res) => {
  console.log(req.body)
  const mensagens = colecaoMensagem.find().sort({ createdAt: -1 }); 
  res.json(mensagens);
  const mensagem = req.body.mensagem;
  const usuario = req.body.usuario;
  const mensagem_user = req.body.mensagem_user;
  if (!mensagem || !usuario || !mensagem_user) {  
    return res.status(400).send({ error: "mensagem, usuario, and mensagem_user are required" });
  }
  new colecaoMensagem({
    mensagem: mensagem,
    usuario: usuario,
    mensagem_user: mensagem_user,
  }).save();
  res.sendStatus(200);
})

app.listen(80, (req, res) => {
  console.log("Server ligado na porta 80!");
})
