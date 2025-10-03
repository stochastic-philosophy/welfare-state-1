// controllers2.js
// 1. Tuodaan marked-kirjasto suoraan CDN:stä ES-moduulina
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/marked.esm.js';

// --- Apufunktio - KORJATTU TUKEMAAN ÄÄKKÖSIÄ ---
function slugify(text) {
  return text.toString().toLowerCase()
    .normalize('NFD')                    // Normalisoi merkit
    .replace(/[\u0300-\u036f]/g, '')     // Poista aksentit (mutta säilytä ääkköset)
    .replace(/[^a-zäöå0-9\s-]/g, '')     // Säilytä vain kirjaimet (inkl. ääkköset), numerot, välilyönnit ja viivat
    .replace(/\s+/g, '-')                // Välilyönnit viivoiksi
    .replace(/\-\-+/g, '-')              // Monta viivaa yhdeksi
    .replace(/^-+/, '')                  // Poista viiva alusta
    .replace(/-+$/, '');                 // Poista viiva lopusta
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
      return `
        <h1>Osiota ei löytynyt</h1>
        <p>Etsitty slug: <code>${sectionSlug}</code></p>
        <p>Saatavilla olevat osiot:</p>
        <ul>
          ${this.tocData.sections.map(s => 
            `<li>${s.title} → <code>${slugify(s.title)}</code></li>`
          ).join('')}
        </ul>
        <p><a href="#/">← Takaisin alkuun</a></p>
      `;
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
    if (!section) return this.notFound(sectionSlug, chapterSlug);
    
    const chapterIndex = section.chapters.findIndex(c => slugify(c.title) === chapterSlug);
    if (chapterIndex === -1) return this.notFound(sectionSlug, chapterSlug, section);
    
    const chapter = section.chapters[chapterIndex];
    
    try {
      const response = await fetch(chapter.file);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
      return `
        <h1>Virhe</h1>
        <p><strong>Luvun lataus epäonnistui</strong></p>
        <p>Tiedosto: <code>${chapter.file}</code></p>
        <p>Virhe: ${error.message}</p>
        <hr>
        <h3>Tarkista:</h3>
        <ol>
          <li>Onko tiedosto olemassa oikeassa paikassa?</li>
          <li>Onko tiedoston nimi kirjoitettu oikein?</li>
          <li>Onko <code>content/</code> kansio olemassa?</li>
        </ol>
        <p><a href="#/${sectionSlug}">← Takaisin osioon</a> | <a href="#/">Alkuun</a></p>
      `;
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

  notFound(sectionSlug, chapterSlug, section = null) {
    let html = '<h1>Lukua ei löytynyt</h1>';
    html += `<p>Etsitty: <code>${sectionSlug}/${chapterSlug}</code></p>`;
    
    if (section) {
      html += '<p>Saatavilla olevat luvut tässä osiossa:</p><ul>';
      section.chapters.forEach(ch => {
        html += `<li>${ch.title} → <code>${slugify(ch.title)}</code></li>`;
      });
      html += '</ul>';
    }
    
    html += '<p><a href="#/">Takaisin alkuun</a></p>';
    return html;
  }
}

// 2. Viedään kaikki controller-luokat
export { HomeController, SectionController, ChapterController };
