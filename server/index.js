
const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require("express");
const mongoose = require("mongoose");
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

const uri = "mongodb+srv://kaikesathler7:5udzOlxP9vAIGVav@cluster0.8eiqz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri);

const tabelaMensagens = new mongoose.Schema({
  mensagem: {
    type: "String",
    required: true
  }
});

const colecaoMensagem = mongoose.model("mensagens", tabelaMensagens);

app.post("/api/message", (req, res) => {
  console.log(req.body)
  const mensagem = req.body.mensagem;
  if(!mensagem) {
    return res.sendStatus(500);
  }
  new colecaoMensagem({
    mensagem: mensagem
  }).save();
  res.sendStatus(200);
})

app.listen(8003, (req, res) => {
  console.log("Server ligado na porta 8003!");
})

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  const db = client.db("gemini_db").collection("usuario")
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
}
run().catch(console.dir);

