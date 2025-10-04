// utils.js
// Apufunktiot

/**
 * Muuttaa tekstin URL-ystävälliseksi slug-muotoon
 * Esim: "Yhteiskunnallisen vakauden perustat" -> "yhteiskunnallisen-vakauden-perustat"
 */
export function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/å/g, 'a')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
