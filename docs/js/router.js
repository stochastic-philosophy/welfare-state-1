// Router Module
// Detects page type and loads appropriate modules

const Router = {
    pageType: null,
    loadedModules: new Set(),

    // Initialize router
    init() {
        this.detectPageType();
        return this.loadRequiredModules();
    },

    // Detect which page we're on
    detectPageType() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        
        if (filename === 'static.html') {
            this.pageType = 'static';
        } else {
            this.pageType = 'index';
        }
        
        console.log(`Router: Detected page type: ${this.pageType}`);
    },

    // Get modules to load based on page type
    getModulesForPage() {
        const commonModules = [
            { name: 'consent', path: 'js/consent.js' },
            { name: 'footer', path: 'js/footer.js' }
        ];

        const indexModules = [
            { name: 'page-navigation', path: 'js/page-navigation.js' },
            { name: 'scroll-navigation', path: 'js/scroll-navigation.js' }
        ];

        if (this.pageType === 'static') {
            return commonModules;
        } else {
            return [...commonModules, ...indexModules];
        }
    },

    // Load all required modules
    async loadRequiredModules() {
        const modules = this.getModulesForPage();
        const loadPromises = modules.map(module => this.loadModule(module));
        
        try {
            await Promise.all(loadPromises);
            console.log('Router: All modules loaded successfully');
            return true;
        } catch (error) {
            console.error('Router: Error loading modules:', error);
            return false;
        }
    },

    // Load a single module
    loadModule(module) {
        if (this.loadedModules.has(module.name)) {
            console.log(`Router: Module ${module.name} already loaded`);
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = module.path;
            
            script.onload = () => {
                this.loadedModules.add(module.name);
                console.log(`Router: Loaded ${module.name}`);
                
                // Initialize module if it has init function
                this.initializeModule(module.name);
                resolve();
            };
            
            script.onerror = () => {
                console.error(`Router: Failed to load ${module.name}`);
                reject(new Error(`Failed to load ${module.path}`));
            };
            
            document.head.appendChild(script);
        });
    },

    // Initialize module after loading
    initializeModule(moduleName) {
        switch(moduleName) {
            case 'scroll-navigation':
                if (window.ScrollNavigation && window.ScrollNavigation.init) {
                    window.ScrollNavigation.init();
                }
                break;
            // consent.js and footer.js auto-initialize
            // page-navigation.js initializes with content data later
        }
    },

    // Check if module is loaded
    isModuleLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }
};

// Export to window
window.Router = Router;
