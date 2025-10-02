// Universal Application Entry Point
// Used by both index.html and static.html

// Application state
const App = {
    pageType: null,
    contentData: null,
    md: null,

    // Initialize application
    async init() {
        console.log('App: Initializing...');
        
        // Show loading
        this.showLoading();
        
        // Initialize markdown-it
        this.md = window.markdownit({
            html: true,
            linkify: true,
            typographer: true
        });
        
        try {
            // Load router
            await this.loadRouter();
            
            // Initialize router
            const routerReady = await window.Router.init();
            
            if (!routerReady) {
                throw new Error('Router initialization failed');
            }
            
            this.pageType = window.Router.pageType;
            
            // Page-specific initialization
            if (this.pageType === 'index') {
                await this.initIndexPage();
            } else {
                await this.initStaticPage();
            }
            
            this.hideLoading();
            console.log('App: Initialization complete');
            
        } catch (error) {
            console.error('App: Initialization failed:', error);
            this.showError('Sovelluksen lataus epäonnistui: ' + error.message);
        }
    },

    // Show loading spinner
    showLoading() {
        const contentArea = document.getElementById('contentArea');
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Ladataan...</p>
                </div>
            `;
        }
    },

    // Hide loading spinner
    hideLoading() {
        // Loading will be replaced by content
    },

    // Load router module
    async loadRouter() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'js/router.js';
            
            script.onload = () => {
                console.log('App: Router loaded');
                resolve();
            };
            
            script.onerror = () => {
                reject(new Error('Failed to load router.js'));
            };
            
            document.head.appendChild(script);
        });
    },

    // Initialize index.html page (SPA)
    async initIndexPage() {
        console.log('App: Initializing index page (SPA mode)');
        
        // Load content data
        await this.loadContentData();
        
        // Wait a moment for page-navigation to load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Initialize page navigation with content data
        if (window.PageNavigation) {
            window.PageNavigation.init(this.contentData);
        }
        
        // Set up routing
        this.handleRoute();
        window.addEventListener('hashchange', () => this.handleRoute());
    },

    // Initialize static.html page
    async initStaticPage() {
        console.log('App: Initializing static page');
        // Just clear loading
        const contentArea = document.getElementById('contentArea');
        if (contentArea && contentArea.querySelector('.loading-container')) {
            contentArea.innerHTML = '';
        }
    },

    // Load content data from JSON
    async loadContentData() {
        try {
            const response = await fetch('content.json');
            if (!response.ok) throw new Error('Sisällysluettelon lataus epäonnistui');
            this.contentData = await response.json();
            console.log('App: Content data loaded');
        } catch (error) {
            throw error;
        }
    },

    // Handle routing (index.html only)
    handleRoute() {
        const hash = window.location.hash.slice(1);
        
        if (!hash) {
            this.showTableOfContents();
        } else {
            const hashParts = hash.split('#');
            const pageId = hashParts[0];
            const headingId = hashParts.length > 1 ? hashParts[1] : null;
            
            const pageInfo = this.findPageById(pageId);
            if (pageInfo) {
                if (window.PageNavigation) {
                    window.PageNavigation.setCurrentFile(pageInfo.file);
                }
                this.showPage(pageInfo, headingId);
            } else {
                this.showError('Sivua ei löytynyt');
            }
        }
    },

    // Show table of contents
    showTableOfContents() {
        if (window.PageNavigation) {
            window.PageNavigation.currentFile = null;
            window.PageNavigation.updateHeaderButtons();
        }
        
        if (!this.contentData) {
            this.showError('Sisällysluettelo ei ole saatavilla');
            return;
        }
        
        let html = '<div class="toc-intro">';
        html += '<h2>' + this.contentData.title + '</h2>';
        html += '<p class="description">' + this.contentData.description + '</p>';
        html += '</div>';
        
        if (this.contentData.sections) {
            this.contentData.sections.forEach(section => {
                html += this.renderSection(section);
            });
        }
        
        document.getElementById('contentArea').innerHTML = html;
    },

    // Render section
    renderSection(section) {
        let html = '<div class="section-container">';
        html += '<h3 class="section-title">' + section.title + '</h3>';
        html += '<p class="section-description">' + section.description + '</p>';
        
        if (section.parts) {
            section.parts.forEach(part => {
                html += this.renderPart(part);
            });
        }
        
        html += '</div>';
        return html;
    },

    // Render part
    renderPart(part) {
        let html = '<div class="part-container">';
        html += '<h4 class="part-title">' + part.title + '</h4>';
        html += '<p class="part-description">' + part.description + '</p>';
        
        if (part.file) {
            html += '<div class="chapter-item">';
            html += '<div class="chapter-title">';
            html += '<span>' + part.title + '</span>';
            html += '<div>';
            html += '<button class="download-btn" onclick="downloadFile(\'' + part.file + '\', \'' + this.sanitizeFilename(part.title) + '.md\')">📥 Lataa</button>';
            html += '<button class="download-btn view-btn" onclick="viewPage(\'' + part.id + '\')">👁️ Näytä</button>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
        } else if (part.chapters) {
            html += '<ul class="chapter-list">';
            part.chapters.forEach((chapter, index) => {
                const chapterId = `${part.id}-chapter-${index}`;
                const headingId = this.createHeadingId(chapter.title);
                const fullHash = `${chapterId}#${headingId}`;
                
                html += '<li class="chapter-item">';
                html += '<div class="chapter-title">';
                html += '<span>' + chapter.title + '</span>';
                html += '<div>';
                html += '<button class="download-btn" onclick="downloadFile(\'' + chapter.file + '\', \'' + this.sanitizeFilename(chapter.title) + '.md\')">📥 Lataa</button>';
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
    },

    // Show page with content
    async showPage(page, headingId = null) {
        if (window.PageNavigation) {
            window.PageNavigation.updateHeaderButtons();
        }
        
        try {
            const response = await fetch(page.file);
            if (!response.ok) throw new Error('Tiedoston lataus epäonnistui');
            const content = await response.text();
            
            // Render markdown
            let html = this.md.render(content);
            
            // Process headings (scroll-navigation loaded in HTML, always available)
            if (window.ScrollNavigation && window.ScrollNavigation.processContentHeadings) {
                html = window.ScrollNavigation.processContentHeadings(html);
            }
            
            // Add page navigation
            if (window.PageNavigation) {
                html = window.PageNavigation.addNavigationToContent(html);
            }
            
            document.getElementById('contentArea').innerHTML = '<div class="content">' + html + '</div>';
            
            window.scrollTo(0, 0);
            
            // Handle scrolling to heading
            if (window.ScrollNavigation && headingId) {
                setTimeout(() => {
                    const headingElement = document.getElementById(headingId);
                    if (headingElement) {
                        window.ScrollNavigation.scrollToHeading(headingElement);
                    } else {
                        // Try to find by text
                        const headings = document.querySelectorAll('h1, h2, h3');
                        for (let i = 0; i < headings.length; i++) {
                            const heading = headings[i];
                            const headingTextId = this.createHeadingId(heading.textContent);
                            if (headingTextId === headingId) {
                                heading.id = headingId;
                                window.ScrollNavigation.scrollToHeading(heading);
                                break;
                            }
                        }
                    }
                }, 300);
            }
        } catch (error) {
            this.showError('Virhe tiedoston "' + page.file + '" latauksessa: ' + error.message);
        }
    },

    // Find page by ID
    findPageById(pageId) {
        if (!this.contentData || !this.contentData.sections) return null;
        
        for (const section of this.contentData.sections) {
            if (section.parts) {
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
        }
        return null;
    },

    // Create heading ID
    createHeadingId(title) {
        return title
            .toLowerCase()
            .replace(/[ä]/g, 'a')
            .replace(/[ö]/g, 'o')
            .replace(/[å]/g, 'a')
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

    // Show error
    showError(message) {
        document.getElementById('contentArea').innerHTML = '<div class="error">' + message + '</div>';
    }
};

// Global functions
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

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}
