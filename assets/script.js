import { GoogleGenerativeAI } from "@google/generative-ai";
let json = undefined;

await fetch("../config.json").then(async (data) => {
  json = await data.json();
});

var app = document.getElementById('ia');

const API_KEY = json.API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const chat = model.startChat();

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
    const result = await chat.sendMessageStream(prompt);
    let resposta = "";
    let span = document.createElement("div");
    app.insertAdjacentElement("beforeend", span);

    for await (const chunk of result.stream) {
      console.log(chunk.text())
      const chunkText = await chunk.text();
      resposta += chunk.text()
      span.innerHTML = highlightCode(resposta);
    }

  } catch (error) {
    console.error("Erro na solicitação:", error);
  }
});