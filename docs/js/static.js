import { initThemeSwitcher } from './theme-switcher.js';
import { initCookieConsent } from './cookie-consent.js';
import { initFooter } from './footer.js';

document.addEventListener('DOMContentLoaded', () => {
  initCookieConsent();
  //initThemeSwitcher();
  initFooter();
  
  const spaButton = document.createElement('button');
  spaButton.id = 'spa-link';
  spaButton.textContent = '📄 js-versio';
  spaButton.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
  document.body.appendChild(spaButton);
});
