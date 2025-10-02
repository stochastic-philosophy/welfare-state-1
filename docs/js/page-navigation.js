// Page Navigation Module
// Handles page navigation, page numbers, and coordinates with scroll-navigation

const PageNavigation = {
    allPages: [],
    currentPageIndex: -1,
    contentData: null,

    // Initialize with content data
    init(contentData) {
        this.contentData = contentData;
        this.buildPagesList();
    },

    // Build flat list of all pages from content.json
    buildPagesList() {
        this.allPages = [];
        
        if (!this.contentData || !this.contentData.sections) return;
        
        this.contentData.sections.forEach(section => {
            if (section.parts) {
                section.parts.forEach(part => {
                    if (part.file) {
                        this.allPages.push({
                            id: part.id,
                            title: part.title,
                            file: part.file,
                            type: 'part',
                            sectionTitle: section.title
                        });
                    } else if (part.chapters) {
                        part.chapters.forEach((chapter, index) => {
                            this.allPages.push({
                                id: `${part.id}-chapter-${index}`,
                                title: chapter.title,
                                file: chapter.file,
                                type: 'chapter',
                                sectionTitle: section.title,
                                partTitle: part.title
                            });
                        });
                    }
                });
            }
        });
    },

    // Get current page info
    getCurrentPage() {
        if (this.currentPageIndex >= 0 && this.currentPageIndex < this.allPages.length) {
            return this.allPages[this.currentPageIndex];
        }
        return null;
    },

    // Get page by ID
    getPageById(pageId) {
        return this.allPages.find(p => p.id === pageId);
    },

    // Get page index by ID
    getPageIndexById(pageId) {
        return this.allPages.findIndex(p => p.id === pageId);
    },

    // Set current page
    setCurrentPage(pageId) {
        const index = this.getPageIndexById(pageId);
        if (index !== -1) {
            this.currentPageIndex = index;
            return true;
        }
        return false;
    },

    // Get page numbers
    getPageNumbers() {
        const current = this.currentPageIndex + 1;
        const total = this.allPages.length;
        return { current, total };
    },

    // Check if has previous page
    hasPrevious() {
        return this.currentPageIndex > 0;
    },

    // Check if has next page
    hasNext() {
        return this.currentPageIndex < this.allPages.length - 1;
    },

    // Get previous page
    getPreviousPage() {
        if (this.hasPrevious()) {
            return this.allPages[this.currentPageIndex - 1];
        }
        return null;
    },

    // Get next page
    getNextPage() {
        if (this.hasNext()) {
            return this.allPages[this.currentPageIndex + 1];
        }
        return null;
    },

    // Navigate to previous page
    navigatePrevious() {
        const prev = this.getPreviousPage();
        if (prev) {
            window.location.hash = prev.id;
        }
    },

    // Navigate to next page
    navigateNext() {
        const next = this.getNextPage();
        if (next) {
            window.location.hash = next.id;
        }
    },

    // Navigate to home
    navigateHome() {
        window.location.hash = '';
    },

    // Update navigation buttons in header
    updateHeaderButtons() {
        const homeBtn = document.getElementById('homeBtn');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (this.currentPageIndex === -1) {
            homeBtn.style.display = 'none';
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            homeBtn.style.display = 'inline-block';
            prevBtn.style.display = 'inline-block';
            nextBtn.style.display = 'inline-block';
            
            prevBtn.disabled = !this.hasPrevious();
            nextBtn.disabled = !this.hasNext();
        }
    },

    // Create page navigation footer
    createPageFooter() {
        const numbers = this.getPageNumbers();
        const currentPage = this.getCurrentPage();
        
        if (!currentPage) return '';

        const prevDisabled = !this.hasPrevious() ? 'disabled' : '';
        const nextDisabled = !this.hasNext() ? 'disabled' : '';

        return `
            <div class="page-navigation-footer">
                <div class="page-info">
                    <div class="page-number">Sivu ${numbers.current} / ${numbers.total}</div>
                    <div class="page-title">${currentPage.title}</div>
                </div>
                <div class="page-nav-buttons">
                    <button onclick="PageNavigation.navigatePrevious()" ${prevDisabled} class="page-nav-btn">
                        ← Edellinen
                    </button>
                    <button onclick="PageNavigation.navigateHome()" class="page-nav-btn home-btn">
                        🏠 Sisällysluettelo
                    </button>
                    <button onclick="PageNavigation.navigateNext()" ${nextDisabled} class="page-nav-btn">
                        Seuraava →
                    </button>
                </div>
            </div>
        `;
    },

    // Create page navigation header (for top of content)
    createPageHeader() {
        const numbers = this.getPageNumbers();
        const currentPage = this.getCurrentPage();
        
        if (!currentPage) return '';

        return `
            <div class="page-navigation-header">
                <div class="page-breadcrumb">
                    ${currentPage.sectionTitle}
                    ${currentPage.partTitle ? ' → ' + currentPage.partTitle : ''}
                </div>
                <div class="page-number-small">Sivu ${numbers.current} / ${numbers.total}</div>
            </div>
        `;
    },

    // Add navigation to content
    addNavigationToContent(contentHtml) {
        const header = this.createPageHeader();
        const footer = this.createPageFooter();
        
        return `
            ${header}
            ${contentHtml}
            ${footer}
        `;
    }
};

// Export to window
window.PageNavigation = PageNavigation;
