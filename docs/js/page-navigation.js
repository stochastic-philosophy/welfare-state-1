// Page Navigation Module
// Handles page navigation, page numbers based on unique files

const PageNavigation = {
    allUniqueFiles: [],  // Unique file paths in order
    currentFile: null,
    contentData: null,

    // Initialize with content data
    init(contentData) {
        this.contentData = contentData;
        this.buildUniqueFilesList();
    },

    // Build list of unique files in order from content.json
    buildUniqueFilesList() {
        const filesInOrder = [];
        const seenFiles = new Set();
        
        if (!this.contentData || !this.contentData.sections) return;
        
        // Collect all file paths in order, preserving first occurrence
        this.contentData.sections.forEach(section => {
            if (section.parts) {
                section.parts.forEach(part => {
                    if (part.file) {
                        if (!seenFiles.has(part.file)) {
                            filesInOrder.push({
                                file: part.file,
                                title: part.title,
                                sectionTitle: section.title
                            });
                            seenFiles.add(part.file);
                        }
                    } else if (part.chapters) {
                        part.chapters.forEach(chapter => {
                            if (!seenFiles.has(chapter.file)) {
                                filesInOrder.push({
                                    file: chapter.file,
                                    title: chapter.title,
                                    sectionTitle: section.title,
                                    partTitle: part.title
                                });
                                seenFiles.add(chapter.file);
                            }
                        });
                    }
                });
            }
        });
        
        this.allUniqueFiles = filesInOrder;
    },

    // Get file info by file path
    getFileInfo(filePath) {
        return this.allUniqueFiles.find(f => f.file === filePath);
    },

    // Get file index by file path
    getFileIndex(filePath) {
        return this.allUniqueFiles.findIndex(f => f.file === filePath);
    },

    // Set current file
    setCurrentFile(filePath) {
        const index = this.getFileIndex(filePath);
        if (index !== -1) {
            this.currentFile = filePath;
            return true;
        }
        return false;
    },

    // Get current file info
    getCurrentFileInfo() {
        if (this.currentFile) {
            return this.getFileInfo(this.currentFile);
        }
        return null;
    },

    // Get page numbers (based on unique files)
    getPageNumbers() {
        if (!this.currentFile) return { current: 0, total: this.allUniqueFiles.length };
        
        const current = this.getFileIndex(this.currentFile) + 1;
        const total = this.allUniqueFiles.length;
        return { current, total };
    },

    // Check if has previous page
    hasPrevious() {
        if (!this.currentFile) return false;
        return this.getFileIndex(this.currentFile) > 0;
    },

    // Check if has next page
    hasNext() {
        if (!this.currentFile) return false;
        const index = this.getFileIndex(this.currentFile);
        return index < this.allUniqueFiles.length - 1;
    },

    // Get previous file
    getPreviousFile() {
        if (!this.hasPrevious()) return null;
        const currentIndex = this.getFileIndex(this.currentFile);
        return this.allUniqueFiles[currentIndex - 1];
    },

    // Get next file
    getNextFile() {
        if (!this.hasNext()) return null;
        const currentIndex = this.getFileIndex(this.currentFile);
        return this.allUniqueFiles[currentIndex + 1];
    },

    // Find first chapter/part that uses this file
    findChapterIdForFile(filePath) {
        if (!this.contentData || !this.contentData.sections) return null;
        
        for (const section of this.contentData.sections) {
            if (section.parts) {
                for (const part of section.parts) {
                    if (part.file === filePath) {
                        return part.id;
                    }
                    if (part.chapters) {
                        for (let i = 0; i < part.chapters.length; i++) {
                            const chapter = part.chapters[i];
                            if (chapter.file === filePath) {
                                return `${part.id}-chapter-${i}`;
                            }
                        }
                    }
                }
            }
        }
        return null;
    },

    // Navigate to previous page
    navigatePrevious() {
        const prev = this.getPreviousFile();
        if (prev) {
            const chapterId = this.findChapterIdForFile(prev.file);
            if (chapterId) {
                window.location.hash = chapterId;
            }
        }
    },

    // Navigate to next page
    navigateNext() {
        const next = this.getNextFile();
        if (next) {
            const chapterId = this.findChapterIdForFile(next.file);
            if (chapterId) {
                window.location.hash = chapterId;
            }
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
        
        if (!this.currentFile) {
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
        const fileInfo = this.getCurrentFileInfo();
        
        if (!fileInfo) return '';

        const prevDisabled = !this.hasPrevious() ? 'disabled' : '';
        const nextDisabled = !this.hasNext() ? 'disabled' : '';

        return `
            <div class="page-navigation-footer">
                <div class="page-info">
                    <div class="page-number">Sivu ${numbers.current} / ${numbers.total}</div>
                    <div class="page-title">${fileInfo.title}</div>
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
        const fileInfo = this.getCurrentFileInfo();
        
        if (!fileInfo) return '';

        return `
            <div class="page-navigation-header">
                <div class="page-breadcrumb">
                    ${fileInfo.sectionTitle}
                    ${fileInfo.partTitle ? ' → ' + fileInfo.partTitle : ''}
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
