// SPA Application Logic
// Only used by index.html
// Uses page-navigation.js for page loading

// Global state
let contentData = null;
let allPages = [];
let currentPageIndex = -1;

// Initialize the application
async function init() {
    await loadContentData();
    // Use the enhanced route handler from page-navigation.js
    window.PageNavigation.handleRouteWithAnchor();
    window.addEventListener('hashchange', () => {
        window.PageNavigation.handleRouteWithAnchor();
    });
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
                            type: 'chapter',
                            anchor: chapter.anchor // Support for chapter anchors
                        });
                    });
                }
            });
        }
    });
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
        // Has chapters - show all with their descriptions and section links
        html += '<ul class="chapter-list">';
        part.chapters.forEach((chapter, index) => {
            const chapterId = `${part.id}-chapter-${index}`;
            html += '<li class="chapter-item">';
            html += '<div class="chapter-title">';
            html += '<span>' + chapter.title + '</span>';
            html += '<div>';
            html += '<button class="download-btn" onclick="downloadFile(\'' + chapter.file + '\', \'' + sanitizeFilename(chapter.title) + '.md\')">📥 Lataa</button>';
            html += '<button class="download-btn view-btn" onclick="viewPage(\'' + chapterId + '\')">👁️ Näytä</button>';
            html += '</div>';
            html += '</div>';
            html += '<p class="chapter-description">' + chapter.description + '</p>';
            
            // Add section links if provided in content.json
            if (chapter.sections && chapter.sections.length > 0) {
                html += '<div class="section-links">';
                html += '<span class="section-links-label">Hyppää:</span>';
                chapter.sections.forEach(sectionLink => {
                    const anchorId = window.PageNavigation.generateHeadingId(sectionLink.title);
                    html += '<button class="section-link-btn" onclick="navigateToSection(\'' + chapterId + '\', \'' + anchorId + '\')">';
                    html += sectionLink.title;
                    html += '</button>';
                });
                html += '</div>';
            }
            
            html += '</li>';
        });
        html += '</ul>';
    }
    
    html += '</div>';
    return html;
}

// Navigation functions
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

// Navigate to specific section within a page
function navigateToSection(pageId, anchorId) {
    window.PageNavigation.navigateToPage(pageId, anchorId);
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
