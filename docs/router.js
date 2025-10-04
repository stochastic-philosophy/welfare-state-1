export class Router {
  constructor(options = {}) {
    this.routes = [];
    this.controllers = options.controllers || {};
    this.notFoundHandler = options.notFound || (() => this.render('<h1>404</h1>'));
    this.rootElement = options.root || document.body;
    
    window.addEventListener('hashchange', () => this.resolve());
    
    document.addEventListener('click', (event) => {
      if (event.target.tagName === 'A' && event.target.href) {
        const url = new URL(event.target.href);
        if (url.hash) {
          event.preventDefault();
          this.navigate(url.hash);
        }
      }
    });
  }

  addRoute(path, controllerName, methodName) {
    const keys = [];
    const regex = new RegExp('^' + path.replace(/\/:([^\/]+)/g, (_, key) => {
      keys.push(key);
      return '/([^\/]+)';
    }) + '$');
    this.routes.push({ regex, keys, controllerName, methodName });
  }

  resolve() {
    let fullHash = window.location.hash.slice(1);
    
    const anchorIndex = fullHash.indexOf('#');
    let path = fullHash;
    if (anchorIndex > 0) {
      path = fullHash.substring(0, anchorIndex);
    }
    
    if (path === '') path = '/';
    
    for (const route of this.routes) {
      const match = path.match(route.regex);
      if (match) {
        const params = {};
        route.keys.forEach((key, index) => {
          params[key] = match[index + 1];
        });
        
        const getControllerInstance = this.controllers[route.controllerName];
        if (!getControllerInstance) {
          console.error(`Controller ${route.controllerName} ei löytynyt`);
          this.notFoundHandler();
          return;
        }
        
        const controllerInstance = getControllerInstance();
        const action = controllerInstance[route.methodName];
        
        if (typeof action === 'function') {
          const result = action.call(controllerInstance, params);
          if (result && typeof result.then === 'function') {
            result.then(html => {
              if (html) this.render(html);
            });
          } else {
            if (result) this.render(result);
          }
        } else {
          console.error(`Metodi ${route.methodName} ei ole funktio`);
          this.notFoundHandler();
        }
        return;
      }
    }
    
    this.notFoundHandler();
  }
  
  render(html) {
    this.rootElement.innerHTML = html;
  }
  
  navigate(hash) {
    window.location.hash = hash.startsWith('#') ? hash : '#' + hash;
  }
  
  setNotFoundHandler(handler) {
    this.notFoundHandler = handler;
  }
}
