// Consent and Theme Management consent.js
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
            setTimeout(showConsentModal, 500);
        }
    } catch (e) {
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
        // First save the consent decision
        localStorage.setItem(CONSENT_KEY, consent.toString());
        
        if (consent === true) {
            // User gave consent - save current theme
            const currentTheme = document.body.getAttribute('data-theme') || 'light';
            localStorage.setItem(THEME_KEY, currentTheme);
        } else {
            // User denied consent - remove all stored data
            localStorage.removeItem(CONSENT_KEY);
            localStorage.removeItem(THEME_KEY);
        }
    } catch (e) {
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
            // Silently fail
        }
    } else if (consentGiven === null) {
        // No consent yet - ask for it
        showConsentModal();
    }
    // If consentGiven is false, don't save anything
}

function updateThemeIcon(theme) {
    const iconElement = document.getElementById('themeIcon');
    if (iconElement) {
        iconElement.textContent = theme === 'light' ? '🌙' : '☀️';
    }
}

// Function to show consent modal from footer link
function showConsentModalFromFooter() {
    showConsentModal();
}

// Export functions for global access
window.ConsentManager = {
    init: initConsent,
    show: showConsentModalFromFooter,
    hide: hideConsentModal,
    handleConsent: handleConsent,
    hasConsent: () => consentGiven === true
};

// Initialize immediately when script loads
initConsent();

// Also initialize when DOM is ready (backup)
document.addEventListener('DOMContentLoaded', initConsent);
