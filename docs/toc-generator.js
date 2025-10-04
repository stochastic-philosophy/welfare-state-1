import { slugify } from './utils.js';

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
      
      if (chapter.headings && chapter.headings.length > 0) {
        html += `<ul class="toc-headings">`;
        
        chapter.headings.forEach(heading => {
          const indent = (heading.level - 1) * 20;
          html += `<li style="margin-left: ${indent}px;">`;
          html += `<a href="#/${sectionSlug}/${chapterSlug}#${heading.id}">`;
          html += heading.text;
          html += `</a>`;
          html += `</li>`;
        });
        
        html += `</ul>`;
      }
      
      html += `</div>`;
    });
    
    html += `</div>`;
  });
  
  html += '</nav>';
  
  return html;
}
