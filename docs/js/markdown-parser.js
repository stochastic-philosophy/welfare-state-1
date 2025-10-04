import { slugify } from './utils.js';

export function extractHeadings(markdown) {
  const headings = [];
  const lines = markdown.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = slugify(text);
      
      headings.push({
        level: level,
        text: text,
        id: id,
        line: i
      });
    }
  }
  
  return headings;
}

export function addIdsToHeadings(html) {
  return html.replace(/<h([1-6])>(.+?)<\/h\1>/g, (match, level, text) => {
    const id = slugify(text);
    return `<h${level} id="${id}">${text}</h${level}>`;
  });
}
