export function openEmailClient(to, subject, body) {
  const params = new URLSearchParams({
    subject: subject,
    body: body
  });
  
  const mailtoLink = `mailto:${to}?${params.toString()}`;
  window.location.href = mailtoLink;
}

export function sendFeedback(selectedLinks = '') {
  const to = 'stochasticphilosopher@gmail.com';
  const subject = 'Palaute: Hyvinvointivaltion analyysi';
  
  let body = 'Hei,\n\n';
  body += 'Haluan antaa palautetta sivustosta:\n\n';
  body += '[Kirjoita palautteesi tähän]\n\n';
  
  if (selectedLinks) {
    body += '---\n\n';
    body += 'Viittaan seuraaviin dokumentteihin:\n';
    body += selectedLinks;
    body += '\n';
  }
  
  body += '---\n\n';
  body += `Lähetetty: ${new Date().toLocaleString('fi-FI')}\n`;
  body += `Sivu: ${window.location.href}`;
  
  openEmailClient(to, subject, body);
}
