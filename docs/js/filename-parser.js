export function parseFilename(filename) {
  const match = filename.match(/^(.+)_osa(\d+)\.md$/);
  
  if (!match) {
    console.warn(`Tiedostonimi ei vastaa kaavaa: ${filename}`);
    return null;
  }
  
  const baseName = match[1];
  const partNumber = parseInt(match[2], 10);
  
  const cleanName = baseName
    .replace(/_v\d+$/, '')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return {
    baseName: baseName,
    cleanName: cleanName,
    partNumber: partNumber,
    filename: filename
  };
}

export function groupFilesBySection(files, contentDir) {
  const parsed = files
    .map(parseFilename)
    .filter(p => p !== null);
  
  const grouped = {};
  
  parsed.forEach(item => {
    if (!grouped[item.baseName]) {
      grouped[item.baseName] = {
        title: item.cleanName,
        chapters: []
      };
    }
    
    grouped[item.baseName].chapters.push({
      title: `Osa ${item.partNumber}`,
      file: `${contentDir}/${item.filename}`,
      partNumber: item.partNumber
    });
  });
  
  const sections = Object.values(grouped).map(section => {
    section.chapters.sort((a, b) => a.partNumber - b.partNumber);
    return section;
  });
  
  sections.sort((a, b) => {
    const firstA = a.chapters[0]?.filename || '';
    const firstB = b.chapters[0]?.filename || '';
    return firstA.localeCompare(firstB);
  });
  
  return sections;
}
