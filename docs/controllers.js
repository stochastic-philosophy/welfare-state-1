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

// --- HomeController ---
class HomeController {
  constructor(router, tocData) {
    this.router = router;
    this.tocData = tocData;
  }

  index() {
    let html = `<h1>${this.tocData.title || 'Dokumentaatio'}</h1>`;
    html += '<p>Valitse osio:</p>';
    html += '<nav><ul>';
    
    this.tocData.sections.forEach(section => {
      const sectionSlug = slugify(section.title);
      html += `<li><a href="#/${sectionSlug}">${section.title}</a></li>`;
    });
    
    html += '</ul></nav>';
    return html;
  }
}

// --- SectionController ---
class SectionController {
  constructor(router, tocData) {
    this.router = router;
    this.tocData = tocData;
  }

  show(params) {
    const sectionSlug = params.section;
    const section = this.tocData.sections.find(s => slugify(s.title) === sectionSlug);
    
    if (!section) {
      return '<h1>Osiota ei löytynyt</h1><p><a href="#/">Takaisin alkuun</a></p>';
    }

    let html = `<h1>${section.title}</h1>`;
    html += '<p>Valitse luku:</p>';
    html += '<nav><ul>';
    
    section.chapters.forEach(chapter => {
      const chapterSlug = slugify(chapter.title);
      html += `<li><a href="#/${sectionSlug}/${chapterSlug}">${chapter.title}</a></li>`;
    });
    
    html += '</ul></nav>';
    html += `<p><a href="#/">← Takaisin alkuun</a></p>`;
    return html;
  }
}

// --- ChapterController ---
class ChapterController {
  constructor(router, tocData) {
    this.router = router;
    this.tocData = tocData;
  }

  async show(params) {
    const sectionSlug = params.section;
    const chapterSlug = params.chapter;
    
    const section = this.tocData.sections.find(s => slugify(s.title) === sectionSlug);
    if (!section) return this.notFound();
    
    const chapterIndex = section.chapters.findIndex(c => slugify(c.title) === chapterSlug);
    if (chapterIndex === -1) return this.notFound();
    
    const chapter = section.chapters[chapterIndex];
    
    try {
      const response = await fetch(chapter.file);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const markdown = await response.text();
      const contentHtml = marked.parse(markdown);
      
      let html = '<article>';
      html += this.createNavigation(section, chapterIndex);
      html += contentHtml;
      html += this.createNavigation(section, chapterIndex);
      html += '</article>';
      
      return html;
    } catch (error) {
      return `<h1>Virhe</h1><p>Luvun lataus epäonnistui: ${error.message}</p><p><a href="#/">Takaisin alkuun</a></p>`;
    }
  }

  createNavigation(section, currentChapterIndex) {
    const sectionSlug = slugify(section.title);
    const chapters = section.chapters;
    
    let nav = '<div class="chapter-nav">';
    
    // Edellinen luku
    if (currentChapterIndex > 0) {
      const prevChapter = chapters[currentChapterIndex - 1];
      const prevSlug = slugify(prevChapter.title);
      nav += `<a href="#/${sectionSlug}/${prevSlug}" class="nav-link">← ${prevChapter.title}</a>`;
    } else {
      nav += '<span></span>';
    }
    
    // Takaisin osioon
    nav += `<a href="#/${sectionSlug}" class="nav-link">↑ Takaisin</a>`;
    
    // Seuraava luku
    if (currentChapterIndex < chapters.length - 1) {
      const nextChapter = chapters[currentChapterIndex + 1];
      const nextSlug = slugify(nextChapter.title);
      nav += `<a href="#/${sectionSlug}/${nextSlug}" class="nav-link">${nextChapter.title} →</a>`;
    } else {
      nav += '<span></span>';
    }
    
    nav += '</div>';
    return nav;
  }

  notFound() {
    return '<h1>Lukua ei löytynyt</h1><p><a href="#/">Takaisin alkuun</a></p>';
  }
}

// 2. Viedään kaikki controller-luokat
export { HomeController, SectionController, ChapterController };
