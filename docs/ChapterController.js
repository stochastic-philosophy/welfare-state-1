// ChapterController.js
import { slugify } from './utils.js';
import { md } from './markdown-config.js';

export class ChapterController {
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
      html += this.createNavigation(section, chapterIndex);
      html += contentHtml;
      html += this.createNavigation(section, chapterIndex);
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

  createNavigation(section, index) {
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
