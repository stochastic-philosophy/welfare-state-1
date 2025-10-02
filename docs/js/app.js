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
let allPages = [];
let currentPageIndex = -1;
let scrollNavigationLoaded = false;

// Initialize the application
async function init() {
    // Consent and footer initialized by their own modules
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
        
        // Load scroll navigation module
        await loadScrollNavigation();
        
        buildPagesList();
    } catch (error) {
        showError('Virhe sisällysluettelon latauksessa: ' + error.message);
    }
}

// Load scroll navigation module dynamically
async function loadScrollNavigation() {
    if (scrollNavigationLoaded) return;
    
    try {
        // Create script element
        const script = document.createElement('script');
        script.src = 'js/scroll-navigation.js';
        
        // Return a promise that resolves when the script is loaded
        return new Promise((resolve, reject) => {
            script.onload = () => {
                scrollNavigationLoaded = true;
                // Initialize the scroll navigation
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
                            type: 'chapter',
                            chapterIndex: index,
                            partId: part.id
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
        // Check if hash contains a heading reference (e.g., "page-id#heading-id")
        const hashParts = hash.split('#');
        const pageId = hashParts[0];
        const headingId = hashParts.length > 1 ? hashParts[1] : null;
        
        const pageIndex = allPages.findIndex(p => p.id === pageId);
        if (pageIndex !== -1) {
            currentPageIndex = pageIndex;
            showPage(allPages[pageIndex], headingId);
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
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();
}

// Show a page with markdown content
async function showPage(page, headingId = null) {
    updateNavButtons();
    
    try {
        const response = await fetch(page.file);
        if (!response.ok) throw new Error('Tiedoston lataus epäonnistui');
        let content = await response.text();
        
        // Process content to add IDs to headings if needed
        if (window.ScrollNavigation) {
            content = window.ScrollNavigation.processContentHeadings(content);
        }
        
        const html = md.render(content);
        document.getElementById('contentArea').innerHTML = '<div class="content">' + html + '</div>';
        
        // Scroll to top initially
        window.scrollTo(0, 0);
        
        // Handle hash for heading after content is loaded
        if (window.ScrollNavigation) {
            if (headingId) {
                // Scroll to specific heading
                setTimeout(() => {
                    const headingElement = document.getElementById(headingId);
                    if (headingElement) {
                        window.ScrollNavigation.scrollToHeading(headingElement);
                    } else {
                        // Try to find heading by text if ID doesn't match
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
                // Handle URL hash for heading
                window.ScrollNavigation.handleHashForHeading();
            }
        }
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
