import { slugify } from './utils.js';
import { md } from './markdown-config.js';
import { addIdsToHeadings } from './markdown-parser.js';

export class ChapterController {
  constructor(router, tocData, getEnrichedDataFn) {
    this.router = router;
    this.tocData = tocData;
    this.getEnrichedData = getEnrichedDataFn;
  }

  async show(params) {
    const sectionSlug = params.section;
    const chapterSlug = params.chapter;
    
    const fullHash = window.location.hash;
    const anchorIndex = fullHash.indexOf('#', 1);
    const anchorId = anchorIndex > 0 ? fullHash.substring(anchorIndex + 1) : null;
    
    const enrichedData = this.getEnrichedData();
    if (!enrichedData) {
      return '<h1>Virhe</h1><p>Sisältöä ei ole vielä ladattu. <a href="#/">Palaa etusivulle</a></p>';
    }
    
    const section = enrichedData.sections.find(s => slugify(s.title) === sectionSlug);
    if (!section) {
      return `<h1>Osiota ei löytynyt</h1><p><a href="#/">Takaisin</a></p>`;
    }
    
    const chapterIndex = section.chapters.findIndex(c => slugify(c.title) === chapterSlug);
    if (chapterIndex === -1) {
      return `<h1>Lukua ei löytynyt</h1><p><a href="#/">Takaisin</a></p>`;
    }
    
    const chapter = section.chapters[chapterIndex];
    
    if (chapter.error) {
      return `<h1>Virhe</h1><p>Luvun lataus epäonnistui: ${chapter.error}</p><p><a href="#/">Takaisin</a></p>`;
    }
    
    let contentHtml = md.render(chapter.markdown);
    contentHtml = addIdsToHeadings(contentHtml);
    
    let html = '<article>';
    html += this.createNavigation(section, chapterIndex);
    html += contentHtml;
    html += this.createNavigation(section, chapterIndex);
    html += '</article>';
    
    if (anchorId) {
      setTimeout(() => {
        const element = document.getElementById(anchorId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          element.style.backgroundColor = '#ffffcc';
          setTimeout(() => {
            element.style.transition = 'background-color 2s';
            element.style.backgroundColor = '';
          }, 500);
        }
      }, 100);
    }
    
    return html;
  }

  createNavigation(section, index) {
    const sectionSlug = slugify(section.title);
    const chapters = section.chapters;
    
    let nav = '<div class="chapter-nav">';
    
    if (index > 0) {
      const prev = chapters[index - 1];
      nav += `<a href="#/${sectionSlug}/${slugify(prev.title)}" class="nav-link">← ${prev.title}</a>`;
    } else {
      nav += '<span></span>';
    }
    
    nav += `<a href="#/" class="nav-link">↑ Sisällysluettelo</a>`;
    
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
