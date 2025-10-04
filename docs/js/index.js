import { initThemeSwitcher } from './js/theme-switcher.js';
import { initCookieConsent } from './js/cookie-consent.js';
import { initFooter } from './js/footer.js';
        
initCookieConsent();
const staticButton = document.createElement('button');
staticButton.id = 'static-link';
staticButton.textContent = '🤖 Botti-versio';
staticButton.addEventListener('click', () => {
  window.location.href = 'static.html';
});
document.body.appendChild(staticButton);
initThemeSwitcher();
initFooter();
