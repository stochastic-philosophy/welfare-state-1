// SPA Application Logic app.js
// Only used by index.html

// Initialize markdown-it
const md = window.markdownit({
    html: true,
    linkify: true,
    typographer: true
});

// Global state
let contentData = null;
let scrollNavigationLoaded = false;
let pageNavigationLoaded = false;

// Initialize the application
async function init() {
    await loadContentData();
    handleRoute();
    window.addEventListener('hashchange', handleRoute);
}

// Content loading
async function loadContentData() {
    try {
        const response = await fetch('content.json');
        if (!response.ok) throw new Error('Sisällysluettelon lataus epäonnistui');
        contentData = await response.json();
        
        // Load navigation modules
        await loadPageNavigation();
        await loadScrollNavigation();
        
        // Initialize page navigation with content data
        if (window.PageNavigation) {
            window.PageNavigation.init(contentData);
        }
    } catch (error) {
        showError('Virhe sisällysluettelon latauksessa: ' + error.message);
    }
}

// Load page navigation module dynamically
async function loadPageNavigation() {
    if (pageNavigationLoaded) return;
    
    try {
        const script = document.createElement('script');
        script.src = 'js/page-navigation.js';
        
        return new Promise((resolve, reject) => {
            script.onload = () => {
                pageNavigationLoaded = true;
                resolve();
            };
            
            script.onerror = () => {
                reject(new Error('Page-navigation.js:n lataus epäonnistui'));
            };
            
            document.head.appendChild(script);
        });
    } catch (error) {
        console.error('Virhe page-navigation.js:n lataamisessa:', error);
    }
}

// Load scroll navigation module dynamically
async function loadScrollNavigation() {
    if (scrollNavigationLoaded) return;
    
    try {
        const script = document.createElement('script');
        script.src = 'js/scroll-navigation.js';
        
        return new Promise((resolve, reject) => {
            script.onload = () => {
                scrollNavigationLoaded = true;
                if (window.ScrollNavigation) {
                    window.ScrollNavigation.init();
                }
                resolve();
            };
            
            script.onerror = () => {
                reject(new Error('Scroll-navigation.js:n lataus epäonnistui'));
            };
            
            document.head.appendChild(script);
        });
    } catch (error) {
        console.error('Virhe scroll-navigation.js:n lataamisessa:', error);
    }
}

// Routing
function handleRoute() {
    const hash = window.location.hash.slice(1);
    
    if (!hash) {
        showTableOfContents();
    } else {
        // Check if hash contains a heading reference (e.g., "page-id#heading-id")
        const hashParts = hash.split('#');
        const pageId = hashParts[0];
        const headingId = hashParts.length > 1 ? hashParts[1] : null;
        
        // Set current page in PageNavigation
        if (window.PageNavigation && window.PageNavigation.setCurrentPage(pageId)) {
            const page = window.PageNavigation.getCurrentPage();
            showPage(page, headingId);
        } else {
            showError('Sivua ei löytynyt');
        }
    }
}

// Display table of contents
function showTableOfContents() {
    // Reset page navigation
    if (window.PageNavigation) {
        window.PageNavigation.currentPageIndex = -1;
        window.PageNavigation.updateHeaderButtons();
    }
    
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
        html += '<ul class="chapter-list">';
        part.chapters.forEach((chapter, index) => {
            const chapterId = `${part.id}-chapter-${index}`;
            const headingId = createHeadingId(chapter.title);
            const fullHash = `${chapterId}#${headingId}`;
            
            html += '<li class="chapter-item">';
            html += '<div class="chapter-title">';
            html += '<span>' + chapter.title + '</span>';
            html += '<div>';
            html += '<button class="download-btn" onclick="downloadFile(\'' + chapter.file + '\', \'' + sanitizeFilename(chapter.title) + '.md\')">📥 Lataa</button>';
            html += '<button class="download-btn view-btn" onclick="viewPage(\'' + fullHash + '\')">👁️ Näytä</button>';
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

// Create a heading ID from title text
function createHeadingId(title) {
    return title
        .toLowerCase()
        .replace(/[ä]/g, 'a')
        .replace(/[ö]/g, 'o')
        .replace(/[å]/g, 'a')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Show a page with markdown content
async function showPage(page, headingId = null) {
    // Update header navigation buttons
    if (window.PageNavigation) {
        window.PageNavigation.updateHeaderButtons();
    }
    
    try {
        const response = await fetch(page.file);
        if (!response.ok) throw new Error('Tiedoston lataus epäonnistui');
        const content = await response.text();
        
        // Render markdown to HTML
        let html = md.render(content);
        
        // Process HTML to add IDs to headings
        if (window.ScrollNavigation) {
            html = window.ScrollNavigation.processContentHeadings(html);
        }
        
        // Add page navigation (header and footer with page numbers)
        if (window.PageNavigation) {
            html = window.PageNavigation.addNavigationToContent(html);
        }
        
        document.getElementById('contentArea').innerHTML = '<div class="content">' + html + '</div>';
        
        // Scroll to top initially
        window.scrollTo(0, 0);
        
        // Handle hash for heading after content is loaded
        if (window.ScrollNavigation) {
            if (headingId) {
                setTimeout(() => {
                    const headingElement = document.getElementById(headingId);
                    if (headingElement) {
                        window.ScrollNavigation.scrollToHeading(headingElement);
                    } else {
                        // Try to find heading by text
                        const headings = document.querySelectorAll('h1, h2, h3');
                        for (let i = 0; i < headings.length; i++) {
                            const heading = headings[i];
                            const headingTextId = createHeadingId(heading.textContent);
                            if (headingTextId === headingId) {
                                heading.id = headingId;
                                window.ScrollNavigation.scrollToHeading(heading);
                                break;
                            }
                        }
                    }
                }, 300);
            } else {
                window.ScrollNavigation.handleHashForHeading();
            }
        }
    } catch (error) {
        showError('Virhe tiedoston "' + page.file + '" latauksessa: ' + error.message);
    }
}

// Navigation wrapper functions for header buttons
function navigateHome() {
    if (window.PageNavigation) {
        window.PageNavigation.navigateHome();
    }
}

function navigatePrev() {
    if (window.PageNavigation) {
        window.PageNavigation.navigatePrevious();
    }
}

function navigateNext() {
    if (window.PageNavigation) {
        window.PageNavigation.navigateNext();
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
