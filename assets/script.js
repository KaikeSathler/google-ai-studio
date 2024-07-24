import { GoogleGenerativeAI } from "@google/generative-ai";

var app = document.getElementById('ia');

var typewriter = new Typewriter(app, {
  delay: 10
});

typewriter.typeString('Olá, tudo bem, como posso te ajudar hoje?')
    .start();


const API_KEY = "AIzaSyDsE6K5NDNRTDGxX2xlyppT0fesCbjuxZs";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function highlightCode(text) {
  const lines = text.split("```");
  let html = "";
  console.log(lines)
  lines.forEach((linha) => {
    console.log(linha)
    if(hljs.getLanguage(linha.split("\n")[0])) {
      const highlightedCode = hljs.highlight(linha, {language: linha.split("\n")[0]}).value;
      html += `<pre><code class="hljs">${highlightedCode}</code></pre>`;
    } else {
      html += markdown.toHTML(linha);
    }
  })
  return html;
}

document.getElementById('enviar').addEventListener('click', async () => {
  const prompt = document.getElementById('prompt').value;
  document.getElementById('prompt').value = '';

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = highlightCode(text); 

    app.innerHTML = text;

  } catch (error) {
    console.error("Erro na solicitação:", error);
    typewriter.deleteAll().start();
    typewriter.typeString("Desculpe, ocorreu um erro. Tente novamente.").start();
  }
});