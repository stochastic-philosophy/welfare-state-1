// app2.js
// 1. Tuodaan tarvittavat luokat ja kirjastot omista tiedostoistaan
import { Router } from './router.js';
import { HomeController, SectionController, ChapterController } from './controllers.js';

// 2. Sovelluksen käynnistysfunktio
document.addEventListener('DOMContentLoaded', async () => {
  let tocData;
  try {
    const response = await fetch('documents.json');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    tocData = await response.json();
  } catch (error) {
    console.error("Datan lataus epäonnistui:", error);
    document.getElementById('app').innerHTML = "<h1>Virhe</h1><p>Sisällysluettelon lataus epäonnistui. Tarkista, että documents.json-tiedosto on olemassa.</p>";
    return;
  }

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
  router.addRoute('', 'HomeController', 'index');

  router.setNotFoundHandler(() => {
    router.render(`<h1 style="color: red;">404 - Sivua ei löytynyt</h1><p><a href="#/">Takaisin alkuun</a></p>`);
  });

  // 8. Käynnistetään reititin
  router.resolve();
});
