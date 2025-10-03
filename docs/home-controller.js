// home-controller.js
class HomeController {
  constructor(router, tocData) {
    this.router = router;
    this.tocData = tocData;
  }

  index() {
    let html = `<h1>${this.tocData.title || 'Dokumentaatio'}</h1>`;
    html += '<p>Valitse osio:</p>';
    html += '<nav><ul>';
    
    this.tocData.sections.forEach(section => {
      const sectionSlug = slugify(section.title);
      html += `<li><a href="#/${sectionSlug}">${section.title}</a></li>`;
    });
    
    html += '</ul></nav>';
    return html;
  }
}
