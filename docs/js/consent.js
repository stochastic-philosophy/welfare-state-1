// Consent and Theme Management
// Shared between index.html and static.html

const CONSENT_KEY = 'theme-consent';
const THEME_KEY = 'theme-preference';
let consentGiven = null;
let initialized = false;

// Initialize consent check on page load
function initConsent() {
    // Prevent multiple initializations
    if (initialized) return;
    initialized = true;
    
    checkConsent();
}

function checkConsent() {
    try {
        const savedConsent = localStorage.getItem(CONSENT_KEY);
        
        if (savedConsent !== null) {
            consentGiven = savedConsent === 'true';
            
            if (consentGiven === true) {
                // User has given consent - load saved theme
                loadTheme();
            } else {
                // User has denied consent - apply default theme
                applyDefaultTheme();
            }
        } else {
            // No consent saved - this is first visit
            consentGiven = null;
            applyDefaultTheme();
            // Show modal after a short delay
            setTimeout(showConsentModal, 1000);
        }
    } catch (e) {
        console.error('Error checking consent:', e);
        consentGiven = false;
        applyDefaultTheme();
    }
}

function applyDefaultTheme() {
    document.body.setAttribute('data-theme', 'light');
    updateThemeIcon('light');
}

function showConsentModal() {
    const modal = document.getElementById('consentModal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error('Consent modal element not found');
    }
}

function hideConsentModal() {
    const modal = document.getElementById('consentModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function handleConsent(consent) {
    consentGiven = consent;
    hideConsentModal();
    
    try {
        if (consent === true) {
            // User gave consent - save consent and current theme
            localStorage.setItem(CONSENT_KEY, 'true');
            const currentTheme = document.body.getAttribute('data-theme') || 'light';
            localStorage.setItem(THEME_KEY, currentTheme);
        } else {
            // User denied consent - save the denial but don't save theme
            localStorage.setItem(CONSENT_KEY, 'false');
            // Don't remove CONSENT_KEY - we need to remember they said no
        }
    } catch (e) {
        console.error('Error saving consent:', e);
        consentGiven = false;
    }
}

function loadTheme() {
    try {
        const savedTheme = localStorage.getItem(THEME_KEY);
        
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            document.body.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        } else {
            applyDefaultTheme();
        }
    } catch (e) {
        console.error('Error loading theme:', e);
        applyDefaultTheme();
    }
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Apply the new theme immediately
    document.body.setAttribute('data-theme', newTheme);
    updateThemeIcon(newTheme);
    
    // Handle consent
    if (consentGiven === true) {
        // User has already given consent - save the theme
        try {
            localStorage.setItem(THEME_KEY, newTheme);
        } catch (e) {
            console.error('Error saving theme:', e);
        }
    } else if (consentGiven === null) {
        // No consent yet - ask for it
        showConsentModal();
    } else {
        // User has denied consent - show modal to ask again
        showConsentModal();
    }
}

function updateThemeIcon(theme) {
    const iconElement = document.getElementById('themeIcon');
    if (iconElement) {
        iconElement.textContent = theme === 'light' ? '🌙' : '☀️';
    }
}

// Wait for DOM to be fully loaded before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConsent);
} else {
    // DOM is already loaded
    initConsent();
}
