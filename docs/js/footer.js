import { openCookieSettings } from './cookie-consent.js';

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
        Sähköposti: stochasticphilosopher(at)gmail(dot)com
      </p>
      <p class="privacy">
        <a href="#" id="privacy-link">Tietosuoja-asetukset</a>
      </p>
    </div>
  `;
  
  document.body.appendChild(footer);
  
  document.getElementById('privacy-link').addEventListener('click', (e) => {
    e.preventDefault();
    openCookieSettings();
  });
}
