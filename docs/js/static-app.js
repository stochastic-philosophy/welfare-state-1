// Static page initialization
// Only used by static.html

// Initialize static page when DOM is ready
function initStaticPage() {
    // Consent already initialized by consent.js
    // Footer already initialized by footer.js
    
    // Any additional static page specific initialization goes here
    console.log('Static page initialized');
}

// Run initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStaticPage);
} else {
    initStaticPage();
}
