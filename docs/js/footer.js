import { openCookieSettings } from './cookie-consent.js';
import { sendFeedback } from './email-helper.js';

export function initFooter() {
  const footer = document.createElement('footer');
  footer.id = 'site-footer';
  
  const currentYear = new Date().getFullYear();
  
  footer.innerHTML = `
    <div class="footer-content">
      <p class="copyright">
        © ${currentYear} Stochastic Philosopher
      </p>
      <p class="contact">
        <a href="#" id="email-link">📧 Lähetä palaute</a>
      </p>
      <p class="privacy">
        <a href="#" id="privacy-link">Tietosuoja-asetukset</a>
      </p>
    </div>
  `;
  
  document.body.appendChild(footer);
  
  document.getElementById('email-link').addEventListener('click', (e) => {
    e.preventDefault();
    sendFeedback();
  });
  
  document.getElementById('privacy-link').addEventListener('click', (e) => {
    e.preventDefault();
    openCookieSettings();
  });
}
