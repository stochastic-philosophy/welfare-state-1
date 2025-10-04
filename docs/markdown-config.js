// markdown-config.js
// Markdown-parserin konfiguraatio

import MarkdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@14/+esm'

// Alustetaan ja viedään markdown-parseri
export const md = new MarkdownIt({
  html: true,          // Sallii HTML-tagit markdownissa
  linkify: true,       // Muuttaa URL:t automaattisesti linkeiksi
  typographer: true,   // Kauniit lainausmerkit ja viivat
  breaks: false        // Ei muuta rivinvaihtoja <br>:iksi
});
