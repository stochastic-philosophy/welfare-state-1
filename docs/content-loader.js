import { extractHeadings } from './markdown-parser.js';

export async function loadAllContent(tocData) {
  const enrichedData = {
    title: tocData.title,
    sections: []
  };
  
  for (const section of tocData.sections) {
    const enrichedSection = {
      title: section.title,
      description: section.description,
      chapters: []
    };
    
    for (const chapter of section.chapters) {
      try {
        const response = await fetch(chapter.file);
        if (!response.ok) {
          console.warn(`Ei voitu ladata: ${chapter.file}`);
          enrichedSection.chapters.push({
            ...chapter,
            headings: [],
            error: `HTTP ${response.status}`
          });
          continue;
        }
        
        const markdown = await response.text();
        const headings = extractHeadings(markdown);
        
        enrichedSection.chapters.push({
          ...chapter,
          headings: headings,
          markdown: markdown
        });
        
      } catch (error) {
        console.error(`Virhe ladattaessa ${chapter.file}:`, error);
        enrichedSection.chapters.push({
          ...chapter,
          headings: [],
          error: error.message
        });
      }
    }
    
    enrichedData.sections.push(enrichedSection);
  }
  
  return enrichedData;
}
