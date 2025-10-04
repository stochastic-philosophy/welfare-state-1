import { loadAllContent } from './content-loader.js';
import { generateTableOfContents } from './toc-generator.js';

export class HomeController {
  constructor(router, tocData) {
    this.router = router;
    this.tocData = tocData;
    this.enrichedData = null;
  }

  async index() {
    if (!this.enrichedData) {
      const loadingHtml = '<h1>Ladataan sisällysluetteloa...</h1><p>Luetaan markdown-tiedostoja ja parsitaan otsikot...</p>';
      this.router.render(loadingHtml);
      
      this.enrichedData = await loadAllContent(this.tocData);
    }
    
    return generateTableOfContents(this.enrichedData);
  }
  
  getEnrichedData() {
    return this.enrichedData;
  }
}
