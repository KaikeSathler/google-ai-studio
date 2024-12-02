import { GoogleGenerativeAI } from "@google/generative-ai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

var app = document.getElementById("ia");
let tokenCount = 0;
let tempTokenCount = 0;
const promptElement = document.getElementById("prompt");
const tokenElement = document.getElementById("token-count");
let history = JSON.parse(localStorage.getItem('chatHistory')) || [];

promptElement.addEventListener("keyup", async function (e) {
  const { totalTokens } = await model.countTokens(e.target.value);
  tempTokenCount = tokenCount;
  const tokens = totalTokens + tempTokenCount
  tokenElement.innerHTML = `Tokens: ${tokens}/${
    chatbotConfig.maxOutputTokens
  }`;
  
  if (tokens >= chatbotConfig.maxOutputTokens) {
    tokenElement.style.color = 'red';
    tokenElement.innerHTML = `Tokens: ${tokens}/${chatbotConfig.maxOutputTokens}`;
  }

});

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

const chatbotConfig = {
  maxOutputTokens: 8000,
  temperature: 0.9,
  topP: 0.95,
  topK: 40,
};

// Carrega o histórico do localStorage ou inicializa um array vazio
function addToHistory(role, message) {
  history.push({ role: role, parts: [{ text: message }] });
  localStorage.setItem('chatHistory', JSON.stringify(history));
}

const API_KEY = "AIzaSyAmUOh3Mae0Ldf5s-fy-CK9Omp5bSwjFzU";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  history,
  model: "gemini-1.5-flash",
  chatbotConfig,
  safetySettings,
  systemInstruction: "Chat, a partir de agora você é especialista na programação, você ira ajudar seus usuários a resolver problemas ou a criar projetos com base nas seguintes linguagens: HTML, CSS, Python, JavaScript, Java, C++, C#, PHP, Ruby, Swift, Go, Kotlin.\nRegras: Não responda nenhum conteúdo além da área programação. \nFoco: Você deve ser capaz de gerar código para diferentes tipos de aplicações, desde aplicações webs até sistemas de desktop e mobile. \nTreinamento: É essencial ter um dataset grande e diversificado de código para cada linguagem. Você pode utilizar repositórios de código como GitHub, GitLab e Bitbucket, além de código de projetos open-source.\nDificuldades: Criar um modelo que gere código de alta qualidade para todas essas linguagens exige um dataset massivo e uma arquitetura complexa, capaz de lidar com as diferentes nuances sintáticas e semânticas de cada linguagem. \nObservações: É TOTALMENTE RESTRITO VOCÊ SAIR DA TEMÁTICA DE PROGRAMAÇÃO.",
  responseMimeType: "text/plain",
});
const chat = model.startChat();
const fraseAtual = "Olá, como eu posso te ajudar em programação?";
const elemento = document.createElement("div");
elemento.className = "text-assistant";
app.insertAdjacentElement("beforeend", elemento);

const typewriter = new Typewriter(elemento, {
  cursor: "",
  delay: 20,
});

typewriter.typeString(fraseAtual).start();

function highlightCode(text) {
  const lines = text.split("```");
  let html = "";
  lines.forEach((linha) => {
    let linguagem = linha.split("\n")[0];
    if (hljs.getLanguage(linguagem)) {
      linha = linha.split("\n").filter((a) => a != linguagem).join("\n");
      console.log(linha)
      let codigo = hljs.highlight(linha, {
        language: linguagem,
      }).value;
      html += `<div class="linguagem"><span>${linguagem}<span></div>`;
      html += `<pre><code class="hljs">${codigo}</code></pre>`;
    } else {
      html += markdown.toHTML(linha);
    }
  });
  return html;
}

async function contarTokens(prompt) {
  const { totalTokens } = await model.countTokens(prompt);
  tokenCount += totalTokens;
}

document.getElementById("enviar").addEventListener("click", async () => {
  let prompt = promptElement.value;
  if (prompt.trim().length == 0 || prompt == undefined) {
    return;
  }
  
  await contarTokens(prompt);

  if (tokenCount >= chatbotConfig.maxOutputTokens) {
    alert(
      "Você alcançou o limite de tokens."
    );
    return;
  }

  document.getElementById("prompt").value = "";
  addToHistory("user", prompt);

  app.innerHTML += `
    <div class="text-user"><div class="text-user-content"><span>${prompt}</span></div></div>
    `;

  let resposta = "";
  try {
    const result = await chat.sendMessageStream(prompt);
    let span = document.createElement("div");
    span.classList.add("resposta");
    app.insertAdjacentElement("beforeend", span);
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    const dataip = data.ip;

    for await (const chunk of result.stream) {
      resposta += chunk.text();
      span.innerHTML = highlightCode(resposta);
      app.scrollTo(0, app.scrollHeight);
    }
    fetch('https://server-node-chatbot.onrender.com/api/message', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
  
      body: JSON.stringify({
        mensagem: resposta,
        usuario: dataip,
        mensagem_user: prompt,
      }),
    })
  } catch (error) {
    console.error("Erro na solicitação:", error);
  } 

});

document.getElementById("prompt").addEventListener("input", () => {
  if (tokenCount >= chatbotConfig.maxOutputTokens) {
    tokenCount = 0;
  }
});
