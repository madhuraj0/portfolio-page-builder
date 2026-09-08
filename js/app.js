/**
 * Portfolio & Story Page Builder
 * State-driven visual block editor
 */

(function () {
  'use strict';

  // --- HTML Entity Escaping (Prevent DOM XSS) ---
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Sanitize URL for iframe / images to prevent javascript: pseudo-protocol
  function sanitizeURL(url) {
    if (!url) return '';
    const trimmed = String(url).trim();
    if (/^(https?:\/\/|\/|\.\/|data:image\/)/i.test(trimmed)) {
      return trimmed;
    }
    // Default safe fallback if protocol omitted
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
      return 'https://' + trimmed;
    }
    return escapeHTML(trimmed);
  }

  // --- Initial / Sample State ---
  const SAMPLE_STORY = [
    {
      id: 'blk_sample_1',
      type: 'cover',
      data: {
        title: 'Chasing the Horizon',
        tagline: 'An intimate photographic journey across remote landscapes and quiet moments.',
        byline: 'By Alex Bennett',
        dateline: 'September 2026',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80',
        overlayOpacity: 55
      }
    },
    {
      id: 'blk_sample_2',
      type: 'heading',
      data: {
        text: 'The Stillness of Dawn',
        level: 'h1'
      }
    },
    {
      id: 'blk_sample_3',
      type: 'text',
      data: {
        text: 'Every morning begins with an unspoken promise. Before the first rays break across the ridgeline, the mountain valleys exist in a tranquil blue twilight.\n\nTraveling light with nothing more than a mechanical camera, a sketchbook, and a warm flask of tea, I set out into the misty foothills of the eastern range. The air was crisp, carrying the distinct scent of damp pine and morning dew.'
      }
    },
    {
      id: 'blk_sample_4',
      type: 'wideImage',
      data: {
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80',
        caption: 'First light over the alpine meadows, captured on 35mm film.',
        altText: 'Alpine sunrise'
      }
    },
    {
      id: 'blk_sample_5',
      type: 'quote',
      data: {
        quote: 'In the depth of winter, I finally learned that within me there lay an invincible summer.',
        author: 'Albert Camus'
      }
    },
    {
      id: 'blk_sample_6',
      type: 'bleedingImage',
      data: {
        imageUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=2000&q=80',
        caption: 'Walking through ancient evergreen forests under heavy mist.',
        altText: 'Mist in the forest'
      }
    },
    {
      id: 'blk_sample_7',
      type: 'text',
      data: {
        text: 'Finding stillness in a hyper-connected world is an act of deliberate intention. For three weeks, no screens illuminated my evenings; only the embers of the hearth and the quiet whisper of wind through the trees.'
      }
    },
    {
      id: 'blk_sample_8',
      type: 'footer',
      data: {
        text: '© 2026 Alex Bennett. All rights reserved. Built with Portfolio Page Builder.'
      }
    }
  ];

  // --- Application State ---
  let state = {
    title: 'Visual Story Portfolio',
    blocks: []
  };

  const undoStack = [];
  const redoStack = [];

  // --- Persistence ---
  const STORAGE_KEY = 'portfolio_builder_draft_v2';

  function saveState(recordHistory = true) {
    if (recordHistory) {
      undoStack.push(JSON.stringify(state));
      redoStack.length = 0; // clear redo on new action
      if (undoStack.length > 30) undoStack.shift();
      updateUndoRedoUI();
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state = JSON.parse(saved);
        return true;
      }
    } catch (e) {
      console.warn('Failed reading draft', e);
    }
    return false;
  }

  function updateUndoRedoUI() {
    const btnUndo = document.getElementById('btnUndo');
    const btnRedo = document.getElementById('btnRedo');
    if (btnUndo) btnUndo.disabled = undoStack.length === 0;
    if (btnRedo) btnRedo.disabled = redoStack.length === 0;
  }

  function undo() {
    if (undoStack.length === 0) return;
    redoStack.push(JSON.stringify(state));
    const previous = JSON.parse(undoStack.pop());
    state = previous;
    renderCanvas();
    updateUndoRedoUI();
    showToast('Action undone');
  }

  function redo() {
    if (redoStack.length === 0) return;
    undoStack.push(JSON.stringify(state));
    const next = JSON.parse(redoStack.pop());
    state = next;
    renderCanvas();
    updateUndoRedoUI();
    showToast('Action redone');
  }

  // --- Toast Notification ---
  function showToast(message, icon = 'check-circle') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'app-toast';
    toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${escapeHTML(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // --- Block Rendering Helpers ---
  function renderBlockHTML(block) {
    const d = block.data || {};
    switch (block.type) {
      case 'cover': {
        const opacity = (d.overlayOpacity || 55) / 100;
        const bgImg = sanitizeURL(d.imageUrl || '');
        return `
          <div class="story-cover" style="background-image: url('${bgImg}');">
            <div class="story-cover-overlay" style="background-color: rgba(0, 0, 0, ${opacity});">
              <h1 class="story-cover-title">${escapeHTML(d.title || 'Your Title Here')}</h1>
              ${d.tagline ? `<p class="story-cover-tagline">${escapeHTML(d.tagline)}</p>` : ''}
              <div class="story-cover-meta">
                ${d.byline ? `<span class="story-cover-byline">${escapeHTML(d.byline)}</span>` : ''}
                ${d.dateline ? `<span class="story-cover-dateline">${escapeHTML(d.dateline)}</span>` : ''}
              </div>
            </div>
          </div>`;
      }
      case 'heading': {
        const tag = ['h1', 'h2', 'h3'].includes(d.level) ? d.level : 'h1';
        return `
          <div class="story-heading-container">
            <${tag} class="story-heading">${escapeHTML(d.text || 'Section Heading')}</${tag}>
          </div>`;
      }
      case 'text': {
        return `
          <div class="story-text-container">
            <p class="story-text">${escapeHTML(d.text || '')}</p>
          </div>`;
      }
      case 'wideImage': {
        const imgUrl = sanitizeURL(d.imageUrl || '');
        return `
          <div class="story-wide-image">
            <figure>
              <img src="${imgUrl}" alt="${escapeHTML(d.altText || d.caption || 'Photo')}" loading="lazy" class="img-fluid" />
              ${d.caption ? `<figcaption class="story-caption">${escapeHTML(d.caption)}</figcaption>` : ''}
            </figure>
          </div>`;
      }
      case 'bleedingImage': {
        const imgUrl = sanitizeURL(d.imageUrl || '');
        return `
          <div class="story-bleeding-image">
            <img src="${imgUrl}" alt="${escapeHTML(d.altText || d.caption || 'Full Bleed Photo')}" loading="lazy" />
            ${d.caption ? `<div class="story-caption">${escapeHTML(d.caption)}</div>` : ''}
          </div>`;
      }
      case 'quote': {
        return `
          <div class="story-quote-container">
            <blockquote class="story-pull-quote">
              <p class="story-quote-text">“${escapeHTML(d.quote || '')}”</p>
              ${d.author ? `<cite class="story-quote-cite">— ${escapeHTML(d.author)}</cite>` : ''}
            </blockquote>
          </div>`;
      }
      case 'embed': {
        const embedUrl = sanitizeURL(d.url || '');
        return `
          <div class="story-embed-container">
            <div class="responsive-embed-frame">
              <iframe src="${embedUrl}" title="Embedded Media" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            ${d.caption ? `<div class="story-caption">${escapeHTML(d.caption)}</div>` : ''}
          </div>`;
      }
      case 'caption': {
        return `
          <div class="story-standalone-caption">
            <p class="story-caption"><em>${escapeHTML(d.text || '')}</em></p>
          </div>`;
      }
      case 'footer': {
        return `
          <footer class="story-footer">
            <p>${escapeHTML(d.text || '')}</p>
          </footer>`;
      }
      default:
        return `<div class="p-3 text-muted">Unknown block type</div>`;
    }
  }

  // --- Canvas Renderer ---
  function renderCanvas() {
    const canvas = document.getElementById('storyCanvas');
    if (!canvas) return;

    if (!state.blocks || state.blocks.length === 0) {
      canvas.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fas fa-layer-group"></i></div>
          <h3>Start Crafting Your Story</h3>
          <p>Click any block button from the toolbar above to add covers, headings, paragraphs, images, or embeds.</p>
          <button class="btn btn-primary btn-sm px-3" id="btnLoadSample">
            <i class="fas fa-magic me-1"></i> Load Sample Story
          </button>
        </div>`;

      document.getElementById('btnLoadSample')?.addEventListener('click', () => {
        saveState();
        state.blocks = JSON.parse(JSON.stringify(SAMPLE_STORY));
        renderCanvas();
        showToast('Sample story loaded!');
      });
      return;
    }

    canvas.innerHTML = '';

    state.blocks.forEach((block, index) => {
      const blockEl = document.createElement('div');
      blockEl.className = 'story-block';
      blockEl.dataset.blockId = block.id;

      // Controls Bar (Move, Edit, Duplicate, Delete)
      const actionsBar = document.createElement('div');
      actionsBar.className = 'block-actions';
      actionsBar.innerHTML = `
        <button class="btn-block-action" data-action="up" title="Move Up" ${index === 0 ? 'disabled' : ''}>
          <i class="fas fa-arrow-up"></i>
        </button>
        <button class="btn-block-action" data-action="down" title="Move Down" ${index === state.blocks.length - 1 ? 'disabled' : ''}>
          <i class="fas fa-arrow-down"></i>
        </button>
        <button class="btn-block-action" data-action="edit" title="Edit Block">
          <i class="fas fa-pen"></i>
        </button>
        <button class="btn-block-action" data-action="duplicate" title="Duplicate Block">
          <i class="fas fa-copy"></i>
        </button>
        <button class="btn-block-action btn-delete" data-action="delete" title="Delete Block">
          <i class="fas fa-trash"></i>
        </button>
      `;

      // Content Wrapper
      const contentEl = document.createElement('div');
      contentEl.className = 'story-block-content';
      contentEl.innerHTML = renderBlockHTML(block);

      blockEl.appendChild(actionsBar);
      blockEl.appendChild(contentEl);
      canvas.appendChild(blockEl);

      // Event delegation for actions
      actionsBar.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const action = btn.dataset.action;
        handleBlockAction(action, block.id, index);
      });
    });
  }

  // --- Block Actions Handler ---
  function handleBlockAction(action, blockId, index) {
    switch (action) {
      case 'up':
        if (index > 0) {
          saveState();
          const temp = state.blocks[index];
          state.blocks[index] = state.blocks[index - 1];
          state.blocks[index - 1] = temp;
          renderCanvas();
        }
        break;
      case 'down':
        if (index < state.blocks.length - 1) {
          saveState();
          const temp = state.blocks[index];
          state.blocks[index] = state.blocks[index + 1];
          state.blocks[index + 1] = temp;
          renderCanvas();
        }
        break;
      case 'edit':
        openEditModal(blockId);
        break;
      case 'duplicate': {
        saveState();
        const original = state.blocks[index];
        const copy = JSON.parse(JSON.stringify(original));
        copy.id = 'blk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        state.blocks.splice(index + 1, 0, copy);
        renderCanvas();
        showToast('Block duplicated');
        break;
      }
      case 'delete':
        saveState();
        state.blocks.splice(index, 1);
        renderCanvas();
        showToast('Block removed', 'trash-alt');
        break;
    }
  }

  // --- Modal Form Editor ---
  let blockModalInstance = null;

  function initModal() {
    const modalEl = document.getElementById('blockEditModal');
    if (modalEl && window.bootstrap) {
      blockModalInstance = new bootstrap.Modal(modalEl);
    }
  }

  function openEditModal(blockId, isNew = false, defaultType = 'text') {
    let block;
    if (isNew) {
      block = {
        id: 'blk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        type: defaultType,
        data: {}
      };
    } else {
      block = state.blocks.find(b => b.id === blockId);
    }

    if (!block) return;

    const modalTitle = document.getElementById('blockModalTitle');
    const modalBody = document.getElementById('blockModalBody');
    const saveBtn = document.getElementById('btnSaveBlock');

    modalTitle.textContent = (isNew ? 'Add ' : 'Edit ') + formatTypeName(block.type);
    modalBody.innerHTML = generateFormFields(block);

    // Save button click
    saveBtn.onclick = () => {
      const updatedData = extractFormData(block.type);
      saveState();
      block.data = updatedData;
      if (isNew) {
        state.blocks.push(block);
      }
      renderCanvas();
      blockModalInstance.hide();
      showToast(isNew ? 'Block added!' : 'Block updated!');
    };

    blockModalInstance.show();
  }

  function formatTypeName(type) {
    const names = {
      cover: 'Cover / Hero Banner',
      heading: 'Section Heading',
      text: 'Paragraph Text',
      wideImage: 'Wide Image',
      bleedingImage: 'Bleeding Full-Bleed Image',
      quote: 'Pull Quote',
      embed: 'Web Embed (YouTube / iframe)',
      caption: 'Standalone Caption',
      footer: 'Story Footer'
    };
    return names[type] || 'Story Block';
  }

  function generateFormFields(block) {
    const d = block.data || {};
    switch (block.type) {
      case 'cover':
        return `
          <div class="mb-3">
            <label class="form-label">Background Image URL</label>
            <input type="url" class="form-control" id="field_imageUrl" value="${escapeHTML(d.imageUrl || '')}" placeholder="https://images.unsplash.com/..." required>
          </div>
          <div class="mb-3">
            <label class="form-label">Story Headline / Title</label>
            <input type="text" class="form-control" id="field_title" value="${escapeHTML(d.title || '')}" placeholder="My Epic Journey" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Tagline / Subheading</label>
            <input type="text" class="form-control" id="field_tagline" value="${escapeHTML(d.tagline || '')}" placeholder="A journey into the unknown...">
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Byline</label>
              <input type="text" class="form-control" id="field_byline" value="${escapeHTML(d.byline || '')}" placeholder="By Jane Doe">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Dateline / Date</label>
              <input type="text" class="form-control" id="field_dateline" value="${escapeHTML(d.dateline || '')}" placeholder="September 2026">
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Dark Overlay Opacity: <span id="opacityVal">${d.overlayOpacity || 55}%</span></label>
            <input type="range" class="form-range" id="field_overlayOpacity" min="10" max="90" value="${d.overlayOpacity || 55}" oninput="document.getElementById('opacityVal').textContent = this.value + '%'">
          </div>`;

      case 'heading':
        return `
          <div class="mb-3">
            <label class="form-label">Heading Text</label>
            <input type="text" class="form-control" id="field_text" value="${escapeHTML(d.text || '')}" placeholder="Enter heading..." required>
          </div>
          <div class="mb-3">
            <label class="form-label">Heading Level</label>
            <select class="form-select" id="field_level">
              <option value="h1" ${d.level === 'h1' ? 'selected' : ''}>H1 - Large Title</option>
              <option value="h2" ${d.level === 'h2' ? 'selected' : ''}>H2 - Major Section</option>
              <option value="h3" ${d.level === 'h3' ? 'selected' : ''}>H3 - Sub-heading</option>
            </select>
          </div>`;

      case 'text':
        return `
          <div class="mb-3">
            <label class="form-label">Story Text (Supports multiple paragraphs)</label>
            <textarea class="form-control" id="field_text" rows="8" placeholder="Type or paste your narrative here...">${escapeHTML(d.text || '')}</textarea>
          </div>`;

      case 'wideImage':
      case 'bleedingImage':
        return `
          <div class="mb-3">
            <label class="form-label">Image URL</label>
            <input type="url" class="form-control" id="field_imageUrl" value="${escapeHTML(d.imageUrl || '')}" placeholder="https://..." required>
          </div>
          <div class="mb-3">
            <label class="form-label">Caption</label>
            <input type="text" class="form-control" id="field_caption" value="${escapeHTML(d.caption || '')}" placeholder="Optional photo description or credits">
          </div>
          <div class="mb-3">
            <label class="form-label">Accessibility Alt Text</label>
            <input type="text" class="form-control" id="field_altText" value="${escapeHTML(d.altText || '')}" placeholder="Visual description for screen readers">
          </div>`;

      case 'quote':
        return `
          <div class="mb-3">
            <label class="form-label">Quote</label>
            <textarea class="form-control" id="field_quote" rows="3" placeholder="Memorable quote...">${escapeHTML(d.quote || '')}</textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">Author / Attribution</label>
            <input type="text" class="form-control" id="field_author" value="${escapeHTML(d.author || '')}" placeholder="Author Name">
          </div>`;

      case 'embed':
        return `
          <div class="mb-3">
            <label class="form-label">Embed URL (YouTube, Vimeo, Google Drive preview, Maps)</label>
            <input type="url" class="form-control" id="field_url" value="${escapeHTML(d.url || '')}" placeholder="https://www.youtube.com/embed/..." required>
            <div class="form-text">Tip: For YouTube, use embed links like <code>https://www.youtube.com/embed/VIDEO_ID</code></div>
          </div>
          <div class="mb-3">
            <label class="form-label">Caption / Description</label>
            <input type="text" class="form-control" id="field_caption" value="${escapeHTML(d.caption || '')}" placeholder="Video caption">
          </div>`;

      case 'caption':
        return `
          <div class="mb-3">
            <label class="form-label">Caption Text</label>
            <input type="text" class="form-control" id="field_text" value="${escapeHTML(d.text || '')}" placeholder="Standalone note or italic caption">
          </div>`;

      case 'footer':
        return `
          <div class="mb-3">
            <label class="form-label">Footer Content</label>
            <textarea class="form-control" id="field_text" rows="3" placeholder="Copyright or closing statement...">${escapeHTML(d.text || '')}</textarea>
          </div>`;

      default:
        return `<p>No settings available for this block.</p>`;
    }
  }

  function extractFormData(type) {
    const data = {};
    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    switch (type) {
      case 'cover':
        data.imageUrl = getVal('field_imageUrl');
        data.title = getVal('field_title');
        data.tagline = getVal('field_tagline');
        data.byline = getVal('field_byline');
        data.dateline = getVal('field_dateline');
        data.overlayOpacity = parseInt(getVal('field_overlayOpacity') || '55', 10);
        break;
      case 'heading':
        data.text = getVal('field_text');
        data.level = getVal('field_level');
        break;
      case 'text':
        data.text = getVal('field_text');
        break;
      case 'wideImage':
      case 'bleedingImage':
        data.imageUrl = getVal('field_imageUrl');
        data.caption = getVal('field_caption');
        data.altText = getVal('field_altText');
        break;
      case 'quote':
        data.quote = getVal('field_quote');
        data.author = getVal('field_author');
        break;
      case 'embed':
        data.url = getVal('field_url');
        data.caption = getVal('field_caption');
        break;
      case 'caption':
      case 'footer':
        data.text = getVal('field_text');
        break;
    }
    return data;
  }

  // --- Export Functionality ---
  function getRenderedContentHTML() {
    return state.blocks.map(b => renderBlockHTML(b)).join('\n');
  }

  function generateFullStandaloneHTML() {
    const content = getRenderedContentHTML();
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(state.title || 'Portfolio Story')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.6;
    }
    .story-cover {
      position: relative;
      width: 100%;
      min-height: 85vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-size: cover;
      background-position: center;
    }
    .story-cover-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 3rem 1.5rem;
      text-align: center;
      color: #ffffff;
    }
    .story-cover-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: clamp(2.2rem, 5vw, 4rem);
      font-weight: 700;
      margin-bottom: 1rem;
      max-width: 900px;
    }
    .story-cover-tagline {
      font-size: clamp(1.1rem, 2vw, 1.45rem);
      font-weight: 300;
      max-width: 750px;
      margin-bottom: 1.5rem;
      opacity: 0.95;
    }
    .story-cover-meta {
      display: flex;
      gap: 1.25rem;
      font-size: 0.95rem;
      opacity: 0.85;
    }
    .story-heading-container {
      max-width: 780px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem 0.5rem;
    }
    .story-heading {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: clamp(1.85rem, 3.5vw, 2.75rem);
      font-weight: 700;
      color: #0f172a;
    }
    .story-text-container {
      max-width: 780px;
      margin: 0 auto;
      padding: 1rem 1.5rem;
    }
    .story-text {
      font-size: 1.18rem;
      line-height: 1.85;
      color: #334155;
      white-space: pre-line;
      margin-bottom: 1.25rem;
    }
    .story-wide-image {
      max-width: 1040px;
      margin: 2.5rem auto;
      padding: 0 1rem;
    }
    .story-wide-image img {
      width: 100%;
      max-height: 85vh;
      object-fit: cover;
      border-radius: 4px;
    }
    .story-bleeding-image {
      width: 100%;
      margin: 3rem 0;
    }
    .story-bleeding-image img {
      width: 100%;
      max-height: 90vh;
      object-fit: cover;
    }
    .story-caption {
      font-size: 0.95rem;
      font-style: italic;
      color: #64748b;
      margin-top: 0.75rem;
      text-align: center;
    }
    .story-quote-container {
      max-width: 780px;
      margin: 2.5rem auto;
      padding: 1rem 1.5rem;
    }
    .story-pull-quote {
      border-left: 4px solid #2563eb;
      padding: 0.75rem 0 0.75rem 1.5rem;
      margin: 0;
    }
    .story-quote-text {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.5rem;
      font-style: italic;
      line-height: 1.5;
      color: #0f172a;
      margin-bottom: 0.5rem;
    }
    .story-quote-cite {
      font-size: 0.9rem;
      color: #64748b;
      font-weight: 500;
      text-transform: uppercase;
    }
    .story-embed-container {
      max-width: 900px;
      margin: 2.5rem auto;
      padding: 0 1rem;
    }
    .responsive-embed-frame {
      position: relative;
      width: 100%;
      padding-bottom: 56.25%;
      height: 0;
      overflow: hidden;
      border-radius: 6px;
      background: #000;
    }
    .responsive-embed-frame iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }
    .story-standalone-caption {
      max-width: 780px;
      margin: 1.5rem auto;
      padding: 0 1.5rem;
    }
    .story-footer {
      background-color: #0f172a;
      color: #94a3b8;
      padding: 3.5rem 1.5rem;
      text-align: center;
      margin-top: 4rem;
    }
  </style>
</head>
<body>
${content}
</body>
</html>`;
  }

  // Copy to clipboard with legacy fallback
  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => fallbackCopy(text, successMsg));
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (err) {
      alert('Unable to copy automatically. Please copy manually.');
    }
    document.body.removeChild(ta);
  }

  // Download helper
  function downloadFile(filename, content, mimeType = 'text/html') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`);
  }

  // --- Viewport & Mode Controls ---
  function setupViewportsAndModes() {
    const canvas = document.getElementById('storyCanvas');
    const viewportBtns = document.querySelectorAll('[data-viewport]');

    viewportBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        viewportBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const vp = btn.dataset.viewport;
        canvas.classList.remove('viewport-desktop', 'viewport-tablet', 'viewport-mobile');
        canvas.classList.add('viewport-' + vp);
      });
    });

    const btnToggleMode = document.getElementById('btnToggleMode');
    if (btnToggleMode) {
      btnToggleMode.addEventListener('click', () => {
        const isEdit = document.body.classList.contains('mode-edit');
        if (isEdit) {
          document.body.classList.remove('mode-edit');
          document.body.classList.add('mode-preview');
          btnToggleMode.innerHTML = '<i class="fas fa-edit me-1"></i> Edit Mode';
          btnToggleMode.classList.remove('btn-outline-secondary');
          btnToggleMode.classList.add('btn-primary');
          showToast('Switched to Preview Mode');
        } else {
          document.body.classList.remove('mode-preview');
          document.body.classList.add('mode-edit');
          btnToggleMode.innerHTML = '<i class="fas fa-eye me-1"></i> Preview';
          btnToggleMode.classList.remove('btn-primary');
          btnToggleMode.classList.add('btn-outline-secondary');
          showToast('Switched to Edit Mode');
        }
      });
    }
  }

  // --- Event Listeners Setup ---
  function initEvents() {
    // Add Block Palette buttons
    document.querySelectorAll('[data-add-block]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.addBlock;
        openEditModal(null, true, type);
      });
    });

    // Undo / Redo
    document.getElementById('btnUndo')?.addEventListener('click', undo);
    document.getElementById('btnRedo')?.addEventListener('click', redo);

    // Keyboard shortcuts (Ctrl+Z / Ctrl+Y)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo();
      }
    });

    // Clear Canvas
    document.getElementById('btnClearAll')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all blocks? You can undo this action.')) {
        saveState();
        state.blocks = [];
        renderCanvas();
        showToast('Canvas cleared', 'info-circle');
      }
    });

    // Export Dropdown actions
    document.getElementById('btnCopyFullHTML')?.addEventListener('click', () => {
      const html = generateFullStandaloneHTML();
      copyToClipboard(html, 'Full Page HTML copied to clipboard!');
    });

    document.getElementById('btnDownloadFullHTML')?.addEventListener('click', () => {
      const html = generateFullStandaloneHTML();
      downloadFile('story-page.html', html, 'text/html');
    });

    document.getElementById('btnCopySnippetHTML')?.addEventListener('click', () => {
      const snippet = getRenderedContentHTML();
      copyToClipboard(snippet, 'Article content snippet copied!');
    });

    document.getElementById('btnExportJSON')?.addEventListener('click', () => {
      const json = JSON.stringify(state, null, 2);
      downloadFile('story-project.json', json, 'application/json');
    });

    // Import JSON
    const fileInput = document.getElementById('importFileInput');
    document.getElementById('btnImportJSON')?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const imported = JSON.parse(evt.target.result);
          if (imported && Array.isArray(imported.blocks)) {
            saveState();
            state = imported;
            renderCanvas();
            showToast('Project loaded successfully!');
          } else {
            alert('Invalid project file format.');
          }
        } catch (err) {
          alert('Failed to parse JSON file.');
        }
      };
      reader.readAsText(file);
      fileInput.value = '';
    });
  }

  // --- App Initialization ---
  function init() {
    document.body.classList.add('mode-edit');
    initModal();
    setupViewportsAndModes();
    initEvents();

    const hadSaved = loadState();
    if (!hadSaved || state.blocks.length === 0) {
      // Default to the rich sample story so new visitors immediately see a working page
      state.blocks = JSON.parse(JSON.stringify(SAMPLE_STORY));
    }

    renderCanvas();
    updateUndoRedoUI();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
