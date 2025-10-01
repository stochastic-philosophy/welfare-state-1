// Page Navigation Module
// Handles page loading and scrolling to specific sections

// Configure markdown-it with anchor support
const md = window.markdownit({
    html: true,
    linkify: true,
    typographer: true
});

// Add ID generation for headings
md.renderer.rules.heading_open = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    const title = tokens[idx + 1].content;
    const id = generateHeadingId(title);
    token.attrSet('id', id);
    return self.renderToken(tokens, idx, options);
};

// Generate URL-safe ID from heading text
function generateHeadingId(text) {
    return text
        .toLowerCase()
        .replace(/ä/g, 'a')
        .replace(/ö/g, 'o')
        .replace(/å/g, 'a')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Main function to show a page with optional anchor
async function showPageWithAnchor(page, anchor = null) {
    updateNavButtons();
    
    try {
        const response = await fetch(page.file);
        if (!response.ok) throw new Error('Tiedoston lataus epäonnistui');
        const content = await response.text();
        
        // Render markdown to HTML with IDs on headings
        const html = md.render(content);
        document.getElementById('contentArea').innerHTML = '<div class="content">' + html + '</div>';
        
        // Scroll to anchor if provided
        if (anchor) {
            scrollToAnchor(anchor);
        } else {
            // Scroll to top if no anchor
            window.scrollTo(0, 0);
        }
    } catch (error) {
        showError('Virhe tiedoston "' + page.file + '" latauksessa: ' + error.message);
    }
}

// Scroll to specific anchor with smooth animation
function scrollToAnchor(anchorId) {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
        const element = document.getElementById(anchorId);
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start'
            });
            // Add highlight effect
            element.classList.add('highlight-heading');
            setTimeout(() => {
                element.classList.remove('highlight-heading');
            }, 2000);
        } else {
            // If anchor not found, scroll to top
            window.scrollTo(0, 0);
        }
    }, 100);
}

// Parse hash to extract page ID and anchor
function parseHash(hash) {
    if (!hash) return { pageId: null, anchor: null };
    
    // Support format: #page-id or #page-id#anchor-id
    const parts = hash.slice(1).split('#');
    return {
        pageId: parts[0] || null,
        anchor: parts[1] || null
    };
}

// Enhanced route handler that supports anchors
function handleRouteWithAnchor() {
    const hash = window.location.hash;
    const { pageId, anchor } = parseHash(hash);
    
    if (!pageId) {
        showTableOfContents();
    } else {
        const pageIndex = allPages.findIndex(p => p.id === pageId);
        if (pageIndex !== -1) {
            currentPageIndex = pageIndex;
            showPageWithAnchor(allPages[pageIndex], anchor);
        } else {
            showError('Sivua ei löytynyt');
        }
    }
}

// Navigate to page with optional anchor
function navigateToPage(pageId, anchor = null) {
    if (anchor) {
        window.location.hash = `${pageId}#${anchor}`;
    } else {
        window.location.hash = pageId;
    }
}

// Export functions for use in app.js
window.PageNavigation = {
    showPageWithAnchor,
    handleRouteWithAnchor,
    navigateToPage,
    generateHeadingId
};
