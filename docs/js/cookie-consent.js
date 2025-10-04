const CONSENT_KEY = 'cookie-consent';

export function hasConsent() {
  return localStorage.getItem(CONSENT_KEY) === 'granted';
}

export function grantConsent() {
  localStorage.setItem(CONSENT_KEY, 'granted');
  hideBanner();
}

export function revokeConsent() {
  localStorage.removeItem(CONSENT_KEY);
  localStorage.removeItem('preferred-theme');
  showBanner();
}

function showBanner() {
  let banner = document.getElementById('cookie-banner');
  if (!banner) {
    banner = createBanner();
    document.body.appendChild(banner);
  }
  banner.style.display = 'block';
}

function hideBanner() {
  const banner = document.getElementById('cookie-banner');
  if (banner) {
    banner.style.display = 'none';
  }
}

function createBanner() {
  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.innerHTML = `
    <div class="cookie-content">
      <h3>Evästeet ja tietojen tallennus</h3>
      <p>Tämä sivusto tallentaa teemavalinnan (vaalea/tumma) selaimeesi parantaakseen käyttökokemusta. 
      Voit halutessasi kieltää tallennuksen, mutta silloin teemavalinta ei säily selaimen sulkemisen jälkeen.</p>
      <div class="cookie-buttons">
        <button id="accept-cookies" class="cookie-btn accept">Hyväksy</button>
        <button id="decline-cookies" class="cookie-btn decline">Kiellä</button>
      </div>
    </div>
  `;
  
  banner.querySelector('#accept-cookies').addEventListener('click', grantConsent);
  banner.querySelector('#decline-cookies').addEventListener('click', () => {
    revokeConsent();
    hideBanner();
  });
  
  return banner;
}

export function initCookieConsent() {
  if (!hasConsent()) {
    showBanner();
  }
}

export function openCookieSettings() {
  const modal = document.createElement('div');
  modal.id = 'cookie-modal';
  modal.innerHTML = `
    <div class="cookie-modal-content">
      <h2>Tietosuoja-asetukset</h2>
      <p>Tämä sivusto tallentaa vain teemavalinnan (vaalea/tumma teema) selaimeesi. 
      Tietoa ei lähetetä mihinkään palvelimelle eikä käytetä seurantaan.</p>
      
      <h3>Tallennetut tiedot</h3>
      <ul>
        <li><strong>Teemavalinta:</strong> ${localStorage.getItem('preferred-theme') || 'Ei asetettu'}</li>
        <li><strong>Suostumus:</strong> ${hasConsent() ? 'Myönnetty' : 'Ei myönnetty'}</li>
      </ul>
      
      <h3>Hallinnoi tietoja</h3>
      <div class="cookie-buttons">
        <button id="revoke-consent" class="cookie-btn decline">Poista kaikki tallennetut tiedot</button>
        <button id="close-modal" class="cookie-btn accept">Sulje</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('#close-modal').addEventListener('click', () => {
    modal.remove();
  });
  
  modal.querySelector('#revoke-consent').addEventListener('click', () => {
    if (confirm('Haluatko varmasti poistaa kaikki tallennetut tiedot? Teemavalinta nollautuu.')) {
      revokeConsent();
      alert('Kaikki tallennetut tiedot poistettu.');
      modal.remove();
      location.reload();
    }
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}
