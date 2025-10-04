const THEME_KEY = 'preferred-theme';
const THEMES = {
  light: 'theme-light.css',
  dark: 'theme-dark.css'
};

function getCurrentTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

function setTheme(themeName) {
  const link = document.getElementById('theme-stylesheet');
  if (link) {
    link.href = THEMES[themeName];
    localStorage.setItem(THEME_KEY, themeName);
  }
}

function toggleTheme() {
  const current = getCurrentTheme();
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
  updateToggleButton();
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
