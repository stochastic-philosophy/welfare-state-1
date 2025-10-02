// Scroll Navigation Module
// Handles scrolling to specific headings within markdown content

let isScrollNavigationLoaded = false;

// Generate heading ID - MUST match app.js exactly
function generateHeadingId(text) {
    return text
        .toLowerCase()
        .replace(/ä/g, 'a')
        .replace(/ö/g, 'o')
        .replace(/å/g, 'a')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Initialize scroll navigation
function initScrollNavigation() {
    if (isScrollNavigationLoaded) return;
    
    // Add event listeners for anchor links
    document.addEventListener('click', function(e) {
        const target = e.target;
        
        if (target.tagName === 'A' && target.getAttribute('href') && 
            target.getAttribute('href').startsWith('#')) {
            
            const hash = target.getAttribute('href').substring(1);
            const headingElement = document.getElementById(hash);
            
            if (headingElement) {
                e.preventDefault();
                scrollToHeading(headingElement);
            }
        }
    });
    
    isScrollNavigationLoaded = true;
}

// Scroll to specific heading with smooth animation
function scrollToHeading(headingElement) {
    if (!headingElement) return;
    
    const headerHeight = document.querySelector('header').offsetHeight;
    const elementPosition = headingElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
    
    highlightHeading(headingElement);
}

// Add highlight effect to heading
function highlightHeading(headingElement) {
    document.querySelectorAll('.highlight-heading').forEach(el => {
        el.classList.remove('highlight-heading');
    });
    
    headingElement.classList.add('highlight-heading');
    
    setTimeout(() => {
        headingElement.classList.remove('highlight-heading');
    }, 2000);
}

// Process content to add IDs to headings
function processContentHeadings(htmlContent) {
    if (!htmlContent) return htmlContent;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const headings = tempDiv.querySelectorAll('h1, h2, h3');
    
    headings.forEach(heading => {
        if (!heading.id) {
            const text = heading.textContent.trim();
            // Use SAME function as app.js
            heading.id = generateHeadingId(text);
        }
    });
    
    return tempDiv.innerHTML;
}

// Handle hash in URL to scroll to specific heading
function handleHashForHeading() {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
        const hashParts = hash.split('#');
        if (hashParts.length > 1) {
            const headingId = hashParts[1];
            const headingElement = document.getElementById(headingId);
            
            if (headingElement) {
                setTimeout(() => {
                    scrollToHeading(headingElement);
                }, 300);
            }
        }
    }
}

// Export functions
window.ScrollNavigation = {
    init: initScrollNavigation,
    scrollToHeading: scrollToHeading,
    processContentHeadings: processContentHeadings,
    handleHashForHeading: handleHashForHeading,
    generateHeadingId: generateHeadingId
};
