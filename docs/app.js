// app.js

// 1. Tuodaan tarvittavat luokat ja kirjastot omista tiedostoistaan
import { Router } from './router.js';
import { HomeController, SectionController, PartController, ChapterController } from './controllers.js';

// LISÄÄ TÄMÄ SKRIPTIN ALKUUN
window.onerror = function(message, source, lineno, colno, error) {
    // Näytä virhe punaisessa laatikossa sivun yläreunassa
    const errorBox = document.createElement('div');
    errorBox.style.position = 'fixed';
    errorBox.style.top = '10px';
    errorBox.style.left = '10px';
    errorBox.style.right = '10px';
    errorBox.style.background = 'red';
    errorBox.style.color = 'white';
    errorBox.style.padding = '15px';
    errorBox.style.borderRadius = '5px';
    errorBox.style.zIndex = '10000';
    errorBox.style.fontSize = '16px';
    errorBox.style.fontFamily = 'monospace';
    errorBox.innerHTML = `<strong>JavaScript-virhe!</strong><br>
                          Viesti: ${message}<br>
                          Tiedosto: ${source}<br>
                          Rivi: ${lineno}`;
    document.body.appendChild(errorBox);

    // Näytä myös perinteinen alert-ikkuna
    alert(`JavaScript-virhe!\n\n${message}\n\nTiedosto: ${source}\nRivi: ${lineno}`);
    
    return true; // Estää oletusvirheilmoituksen
};

// ---- AIEMPI KOODISI TÄHÄN ----
document.addEventListener('DOMContentLoaded', () => {
    // ...muu koodi...
});

// 2. Sovelluksen käynnistysfunktio
document.addEventListener('DOMContentLoaded', async () => {
  let tocData;
  try {
    const response = await fetch('content.json'); // Varmista, että tiedoston nimi on oikein
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
