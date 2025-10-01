// Initialize markdown-it
const md = window.markdownit({
    html: true,
    linkify: true,
    typographer: true
});

// Global state
let contentData = null;
let allPages = [];
let currentPageIndex = -1;
let consentGiven = null;

const CONSENT_KEY = 'theme-consent';
const THEME_KEY = 'theme-preference';

// Initialize the application
async function init() {
    checkConsent();
    await loadContentData();
    handleRoute();
    window.addEventListener('hashchange', handleRoute);
}

// Theme management
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
    document.getElementById('consentModal').style.display = 'block';
}

function handleConsent(consent) {
    consentGiven = consent;
    document.getElementById('consentModal').style.display = 'none';
    
    try {
        localStorage.setItem(CONSENT_KEY, consent.toString());
        if (consent) {
            saveTheme(document.body.getAttribute('data-theme'));
        }
    } catch (e) {
        console.warn('LocalStorage tallennus epäonnistui:', e);
    }
}

function loadTheme() {
    try {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        }
    } catch (e) {
        console.warn('Teeman lataus epäonnistui:', e);
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
    
    if (consentGiven === null) {
        showConsentModal();
    }
}

function updateThemeIcon(theme) {
    document.getElementById('themeIcon').textContent = theme === 'light' ? '🌙' : '☀️';
}

// Content loading
async function loadContentData() {
    try {
        const response = await fetch('content.json');
        if (!response.ok) throw new Error('Sisällysluettelon lataus epäonnistui');
        contentData = await response.json();
        buildPagesList();
    } catch (error) {
        showError('Virhe sisällysluettelon latauksessa: ' + error.message);
    }
}

// Build flat list of all pages for navigation
function buildPagesList() {
    allPages = [];
    
    if (!contentData || !contentData.sections) return;
    
    contentData.sections.forEach(section => {
        if (section.parts) {
            section.parts.forEach(part => {
                if (part.file) {
                    allPages.push({
                        id: part.id,
                        title: part.title,
                        file: part.file,
                        type: 'part'
                    });
                } else if (part.chapters) {
                    part.chapters.forEach((chapter, index) => {
                        allPages.push({
                            id: `${part.id}-chapter-${index}`,
                            title: chapter.title,
                            file: chapter.file,
                            type: 'chapter'
                        });
                    });
                }
            });
        }
    });
}

// Routing
function handleRoute() {
    const hash = window.location.hash.slice(1);
    
    if (!hash) {
        showTableOfContents();
    } else {
        const pageIndex = allPages.findIndex(p => p.id === hash);
        if (pageIndex !== -1) {
            currentPageIndex = pageIndex;
            showPage(allPages[pageIndex]);
        } else {
            showError('Sivua ei löytynyt');
        }
    }
}

// Display table of contents
function showTableOfContents() {
    currentPageIndex = -1;
    updateNavButtons();
    
    if (!contentData) {
        showError('Sisällysluettelo ei ole saatavilla');
        return;
    }
    
    let html = '<div class="toc-intro">';
    html += '<h2>' + contentData.title + '</h2>';
    html += '<p class="description">' + contentData.description + '</p>';
    html += '</div>';
    
    if (contentData.sections) {
        contentData.sections.forEach(section => {
            html += renderSection(section);
        });
    }
    
    document.getElementById('contentArea').innerHTML = html;
}

// Render a section recursively
function renderSection(section) {
    let html = '<div class="section-container">';
    html += '<h3 class="section-title">' + section.title + '</h3>';
    html += '<p class="section-description">' + section.description + '</p>';
    
    if (section.parts) {
        section.parts.forEach(part => {
            html += renderPart(part);
        });
    }
    
    html += '</div>';
    return html;
}

// Render a part
function renderPart(part) {
    let html = '<div class="part-container">';
    html += '<h4 class="part-title">' + part.title + '</h4>';
    html += '<p class="part-description">' + part.description + '</p>';
    
    if (part.file) {
        // Direct file reference - show as single item with buttons
        html += '<div class="chapter-item">';
        html += '<div class="chapter-title">';
        html += '<span>' + part.title + '</span>';
        html += '<div>';
        html += '<button class="download-btn" onclick="downloadFile(\'' + part.file + '\', \'' + sanitizeFilename(part.title) + '.md\')">📥 Lataa</button>';
        html += '<button class="download-btn view-btn" onclick="viewPage(\'' + part.id + '\')">👁️ Näytä</button>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
    } else if (part.chapters) {
        // Has chapters - show all with their descriptions
        html += '<ul class="chapter-list">';
        part.chapters.forEach((chapter, index) => {
            html += '<li class="chapter-item">';
            html += '<div class="chapter-title">';
            html += '<span>' + chapter.title + '</span>';
            html += '<div>';
            html += '<button class="download-btn" onclick="downloadFile(\'' + chapter.file + '\', \'' + sanitizeFilename(chapter.title) + '.md\')">📥 Lataa</button>';
            html += '<button class="download-btn view-btn" onclick="viewPage(\'' + part.id + '-chapter-' + index + '\')">👁️ Näytä</button>';
            html += '</div>';
            html += '</div>';
            html += '<p class="chapter-description">' + chapter.description + '</p>';
            html += '</li>';
        });
        html += '</ul>';
    }
    
    html += '</div>';
    return html;
}

// Show a page with markdown content
async function showPage(page) {
    updateNavButtons();
    
    try {
        const response = await fetch(page.file);
        if (!response.ok) throw new Error('Tiedoston lataus epäonnistui');
        const content = await response.text();
        
        const html = md.render(content);
        document.getElementById('contentArea').innerHTML = '<div class="content">' + html + '</div>';
        
        // Scroll to top
        window.scrollTo(0, 0);
    } catch (error) {
        showError('Virhe tiedoston "' + page.file + '" latauksessa: ' + error.message);
    }
}

// Navigation
function updateNavButtons() {
    const homeBtn = document.getElementById('homeBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (currentPageIndex === -1) {
        homeBtn.style.display = 'none';
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } else {
        homeBtn.style.display = 'inline-block';
        prevBtn.style.display = 'inline-block';
        nextBtn.style.display = 'inline-block';
        
        prevBtn.disabled = currentPageIndex === 0;
        nextBtn.disabled = currentPageIndex === allPages.length - 1;
    }
}

function navigateHome() {
    window.location.hash = '';
}

function navigatePrev() {
    if (currentPageIndex > 0) {
        window.location.hash = allPages[currentPageIndex - 1].id;
    }
}

function navigateNext() {
    if (currentPageIndex < allPages.length - 1) {
        window.location.hash = allPages[currentPageIndex + 1].id;
    }
}

function viewPage(pageId) {
    window.location.hash = pageId;
}

// File download
async function downloadFile(filepath, filename) {
    try {
        const response = await fetch(filepath);
        if (!response.ok) throw new Error('Tiedoston lataus epäonnistui');
        const blob = await response.blob();
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        alert('Virhe tiedoston latauksessa: ' + error.message);
    }
}

// Utility functions
function sanitizeFilename(title) {
    return title
        .toLowerCase()
        .replace(/ä/g, 'a')
        .replace(/ö/g, 'o')
        .replace(/å/g, 'a')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function showError(message) {
    document.getElementById('contentArea').innerHTML = '<div class="error">' + message + '</div>';
}

// Start the application
init();

// Update copyright year
function updateCopyrightYear() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Call it when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateCopyrightYear);
} else {
    updateCopyrightYear();
}
