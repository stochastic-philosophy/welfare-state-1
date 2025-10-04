import { hasConsent } from './cookie-consent.js';

const THEME_KEY = 'preferred-theme';
const THEMES = {
  light: 'css/theme-light.css',
  dark: 'css/theme-dark.css'
};

function getCurrentTheme() {
  if (hasConsent()) {
    return localStorage.getItem(THEME_KEY) || 'light';
  }
  return 'light';
}

function setTheme(themeName) {
  const link = document.getElementById('theme-stylesheet');
  if (link) {
    link.href = THEMES[themeName];
    if (hasConsent()) {
      localStorage.setItem(THEME_KEY, themeName);
    }
  }
}

function toggleTheme() {
  const current = getCurrentTheme();
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
  updateToggleButton();
  
  if (!hasConsent()) {
    alert('Teemavalinta ei tallennu koska et ole hyväksynyt tietojen tallennusta. Valinta nollautuu selaimen päivityksen yhteydessä.');
  }
}

function updateToggleButton() {
  const button = document.getElementById('theme-toggle');
  if (button) {
    const current = getCurrentTheme();
    button.textContent = current === 'light' ? '🌙 Tumma' : '☀️ Vaalea';
  }
}

export function initThemeSwitcher() {
  const savedTheme = getCurrentTheme();
  setTheme(savedTheme);
  
  const button = document.createElement('button');
  button.id = 'theme-toggle';
  button.addEventListener('click', toggleTheme);
  document.body.appendChild(button);
  
  updateToggleButton();
}
