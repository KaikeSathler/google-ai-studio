import { GoogleGenerativeAI } from "@google/generative-ai";

var app = document.getElementById('ia');

const chatbotConfig = {
  generationConfig: {
    stopSequences: ["red", "blue"],
    maxOutputTokens: 200,
    temperature: 0.9,
    topP: 0.1,
    topK: 16,
  },
};

const API_KEY = "AIzaSyDsE6K5NDNRTDGxX2xlyppT0fesCbjuxZs";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: chatbotConfig.generationConfig });
const chat = model.startChat();
const fraseAtual = "Olá, como eu posso de ajudar?";
const tokenElement = document.getElementById('token-count');

const elemento = document.createElement("div");
elemento.className = "text-assistant";
app.insertAdjacentElement("beforeend", elemento);

const typewriter = new Typewriter(elemento, {
  cursor: "",
  delay: 1,
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

let mensagemLimiteExibida = false;

async function contarTokens(prompt) {
  const { totalTokens } = await model.countTokens(prompt);
  console.log(`Total de tokens: ${totalTokens}`);
  tokenElement.innerHTML = `Tokens: ${totalTokens}/200`;

  if (totalTokens >= 200 && !mensagemLimiteExibida) {
    tokenElement.classList.add('animate-warning');
    tokenElement.style.color = "red";
    tokenElement.innerHTML = `Tokens: ${totalTokens}/200 *Total de token atingido, o próximo prompt reiniciará o token`;
    mensagemLimiteExibida = true;
    document.getElementById('prompt').value = '';

    setTimeout(() => {
      tokenElement.classList.add().innerHTML = `Tokens: ${totalTokens}/200`;
      tokenElement.style.color = '';
    }, 3000);
  }
}

document.getElementById('enviar').addEventListener('click', async () => {
  const prompt = document.getElementById('prompt').value;
  if (prompt.trim().length == 0 || prompt == undefined) {
    return;
  }

  document.getElementById('prompt').value = '';

  app.innerHTML += `
    <div class="text-user"><span>${prompt}</span></div>
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