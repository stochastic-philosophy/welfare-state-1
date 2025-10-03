// controllers.js

// 1. Tuodaan marked-kirjasto suoraan CDN:stä ES-moduulina
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/marked.esm.js';

// --- Apufunktio ---
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// --- Controllerit (sisältö on samaa kuin aiemmin) ---

class HomeController {
  constructor(router, tocData) { /* ... */ }
  index() { /* ... */ }
}

class SectionController {
  constructor(router, tocData) { /* ... */ }
  show(params) { /* ... */ }
}

class PartController {
  constructor(router, tocData) { /* ... */ }
  show(params) { /* ... */ }
}

class ChapterController {
  constructor(router, tocData) { /* ... */ }
  async show(params) { /* ... */ }
  createNavigation(section, part, currentChapterIndex) { /* ... */ }
  notFound() { /* ... */ }
}

// 2. Viedään kaikki controller-luokat, jotta ne voidaan tuoda app.js:ssä
export { HomeController, SectionController, PartController, ChapterController };
