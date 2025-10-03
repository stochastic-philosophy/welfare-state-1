// app2.js
// Tuodaan tarvittavat luokat erillisistä tiedostoista
import { Router } from './router.js';
import { HomeController } from './HomeController.js';
import { SectionController } from './SectionController.js';
import { ChapterController } from './ChapterController.js';

// Apufunktio virheiden näyttämiseen sivulla
function showError(message, details = '') {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div style="padding: 20px; border: 2px solid red; background: #fee; margin: 20px;">
      <h1 style="color: red;">⚠️ Virhe</h1>
      <p><strong>${message}</strong></p>
      ${details ? `<p style="font-size: 0.9em; color: #666;">${details}</p>` : ''}
      <hr>
      <h3>Tarkistuslista:</h3>
      <ol>
        <li>Onko <code>content.json</code> tiedosto olemassa?</li>
        <li>Onko <code>content/</code> kansio olemassa?</li>
        <li>Ovatko markdown-tiedostot <code>content/</code> kansiossa?</li>
        <li>Onko GitHub Pages päällä?</li>
      </ol>
    </div>
  `;
}

function showStatus(message) {
  const app = document.getElementById('app');
  app.innerHTML = `<p style="padding: 20px;">${message}</p>`;
}

// Sovelluksen käynnistysfunktio
document.addEventListener('DOMContentLoaded', async () => {
  showStatus('🔄 Ladataan content.json...');
  
  let tocData;
  try {
    const response = await fetch('content.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    tocData = await response.json();
    
    // Tarkistetaan että data on oikeassa muodossa
    if (!tocData.sections || !Array.isArray(tocData.sections)) {
      throw new Error('content.json ei sisällä "sections" taulukkoa');
    }
    
    showStatus('✅ content.json ladattu! Alustetaan sovellus...');
    
  } catch (error) {
    console.error("Datan lataus epäonnistui:", error);
    showError(
      'Sisällysluettelon lataus epäonnistui',
      `Syy: ${error.message}<br><br>Varmista että <code>content.json</code> on repositoryn juuressa.`
    );
    return;
  }

  try {
    // Luodaan ensin tyhjä controllers-objekti
    const controllers = {};

    // Luodaan reititin ENSIN
    const router = new Router({ 
      root: document.getElementById('app'),
      controllers: controllers
    });

    // Luodaan kontrollerien instanssit
    const homeController = new HomeController(router, tocData);
    const sectionController = new SectionController(router, tocData);
    const chapterController = new ChapterController(router, tocData);

    // Asetetaan controllerit controllers-objektiin
    controllers.HomeController = () => homeController;
    controllers.SectionController = () => sectionController;
    controllers.ChapterController = () => chapterController;

    // Määritellään reitit (tarkimmasta yleisimpään)
    router.addRoute('/:section/:chapter', 'ChapterController', 'show');
    router.addRoute('/:section', 'SectionController', 'show');
    router.addRoute('', 'HomeController', 'index');

    router.setNotFoundHandler(() => {
      router.render(`
        <h1 style="color: red;">404 - Sivua ei löytynyt</h1>
        <p><a href="#/">Takaisin alkuun</a></p>
        <hr>
        <p style="font-size: 0.9em; color: #666;">URL: ${window.location.hash}</p>
      `);
    });

    // Käynnistetään reititin
    showStatus('✅ Sovellus alustettu! Käynnistetään reititin...');
    router.resolve();
    
  } catch (error) {
    console.error("Sovelluksen alustus epäonnistui:", error);
    showError(
      'Sovelluksen alustus epäonnistui',
      `Syy: ${error.message}<br><br>Stack: ${error.stack}`
    );
  }
});
