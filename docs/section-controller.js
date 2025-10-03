// section-controller.js

import { slugify } from './utils.js';

export class SectionController {
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
