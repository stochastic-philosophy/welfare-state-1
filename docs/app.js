// app.js
// 1. Tuodaan tarvittavat luokat ja kirjastot omista tiedostoistaan
import { Router } from './router.js';
import { HomeController } from 'home-controller.js';
import { SectionController, ChapterController } from './controllers.js';

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
        <li>Onko <code>documents.json</code> tiedosto olemassa?</li>
        <li>Onko <code>documents/</code> kansio olemassa?</li>
        <li>Ovatko markdown-tiedostot <code>documents/</code> kansiossa?</li>
        <li>Onko GitHub Pages päällä?</li>
      </ol>
    </div>
  `;
}

function showStatus(message) {
  const app = document.getElementById('app');
  app.innerHTML = `<p style="padding: 20px;">${message}</p>`;
}

// 2. Sovelluksen käynnistysfunktio
document.addEventListener('DOMContentLoaded', async () => {
  showStatus('🔄 Ladataan documents.json...');
  
  let tocData;
  try {
    // TÄRKEÄ: Varmista että tiedoston nimi on oikea!
    const response = await fetch('documents.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    tocData = await response.json();
    
    // Tarkistetaan että data on oikeassa muodossa
    if (!tocData.sections || !Array.isArray(tocData.sections)) {
      throw new Error('documents.json ei sisällä "sections" taulukkoa');
    }
    
    showStatus('✅ documents.json ladattu! Alustetaan sovellus...');
    
  } catch (error) {
    console.error("Datan lataus epäonnistui:", error);
    showError(
      'Sisällysluettelon lataus epäonnistui',
      `Syy: ${error.message}<br><br>Varmista että <code>documents.json</code> on repositoryn juuressa.`
    );
    return;
  }

  try {
    // 3. Luodaan ensin tyhjä controllers-objekti
    const controllers = {};

    // 4. Luodaan reititin ENSIN (ennen controllereita!)
    const router = new Router({ 
      root: document.getElementById('app'),
      controllers: controllers
    });

    // 5. Luodaan kontrollerien instanssit ja annetaan niille router + data
    const homeController = new HomeController(router, tocData);
    const sectionController = new SectionController(router, tocData);
    const chapterController = new ChapterController(router, tocData);

    // 6. Asetetaan controllerit controllers-objektiin
    controllers.HomeController = () => homeController;
    controllers.SectionController = () => sectionController;
    controllers.ChapterController = () => chapterController;

    // 7. Määritellään reitit (tarkimmasta yleisimpään)
    router.addRoute('/:section/:chapter', 'ChapterController', 'show');
    router.addRoute('/:section', 'SectionController', 'show');
    router.addRoute('/', 'HomeController', 'index');

    router.setNotFoundHandler(() => {
      router.render(`
        <h1 style="color: red;">404 - Sivua ei löytynyt</h1>
        <p><a href="#/">Takaisin alkuun</a></p>
        <hr>
        <p style="font-size: 0.9em; color: #666;">URL: ${window.location.hash}</p>
      `);
    });

    // 8. Käynnistetään reititin
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
