import { slugify } from './utils.js';

function generateHeadingsList(headings, sectionSlug, chapterSlug) {
  if (!headings || headings.length === 0) return '';
  
  let html = '';
  let currentLevel = 0;
  let openLists = 0;
  
  headings.forEach((heading, index) => {
    const level = heading.level;
    
    if (level > currentLevel) {
      for (let i = currentLevel; i < level; i++) {
        html += '<ul class="toc-headings">';
        openLists++;
      }
    } else if (level < currentLevel) {
      for (let i = level; i < currentLevel; i++) {
        html += '</li></ul>';
        openLists--;
      }
      html += '</li>';
    } else if (index > 0) {
      html += '</li>';
    }
    
    html += `<li><a href="#/${sectionSlug}/${chapterSlug}#${heading.id}">${heading.text}</a>`;
    
    currentLevel = level;
  });
  
  html += '</li>';
  
  while (openLists > 0) {
    html += '</ul>';
    openLists--;
  }
  
  return html;
}

export function generateTableOfContents(enrichedData) {
  let html = `<h1>${enrichedData.title}</h1>`;
  html += '<nav class="table-of-contents">';
  
  enrichedData.sections.forEach(section => {
    const sectionSlug = slugify(section.title);
    
    html += `<div class="toc-section">`;
    html += `<h2 class="toc-main-heading">${section.title}</h2>`;
    
    section.chapters.forEach(chapter => {
      const chapterSlug = slugify(chapter.title);
      
      html += `<div class="toc-chapter">`;
      html += `<a href="#/${sectionSlug}/${chapterSlug}" class="toc-chapter-link">`;
      html += `<strong>${chapter.title}</strong>`;
      html += `</a>`;
      
      html += generateHeadingsList(chapter.headings, sectionSlug, chapterSlug);
      
      html += `</div>`;
    });
    
    html += `</div>`;
  });
  
  html += '</nav>';
  
  return html;
}
