// Scroll Navigation Module scroll-navigation.js
// Handles scrolling to specific headings within markdown content

let isScrollNavigationLoaded = false;

// Initialize scroll navigation
function initScrollNavigation() {
    if (isScrollNavigationLoaded) return;
    
    // Add event listeners for anchor links
    document.addEventListener('click', function(e) {
        const target = e.target;
        
        // Check if clicked element is an anchor link within content
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
    
    // Calculate position with header offset
    const headerHeight = document.querySelector('header').offsetHeight;
    const elementPosition = headingElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;
    
    // Smooth scroll to position
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
    
    // Add highlight effect
    highlightHeading(headingElement);
}

// Add highlight effect to heading
function highlightHeading(headingElement) {
    // Remove previous highlights
    document.querySelectorAll('.highlight-heading').forEach(el => {
        el.classList.remove('highlight-heading');
    });
    
    // Add highlight to current heading
    headingElement.classList.add('highlight-heading');
    
    // Remove highlight after animation completes
    setTimeout(() => {
        headingElement.classList.remove('highlight-heading');
    }, 2000);
}

// Process content to add IDs to headings if they don't exist
function processContentHeadings(content) {
    if (!content) return content;
    
    // Create a temporary DOM element to parse the content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Find all headings (h1, h2, h3)
    const headings = tempDiv.querySelectorAll('h1, h2, h3');
    
    headings.forEach(heading => {
        // If heading doesn't have an ID, create one from its text
        if (!heading.id) {
            const text = heading.textContent.trim();
            // Create a slug from the heading text
            const slug = text
                .toLowerCase()
                .replace(/[ä]/g, 'a')
                .replace(/[ö]/g, 'o')
                .replace(/[å]/g, 'a')
                .replace(/[^\w\s-]/g, '') // Remove special characters
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/-+/g, '-') // Replace multiple hyphens with single
                .trim();
            
            heading.id = slug || `heading-${Math.random().toString(36).substr(2, 9)}`;
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
                // Wait a bit for content to fully render
                setTimeout(() => {
                    scrollToHeading(headingElement);
                }, 300);
            }
        }
    }
}

// Export functions for use in app.js
window.ScrollNavigation = {
    init: initScrollNavigation,
    scrollToHeading: scrollToHeading,
    processContentHeadings: processContentHeadings,
    handleHashForHeading: handleHashForHeading
};
