// Universal Application Entry Point
// All modules loaded in HTML before this script

// Application state
const App = {
    contentData: null,
    md: null,

    // Initialize application
    async init() {
        console.log('App: Initializing...');
        this.showLoading();
        
        // Initialize markdown-it
        this.md = window.markdownit({
            html: true,
            linkify: true,
            typographer: true
        });
        
        try {
            // Load content data
            await this.loadContentData();
            
            // Initialize page navigation
            if (window.PageNavigation) {
                window.PageNavigation.init(this.contentData);
            }
            
            // Set up routing
            this.handleRoute();
            window.addEventListener('hashchange', () => this.handleRoute());
            
            this.hideLoading();
            console.log('App: Ready');
            
        } catch (error) {
            console.error('App: Error:', error);
            this.showError('Latausvirhe: ' + error.message);
        }
    },

    // Load content data
    async loadContentData() {
        const response = await fetch('content.json');
        if (!response.ok) throw new Error('Content load failed');
        this.contentData = await response.json();
    },

    // Handle routing
    handleRoute() {
        const hash = window.location.hash.slice(1);
        
        if (!hash) {
            this.showTableOfContents();
            return;
        }
        
        const parts = hash.split('#');
        const pageId = parts[0];
        const headingId = parts[1] || null;
        
        const pageInfo = this.findPageById(pageId);
        if (pageInfo) {
            if (window.PageNavigation) {
                window.PageNavigation.setCurrentFile(pageInfo.file);
            }
            this.showPage(pageInfo, headingId);
        } else {
            this.showError('Sivua ei löytynyt');
        }
    },

    // Show table of contents
    showTableOfContents() {
        if (window.PageNavigation) {
            window.PageNavigation.currentFile = null;
            window.PageNavigation.updateHeaderButtons();
        }
        
        let html = '<div class="toc-intro">';
        html += '<h2>' + this.contentData.title + '</h2>';
        html += '<p class="description">' + this.contentData.description + '</p>';
        html += '</div>';
        
        this.contentData.sections.forEach(section => {
            html += this.renderSection(section);
        });
        
        document.getElementById('contentArea').innerHTML = html;
    },

    // Render section
    renderSection(section) {
        let html = '<div class="section-container">';
        html += '<h3 class="section-title">' + section.title + '</h3>';
        html += '<p class="section-description">' + section.description + '</p>';
        
        section.parts.forEach(part => {
            html += this.renderPart(part);
        });
        
        html += '</div>';
        return html;
    },

    // Render part
    renderPart(part) {
        let html = '<div class="part-container">';
        html += '<h4 class="part-title">' + part.title + '</h4>';
        html += '<p class="part-description">' + part.description + '</p>';
        
        if (part.file) {
            html += '<div class="chapter-item"><div class="chapter-title">';
            html += '<span>' + part.title + '</span><div>';
            html += '<button class="download-btn" onclick="downloadFile(\'' + part.file + '\', \'' + this.sanitizeFilename(part.title) + '.md\')">📥 Lataa</button>';
            html += '<button class="download-btn view-btn" onclick="viewPage(\'' + part.id + '\')">👁️ Näytä</button>';
            html += '</div></div></div>';
        } else if (part.chapters) {
            html += '<ul class="chapter-list">';
            part.chapters.forEach((chapter, index) => {
                const chapterId = `${part.id}-chapter-${index}`;
                const headingId = this.createHeadingId(chapter.title);
                
                html += '<li class="chapter-item"><div class="chapter-title">';
                html += '<span>' + chapter.title + '</span><div>';
                html += '<button class="download-btn" onclick="downloadFile(\'' + chapter.file + '\', \'' + this.sanitizeFilename(chapter.title) + '.md\')">📥 Lataa</button>';
                html += '<button class="download-btn view-btn" onclick="viewPage(\'' + chapterId + '#' + headingId + '\')">👁️ Näytä</button>';
                html += '</div></div>';
                html += '<p class="chapter-description">' + chapter.description + '</p></li>';
            });
            html += '</ul>';
        }
        
        html += '</div>';
        return html;
    },

    // Show page
    async showPage(page, headingId = null) {
        if (window.PageNavigation) {
            window.PageNavigation.updateHeaderButtons();
        }
        
        const response = await fetch(page.file);
        const content = await response.text();
        
        // Render markdown
        let html = this.md.render(content);
        
        // Add IDs to headings
        if (window.ScrollNavigation) {
            html = window.ScrollNavigation.processContentHeadings(html);
        }
        
        // Add page navigation
        if (window.PageNavigation) {
            html = window.PageNavigation.addNavigationToContent(html);
        }
        
        // Insert to DOM
        document.getElementById('contentArea').innerHTML = '<div class="content">' + html + '</div>';
        
        // Scroll to heading if specified
        if (headingId && window.ScrollNavigation) {
            setTimeout(() => {
                let element = document.getElementById(headingId);
                
                // If not found by ID, try to find by matching text
                if (!element) {
                    const headings = document.querySelectorAll('.content h1, .content h2, .content h3');
                    for (const h of headings) {
                        if (this.createHeadingId(h.textContent) === headingId) {
                            h.id = headingId;
                            element = h;
                            break;
                        }
                    }
                }
                
                if (element) {
                    window.ScrollNavigation.scrollToHeading(element);
                } else {
                    window.scrollTo(0, 0);
                }
            }, 100);
        } else {
            window.scrollTo(0, 0);
        }
    },

    // Find page by ID
    findPageById(pageId) {
        for (const section of this.contentData.sections) {
            for (const part of section.parts) {
                if (part.id === pageId && part.file) {
                    return {
                        id: part.id,
                        title: part.title,
                        file: part.file,
                        sectionTitle: section.title
                    };
                }
                if (part.chapters) {
                    for (let i = 0; i < part.chapters.length; i++) {
                        const chapter = part.chapters[i];
                        const chapterId = `${part.id}-chapter-${i}`;
                        if (chapterId === pageId) {
                            return {
                                id: chapterId,
                                title: chapter.title,
                                file: chapter.file,
                                sectionTitle: section.title,
                                partTitle: part.title
                            };
                        }
                    }
                }
            }
        }
        return null;
    },

    // Create heading ID
    createHeadingId(title) {
        return title
            .toLowerCase()
            .replace(/ä/g, 'a')
            .replace(/ö/g, 'o')
            .replace(/å/g, 'a')
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    },

    // Sanitize filename
    sanitizeFilename(title) {
        return title
            .toLowerCase()
            .replace(/ä/g, 'a')
            .replace(/ö/g, 'o')
            .replace(/å/g, 'a')
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
    },

    // Loading indicator
    showLoading() {
        document.getElementById('contentArea').innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p class="loading-text">Ladataan...</p>
            </div>`;
    },

    hideLoading() {},

    // Error message
    showError(msg) {
        document.getElementById('contentArea').innerHTML = '<div class="error">' + msg + '</div>';
    }
};

// Global functions
function navigateHome() {
    window.PageNavigation.navigateHome();
}

function navigatePrev() {
    window.PageNavigation.navigatePrevious();
}

function navigateNext() {
    window.PageNavigation.navigateNext();
}

function viewPage(pageId) {
    window.location.hash = pageId;
}

async function downloadFile(filepath, filename) {
    const response = await fetch(filepath);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}
