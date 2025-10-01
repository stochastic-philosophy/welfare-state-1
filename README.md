# Hyvinvointivaltion analyysi

Kattava kolmiosainen analyysi hyvinvointivaltiosta: sen perustelut, systemaattinen heikentäminen, ja keskustelun moraaliset juuret.

## 🌐 Sivusto

**Pääsivu:** [https://stochastic-philosophy.github.io/welfare-state-1/](https://stochastic-philosophy.github.io/welfare-state-1/)

**Tekoälynäkymä:** [https://stochastic-philosophy.github.io/welfare-state-1/static.html](https://stochastic-philosophy.github.io/welfare-state-1/static.html)

## 📚 Sisältö

### Kokonaisuus A: Hyvinvointivaltion perustelut
Argumentoi hyvinvointivaltion puolesta kolmesta näkökulmasta:
- **Osa 1:** Yhteiskunnallisen vakauden perustat
- **Osa 2:** Politiikan oppimishaaste
- **Osa 3:** Innovaatio ja laajapohjainen koulutus

### Kokonaisuus B: Hyvinvointivaltion hajoamisen anatomia
Dokumentoi systemaattisesti hyvinvointivaltion heikentämisen 1980-luvulta lähtien:
- **Osa 1:** Rahoituspohjan rapautuminen (1980-2020)
- **Osa 2:** Empiirinen evidenssi: Suomen tapaus
- **Osa 3:** Koulutus ja innovaatio resurssileikkausten aikakaudella

### Kokonaisuus C: Moraaliset ja psykologiset juuret
Tarkastelee miksi hyvinvointivaltio-keskustelu jämähtää pattitilanteeseen:
- **Osa 1:** Haidtin Moral Foundations Theory ja kritiikki
- **Osa 2:** Identiteetin läheisyys ja oppimisen mindsetit
- **Osa 3:** Synteesi ja soveltaminen hyvinvointivaltio-keskusteluun

## 🤖 Käyttö tekoälyjen kanssa

### Tekoälynäkymä
Sivusto sisältää erityisen staattisen näkymän tekoälyille:
- **URL:** [https://stochastic-philosophy.github.io/welfare-state-1/static.html](https://stochastic-philosophy.github.io/welfare-state-1/static.html)
- Sisältää kaikki otsikot, kuvaukset ja suorat linkit dokumentteihin
- Tekoäly voi lukea yhden sivun ja nähdä koko rakenteen
- Ei vaadi JavaScript-suoritusta

### Käyttöesimerkki
```
Hei Claude! Lue tämä sivu ja kerro mitä dokumentteja löydät:
https://stochastic-philosophy.github.io/welfare-state-1/static.html

Sitten lue tämä dokumentti ja keskustellaan siitä:
https://stochastic-philosophy.github.io/welfare-state-1/content/yhteiskunta_sopimus_v2_osa1.md
```

### Miksi tekoälynäkymä?
- Tekoälyt eivät suorita JavaScriptia, joten dynaaminen SPA ei toimi niille
- Staattinen HTML sisältää kaiken tiedon suoraan HTML-lähdekoodissa
- Helpottaa dokumenttien löytämistä ja viittaamista keskusteluissa

## 🛠️ Tekninen toteutus

### Rakenne
```
docs/
├── index.html          # Interaktiivinen SPA ihmiskäyttäjille
├── static.html         # Staattinen näkymä tekoälyille
├── content.json        # Sisällysluettelon data (sisältää baseUrl)
├── css/
│   └── styles.css      # Tyylit molemmille sivuille
├── js/
│   └── app.js          # SPA-logiikka (vain index.html)
└── content/
    └── *.md            # Markdown-dokumentit
```

### Ominaisuudet

#### Interaktiivinen SPA (index.html)
- ✅ Rekursiivinen sisällysluettelo JSON-datasta
- ✅ Markdown → HTML konversio (markdown-it)
- ✅ Edellinen/Seuraava-navigointi
- ✅ Light/Dark theme toggle
- ✅ LocalStorage lupakysely (GDPR)
- ✅ Tiedostojen lataus (.md)
- ✅ Sticky header scrollauksessa

#### Staattinen näkymä (static.html)
- ✅ Kaikki sisältö suoraan HTML:ssä
- ✅ Täydelliset URL:t jokaiseen dokumenttiin
- ✅ Tekoälyystävällinen rakenne
- ✅ Ei JavaScript-riippuvuuksia sisällön näyttämiseen

### Teknologiat
- **Vanilla JavaScript** - ei frameworkeja
- **markdown-it** - Markdown-parseri
- **CSS Variables** - Teemojen hallinta
- **LocalStorage API** - Theme-asetusten tallennus
- **GitHub Pages** - Hosting

## 🔧 Paikallinen kehitys

1. Kloonaa repositorio:
```bash
git clone https://github.com/stochastic-philosophy/welfare-state-1.git
cd welfare-state-1
```

2. Käynnistä paikallinen web-serveri docs-kansiossa:
```bash
cd docs
python -m http.server 8000
# tai
npx serve
```

3. Avaa selaimessa: `http://localhost:8000`

## 📝 Uuden vastaavan sivuston luominen

Tämä sivusto toimii mallina muille vastaaville projekteille. Luo uusi sivusto:

1. **Kopioi `docs/` kansio** uuteen repositorioon

2. **Päivitä `content.json`:**
   - Vaihda `baseUrl` vastaamaan uutta GitHub Pages -osoitetta
   - Päivitä `title`, `description`
   - Lisää omat `sections`, `parts`, ja `chapters`

3. **Lisää markdown-tiedostot** `content/` kansioon

4. **Päivitä `static.html`** (valinnainen):
   - Jos haluat, voit generoida sen automaattisesti `content.json`:sta
   - Tai päivitä manuaalisesti vastaamaan uutta sisältöä

5. **Aktivoi GitHub Pages:**
   - Repository Settings → Pages
   - Source: Deploy from branch
   - Branch: main, Folder: /docs
   - Tallenna

6. **Testaa tekoälynäkymä:**
   - Avaa `https://[username].github.io/[repo-name]/static.html`
   - Varmista että kaikki linkit toimivat

## 🎨 Teemojen muokkaus

Muokkaa värejä `css/styles.css` tiedostossa:

```css
:root {
    --bg-color: #ffffff;
    --text-color: #333333;
    --button-bg: #007bff;
    /* ... */
}

[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    /* ... */
}
```

## 📄 Lisenssi

Tämän sivuston lähdekoodi on vapaasti käytettävissä. Sisältö (markdown-dokumentit) on tekijän omaisuutta.

## 🤝 Yhteystiedot

Jos sinulla on kysymyksiä sivuston teknisestä toteutuksesta tai haluat käyttää sitä mallina omalle projektillesi, ota yhteyttä repositorion kautta.

---

**Huom:** Tämä on dokumentaatiosivusto. Varsinainen sisältö löytyy markdown-tiedostoista `content/` kansiosta.
