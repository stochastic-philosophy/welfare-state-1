// Consent and Theme Management
// Shared between index.html and static.html

const CONSENT_KEY = 'theme-consent';
const THEME_KEY = 'theme-preference';
let consentGiven = null;

// Initialize consent check on page load
function initConsent() {
    checkConsent();
}

function checkConsent() {
    try {
        const savedConsent = localStorage.getItem(CONSENT_KEY);
        if (savedConsent !== null) {
            consentGiven = savedConsent === 'true';
            if (consentGiven) {
                loadTheme();
            }
        } else {
            showConsentModal();
        }
    } catch (e) {
        console.warn('LocalStorage ei ole käytettävissä:', e);
        consentGiven = false;
    }
}

function showConsentModal() {
    const modal = document.getElementById('consentModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function handleConsent(consent) {
    consentGiven = consent;
    const modal = document.getElementById('consentModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    try {
        localStorage.setItem(CONSENT_KEY, consent.toString());
        if (consent) {
            // Tallenna nykyinen teema
            saveTheme(document.body.getAttribute('data-theme'));
        } else {
            // KRIITTINEN KORJAUS: Poista tallennettu theme jos käyttäjä kieltäytyy
            localStorage.removeItem(THEME_KEY);
            consentGiven = false;
        }
    } catch (e) {
        console.warn('LocalStorage tallennus epäonnistui:', e);
    }
}

function loadTheme() {
    try {
        const savedConsent = localStorage.getItem(CONSENT_KEY);
        if (savedConsent === 'true') {
            const savedTheme = localStorage.getItem(THEME_KEY);
            if (savedTheme) {
                document.body.setAttribute('data-theme', savedTheme);
                updateThemeIcon(savedTheme);
            }
        }
    } catch (e) {
        console.warn('LocalStorage ei ole käytettävissä:', e);
    }
}

function saveTheme(theme) {
    if (consentGiven) {
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (e) {
            console.warn('Teeman tallennus epäonnistui:', e);
        }
    }
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    updateThemeIcon(newTheme);
    saveTheme(newTheme);
    
    // Jos lupaa ei ole annettu, kysy uudelleen
    if (consentGiven === null) {
        showConsentModal();
    }
}

function updateThemeIcon(theme) {
    const iconElement = document.getElementById('themeIcon');
    if (iconElement) {
        iconElement.textContent = theme === 'light' ? '🌙' : '☀️';
    }
}
