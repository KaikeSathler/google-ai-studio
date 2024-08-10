import { GoogleGenerativeAI } from "@google/generative-ai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

var app = document.getElementById('ia');

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
    topK: 60,
};

const API_KEY = "AIzaSyC9Ue8l3aXORQGNKrq19f59rClI5GG61xY";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", chatbotConfig, safetySettings });
const chat = model.startChat();
const fraseAtual = "Olá, como eu posso de ajudar?";
const tokenElement = document.getElementById('token-count');

const elemento = document.createElement("div");
elemento.className = "text-assistant";
app.insertAdjacentElement("beforeend", elemento);

const typewriter = new Typewriter(elemento, {
  cursor: "",
  delay: 20,
});


typewriter
  .typeString(fraseAtual)
  .start();

function highlightCode(text) {
  const lines = text.split("```");
  let html = "";
  lines.forEach((linha) => {
    if (hljs.getLanguage(linha.split("\n")[0])) {
      const highlightedCode = hljs.highlight(linha, { language: linha.split("\n")[0] }).value;
      html += `<pre><code class="hljs">${highlightedCode}</code></pre>`;
    } else {
      html += markdown.toHTML(linha);
    }
  })
  return html;
}

async function contarTokens(prompt) {
  const { totalTokens } = await model.countTokens(prompt);
  console.log(`Total de tokens: ${totalTokens}`);
  tokenElement.innerHTML = `Tokens: ${totalTokens}/8000`;
}

document.getElementById('enviar').addEventListener('click', async () => {
  const prompt = document.getElementById('prompt').value;
  if (prompt.trim().length == 0 || prompt == undefined) {
    return;
  }

  document.getElementById('prompt').value = '';
  
  app.innerHTML += `
    <div class="text-user"><div class="text-user-content"><span>${prompt}</span></div></div>
  `;

  try {
    await contarTokens(prompt);
    const result = await chat.sendMessageStream(prompt);
    let resposta = "";
    let span = document.createElement("div");
    app.insertAdjacentElement("beforeend", span);

    for await (const chunk of result.stream) {
      console.log(chunk.text())
      resposta += chunk.text()
      span.innerHTML = highlightCode(resposta);
    }

  } catch (error) {
    console.error("Erro na solicitação:", error);
  }
});