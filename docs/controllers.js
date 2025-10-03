// controllers.js - MARKDOWN-IT VERSION
// Tuodaan markdown-it CDN:stä
import MarkdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@14/+esm'

// Alustetaan markdown-parseri konfiguraatiolla
const md = new MarkdownIt({
  html: true,          // Sallii HTML-tagit markdownissa
  linkify: true,       // Muuttaa URL:t automaattisesti linkeiksi
  typographer: true,   // Kauniit lainausmerkit ja viivat
  breaks: false        // Ei muuta rivinvaihtoja <br>:iksi
})

// SectionController
class SectionController {
  constructor(router, tocData) {
    this.router = router;
    this.tocData = tocData;
  }

  show(params) {
    const sectionSlug = params.section;
    const section = this.tocData.sections.find(s => slugify(s.title) === sectionSlug);
    
    if (!section) {
      return `<h1>Osiota ei löytynyt</h1><p>Etsitty: ${sectionSlug}</p><p><a href="#/">← Takaisin</a></p>`;
    }

    let html = `<h1>${section.title}</h1>`;
    
    // Jos osiossa on kuvaus, näytä se
    if (section.description) {
      html += `<p class="description">${section.description}</p>`;
    }
    
    html += '<p><strong>Valitse luku:</strong></p>';
    html += '<nav><ul>';
    
    section.chapters.forEach(chapter => {
      const chapterSlug = slugify(chapter.title);
      html += `<li>
        <a href="#/${sectionSlug}/${chapterSlug}">
          <strong>${chapter.title}</strong>
        </a>`;
      
      // Näytä luvun kuvaus jos saatavilla
      if (chapter.description) {
        html += `<br><small style="color: #666;">${chapter.description}</small>`;
      }
      
      html += `</li>`;
    });
    
    html += '</ul></nav>';
    html += `<p><a href="#/">← Takaisin alkuun</a></p>`;
    return html;
  }
}

// ChapterController
class ChapterController {
  constructor(router, tocData) {
    this.router = router;
    this.tocData = tocData;
  }

  async show(params) {
    const sectionSlug = params.section;
    const chapterSlug = params.chapter;
    
    const section = this.tocData.sections.find(s => slugify(s.title) === sectionSlug);
    if (!section) {
      return `<h1>Osiota ei löytynyt</h1><p><a href="#/">Takaisin</a></p>`;
    }
    
    const chapterIndex = section.chapters.findIndex(c => slugify(c.title) === chapterSlug);
    if (chapterIndex === -1) {
      return `<h1>Lukua ei löytynyt</h1><p><a href="#/${sectionSlug}">Takaisin osioon</a></p>`;
    }
    
    const chapter = section.chapters[chapterIndex];
    
    try {
      const response = await fetch(chapter.file);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const markdown = await response.text();
      
      // Käytä markdown-it:iä parsimaan markdown -> HTML
      const contentHtml = md.render(markdown);
      
      let html = '<article>';
      html += this.createNav(section, chapterIndex);
      html += contentHtml;
      html += this.createNav(section, chapterIndex);
      html += '</article>';
      
      return html;
      
    } catch (error) {
      return `
        <h1>Virhe</h1>
        <p><strong>Luvun lataus epäonnistui</strong></p>
        <p>Tiedosto: <code>${chapter.file}</code></p>
        <p>Virhe: ${error.message}</p>
        <hr>
        <p><a href="#/${sectionSlug}">← Takaisin osioon</a> | <a href="#/">Alkuun</a></p>
      `;
    }
  }

  createNav(section, index) {
    const sectionSlug = slugify(section.title);
    const chapters = section.chapters;
    
    let nav = '<div class="chapter-nav">';
    
    // Edellinen luku
    if (index > 0) {
      const prev = chapters[index - 1];
      nav += `<a href="#/${sectionSlug}/${slugify(prev.title)}" class="nav-link">← ${prev.title}</a>`;
    } else {
      nav += '<span></span>';
    }
    
    // Takaisin osioon
    nav += `<a href="#/${sectionSlug}" class="nav-link">↑ ${section.title}</a>`;
    
    // Seuraava luku
    if (index < chapters.length - 1) {
      const next = chapters[index + 1];
      nav += `<a href="#/${sectionSlug}/${slugify(next.title)}" class="nav-link">${next.title} →</a>`;
    } else {
      nav += '<span></span>';
    }
    
    nav += '</div>';
    return nav;
  }
}

export { HomeController, SectionController, ChapterController };
