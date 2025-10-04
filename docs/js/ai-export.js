import { sendFeedback } from './email-helper.js';

export function initAIExport(getEnrichedDataFn) {
  const button = document.createElement('button');
  button.id = 'ai-export-toggle';
  button.innerHTML = '🤖 Tekoäly';
  button.addEventListener('click', () => openExportModal(getEnrichedDataFn));
  document.body.appendChild(button);
}

function openExportModal(getEnrichedDataFn) {
  const enrichedData = getEnrichedDataFn();
  if (!enrichedData) {
    alert('Sisältö ei ole vielä ladattu. Palaa etusivulle ensin.');
    return;
  }

  const modal = document.createElement('div');
  modal.id = 'ai-export-modal';
  modal.innerHTML = `
    <div class="ai-export-content">
      <h2>🤖 Vie linkit tekoälyyn</h2>
      <p>Valitse mitä dokumentteja haluat jakaa. Kopioi linkit ja ohjeista tekoälyä lukemaan tarvittavat dokumentit.</p>
      
      <div class="export-controls">
        <button id="select-all" class="export-btn">Valitse kaikki</button>
        <button id="deselect-all" class="export-btn">Poista valinnat</button>
      </div>
      
      <div id="file-tree" class="file-tree"></div>

      <div class="export-actions">
        <button id="email-selected" class="export-btn">📧 Lähetä sähköpostilla</button>
        <button id="copy-selected" class="export-btn primary">Kopioi linkit</button>
        <button id="close-export" class="export-btn">Sulje</button>
      </div>
      
      <div id="export-status" class="export-status"></div>
    </div>
  `;

  document.body.appendChild(modal);

  buildFileTree(enrichedData);

  document.getElementById('select-all').addEventListener('click', () => toggleAll(true));
  document.getElementById('deselect-all').addEventListener('click', () => toggleAll(false));
  document.getElementById('copy-selected').addEventListener('click', () => copySelected(enrichedData));
  document.getElementById('close-export').addEventListener('click', () => modal.remove());
  document.getElementById('email-selected').addEventListener('click', () => {
    const links = generateLinksList(enrichedData);
    sendFeedback(links);
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

function buildFileTree(enrichedData) {
  const tree = document.getElementById('file-tree');
  let html = '';

  enrichedData.sections.forEach((section, sectionIdx) => {
    const sectionId = `section-${sectionIdx}`;
    html += `
      <div class="tree-section">
        <div class="tree-item">
          <input type="checkbox" id="${sectionId}" class="section-checkbox" data-section="${sectionIdx}">
          <label for="${sectionId}"><strong>${section.title}</strong></label>
        </div>
        <div class="tree-chapters">
    `;

    section.chapters.forEach((chapter, chapterIdx) => {
      const chapterId = `chapter-${sectionIdx}-${chapterIdx}`;
      html += `
        <div class="tree-item chapter-item">
          <input type="checkbox" id="${chapterId}" class="chapter-checkbox" data-section="${sectionIdx}" data-chapter="${chapterIdx}">
          <label for="${chapterId}">${chapter.title}</label>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  tree.innerHTML = html;

  document.querySelectorAll('.section-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const sectionIdx = e.target.dataset.section;
      const checked = e.target.checked;
      document.querySelectorAll(`.chapter-checkbox[data-section="${sectionIdx}"]`).forEach(chCb => {
        chCb.checked = checked;
      });
    });
  });

  document.querySelectorAll('.chapter-checkbox').forEach(cb => {
    cb.addEventListener('change', updateSectionCheckbox);
  });
}

function updateSectionCheckbox(e) {
  const sectionIdx = e.target.dataset.section;
  const chapterBoxes = document.querySelectorAll(`.chapter-checkbox[data-section="${sectionIdx}"]`);
  const sectionBox = document.querySelector(`.section-checkbox[data-section="${sectionIdx}"]`);
  
  const allChecked = Array.from(chapterBoxes).every(cb => cb.checked);
  const someChecked = Array.from(chapterBoxes).some(cb => cb.checked);
  
  sectionBox.checked = allChecked;
  sectionBox.indeterminate = someChecked && !allChecked;
}

function toggleAll(checked) {
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = checked;
  });
}

function copySelected(enrichedData) {
  const selected = [];
  const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
  
  document.querySelectorAll('.chapter-checkbox:checked').forEach(cb => {
    const sectionIdx = parseInt(cb.dataset.section);
    const chapterIdx = parseInt(cb.dataset.chapter);
    const section = enrichedData.sections[sectionIdx];
    const chapter = section.chapters[chapterIdx];
    
    selected.push({
      sectionTitle: section.title,
      chapterTitle: chapter.title,
      file: chapter.file,
      url: baseUrl + '/' + chapter.file
    });
  });

  if (selected.length === 0) {
    showStatus('⚠️ Valitse vähintään yksi dokumentti', 'warning');
    return;
  }

  let output = `Lue seuraavat dokumentit:\n\n`;

  const grouped = {};
  selected.forEach(item => {
    if (!grouped[item.sectionTitle]) {
      grouped[item.sectionTitle] = [];
    }
    grouped[item.sectionTitle].push(item);
  });

  Object.entries(grouped).forEach(([sectionTitle, items]) => {
    output += `**${sectionTitle}**\n`;
    items.forEach(item => {
      output += `- ${item.chapterTitle}: ${item.url}\n`;
    });
    output += `\n`;
  });

  output += `---\n\n`;
  output += `Yhteensä ${selected.length} dokumenttia valittu.`;

  navigator.clipboard.writeText(output).then(() => {
    showStatus(`✅ Kopioitu ${selected.length} linkkiä leikepöydälle!`, 'success');
  }).catch(err => {
    showStatus(`❌ Kopiointi epäonnistui: ${err.message}`, 'error');
    
    const textarea = document.createElement('textarea');
    textarea.value = output;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showStatus('✅ Kopioitu (varavaihtoehto)', 'success');
  });
}

function showStatus(message, type) {
  const status = document.getElementById('export-status');
  status.textContent = message;
  status.className = `export-status ${type}`;
  
  setTimeout(() => {
    status.textContent = '';
    status.className = 'export-status';
  }, 3000);
}
