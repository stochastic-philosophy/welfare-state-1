import { Router } from './router.js';
import { HomeController } from './HomeController.js';
import { ChapterController } from './ChapterController.js';

function showError(message, details = '') {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div style="padding: 20px; border: 2px solid red; background: #fee; margin: 20px;">
      <h1 style="color: red;">⚠️ Virhe</h1>
      <p><strong>${message}</strong></p>
      ${details ? `<p style="font-size: 0.9em; color: #666;">${details}</p>` : ''}
    </div>
  `;
}

function showStatus(message) {
  const app = document.getElementById('app');
  app.innerHTML = `<p style="padding: 20px;">${message}</p>`;
}

document.addEventListener('DOMContentLoaded', async () => {
  showStatus('🔄 Ladataan documents.json...');
  
  let tocData;
  try {
    const response = await fetch('documents.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    tocData = await response.json();
    
    if (!tocData.sections || !Array.isArray(tocData.sections)) {
      throw new Error('documents.json ei sisällä "sections" taulukkoa');
    }
    
  } catch (error) {
    console.error("Datan lataus epäonnistui:", error);
    showError(
      'Sisällysluettelon lataus epäonnistui',
      `Syy: ${error.message}`
    );
    return;
  }

  try {
    const controllers = {};

    const router = new Router({ 
      root: document.getElementById('app'),
      controllers: controllers
    });

    const homeController = new HomeController(router, tocData);
    const chapterController = new ChapterController(
      router, 
      tocData, 
      () => homeController.getEnrichedData()
    );

    controllers.HomeController = () => homeController;
    controllers.ChapterController = () => chapterController;

    router.addRoute('/:section/:chapter', 'ChapterController', 'show');
    router.addRoute('/', 'HomeController', 'index');

    router.setNotFoundHandler(() => {
      router.render(`
        <h1 style="color: red;">404 - Sivua ei löytynyt</h1>
        <p><a href="#/">Takaisin sisällysluetteloon</a></p>
      `);
    });

    router.resolve();
    
  } catch (error) {
    console.error("Sovelluksen alustus epäonnistui:", error);
    showError(
      'Sovelluksen alustus epäonnistui',
      `Syy: ${error.message}`
    );
  }
});
