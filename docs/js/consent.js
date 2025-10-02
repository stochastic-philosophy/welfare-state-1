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
            // Only load theme if consent was given
            if (consentGiven === true) {
                loadTheme();
            } else {
                // Apply default theme (light) if no consent
                applyDefaultTheme();
            }
        } else {
            // No consent saved - show modal and apply default theme
            applyDefaultTheme();
            showConsentModal();
        }
    } catch (e) {
        console.warn('LocalStorage ei ole käytettävissä:', e);
        consentGiven = false;
        applyDefaultTheme();
    }
}

function applyDefaultTheme() {
    // Apply light theme as default
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
        localStorage.setItem(CONSENT_KEY, consent.toString());
        
        if (consent === true) {
            // User gave consent - save current theme
            const currentTheme = document.body.getAttribute('data-theme') || 'light';
            saveTheme(currentTheme);
        } else {
            // User denied consent - remove all stored data for this site
            clearSiteData();
        }
    } catch (e) {
        console.warn('LocalStorage tallennus epäonnistui:', e);
        consentGiven = false;
    }
}

function clearSiteData() {
    try {
        // Remove all data stored by this site
        localStorage.removeItem(CONSENT_KEY);
        localStorage.removeItem(THEME_KEY);
        console.log('Kaikki sivuston tallennetut tiedot poistettu');
    } catch (e) {
        console.warn('Tietojen poisto epäonnistui:', e);
    }
}

function loadTheme() {
    try {
        const savedConsent = localStorage.getItem(CONSENT_KEY);
        if (savedConsent === 'true') {
            const savedTheme = localStorage.getItem(THEME_KEY);
            if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
                document.body.setAttribute('data-theme', savedTheme);
                updateThemeIcon(savedTheme);
            } else {
                // No valid theme saved, apply default
                applyDefaultTheme();
            }
        }
    } catch (e) {
        console.warn('Teeman lataus epäonnistui:', e);
        applyDefaultTheme();
    }
}

function saveTheme(theme) {
    if (consentGiven === true) {
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
    
    // Only save theme if consent has been given
    if (consentGiven === true) {
        saveTheme(newTheme);
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
    // Clear any existing timeout that might hide the modal
    if (window.consentModalTimeout) {
        clearTimeout(window.consentModalTimeout);
    }
    showConsentModal();
}

// Function to handle consent modal visibility toggle
function toggleConsentModal() {
    const modal = document.getElementById('consentModal');
    if (modal) {
        if (modal.style.display === 'block') {
            hideConsentModal();
        } else {
            showConsentModalFromFooter();
        }
    }
}

// Export functions for global access
window.ConsentManager = {
    init: initConsent,
    show: showConsentModalFromFooter,
    hide: hideConsentModal,
    toggle: toggleConsentModal,
    clearData: clearSiteData,
    handleConsent: handleConsent,
    hasConsent: () => consentGiven === true
};

// Auto-hide modal after 30 seconds if no interaction (optional)
function setupAutoHide() {
    const modal = document.getElementById('consentModal');
    if (modal) {
        let autoHideTimeout;
        
        const resetAutoHide = () => {
            if (autoHideTimeout) {
                clearTimeout(autoHideTimeout);
            }
            autoHideTimeout = setTimeout(() => {
                if (modal.style.display === 'block' && consentGiven === null) {
                    // User hasn't made a choice - treat as denial
                    handleConsent(false);
                }
            }, 30000); // 30 seconds
        };
        
        // Reset timeout when mouse enters modal
        modal.addEventListener('mouseenter', resetAutoHide);
        modal.addEventListener('click', resetAutoHide);
        
        // Start auto-hide timer when modal is shown
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style' && 
                    modal.style.display === 'block') {
                    resetAutoHide();
                }
            });
        });
        
        observer.observe(modal, { attributes: true });
    }
}

// Initialize auto-hide when DOM is ready
document.addEventListener('DOMContentLoaded', setupAutoHide);
