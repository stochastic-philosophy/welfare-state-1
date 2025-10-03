// controllers3.js - MINIMAALINEN TESTIVERSIO

// Apufunktio
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/å/g, 'a')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// HomeController
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
      return `<h1>Osiota ei löytynyt</h1><p>Etsitty: ${sectionSlug}</p><p><a href="#/">Takaisin</a></p>`;
    }

    let html = `<h1>${section.title}</h1>`;
    html += '<p>Valitse luku:</p>';
    html += '<nav><ul>';
    
    section.chapters.forEach(chapter => {
      const chapterSlug = slugify(chapter.title);
      html += `<li><a href="#/${sectionSlug}/${chapterSlug}">${chapter.title}</a></li>`;
    });
    
    html += '</ul></nav>';
    html += `<p><a href="#/">← Takaisin</a></p>`;
    return html;
  }
}

// ChapterController - ILMAN MARKED-KIRJASTOA
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
      return `<h1>Lukua ei löytynyt</h1><p><a href="#/${sectionSlug}">Takaisin</a></p>`;
    }
    
    const chapter = section.chapters[chapterIndex];
    
    try {
      const response = await fetch(chapter.file);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const markdown = await response.text();
      
      // Yksinkertainen markdown -> HTML (ilman kirjastoa)
      let html = markdown
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^\- (.+)$/gm, '<li>$1</li>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/<li>/g, '<ul><li>')
        .replace(/<\/li>(?!<li>)/g, '</li></ul>');
      
      html = '<p>' + html + '</p>';
      
      let output = '<article>';
      output += this.createNav(section, chapterIndex);
      output += html;
      output += this.createNav(section, chapterIndex);
      output += '</article>';
      
      return output;
    } catch (error) {
      return `<h1>Virhe</h1><p>Lataus epäonnistui: ${error.message}</p><p>Tiedosto: ${chapter.file}</p>`;
    }
  }

  createNav(section, index) {
    const sectionSlug = slugify(section.title);
    const chapters = section.chapters;
    
    let nav = '<div class="chapter-nav">';
    
    if (index > 0) {
      const prev = chapters[index - 1];
      nav += `<a href="#/${sectionSlug}/${slugify(prev.title)}">← ${prev.title}</a>`;
    } else {
      nav += '<span></span>';
    }
    
    nav += `<a href="#/${sectionSlug}">↑ Takaisin</a>`;
    
    if (index < chapters.length - 1) {
      const next = chapters[index + 1];
      nav += `<a href="#/${sectionSlug}/${slugify(next.title)}">${next.title} →</a>`;
    } else {
      nav += '<span></span>';
    }
    
    nav += '</div>';
    return nav;
  }
}

export { HomeController, SectionController, ChapterController };
