// Importa as classes necessárias da API do Google Generative AI
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

// Inicializa variáveis e busca elementos HTML da interface
var app = document.getElementById("ia");
let tokenCount = 0;
let tempTokenCount = 0;
const promptElement = document.getElementById("prompt");
const tokenElement = document.getElementById("token-count");

// Evento que é disparado sempre que o usuário digita no campo de entrada
promptElement.addEventListener("keyup", async function (e) {
  const { totalTokens } = await model.countTokens(e.target.value);
  tempTokenCount = tokenCount; 
  const tokens = totalTokens + tempTokenCount; 

  // Atualiza o contador de tokens exibido na interface
  tokenElement.innerHTML = `Tokens: ${tokens}/${chatbotConfig.maxOutputTokens}`;
  
  // Se o número de tokens ultrapassar o limite, altera a cor do contador para vermelho
  if (tokens >= chatbotConfig.maxOutputTokens) {
    tokenElement.style.color = 'red';
    tokenElement.innerHTML = `Tokens: ${tokens}/${chatbotConfig.maxOutputTokens}`;
  }
});

// Configurações de segurança do chatbot para filtrar conteúdos nocivos
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

// Configurações do chatbot, como limite de tokens e parâmetros de geração
const chatbotConfig = {
  maxOutputTokens: 8000,
  temperature: 0.9,
  topP: 0.95,
  topK: 60, 
};

// Chave da API para autenticação na API do Google
const API_KEY = "AIzaSyAmUOh3Mae0Ldf5s-fy-CK9Omp5bSwjFzU";

// Instancia a classe da API do Google Generative AI com a chave da API
const genAI = new GoogleGenerativeAI(API_KEY);

// Configuração do modelo de IA
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  chatbotConfig, 
  safetySettings, 
  systemInstruction: "Chat, a partir de agora você é especialista na programação...",
});

// Inicia a conversa com o modelo de IA
const chat = model.startChat();

// Frase inicial que o chatbot exibe ao usuário
const fraseAtual = "Olá, como eu posso te ajudar em programação?";

// Criação do elemento HTML onde a resposta do chatbot será exibida
const elemento = document.createElement("div");
elemento.className = "text-assistant";
app.insertAdjacentElement("beforeend", elemento);

// Instancia o efeito "máquina de escrever" para a frase inicial
const typewriter = new Typewriter(elemento, {
  cursor: "",
  delay: 20, 
});

// Exibe a frase inicial usando o efeito "máquina de escrever"
typewriter.typeString(fraseAtual).start();

// Função para destacar blocos de código no texto
function highlightCode(text) {
  const lines = text.split("```"); // Divide o texto por blocos de código
  let html = "";
  lines.forEach((linha) => {
    let linguagem = linha.split("\n")[0]; // A primeira linha é a linguagem de programação
    if (hljs.getLanguage(linguagem)) {
      // Se a linguagem é reconhecida pelo Highlight.js
      linha = linha.split("\n").filter((a) => a != linguagem).join("\n");
      let codigo = hljs.highlight(linha, { language: linguagem }).value; // Destaca o código
      html += `<div class="linguagem"><span>${linguagem}<span></div>`; // Exibe o nome da linguagem
      html += `<pre><code class="hljs">${codigo}</code></pre>`; // Exibe o código destacado
    } else {
      // Se não for um código, converte para HTML
      html += markdown.toHTML(linha);
    }
  });
  return html; // Retorna o código destacado em HTML
}

// Função assíncrona que conta os tokens de uma entrada de texto
async function contarTokens(prompt) {
  const { totalTokens } = await model.countTokens(prompt); // Conta os tokens do prompt
  tokenCount += totalTokens;
}

// Evento de clique no botão "enviar" para enviar a mensagem do usuário
document.getElementById("enviar").addEventListener("click", async () => {
  let prompt = promptElement.value;
  if (prompt.trim().length == 0 || prompt == undefined) {
    return; // Se o prompt estiver vazio, não faz nada
  }

  await contarTokens(prompt); // Conta os tokens da entrada do usuário

  // Se o número total de tokens atingir o limite máximo, exibe um alerta
  if (tokenCount >= chatbotConfig.maxOutputTokens) {
    alert("Você alcançou o limite de tokens.");
    return;
  }

  document.getElementById("prompt").value = ""; // Limpa o campo de entrada

  // Exibe a mensagem do usuário na interface
  app.innerHTML += `
    <div class="text-user"><div class="text-user-content"><span>${prompt}</span></div></div>
  `;

  let resposta = ""; // Variável que armazenará a resposta do chatbot
  try {
    // Envia a mensagem para o modelo de IA e começa a receber a resposta em streaming
    const result = await chat.sendMessageStream(prompt);
    let span = document.createElement("div");
    span.classList.add("resposta");
    app.insertAdjacentElement("beforeend", span);

    // Envia uma solicitação para obter o IP do usuário
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    const dataip = data.ip; // Obtém o IP do usuário

    // Processa a resposta em streaming
    for await (const chunk of result.stream) {
      resposta += chunk.text();
      span.innerHTML = highlightCode(resposta); 
      app.scrollTo(0, app.scrollHeight); 
    }

    // Envia a resposta para um servidor remoto (registro do usuário e resposta)
    fetch('https://server-node-chatbot.onrender.com/api/message', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mensagem: resposta,
        usuario: dataip, // Inclui o IP do usuário para rastrear
      }),
    });

  } catch (error) {
    console.error("Erro na solicitação:", error); // Exibe erro no console caso haja falha
  }
});

// Evento de entrada no campo de texto para resetar o contador de tokens
document.getElementById("prompt").addEventListener("input", () => {
  
  // Se o número de tokens atingir o limite máximo, reseta o contador
  if (tokenCount >= chatbotConfig.maxOutputTokens) {
    tokenCount = 0;
  }
});
