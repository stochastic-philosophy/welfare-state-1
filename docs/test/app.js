// app.js

// 1. Tuodaan tarvittavat luokat ja kirjastot omista tiedostoistaan
import { Router } from './router.js';
import { HomeController, SectionController, PartController, ChapterController } from './controllers.js';

// 2. Sovelluksen käynnistysfunktio
document.addEventListener('DOMContentLoaded', async () => {
  let tocData;
  try {
    const response = await fetch('data.json'); // Varmista, että tiedoston nimi on oikein
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    tocData = await response.json();
  } catch (error) {
    console.error("Datan lataus epäonnistui:", error);
    document.getElementById('app').innerHTML = "<h1>Virhe</h1><p>Sisällysluettelon lataus epäonnistui. Tarkista, että data.json-tiedosto on olemassa.</p>";
    return;
  }

  // 3. Luodaan kontrollerien instanssit ja annetaan niille data
  const homeController = new HomeController(router, tocData);
  const sectionController = new SectionController(router, tocData);
  const partController = new PartController(router, tocData);
  const chapterController = new ChapterController(router, tocData);

  const controllers = {
    HomeController: () => homeController,
    SectionController: () => sectionController,
    PartController: () => partController,
    ChapterController: () => chapterController,
  };

  // 4. Luodaan reititin ja annetaan sille kontrollerit
  const router = new Router({ 
    root: document.getElementById('app'),
    controllers: controllers
  });

  // 5. Määritellään reitit (tarkimmasta yleisimpään)
  router.addRoute('/:section/:part/:chapter', 'ChapterController', 'show');
  router.addRoute('/:section/:part', 'PartController', 'show');
  router.addRoute('/:section', 'SectionController', 'show');
  router.addRoute('', 'HomeController', 'index');

  router.setNotFoundHandler(() => {
    router.render(`<h1 style="color: red;">404 - Sivua ei löytynyt</h1><p><a href="#/">Takaisin alkuun</a></p>`);
  });

  // 6. Käynnistetään reititin
  router.resolve();
});
