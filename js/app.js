/**
 * Portfolio & Story Page Builder
 * State-driven visual block editor with 20 editorial & portfolio block types
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

  // Sanitize URL for iframe / images / audio / links
  function sanitizeURL(url) {
    if (!url) return '';
    const trimmed = String(url).trim();
    if (/^(https?:\/\/|\/|\.\/|mailto:|tel:|data:image\/)/i.test(trimmed)) {
      return trimmed;
    }
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(trimmed)) {
      return 'https://' + trimmed;
    }
    return '#';
  }

  // Safe Inline Markdown Parser: links [text](url), **bold**, *italic*, and `code`
  function renderInlineMarkdown(str) {
    if (!str) return '';
    let escaped = escapeHTML(str);

    // Markdown links [text](url)
    escaped = escaped.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, linkText, url) => {
      const rawUrl = url.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
      const safeUrl = sanitizeURL(rawUrl);
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="story-link">${linkText}</a>`;
    });

    // Inline code `code`
    escaped = escaped.replace(/`([^`]+)`/g, '<code class="story-inline-code">$1</code>');

    // Bold **text** or __text__
    escaped = escaped.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');

    // Italic *text* or _text_
    escaped = escaped.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');

    return escaped;
  }

  // --- Curated Typography Themes ---
  const TYPOGRAPHY_THEMES = {
    classic: {
      name: 'Editorial Classic',
      fontHeading: "'Playfair Display', Georgia, serif",
      fontBody: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Roboto:wght@300;400;500;700&display=swap'
    },
    modern: {
      name: 'Modern Studio',
      fontHeading: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontBody: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap'
    },
    literary: {
      name: 'Literary Book',
      fontHeading: "'Lora', Georgia, serif",
      fontBody: "'Merriweather', Georgia, serif",
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,600;0,700;1,400&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&display=swap'
    },
    creative: {
      name: 'Creative Avant-Garde',
      fontHeading: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontBody: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@600;700&display=swap'
    },
    'minimal-mono': {
      name: 'Minimal Mono',
      fontHeading: "'JetBrains Mono', monospace",
      fontBody: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@500;700&display=swap'
    }
  };

  // --- Sample Story State ---
  const SAMPLE_STORY = [
    {
      id: 'blk_1',
      type: 'cover',
      data: {
        title: 'The Silent Fjords of the North',
        tagline: 'An expedition documenting the vanishing glaciers and quiet resilience of Arctic communities.',
        byline: 'By Alex Bennett',
        dateline: 'September 2026',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80',
        overlayOpacity: 55
      }
    },
    {
      id: 'blk_2',
      type: 'heading',
      data: {
        text: 'The Edge of Stillness',
        level: 'h1'
      }
    },
    {
      id: 'blk_3',
      type: 'text',
      data: {
        text: 'Every journey begins with an unspoken promise. Before dawn broke across the fjord, the water was as smooth as dark obsidian, reflecting **jagged snowcapped ridges** in absolute symmetry.\n\nTraveling light with mechanical cameras, audio recorders, and warm tea, we ventured into regions rarely touched by seasonal roads. Explore our [expedition dispatch](https://github.com/madhuraj0/portfolio-page-builder) and field logs below.'
      }
    },
    {
      id: 'blk_4',
      type: 'stats',
      data: {
        stat1Num: '28',
        stat1Label: 'Days in the Field',
        stat1Sub: 'Off-grid expedition',
        stat2Num: '1,420 km',
        stat2Label: 'Terrain Covered',
        stat2Sub: 'On foot and by kayak',
        stat3Num: '3,800',
        stat3Label: 'Film Photographs',
        stat3Sub: 'Captured on 35mm & 120 film'
      }
    },
    {
      id: 'blk_5',
      type: 'splitMediaText',
      data: {
        imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80',
        imagePosition: 'left',
        title: 'First Light Across the Ridge',
        text: 'The morning mist clears slowly over alpine meadows. At this altitude, every sound is amplified: the distant rumble of glacial runoff, the crunch of gravel under boots, and the sudden flap of sea eagles soaring above.',
        caption: 'Sunrise over eastern slopes.'
      }
    },
    {
      id: 'blk_6',
      type: 'callout',
      data: {
        type: 'note',
        title: 'Field Journal Note',
        text: 'Temperatures dropped below -12°C during overnight bivouacs. Camera shutters required specialized low-temp lubricants to prevent freeze-up during sunrise timelapses.'
      }
    },
    {
      id: 'blk_7',
      type: 'twoColumnImage',
      data: {
        img1Url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        img1Caption: 'Glacial valley carving through ancient granite.',
        img2Url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        img2Caption: 'Coastal inlets meeting open ocean currents.'
      }
    },
    {
      id: 'blk_8',
      type: 'quote',
      data: {
        quote: 'In wildness is the preservation of the world.',
        author: 'Henry David Thoreau'
      }
    },
    {
      id: 'blk_9',
      type: 'timeline',
      data: {
        itemsText: 'Day 1 | Departure from Tromsø | Assembled team, chartered Zodiacs, and calibrated satellite tracking equipment.\nDay 8 | Base Camp Alpha | Established weather station on northern ridge overlooking the primary ice shelf.\nDay 19 | Passage Through Storm | Heavy gale forced three days inside storm tents, testing equipment endurance.\nDay 28 | Final Rendezvous | Reached southern settlement and completed primary research logging.'
      }
    },
    {
      id: 'blk_10',
      type: 'bleedingImage',
      data: {
        imageUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=2000&q=80',
        caption: 'Old-growth boreal forest enveloped in sea mist at twilight.',
        altText: 'Boreal forest in mist'
      }
    },
    {
      id: 'blk_11',
      type: 'skillsPills',
      data: {
        title: 'Tools & Equipment Used',
        tags: 'Leica M10-R, Hasselblad 500C/M, Kodak Portra 400, Sennheiser Ambeo Mic, Weather Station Alpha, Solar Power Kit'
      }
    },
    {
      id: 'blk_12',
      type: 'divider',
      data: {
        style: 'asterisks',
        spacing: 'md'
      }
    },
    {
      id: 'blk_13',
      type: 'authorBio',
      data: {
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        name: 'Alex Bennett',
        role: 'Documentary Photographer & Visual Journalist',
        bio: 'Alex explores the intersection of human endurance, remote climates, and ecological memory. Contributing photojournalist to National Geographic and The Alpine Journal.',
        websiteUrl: 'https://example.com',
        githubUrl: 'https://github.com',
        twitterUrl: 'https://twitter.com',
        email: 'alex@example.com'
      }
    },
    {
      id: 'blk_14',
      type: 'ctaBanner',
      data: {
        heading: 'Bring This Visual Story to Your Publication',
        subtext: 'High-resolution prints, exhibition licensing, and extended field journals are available for editorial syndication.',
        buttonText: 'Request Licensing & Media Kit',
        buttonUrl: 'mailto:contact@example.com'
      }
    },
    {
      id: 'blk_15',
      type: 'footer',
      data: {
        text: '© 2026 Alex Bennett. All rights reserved. Crafted with Portfolio & Story Page Builder.'
      }
    }
  ];

  // --- Application State ---
  let state = {
    title: 'The Silent Fjords of the North',
    author: 'Alex Bennett',
    description: 'An expedition documenting the vanishing glaciers and quiet resilience of Arctic communities.',
    ogImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    typography: 'classic',
    colorMode: 'light',
    accentColor: '#2563eb',
    customTypography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Roboto',
      baseScale: '100'
    },
    blocks: []
  };

  const undoStack = [];
  const redoStack = [];
  const STORAGE_KEY = 'portfolio_builder_draft_v4';

  function getFontUrlForPair(heading, body) {
    const cleanH = encodeURIComponent(heading).replace(/%20/g, '+');
    const cleanB = encodeURIComponent(body).replace(/%20/g, '+');
    return `https://fonts.googleapis.com/css2?family=${cleanH}:wght@600;700&family=${cleanB}:wght@300;400;500;700&display=swap`;
  }

  function resolveActiveTheme() {
    const themeKey = state.typography || 'classic';
    if (themeKey === 'custom') {
      const custom = state.customTypography || {
        headingFont: 'Playfair Display',
        bodyFont: 'Roboto',
        baseScale: '100'
      };
      return {
        key: 'custom',
        name: `Custom (${custom.headingFont})`,
        fontHeading: `'${custom.headingFont}', serif`,
        fontBody: `'${custom.bodyFont}', sans-serif`,
        googleFontsUrl: getFontUrlForPair(custom.headingFont, custom.bodyFont),
        baseScale: custom.baseScale || '100'
      };
    }
    const theme = TYPOGRAPHY_THEMES[themeKey] || TYPOGRAPHY_THEMES.classic;
    return {
      key: themeKey,
      name: theme.name,
      fontHeading: theme.fontHeading,
      fontBody: theme.fontBody,
      googleFontsUrl: theme.googleFontsUrl,
      baseScale: '100'
    };
  }

  function applyTypography(themeKey, recordHistory = false) {
    if (themeKey !== 'custom' && !TYPOGRAPHY_THEMES[themeKey]) themeKey = 'classic';
    if (recordHistory) {
      saveState();
    }
    state.typography = themeKey;
    const canvas = document.getElementById('storyCanvas');
    const label = document.getElementById('currentTypographyLabel');

    if (themeKey === 'custom') {
      const custom = state.customTypography || {
        headingFont: 'Playfair Display',
        bodyFont: 'Roboto',
        baseScale: '100'
      };
      if (canvas) {
        canvas.dataset.theme = 'custom';
        canvas.style.setProperty('--story-font-heading', `'${custom.headingFont}', serif`);
        canvas.style.setProperty('--story-font-body', `'${custom.bodyFont}', sans-serif`);
        canvas.style.fontSize = `${custom.baseScale}%`;
      }
      if (label) {
        label.textContent = `Custom: ${custom.headingFont}`;
      }
    } else {
      if (canvas) {
        canvas.dataset.theme = themeKey;
        canvas.style.removeProperty('--story-font-heading');
        canvas.style.removeProperty('--story-font-body');
        canvas.style.fontSize = '';
      }
      if (label && TYPOGRAPHY_THEMES[themeKey]) {
        label.textContent = TYPOGRAPHY_THEMES[themeKey].name;
      }
    }

    document.querySelectorAll('[data-typography]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.typography === themeKey);
    });

    if (recordHistory) {
      const name = themeKey === 'custom' ? 'Custom Typography' : TYPOGRAPHY_THEMES[themeKey]?.name;
      showToast(`Typography set to ${name}`, 'font');
    }
  }

  function applyColorMode(mode, recordHistory = false) {
    if (!['light', 'dark'].includes(mode)) mode = 'light';
    if (recordHistory) {
      saveState();
    }
    state.colorMode = mode;
    const isDark = mode === 'dark';

    document.documentElement.setAttribute('data-theme-mode', mode);
    document.documentElement.setAttribute('data-bs-theme', mode);
    document.body.setAttribute('data-bs-theme', mode);
    document.querySelectorAll('.modal').forEach(m => m.setAttribute('data-bs-theme', mode));
    const canvas = document.getElementById('storyCanvas');
    if (canvas) {
      canvas.setAttribute('data-theme-mode', mode);
    }
    const btn = document.getElementById('btnToggleColorMode');
    if (btn) {
      btn.innerHTML = isDark ? '<i class="fas fa-sun text-warning"></i>' : '<i class="fas fa-moon"></i>';
      btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
    if (recordHistory) {
      showToast(`Switched to ${isDark ? 'Dark' : 'Light'} Mode`, isDark ? 'moon' : 'sun');
    }
  }

  function applyAccentColor(hex, name = null, recordHistory = false) {
    if (!hex) hex = '#2563eb';
    if (recordHistory) {
      saveState();
    }
    state.accentColor = hex;

    document.documentElement.style.setProperty('--primary-color', hex);
    const canvas = document.getElementById('storyCanvas');
    if (canvas) {
      canvas.style.setProperty('--primary-color', hex);
    }

    const dot = document.getElementById('currentAccentDot');
    if (dot) dot.style.backgroundColor = hex;

    const label = document.getElementById('currentAccentLabel');
    if (label && name) label.textContent = name;

    const colorInput = document.getElementById('inputCustomAccent');
    if (colorInput) colorInput.value = hex;

    const hexLabel = document.getElementById('customAccentHex');
    if (hexLabel) hexLabel.textContent = hex.toLowerCase();

    if (recordHistory) {
      showToast(`Accent color set to ${name || hex}`, 'palette');
    }
  }

  function saveState(recordHistory = true) {
    if (recordHistory) {
      undoStack.push(JSON.stringify(state));
      redoStack.length = 0;
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
        const parsed = JSON.parse(saved);
        state = {
          title: parsed.title || 'The Silent Fjords of the North',
          author: parsed.author || 'Alex Bennett',
          description: parsed.description || 'An expedition documenting the vanishing glaciers and quiet resilience of Arctic communities.',
          ogImage: parsed.ogImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
          typography: parsed.typography || 'classic',
          colorMode: parsed.colorMode || 'light',
          accentColor: parsed.accentColor || '#2563eb',
          customTypography: parsed.customTypography || {
            headingFont: 'Playfair Display',
            bodyFont: 'Roboto',
            baseScale: '100'
          },
          blocks: parsed.blocks || []
        };
        return true;
      }
    } catch (e) {
      console.warn('Failed reading draft', e);
    }
    return false;
  }

  function calculateStoryStats() {
    let totalWords = 0;
    if (!state.blocks || !Array.isArray(state.blocks)) return { words: 0, readTimeMinutes: 0 };

    state.blocks.forEach(block => {
      if (!block.data) return;
      Object.entries(block.data).forEach(([key, val]) => {
        if (typeof val !== 'string') return;
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('url') ||
          lowerKey.includes('src') ||
          lowerKey.includes('color') ||
          lowerKey.includes('font') ||
          lowerKey.includes('style') ||
          lowerKey.includes('opacity') ||
          lowerKey.includes('position') ||
          lowerKey.includes('align') ||
          lowerKey.includes('level') ||
          lowerKey.includes('size')
        ) {
          return;
        }
        const cleaned = val
          .replace(/https?:\/\/[^\s)]+/g, '')
          .replace(/[*_#`~\[\]()|]/g, ' ')
          .trim();
        if (cleaned) {
          const words = cleaned.split(/\s+/).filter(w => w.length > 0 && !/^https?:\/\//i.test(w));
          totalWords += words.length;
        }
      });
    });

    const readTimeMinutes = totalWords === 0 ? 0 : Math.max(1, Math.ceil(totalWords / 200));
    return { words: totalWords, readTimeMinutes };
  }

  function updateReadingStats() {
    const { words, readTimeMinutes } = calculateStoryStats();
    const wordEl = document.getElementById('storyWordCount');
    const readEl = document.getElementById('storyReadTime');
    const modalStatsEl = document.getElementById('modalStoryStats');
    const wordsLabel = `${words.toLocaleString()} ${words === 1 ? 'word' : 'words'}`;
    const timeLabel = `${readTimeMinutes} min read`;

    if (wordEl) {
      wordEl.textContent = wordsLabel;
    }
    if (readEl) {
      readEl.textContent = timeLabel;
    }
    if (modalStatsEl) {
      modalStatsEl.textContent = `${wordsLabel} · ${timeLabel}`;
    }
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
    state = JSON.parse(undoStack.pop());
    applyTypography(state.typography || 'classic', false);
    applyColorMode(state.colorMode || 'light', false);
    applyAccentColor(state.accentColor || '#2563eb', null, false);
    renderCanvas();
    updateUndoRedoUI();
    showToast('Action undone');
  }

  function redo() {
    if (redoStack.length === 0) return;
    undoStack.push(JSON.stringify(state));
    state = JSON.parse(redoStack.pop());
    applyTypography(state.typography || 'classic', false);
    applyColorMode(state.colorMode || 'light', false);
    applyAccentColor(state.accentColor || '#2563eb', null, false);
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

  // Helper to get block-level custom typography and sizing classes
  function getCustomStyleClasses(d) {
    if (!d || !d.enableCustomStyle) return '';
    const classes = [];
    if (d.customSize && d.customSize !== 'default') classes.push('size-' + d.customSize);
    if (d.customFontRole && d.customFontRole !== 'default') classes.push('font-role-' + d.customFontRole);
    if (d.customAlign && d.customAlign !== 'default') classes.push('align-' + d.customAlign);
    return classes.length ? ' ' + classes.join(' ') : '';
  }

  // Helper to get block-level custom inline color styles
  function getCustomStyleInline(d) {
    if (!d || !d.enableCustomStyle) return '';
    const styles = [];
    if (d.applyCustomAccent && d.customAccent) {
      styles.push(`--primary-color: ${d.customAccent}; border-color: ${d.customAccent};`);
    }
    if (d.applyCustomBg && d.customBg) {
      styles.push(`background-color: ${d.customBg};`);
    }
    return styles.length ? ` style="${styles.join(' ')}"` : '';
  }

  // --- Block Rendering Helpers (All 20 Blocks) ---
  function renderBlockHTML(block) {
    const d = block.data || {};
    switch (block.type) {
      // 1. Cover Hero (Supports Image & Ambient Video Backgrounds)
      case 'cover': {
        const opacity = (d.overlayOpacity || 55) / 100;
        const bgImg = sanitizeURL(d.imageUrl || '');
        const isVideo = d.bgType === 'video' && d.videoUrl;
        const videoSrc = isVideo ? sanitizeURL(d.videoUrl) : '';
        return `
          <div class="story-cover" style="${!isVideo && bgImg ? `background-image: url('${bgImg}');` : ''}">
            ${isVideo ? `
              <video class="story-cover-video" autoplay loop muted playsinline ${bgImg ? `poster="${bgImg}"` : ''}>
                <source src="${videoSrc}">
              </video>` : ''}
            <div class="story-cover-overlay${getCustomStyleClasses(d)}" style="background-color: rgba(0, 0, 0, ${opacity});">
              <h1 class="story-cover-title">${escapeHTML(d.title || 'Your Title Here')}</h1>
              ${d.tagline ? `<p class="story-cover-tagline">${renderInlineMarkdown(d.tagline)}</p>` : ''}
              <div class="story-cover-meta">
                ${d.byline ? `<span class="story-cover-byline">${escapeHTML(d.byline)}</span>` : ''}
                ${d.dateline ? `<span class="story-cover-dateline">${escapeHTML(d.dateline)}</span>` : ''}
              </div>
            </div>
          </div>`;
      }

      // 2. Heading
      case 'heading': {
        const tag = ['h1', 'h2', 'h3'].includes(d.level) ? d.level : 'h1';
        return `
          <div class="story-heading-container">
            <${tag} class="story-heading${getCustomStyleClasses(d)}">${renderInlineMarkdown(d.text || 'Section Heading')}</${tag}>
          </div>`;
      }

      // 3. Text
      case 'text': {
        return `
          <div class="story-text-container">
            <p class="story-text${getCustomStyleClasses(d)}">${renderInlineMarkdown(d.text || '')}</p>
          </div>`;
      }

      // 4. Wide Image
      case 'wideImage': {
        const imgUrl = sanitizeURL(d.imageUrl || '');
        return `
          <div class="story-wide-image">
            <figure>
              <img src="${imgUrl}" alt="${escapeHTML(d.altText || d.caption || 'Photo')}" loading="lazy" class="img-fluid" />
              ${d.caption ? `<figcaption class="story-caption">${renderInlineMarkdown(d.caption)}</figcaption>` : ''}
            </figure>
          </div>`;
      }

      // 5. Bleeding Image
      case 'bleedingImage': {
        const imgUrl = sanitizeURL(d.imageUrl || '');
        return `
          <div class="story-bleeding-image">
            <img src="${imgUrl}" alt="${escapeHTML(d.altText || d.caption || 'Full Bleed Photo')}" loading="lazy" />
            ${d.caption ? `<div class="story-caption">${renderInlineMarkdown(d.caption)}</div>` : ''}
          </div>`;
      }

      // 6. Pull Quote
      case 'quote': {
        return `
          <div class="story-quote-container">
            <blockquote class="story-pull-quote${getCustomStyleClasses(d)}"${getCustomStyleInline(d)}>
              <p class="story-quote-text">“${renderInlineMarkdown(d.quote || '')}”</p>
              ${d.author ? `<cite class="story-quote-cite">— ${escapeHTML(d.author)}</cite>` : ''}
            </blockquote>
          </div>`;
      }

      // 7. Web Embed
      case 'embed': {
        const embedUrl = sanitizeURL(d.url || '');
        return `
          <div class="story-embed-container">
            <div class="responsive-embed-frame">
              <iframe src="${embedUrl}" title="Embedded Media" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            ${d.caption ? `<div class="story-caption">${renderInlineMarkdown(d.caption)}</div>` : ''}
          </div>`;
      }

      // 8. Standalone Caption
      case 'caption': {
        return `
          <div class="story-standalone-caption">
            <p class="story-caption${getCustomStyleClasses(d)}"><em>${renderInlineMarkdown(d.text || '')}</em></p>
          </div>`;
      }

      // 9. Footer
      case 'footer': {
        return `
          <footer class="story-footer${getCustomStyleClasses(d)}"${getCustomStyleInline(d)}>
            <p>${renderInlineMarkdown(d.text || '')}</p>
          </footer>`;
      }

      // 10. Two-Column Image Grid
      case 'twoColumnImage': {
        const img1 = sanitizeURL(d.img1Url || '');
        const img2 = sanitizeURL(d.img2Url || '');
        return `
          <div class="story-two-col-container">
            <div class="story-two-col-grid">
              <div class="story-col-image">
                <figure>
                  <img src="${img1}" alt="${escapeHTML(d.img1Caption || 'Photo 1')}" loading="lazy" />
                  ${d.img1Caption ? `<figcaption class="story-caption">${escapeHTML(d.img1Caption)}</figcaption>` : ''}
                </figure>
              </div>
              <div class="story-col-image">
                <figure>
                  <img src="${img2}" alt="${escapeHTML(d.img2Caption || 'Photo 2')}" loading="lazy" />
                  ${d.img2Caption ? `<figcaption class="story-caption">${escapeHTML(d.img2Caption)}</figcaption>` : ''}
                </figure>
              </div>
            </div>
          </div>`;
      }

      // 11. Multi-Photo Gallery Grid
      case 'gallery': {
        const urls = (d.imagesText || '')
          .split('\n')
          .map(u => u.trim())
          .filter(Boolean);
        const cols = [2, 3, 4].includes(parseInt(d.columns, 10)) ? d.columns : '3';
        const items = urls.map(u => `
          <div class="gallery-item">
            <img src="${sanitizeURL(u)}" alt="Gallery image" loading="lazy" />
          </div>
        `).join('');

        return `
          <div class="story-gallery-container">
            <div class="story-gallery-grid cols-${cols}">
              ${items || '<p class="text-muted text-center p-3">No images added</p>'}
            </div>
            ${d.caption ? `<div class="story-caption mt-2">${escapeHTML(d.caption)}</div>` : ''}
          </div>`;
      }

      // 12. Split Media + Text (50/50 Layout)
      case 'splitMediaText': {
        const imgUrl = sanitizeURL(d.imageUrl || '');
        const posClass = d.imagePosition === 'right' ? 'media-right' : 'media-left';
        return `
          <div class="story-split-container">
            <div class="story-split-row ${posClass}">
              <div class="split-media">
                <img src="${imgUrl}" alt="${escapeHTML(d.title || 'Image')}" loading="lazy" />
                ${d.caption ? `<div class="story-caption">${escapeHTML(d.caption)}</div>` : ''}
              </div>
              <div class="split-content${getCustomStyleClasses(d)}">
                <h3>${escapeHTML(d.title || '')}</h3>
                <p>${renderInlineMarkdown(d.text || '')}</p>
              </div>
            </div>
          </div>`;
      }

      // 13. Big Stats / Key Metrics Highlight
      case 'stats': {
        const stats = [
          { num: d.stat1Num, label: d.stat1Label, sub: d.stat1Sub },
          { num: d.stat2Num, label: d.stat2Label, sub: d.stat2Sub },
          { num: d.stat3Num, label: d.stat3Label, sub: d.stat3Sub }
        ].filter(s => s.num || s.label);

        const rendered = stats.map(s => `
          <div class="stat-item">
            <div class="stat-number">${escapeHTML(s.num || '0')}</div>
            <div class="stat-label">${escapeHTML(s.label || '')}</div>
            ${s.sub ? `<div class="stat-sub">${escapeHTML(s.sub)}</div>` : ''}
          </div>
        `).join('');

        return `
          <div class="story-stats-container">
            <div class="story-stats-grid">
              ${rendered}
            </div>
          </div>`;
      }

      // 14. Timeline / Milestones
      case 'timeline': {
        const lines = (d.itemsText || '').split('\n').filter(Boolean);
        const entries = lines.map(line => {
          const parts = line.split('|').map(p => p.trim());
          const date = parts[0] || '';
          const title = parts[1] || '';
          const desc = parts[2] || '';
          return `
            <div class="timeline-entry">
              <div class="timeline-dot"></div>
              ${date ? `<div class="timeline-date">${escapeHTML(date)}</div>` : ''}
              ${title ? `<div class="timeline-title">${escapeHTML(title)}</div>` : ''}
              ${desc ? `<p class="timeline-desc">${renderInlineMarkdown(desc)}</p>` : ''}
            </div>`;
        }).join('');

        return `
          <div class="story-timeline-container">
            <div class="story-timeline">
              ${entries || '<p class="text-muted">No timeline items</p>'}
            </div>
          </div>`;
      }

      // 15. Callout / Aside Box
      case 'callout': {
        const type = d.type || 'note';
        const typeClass = ['info', 'note', 'tip', 'warning', 'minimal', 'accent', 'custom'].includes(type) ? `callout-${type}` : 'callout-note';
        const icons = {
          info: 'info-circle',
          note: 'bookmark',
          tip: 'lightbulb',
          warning: 'triangle-exclamation',
          minimal: 'quote-left',
          accent: 'star',
          custom: 'bookmark'
        };
        const icon = icons[type] || 'bookmark';
        let customStyle = '';
        if (type === 'custom' && (d.borderColor || d.bgColor)) {
          const s = [];
          if (d.borderColor) s.push(`border-color: ${d.borderColor};`);
          if (d.bgColor) s.push(`background-color: ${d.bgColor};`);
          customStyle = ` style="${s.join(' ')}"`;
        } else {
          customStyle = getCustomStyleInline(d);
        }
        return `
          <div class="story-callout-container">
            <aside class="story-callout ${typeClass}${getCustomStyleClasses(d)}"${customStyle}>
              ${d.title ? `<div class="callout-header"><i class="fas fa-${icon}"></i> ${escapeHTML(d.title)}</div>` : ''}
              <p class="callout-body">${renderInlineMarkdown(d.text || '')}</p>
            </aside>
          </div>`;
      }

      // 16. Audio / Field Recording Player
      case 'audioPlayer': {
        const audioUrl = sanitizeURL(d.audioUrl || '');
        return `
          <div class="story-audio-container">
            <div class="story-audio-card">
              <div class="audio-icon-box">
                <i class="fas fa-volume-high"></i>
              </div>
              <div class="audio-info">
                <div class="audio-title">${escapeHTML(d.title || 'Audio Recording')}</div>
                ${d.artist ? `<div class="audio-artist">${escapeHTML(d.artist)}</div>` : ''}
                <audio controls preload="none">
                  <source src="${audioUrl}">
                  Your browser does not support audio playback.
                </audio>
              </div>
            </div>
            ${d.caption ? `<div class="story-caption">${renderInlineMarkdown(d.caption)}</div>` : ''}
          </div>`;
      }

      // 17. Author Profile / Bio Card
      case 'authorBio': {
        const avatar = sanitizeURL(d.avatarUrl || '');
        return `
          <div class="story-author-container">
            <div class="story-author-card">
              ${avatar ? `<img src="${avatar}" alt="${escapeHTML(d.name || 'Author')}" class="author-avatar" />` : ''}
              <div class="author-info">
                <h4 class="author-name">${escapeHTML(d.name || 'Author Name')}</h4>
                ${d.role ? `<div class="author-role">${escapeHTML(d.role)}</div>` : ''}
                ${d.bio ? `<p class="author-bio">${renderInlineMarkdown(d.bio)}</p>` : ''}
                <div class="author-socials">
                  ${d.websiteUrl ? `<a href="${sanitizeURL(d.websiteUrl)}" target="_blank" rel="noopener" class="author-social-link" title="Website"><i class="fas fa-globe"></i></a>` : ''}
                  ${d.githubUrl ? `<a href="${sanitizeURL(d.githubUrl)}" target="_blank" rel="noopener" class="author-social-link" title="GitHub"><i class="fab fa-github"></i></a>` : ''}
                  ${d.twitterUrl ? `<a href="${sanitizeURL(d.twitterUrl)}" target="_blank" rel="noopener" class="author-social-link" title="Twitter / X"><i class="fab fa-x-twitter"></i></a>` : ''}
                  ${d.email ? `<a href="mailto:${escapeHTML(d.email)}" class="author-social-link" title="Email"><i class="fas fa-envelope"></i></a>` : ''}
                </div>
              </div>
            </div>
          </div>`;
      }

      // 18. Call-to-Action (CTA) Banner
      case 'ctaBanner': {
        const btnUrl = sanitizeURL(d.buttonUrl || '#');
        return `
          <div class="story-cta-container">
            <div class="story-cta-box${getCustomStyleClasses(d)}"${getCustomStyleInline(d)}>
              <h3 class="cta-heading">${escapeHTML(d.heading || 'Take the Next Step')}</h3>
              ${d.subtext ? `<p class="cta-subtext">${renderInlineMarkdown(d.subtext)}</p>` : ''}
              <a href="${btnUrl}" target="_blank" rel="noopener" class="btn-cta">
                ${escapeHTML(d.buttonText || 'Learn More')} <i class="fas fa-arrow-right ms-1"></i>
              </a>
            </div>
          </div>`;
      }

      // 19. Skills / Tools Pills
      case 'skillsPills': {
        const pills = (d.tags || '')
          .split(',')
          .map(t => t.trim())
          .filter(Boolean);
        const rendered = pills.map(p => `<span class="skill-badge">${escapeHTML(p)}</span>`).join('');
        return `
          <div class="story-skills-container">
            ${d.title ? `<div class="skills-heading">${escapeHTML(d.title)}</div>` : ''}
            <div class="skills-wrapper">
              ${rendered || '<span class="text-muted">No tags added</span>'}
            </div>
          </div>`;
      }

      // 20. Section Divider & Spacer
      case 'divider': {
        const spacing = ['sm', 'md', 'lg'].includes(d.spacing) ? d.spacing : 'md';
        let inner = '<hr class="divider-line" />';
        if (d.style === 'asterisks') {
          inner = '<span class="divider-asterisks">* * *</span>';
        } else if (d.style === 'dots') {
          inner = '<span class="divider-dots">• • •</span>';
        } else if (d.style === 'space') {
          inner = '';
        }
        return `
          <div class="story-divider-container spacing-${spacing}">
            ${inner}
          </div>`;
      }

      // 21. Story Topbar / Navigation Header
      case 'navbar': {
        const linksHtml = (d.linksText || '')
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => {
            const parts = line.split('|').map(s => s.trim());
            const label = parts[0] || '';
            const url = parts[1] || '#';
            return `<a href="${sanitizeURL(url)}" class="story-nav-link">${escapeHTML(label)}</a>`;
          })
          .join('');

        const logo = d.logoUrl ? `<img src="${sanitizeURL(d.logoUrl)}" alt="Logo" class="story-nav-logo" />` : '';
        const cta = d.ctaText ? `<a href="${sanitizeURL(d.ctaUrl || '#')}" class="btn btn-sm btn-primary story-nav-cta">${escapeHTML(d.ctaText)}</a>` : '';
        const stickyClass = d.sticky !== false ? 'is-sticky' : '';
        const styleClass = `style-${d.style || 'glass'}`;

        return `
          <div class="story-navbar-container ${stickyClass} ${styleClass}${getCustomStyleClasses(d)}"${getCustomStyleInline(d)}>
            <nav class="story-navbar">
              <div class="story-nav-brand">
                ${logo}
                <div class="story-nav-brand-text">
                  <a href="${sanitizeURL(d.brandUrl || '#')}" class="story-nav-brand-name">${escapeHTML(d.brandName || state.title || 'Story')}</a>
                  ${d.brandSubtitle ? `<span class="story-nav-brand-sub">${escapeHTML(d.brandSubtitle)}</span>` : ''}
                </div>
              </div>
              <div class="story-nav-links d-none d-md-flex align-items-center gap-4">
                ${linksHtml}
              </div>
              <div class="story-nav-action d-flex align-items-center gap-2">
                ${cta}
              </div>
              ${linksHtml ? `<div class="story-nav-links-mobile d-flex d-md-none">${linksHtml}</div>` : ''}
            </nav>
          </div>`;
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
      updateReadingStats();
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

    updateReadingStats();
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
  let customTypographyModalInstance = null;
  let storySettingsModalInstance = null;

  function initModal() {
    const modalEl = document.getElementById('blockEditModal');
    if (modalEl && window.bootstrap) {
      blockModalInstance = new bootstrap.Modal(modalEl);
    }
    const customTypeModalEl = document.getElementById('customTypographyModal');
    if (customTypeModalEl && window.bootstrap) {
      customTypographyModalInstance = new bootstrap.Modal(customTypeModalEl);
    }
    const storyModalEl = document.getElementById('storySettingsModal');
    if (storyModalEl && window.bootstrap) {
      storySettingsModalInstance = new bootstrap.Modal(storyModalEl);
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
      if (defaultType === 'navbar') {
        block.data = {
          brandName: state.author || state.title || 'Alex Bennett',
          brandSubtitle: 'Visual Portfolio',
          brandUrl: '#',
          linksText: 'Story | #blk_1\nHighlights | #blk_4\nField Notes | #blk_6\nContact | #blk_14',
          ctaText: 'Get in Touch',
          ctaUrl: 'mailto:contact@example.com',
          sticky: true,
          style: 'glass'
        };
      }
    } else {
      block = state.blocks.find(b => b.id === blockId);
    }

    if (!block) return;

    const modalTitle = document.getElementById('blockModalTitle');
    const modalBody = document.getElementById('blockModalBody');
    const saveBtn = document.getElementById('btnSaveBlock');

    modalTitle.textContent = (isNew ? 'Add ' : 'Edit ') + formatTypeName(block.type);
    modalBody.innerHTML = generateFormFields(block);

    // Wire Markdown & Hyperlink Formatting Toolbar Buttons
    modalBody.querySelectorAll('.btn-format').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const toolbar = btn.closest('.text-format-toolbar');
        if (!toolbar) return;
        const targetId = toolbar.dataset.target;
        const textarea = document.getElementById(targetId);
        if (!textarea) return;

        const action = btn.dataset.action;
        const start = textarea.selectionStart != null ? textarea.selectionStart : textarea.value.length;
        const end = textarea.selectionEnd != null ? textarea.selectionEnd : textarea.value.length;
        const selectedText = textarea.value.substring(start, end);
        let replacement = '';

        if (action === 'bold') {
          replacement = `**${selectedText || 'bold text'}**`;
        } else if (action === 'italic') {
          replacement = `*${selectedText || 'italic text'}*`;
        } else if (action === 'code') {
          replacement = `\`${selectedText || 'code'}\``;
        } else if (action === 'link') {
          const initialText = selectedText || 'link text';
          const enteredUrl = prompt('Enter destination URL (e.g. https://example.com):', 'https://');
          if (enteredUrl === null) return;
          const cleanUrl = enteredUrl.trim() || 'https://';
          replacement = `[${initialText}](${cleanUrl})`;
        }

        textarea.setRangeText(replacement, start, end, 'end');
        textarea.focus();
        textarea.dispatchEvent(new Event('input'));
      });
    });

    saveBtn.onclick = () => {
      const updatedData = extractFormData(block.type);
      saveState();
      block.data = updatedData;
      if (isNew) {
        if (block.type === 'navbar') {
          state.blocks.unshift(block);
        } else {
          state.blocks.push(block);
        }
      }
      renderCanvas();
      blockModalInstance.hide();
      showToast(isNew ? 'Block added!' : 'Block updated!');
    };

    blockModalInstance.show();
  }

  function generateTextFormatToolbar(targetFieldId, labelText = 'Content Text') {
    return `
      <div class="d-flex justify-content-between align-items-center mb-1">
        <label class="form-label mb-0" for="${targetFieldId}">${escapeHTML(labelText)}</label>
        <div class="btn-group btn-group-sm text-format-toolbar" data-target="${targetFieldId}">
          <button type="button" class="btn btn-outline-secondary py-0 px-2 btn-format" data-action="bold" title="Bold (**text**)"><i class="fas fa-bold fa-xs"></i></button>
          <button type="button" class="btn btn-outline-secondary py-0 px-2 btn-format" data-action="italic" title="Italic (*text*)"><i class="fas fa-italic fa-xs"></i></button>
          <button type="button" class="btn btn-outline-secondary py-0 px-2 btn-format" data-action="link" title="Hyperlink [text](url)"><i class="fas fa-link fa-xs"></i> Link</button>
          <button type="button" class="btn btn-outline-secondary py-0 px-2 btn-format" data-action="code" title="Code (\`text\`)"><i class="fas fa-code fa-xs"></i></button>
        </div>
      </div>`;
  }

  function formatTypeName(type) {
    const names = {
      cover: 'Cover / Hero Banner',
      heading: 'Section Heading',
      text: 'Paragraph Text',
      wideImage: 'Wide Image',
      bleedingImage: 'Bleeding Full-Bleed Image',
      twoColumnImage: 'Two-Column Image Grid',
      gallery: 'Multi-Photo Gallery Grid',
      splitMediaText: 'Split Media + Text (50/50)',
      stats: 'Big Stats & Key Metrics',
      timeline: 'Timeline & Milestones',
      callout: 'Callout / Aside Box',
      quote: 'Pull Quote',
      embed: 'Web Embed (YouTube / iframe)',
      audioPlayer: 'Audio / Field Recording',
      authorBio: 'Author Profile / Bio Card',
      ctaBanner: 'Call-to-Action (CTA) Banner',
      skillsPills: 'Skills / Tech Stack Pills',
      divider: 'Section Divider & Spacer',
      caption: 'Standalone Caption',
      footer: 'Story Footer',
      navbar: 'Story Topbar / Navigation Header'
    };
    return names[type] || 'Story Block';
  }

  function generateCustomStyleToggle(d) {
    const hasCustom = !!d.enableCustomStyle;
    return `
      <div class="mt-3 pt-3 border-top">
        <div class="form-check form-switch mb-2">
          <input class="form-check-input" type="checkbox" id="field_enableCustomStyle" ${hasCustom ? 'checked' : ''} onchange="document.getElementById('customStylePanel').classList.toggle('d-none', !this.checked)">
          <label class="form-check-label fw-semibold text-secondary" for="field_enableCustomStyle">
            <i class="fas fa-sliders me-1"></i> Customize Typography & Styling
          </label>
        </div>
        <div id="customStylePanel" class="${hasCustom ? '' : 'd-none'} p-3 bg-light rounded border">
          <div class="row g-2">
            <div class="col-md-4">
              <label class="form-label small">Size Scale</label>
              <select class="form-select form-select-sm" id="field_customSize">
                <option value="default" ${d.customSize === 'default' || !d.customSize ? 'selected' : ''}>Default</option>
                <option value="sm" ${d.customSize === 'sm' ? 'selected' : ''}>Small / Compact</option>
                <option value="lg" ${d.customSize === 'lg' ? 'selected' : ''}>Large / Lead</option>
                <option value="xl" ${d.customSize === 'xl' ? 'selected' : ''}>Extra Large / Display</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label small">Font Role</label>
              <select class="form-select form-select-sm" id="field_customFontRole">
                <option value="default" ${d.customFontRole === 'default' || !d.customFontRole ? 'selected' : ''}>Theme Default</option>
                <option value="heading" ${d.customFontRole === 'heading' ? 'selected' : ''}>Heading Font</option>
                <option value="body" ${d.customFontRole === 'body' ? 'selected' : ''}>Body Font</option>
                <option value="mono" ${d.customFontRole === 'mono' ? 'selected' : ''}>Monospace Accent</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label small">Alignment</label>
              <select class="form-select form-select-sm" id="field_customAlign">
                <option value="default" ${d.customAlign === 'default' || !d.customAlign ? 'selected' : ''}>Default</option>
                <option value="left" ${d.customAlign === 'left' ? 'selected' : ''}>Left</option>
                <option value="center" ${d.customAlign === 'center' ? 'selected' : ''}>Center</option>
                <option value="right" ${d.customAlign === 'right' ? 'selected' : ''}>Right</option>
              </select>
            </div>
          </div>
          <div class="row g-2 mt-2 pt-2 border-top">
            <div class="col-md-6">
              <label class="form-label small" for="field_customAccent">Custom Accent / Border Color</label>
              <div class="d-flex align-items-center gap-2">
                <input type="color" class="form-control form-control-color form-control-sm p-0 border-0" id="field_customAccent" value="${d.customAccent || '#2563eb'}" style="width: 28px; height: 28px; cursor: pointer;">
                <div class="form-check mb-0">
                  <input class="form-check-input" type="checkbox" id="field_applyCustomAccent" ${d.applyCustomAccent ? 'checked' : ''}>
                  <label class="form-check-label small" for="field_applyCustomAccent">Enable Custom Accent</label>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label small" for="field_customBg">Custom Surface / Background</label>
              <div class="d-flex align-items-center gap-2">
                <input type="color" class="form-control form-control-color form-control-sm p-0 border-0" id="field_customBg" value="${d.customBg || '#f8fafc'}" style="width: 28px; height: 28px; cursor: pointer;">
                <div class="form-check mb-0">
                  <input class="form-check-input" type="checkbox" id="field_applyCustomBg" ${d.applyCustomBg ? 'checked' : ''}>
                  <label class="form-check-label small" for="field_applyCustomBg">Enable Custom Background</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function getBaseFormFields(block) {
    const d = block.data || {};
    switch (block.type) {
      case 'cover': {
        const isVid = d.bgType === 'video';
        return `
          <div class="row mb-3">
            <div class="col-md-5">
              <label class="form-label fw-semibold">Hero Background Type</label>
              <select class="form-select" id="field_bgType" onchange="const row = document.getElementById('coverVideoUrlRow'); if (row) row.classList.toggle('d-none', this.value !== 'video');">
                <option value="image" ${!isVid ? 'selected' : ''}>Photo / Image</option>
                <option value="video" ${isVid ? 'selected' : ''}>Looping Video (MP4 / WebM)</option>
              </select>
            </div>
            <div class="col-md-7">
              <label class="form-label fw-semibold">Cover Image URL (or Video Poster Fallback)</label>
              <input type="url" class="form-control" id="field_imageUrl" value="${escapeHTML(d.imageUrl || '')}" placeholder="https://images.unsplash.com/..." required>
            </div>
          </div>
          <div id="coverVideoUrlRow" class="mb-3 ${isVid ? '' : 'd-none'} p-2 bg-light rounded border">
            <label class="form-label small fw-semibold">Direct Video File URL (.mp4 / .webm)</label>
            <input type="url" class="form-control form-control-sm" id="field_videoUrl" value="${escapeHTML(d.videoUrl || '')}" placeholder="https://example.com/ambient-loop.mp4">
            <div class="form-text">Ambient background video plays automatically, muted, and loops infinitely.</div>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Story Headline / Title</label>
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
      }

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
            ${generateTextFormatToolbar('field_text', 'Story Text (Multiple paragraphs & markdown supported)')}
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

      case 'twoColumnImage':
        return `
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Left Image URL</label>
              <input type="url" class="form-control" id="field_img1Url" value="${escapeHTML(d.img1Url || '')}" placeholder="https://..." required>
              <label class="form-label mt-2">Left Image Caption</label>
              <input type="text" class="form-control" id="field_img1Caption" value="${escapeHTML(d.img1Caption || '')}" placeholder="Caption for left photo">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Right Image URL</label>
              <input type="url" class="form-control" id="field_img2Url" value="${escapeHTML(d.img2Url || '')}" placeholder="https://..." required>
              <label class="form-label mt-2">Right Image Caption</label>
              <input type="text" class="form-control" id="field_img2Caption" value="${escapeHTML(d.img2Caption || '')}" placeholder="Caption for right photo">
            </div>
          </div>`;

      case 'gallery':
        return `
          <div class="mb-3">
            <label class="form-label">Image URLs (one URL per line)</label>
            <textarea class="form-control" id="field_imagesText" rows="6" placeholder="https://images.unsplash.com/photo-1...\nhttps://images.unsplash.com/photo-2...">${escapeHTML(d.imagesText || '')}</textarea>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Columns</label>
              <select class="form-select" id="field_columns">
                <option value="2" ${d.columns === '2' ? 'selected' : ''}>2 Columns</option>
                <option value="3" ${d.columns === '3' || !d.columns ? 'selected' : ''}>3 Columns</option>
                <option value="4" ${d.columns === '4' ? 'selected' : ''}>4 Columns</option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Overall Gallery Caption</label>
              <input type="text" class="form-control" id="field_caption" value="${escapeHTML(d.caption || '')}" placeholder="Optional gallery notes">
            </div>
          </div>`;

      case 'splitMediaText':
        return `
          <div class="mb-3">
            <label class="form-label">Image URL</label>
            <input type="url" class="form-control" id="field_imageUrl" value="${escapeHTML(d.imageUrl || '')}" placeholder="https://..." required>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Image Placement</label>
              <select class="form-select" id="field_imagePosition">
                <option value="left" ${d.imagePosition === 'left' || !d.imagePosition ? 'selected' : ''}>Image Left, Text Right</option>
                <option value="right" ${d.imagePosition === 'right' ? 'selected' : ''}>Image Right, Text Left</option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Image Caption</label>
              <input type="text" class="form-control" id="field_caption" value="${escapeHTML(d.caption || '')}" placeholder="Optional photo caption">
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Section Title</label>
            <input type="text" class="form-control" id="field_title" value="${escapeHTML(d.title || '')}" placeholder="Title of this feature">
          </div>
          <div class="mb-3">
            ${generateTextFormatToolbar('field_text', 'Narrative Text')}
            <textarea class="form-control" id="field_text" rows="5" placeholder="Narrative text describing the image...">${escapeHTML(d.text || '')}</textarea>
          </div>`;

      case 'stats':
        return `
          <div class="row mb-3 pb-2 border-bottom">
            <div class="col-md-4"><label class="form-label">Metric 1 (Number)</label><input type="text" class="form-control" id="field_stat1Num" value="${escapeHTML(d.stat1Num || '')}" placeholder="14+"></div>
            <div class="col-md-4"><label class="form-label">Label</label><input type="text" class="form-control" id="field_stat1Label" value="${escapeHTML(d.stat1Label || '')}" placeholder="Countries Explored"></div>
            <div class="col-md-4"><label class="form-label">Subtitle (Optional)</label><input type="text" class="form-control" id="field_stat1Sub" value="${escapeHTML(d.stat1Sub || '')}" placeholder="Over 6 months"></div>
          </div>
          <div class="row mb-3 pb-2 border-bottom">
            <div class="col-md-4"><label class="form-label">Metric 2 (Number)</label><input type="text" class="form-control" id="field_stat2Num" value="${escapeHTML(d.stat2Num || '')}" placeholder="250k"></div>
            <div class="col-md-4"><label class="form-label">Label</label><input type="text" class="form-control" id="field_stat2Label" value="${escapeHTML(d.stat2Label || '')}" placeholder="Total Readers"></div>
            <div class="col-md-4"><label class="form-label">Subtitle (Optional)</label><input type="text" class="form-control" id="field_stat2Sub" value="${escapeHTML(d.stat2Sub || '')}" placeholder="Global audience"></div>
          </div>
          <div class="row">
            <div class="col-md-4"><label class="form-label">Metric 3 (Number)</label><input type="text" class="form-control" id="field_stat3Num" value="${escapeHTML(d.stat3Num || '')}" placeholder="100%"></div>
            <div class="col-md-4"><label class="form-label">Label</label><input type="text" class="form-control" id="field_stat3Label" value="${escapeHTML(d.stat3Label || '')}" placeholder="Organic Coverage"></div>
            <div class="col-md-4"><label class="form-label">Subtitle (Optional)</label><input type="text" class="form-control" id="field_stat3Sub" value="${escapeHTML(d.stat3Sub || '')}" placeholder="Zero sponsors"></div>
          </div>`;

      case 'timeline':
        return `
          <div class="mb-3">
            <label class="form-label">Timeline Items (One item per line: <code>Date | Title | Description</code>)</label>
            <textarea class="form-control" id="field_itemsText" rows="6" placeholder="2022 | Expedition Begins | Started preparation and planning.\n2024 | First Publication | Photo book published.">${escapeHTML(d.itemsText || '')}</textarea>
            <div class="form-text">Separate the 3 parts with a vertical bar <code>|</code></div>
          </div>`;

      case 'callout': {
        const isCustom = d.type === 'custom';
        return `
          <div class="row mb-3">
            <div class="col-md-5">
              <label class="form-label fw-semibold">Callout Color Theme</label>
              <select class="form-select" id="field_type" onchange="const row = document.getElementById('calloutCustomColorRow'); if (row) row.classList.toggle('d-none', this.value !== 'custom');">
                <option value="note" ${d.type === 'note' || !d.type ? 'selected' : ''}>Note (Editorial Purple)</option>
                <option value="info" ${d.type === 'info' ? 'selected' : ''}>Info (Calm Blue)</option>
                <option value="tip" ${d.type === 'tip' ? 'selected' : ''}>Tip / Success (Emerald Green)</option>
                <option value="warning" ${d.type === 'warning' ? 'selected' : ''}>Warning / Notice (Amber)</option>
                <option value="minimal" ${d.type === 'minimal' ? 'selected' : ''}>Minimal Slate (Neutral Gray)</option>
                <option value="accent" ${d.type === 'accent' ? 'selected' : ''}>Story Theme Accent (Dynamic)</option>
                <option value="custom" ${isCustom ? 'selected' : ''}>Custom Colors...</option>
              </select>
            </div>
            <div class="col-md-7">
              <label class="form-label fw-semibold">Box Title</label>
              <input type="text" class="form-control" id="field_title" value="${escapeHTML(d.title || '')}" placeholder="Behind the Scenes...">
            </div>
          </div>
          <!-- Custom Color Controls for Callout -->
          <div id="calloutCustomColorRow" class="${isCustom ? '' : 'd-none'} p-3 mb-3 bg-light rounded border">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label small fw-semibold" for="field_calloutBorderColor">Border / Left Accent Color</label>
                <div class="d-flex align-items-center gap-2">
                  <input type="color" class="form-control form-control-color form-control-sm p-0 border-0" id="field_calloutBorderColor" value="${d.borderColor || '#3b82f6'}" style="width: 32px; height: 32px; cursor: pointer;" oninput="const h = document.getElementById('calloutBorderHex'); if(h) h.textContent = this.value">
                  <span class="small font-monospace text-muted" id="calloutBorderHex">${d.borderColor || '#3b82f6'}</span>
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-semibold" for="field_calloutBgColor">Background Surface Tint</label>
                <div class="d-flex align-items-center gap-2">
                  <input type="color" class="form-control form-control-color form-control-sm p-0 border-0" id="field_calloutBgColor" value="${d.bgColor || '#eff6ff'}" style="width: 32px; height: 32px; cursor: pointer;" oninput="const h = document.getElementById('calloutBgHex'); if(h) h.textContent = this.value">
                  <span class="small font-monospace text-muted" id="calloutBgHex">${d.bgColor || '#eff6ff'}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="mb-3">
            ${generateTextFormatToolbar('field_text', 'Callout Content Text')}
            <textarea class="form-control" id="field_text" rows="4" placeholder="Highlighted note or methodology details...">${escapeHTML(d.text || '')}</textarea>
          </div>`;
      }

      case 'audioPlayer':
        return `
          <div class="mb-3">
            <label class="form-label">Audio File URL (.mp3 / .wav / .ogg)</label>
            <input type="url" class="form-control" id="field_audioUrl" value="${escapeHTML(d.audioUrl || '')}" placeholder="https://example.com/soundscape.mp3" required>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Track / Field Recording Title</label>
              <input type="text" class="form-control" id="field_title" value="${escapeHTML(d.title || '')}" placeholder="Fjord Dawn Ambiance">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Artist / Narrator</label>
              <input type="text" class="form-control" id="field_artist" value="${escapeHTML(d.artist || '')}" placeholder="Recorded on location by Alex">
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Optional Caption</label>
            <input type="text" class="form-control" id="field_caption" value="${escapeHTML(d.caption || '')}" placeholder="Recorded with binaural microphones.">
          </div>`;

      case 'authorBio':
        return `
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Author Name</label>
              <input type="text" class="form-control" id="field_name" value="${escapeHTML(d.name || '')}" placeholder="Alex Bennett" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Role / Byline Title</label>
              <input type="text" class="form-control" id="field_role" value="${escapeHTML(d.role || '')}" placeholder="Documentary Photographer">
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Avatar Image URL</label>
            <input type="url" class="form-control" id="field_avatarUrl" value="${escapeHTML(d.avatarUrl || '')}" placeholder="https://...">
          </div>
          <div class="mb-3">
            ${generateTextFormatToolbar('field_bio', 'Biography / Background')}
            <textarea class="form-control" id="field_bio" rows="3" placeholder="Brief author or creator summary...">${escapeHTML(d.bio || '')}</textarea>
          </div>
          <div class="row">
            <div class="col-md-3 mb-3"><label class="form-label">Website</label><input type="url" class="form-control" id="field_websiteUrl" value="${escapeHTML(d.websiteUrl || '')}" placeholder="https://..."></div>
            <div class="col-md-3 mb-3"><label class="form-label">GitHub</label><input type="url" class="form-control" id="field_githubUrl" value="${escapeHTML(d.githubUrl || '')}" placeholder="https://github.com/..."></div>
            <div class="col-md-3 mb-3"><label class="form-label">Twitter / X</label><input type="url" class="form-control" id="field_twitterUrl" value="${escapeHTML(d.twitterUrl || '')}" placeholder="https://x.com/..."></div>
            <div class="col-md-3 mb-3"><label class="form-label">Email</label><input type="email" class="form-control" id="field_email" value="${escapeHTML(d.email || '')}" placeholder="alex@..."></div>
          </div>`;

      case 'ctaBanner':
        return `
          <div class="mb-3">
            <label class="form-label">Banner Headline</label>
            <input type="text" class="form-control" id="field_heading" value="${escapeHTML(d.heading || '')}" placeholder="Ready to collaborate?" required>
          </div>
          <div class="mb-3">
            ${generateTextFormatToolbar('field_subtext', 'Descriptive Subtext')}
            <textarea class="form-control" id="field_subtext" rows="2" placeholder="Available for assignments, exhibitions, and commissions.">${escapeHTML(d.subtext || '')}</textarea>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Button Text</label>
              <input type="text" class="form-control" id="field_buttonText" value="${escapeHTML(d.buttonText || '')}" placeholder="Get in Touch">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Button Destination URL</label>
              <input type="text" class="form-control" id="field_buttonUrl" value="${escapeHTML(d.buttonUrl || '')}" placeholder="mailto:you@example.com or https://...">
            </div>
          </div>`;

      case 'skillsPills':
        return `
          <div class="mb-3">
            <label class="form-label">Section Title</label>
            <input type="text" class="form-control" id="field_title" value="${escapeHTML(d.title || '')}" placeholder="Equipment & Technical Stack">
          </div>
          <div class="mb-3">
            <label class="form-label">Tags / Skills (Comma-separated)</label>
            <textarea class="form-control" id="field_tags" rows="3" placeholder="Leica M10, 35mm Film, Drone Cinematography, Lightroom, GPS Mapping">${escapeHTML(d.tags || '')}</textarea>
          </div>`;

      case 'divider':
        return `
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Divider Style</label>
              <select class="form-select" id="field_style">
                <option value="line" ${d.style === 'line' || !d.style ? 'selected' : ''}>Hairline Rule (—)</option>
                <option value="asterisks" ${d.style === 'asterisks' ? 'selected' : ''}>Editorial Asterisks (* * *)</option>
                <option value="dots" ${d.style === 'dots' ? 'selected' : ''}>Subtle Dots (• • •)</option>
                <option value="space" ${d.style === 'space' ? 'selected' : ''}>Pure Whitespace Spacer</option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Vertical Spacing</label>
              <select class="form-select" id="field_spacing">
                <option value="sm" ${d.spacing === 'sm' ? 'selected' : ''}>Small (1.5rem)</option>
                <option value="md" ${d.spacing === 'md' || !d.spacing ? 'selected' : ''}>Medium (2.75rem)</option>
                <option value="lg" ${d.spacing === 'lg' ? 'selected' : ''}>Large (4.5rem)</option>
              </select>
            </div>
          </div>`;

      case 'quote':
        return `
          <div class="mb-3">
            ${generateTextFormatToolbar('field_quote', 'Quote Content')}
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
            ${generateTextFormatToolbar('field_text', 'Caption Text')}
            <textarea class="form-control" id="field_text" rows="3" placeholder="Standalone note or italic caption">${escapeHTML(d.text || '')}</textarea>
          </div>`;

      case 'footer':
        return `
          <div class="mb-3">
            ${generateTextFormatToolbar('field_text', 'Footer Content')}
            <textarea class="form-control" id="field_text" rows="3" placeholder="Copyright or closing statement...">${escapeHTML(d.text || '')}</textarea>
          </div>`;

      case 'navbar':
        return `
          <div class="row mb-3">
            <div class="col-md-7">
              <label class="form-label fw-semibold">Brand / Site Title</label>
              <input type="text" class="form-control" id="field_brandName" value="${escapeHTML(d.brandName || state.title || 'Alex Bennett')}" placeholder="e.g. Alex Bennett">
            </div>
            <div class="col-md-5">
              <label class="form-label fw-semibold">Brand Subtitle / Tag</label>
              <input type="text" class="form-control" id="field_brandSubtitle" value="${escapeHTML(d.brandSubtitle || 'Visual Portfolio')}" placeholder="e.g. Visual Storyteller">
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-md-6">
              <label class="form-label">Brand Link / Home URL</label>
              <input type="text" class="form-control" id="field_brandUrl" value="${escapeHTML(d.brandUrl || '#')}" placeholder="https://... or #">
            </div>
            <div class="col-md-6">
              <label class="form-label">Logo Image URL (Optional)</label>
              <input type="url" class="form-control" id="field_logoUrl" value="${escapeHTML(d.logoUrl || '')}" placeholder="https://example.com/logo.png">
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Navigation Links (One link per line: <code>Label | #anchor or URL</code>)</label>
            <textarea class="form-control font-monospace" id="field_linksText" rows="4" placeholder="Overview | #blk_1\nField Notes | #blk_6\nEquipment | #blk_11\nContact | #blk_14">${escapeHTML(d.linksText != null ? d.linksText : 'Story | #blk_1\nField Notes | #blk_6\nEquipment | #blk_11\nContact | #blk_14')}</textarea>
            <div class="form-text">Tip: Use <code>#block_id</code> to jump smoothly to any story block, or enter full web URLs.</div>
          </div>
          <div class="row mb-3">
            <div class="col-md-6">
              <label class="form-label">Action Button Label (Optional)</label>
              <input type="text" class="form-control" id="field_ctaText" value="${escapeHTML(d.ctaText || 'Get in Touch')}" placeholder="e.g. Get in Touch, View Resume">
            </div>
            <div class="col-md-6">
              <label class="form-label">Action Button Link / URL</label>
              <input type="text" class="form-control" id="field_ctaUrl" value="${escapeHTML(d.ctaUrl || 'mailto:contact@example.com')}" placeholder="mailto:... or https://...">
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Navbar Style</label>
              <select class="form-select" id="field_style">
                <option value="glass" ${d.style === 'glass' || !d.style ? 'selected' : ''}>Frosted Glass (Modern Blur)</option>
                <option value="clean" ${d.style === 'clean' ? 'selected' : ''}>Solid Clean Surface</option>
                <option value="transparent" ${d.style === 'transparent' ? 'selected' : ''}>Transparent Overlay</option>
              </select>
            </div>
            <div class="col-md-6 d-flex align-items-end">
              <div class="form-check form-switch mb-2">
                <input class="form-check-input" type="checkbox" id="field_sticky" ${d.sticky !== false ? 'checked' : ''}>
                <label class="form-check-label fw-semibold" for="field_sticky">Sticky Navbar (Fixed to top on scroll)</label>
              </div>
            </div>
          </div>`;

      default:
        return `<p>No settings available for this block.</p>`;
    }
  }

  function generateFormFields(block) {
    const d = block.data || {};
    let fields = getBaseFormFields(block);
    if (['cover', 'heading', 'text', 'quote', 'callout', 'caption', 'footer', 'splitMediaText', 'ctaBanner', 'navbar'].includes(block.type)) {
      fields += generateCustomStyleToggle(d);
    }
    return fields;
  }

  function extractFormData(type) {
    const data = {};
    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    switch (type) {
      case 'cover':
        data.bgType = getVal('field_bgType') || 'image';
        data.videoUrl = getVal('field_videoUrl');
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
      case 'twoColumnImage':
        data.img1Url = getVal('field_img1Url');
        data.img1Caption = getVal('field_img1Caption');
        data.img2Url = getVal('field_img2Url');
        data.img2Caption = getVal('field_img2Caption');
        break;
      case 'gallery':
        data.imagesText = getVal('field_imagesText');
        data.columns = getVal('field_columns');
        data.caption = getVal('field_caption');
        break;
      case 'splitMediaText':
        data.imageUrl = getVal('field_imageUrl');
        data.imagePosition = getVal('field_imagePosition');
        data.title = getVal('field_title');
        data.text = getVal('field_text');
        data.caption = getVal('field_caption');
        break;
      case 'stats':
        data.stat1Num = getVal('field_stat1Num');
        data.stat1Label = getVal('field_stat1Label');
        data.stat1Sub = getVal('field_stat1Sub');
        data.stat2Num = getVal('field_stat2Num');
        data.stat2Label = getVal('field_stat2Label');
        data.stat2Sub = getVal('field_stat2Sub');
        data.stat3Num = getVal('field_stat3Num');
        data.stat3Label = getVal('field_stat3Label');
        data.stat3Sub = getVal('field_stat3Sub');
        break;
      case 'timeline':
        data.itemsText = getVal('field_itemsText');
        break;
      case 'callout':
        data.type = getVal('field_type') || 'note';
        data.title = getVal('field_title');
        data.text = getVal('field_text');
        data.borderColor = getVal('field_calloutBorderColor');
        data.bgColor = getVal('field_calloutBgColor');
        break;
      case 'audioPlayer':
        data.audioUrl = getVal('field_audioUrl');
        data.title = getVal('field_title');
        data.artist = getVal('field_artist');
        data.caption = getVal('field_caption');
        break;
      case 'authorBio':
        data.avatarUrl = getVal('field_avatarUrl');
        data.name = getVal('field_name');
        data.role = getVal('field_role');
        data.bio = getVal('field_bio');
        data.websiteUrl = getVal('field_websiteUrl');
        data.githubUrl = getVal('field_githubUrl');
        data.twitterUrl = getVal('field_twitterUrl');
        data.email = getVal('field_email');
        break;
      case 'ctaBanner':
        data.heading = getVal('field_heading');
        data.subtext = getVal('field_subtext');
        data.buttonText = getVal('field_buttonText');
        data.buttonUrl = getVal('field_buttonUrl');
        break;
      case 'skillsPills':
        data.title = getVal('field_title');
        data.tags = getVal('field_tags');
        break;
      case 'divider':
        data.style = getVal('field_style');
        data.spacing = getVal('field_spacing');
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
      case 'navbar':
        data.brandName = getVal('field_brandName');
        data.brandSubtitle = getVal('field_brandSubtitle');
        data.brandUrl = getVal('field_brandUrl');
        data.logoUrl = getVal('field_logoUrl');
        data.linksText = getVal('field_linksText');
        data.ctaText = getVal('field_ctaText');
        data.ctaUrl = getVal('field_ctaUrl');
        data.style = getVal('field_style') || 'glass';
        data.sticky = document.getElementById('field_sticky')?.checked ?? true;
        break;
    }

    const enableCustomStyle = document.getElementById('field_enableCustomStyle')?.checked || false;
    data.enableCustomStyle = enableCustomStyle;
    if (enableCustomStyle) {
      data.customSize = getVal('field_customSize') || 'default';
      data.customFontRole = getVal('field_customFontRole') || 'default';
      data.customAlign = getVal('field_customAlign') || 'default';
      data.applyCustomAccent = document.getElementById('field_applyCustomAccent')?.checked || false;
      data.customAccent = getVal('field_customAccent') || '#2563eb';
      data.applyCustomBg = document.getElementById('field_applyCustomBg')?.checked || false;
      data.customBg = getVal('field_customBg') || '#f8fafc';
    }

    return data;
  }

  // --- Export Functionality ---
  function getRenderedContentHTML(withSelfContainedFonts = true) {
    const theme = resolveActiveTheme();
    const accent = state.accentColor || '#2563eb';
    const mode = state.colorMode || 'light';
    const isDark = mode === 'dark';
    const blocksHtml = state.blocks.map(b => renderBlockHTML(b)).join('\n');
    const overridesCss = `
  .story-snippet {
    --primary-color: ${accent};
    --primary-hover: ${accent};
  }
  .story-snippet .size-sm { font-size: 0.92rem !important; }
  .story-snippet .size-lg { font-size: 1.35rem !important; line-height: 1.75 !important; }
  .story-snippet .size-xl { font-size: clamp(1.5rem, 2.8vw, 2.1rem) !important; font-weight: 700 !important; }
  .story-snippet .story-heading.size-sm { font-size: clamp(1.3rem, 2.2vw, 1.75rem) !important; }
  .story-snippet .story-heading.size-lg { font-size: clamp(2.3rem, 4.5vw, 3.4rem) !important; }
  .story-snippet .story-heading.size-xl { font-size: clamp(2.9rem, 6vw, 4.4rem) !important; }
  .story-snippet .font-role-heading { font-family: var(--story-font-heading) !important; }
  .story-snippet .font-role-body { font-family: var(--story-font-body) !important; }
  .story-snippet .font-role-mono { font-family: 'JetBrains Mono', SFMono-Regular, Consolas, monospace !important; }
  .story-snippet .align-left { text-align: left !important; }
  .story-snippet .align-center { text-align: center !important; }
  .story-snippet .align-right { text-align: right !important; }
  .story-snippet .story-link { color: var(--primary-color); text-decoration: underline; text-underline-offset: 3px; font-weight: 500; }
  .story-snippet .story-link:hover { color: var(--primary-hover); text-decoration: underline; }
  .story-snippet .story-inline-code { background-color: #f1f5f9; color: #0f172a; padding: 0.15rem 0.38rem; border-radius: 4px; font-size: 0.88em; font-family: monospace; }
  .story-snippet[data-theme-mode="dark"] { background-color: #0a0f1d; color: #cbd5e1; }
  .story-snippet[data-theme-mode="dark"] .story-heading { color: #f8fafc; }
  .story-snippet[data-theme-mode="dark"] .story-text { color: #cbd5e1; }
  .story-snippet[data-theme-mode="dark"] .story-caption { color: #94a3b8; }
  .story-snippet[data-theme-mode="dark"] .split-content h3 { color: #f8fafc; }
  .story-snippet[data-theme-mode="dark"] .split-content p { color: #cbd5e1; }
  .story-snippet[data-theme-mode="dark"] .stat-label { color: #f8fafc; }
  .story-snippet[data-theme-mode="dark"] .stat-sub { color: #94a3b8; }
  .story-snippet[data-theme-mode="dark"] .timeline-title { color: #f8fafc; }
  .story-snippet[data-theme-mode="dark"] .timeline-desc { color: #cbd5e1; }
  .story-snippet[data-theme-mode="dark"] .callout-header { color: #f8fafc; }
  .story-snippet[data-theme-mode="dark"] .callout-body { color: #cbd5e1; }
  .story-snippet[data-theme-mode="dark"] .story-quote-text { color: #f8fafc; }
  .story-snippet[data-theme-mode="dark"] .story-quote-cite { color: #94a3b8; }
  .story-snippet[data-theme-mode="dark"] .story-author-card,
  .story-snippet[data-theme-mode="dark"] .story-audio-card { background-color: #111827; border-color: #1f2937; }
  .story-snippet[data-theme-mode="dark"] .author-name { color: #f8fafc; }
  .story-snippet[data-theme-mode="dark"] .author-bio { color: #cbd5e1; }
  .story-snippet[data-theme-mode="dark"] .skill-badge { background-color: #111827; color: #cbd5e1; border-color: #1f2937; }
  .story-snippet[data-theme-mode="dark"] .story-inline-code { background-color: #1e293b; color: #e2e8f0; }`;

    if (withSelfContainedFonts) {
      return `<style>
  @import url('${theme.googleFontsUrl}');
  .story-snippet {
    --story-font-heading: ${theme.fontHeading};
    --story-font-body: ${theme.fontBody};
    font-family: var(--story-font-body);
    font-size: ${theme.baseScale || 100}%;
  }
  .story-snippet .story-cover-title,
  .story-snippet .story-heading,
  .story-snippet .story-quote-text,
  .story-snippet .split-content h3,
  .story-snippet .stat-number,
  .story-snippet .author-name,
  .story-snippet .cta-heading {
    font-family: var(--story-font-heading);
  }
  ${overridesCss}
</style>
<div class="story-snippet" data-theme="${escapeHTML(theme.key)}" data-theme-mode="${isDark ? 'dark' : 'light'}">
${blocksHtml}
</div>`;
    }

    return `<style>${overridesCss}
</style>
<div class="story-snippet story-inherit-fonts" data-theme-mode="${isDark ? 'dark' : 'light'}">
${blocksHtml}
</div>`;
  }

  function generateFullStandaloneHTML() {
    const theme = resolveActiveTheme();
    const accent = state.accentColor || '#2563eb';
    const mode = state.colorMode || 'light';
    const title = escapeHTML(state.title || 'Portfolio Story');
    const desc = escapeHTML(state.description || '');
    const author = escapeHTML(state.author || '');
    const ogImage = state.ogImage ? escapeHTML(state.ogImage) : '';
    const content = state.blocks.map(b => renderBlockHTML(b)).join('\n');
    return `<!DOCTYPE html>
<html lang="en" data-theme-mode="${mode}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${desc ? `<meta name="description" content="${desc}">` : ''}
  ${author ? `<meta name="author" content="${author}">` : ''}

  <!-- Open Graph / Facebook / LinkedIn -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${title}">
  ${desc ? `<meta property="og:description" content="${desc}">` : ''}
  ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  ${desc ? `<meta name="twitter:description" content="${desc}">` : ''}
  ${ogImage ? `<meta name="twitter:image" content="${ogImage}">` : ''}

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${theme.googleFontsUrl}" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    :root {
      --primary-color: ${accent};
      --primary-hover: ${accent};
      --story-font-heading: ${theme.fontHeading};
      --story-font-body: ${theme.fontBody};
      --canvas-bg: #ffffff;
      --canvas-surface: #f8fafc;
      --canvas-surface-border: #e2e8f0;
      --canvas-text: #1e293b;
      --canvas-heading: #0f172a;
      --canvas-muted: #64748b;
    }
    [data-theme-mode="dark"] {
      --canvas-bg: #0a0f1d;
      --canvas-surface: #111827;
      --canvas-surface-border: #1f2937;
      --canvas-text: #cbd5e1;
      --canvas-heading: #f8fafc;
      --canvas-muted: #94a3b8;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: var(--story-font-body);
      font-size: ${theme.baseScale || 100}%;
      color: var(--canvas-text);
      background-color: var(--canvas-bg);
      line-height: 1.6;
      transition: background-color 0.2s ease, color 0.2s ease;
    }
    /* Block-Level Typography Overrides */
    .size-sm { font-size: 0.92rem !important; }
    .size-lg { font-size: 1.35rem !important; line-height: 1.75 !important; }
    .size-xl { font-size: clamp(1.5rem, 2.8vw, 2.1rem) !important; font-weight: 700 !important; }
    .story-heading.size-sm { font-size: clamp(1.3rem, 2.2vw, 1.75rem) !important; }
    .story-heading.size-lg { font-size: clamp(2.3rem, 4.5vw, 3.4rem) !important; }
    .story-heading.size-xl { font-size: clamp(2.9rem, 6vw, 4.4rem) !important; }
    .font-role-heading { font-family: var(--story-font-heading) !important; }
    .font-role-body { font-family: var(--story-font-body) !important; }
    .font-role-mono { font-family: 'JetBrains Mono', SFMono-Regular, Consolas, monospace !important; }
    .align-left { text-align: left !important; }
    .align-center { text-align: center !important; }
    .align-right { text-align: right !important; }
    .story-link { color: var(--primary-color); text-decoration: underline; text-underline-offset: 3px; font-weight: 500; }
    .story-link:hover { color: var(--primary-hover); text-decoration: underline; }
    .story-inline-code { background-color: #f1f5f9; color: #0f172a; padding: 0.15rem 0.38rem; border-radius: 4px; font-size: 0.88em; font-family: monospace; }
    [data-theme-mode="dark"] .story-inline-code { background-color: #1e293b; color: #e2e8f0; }
    [data-theme-mode="dark"] .story-heading { color: var(--canvas-heading); }
    [data-theme-mode="dark"] .story-text { color: var(--canvas-text); }
    [data-theme-mode="dark"] .story-caption { color: var(--canvas-muted); }
    [data-theme-mode="dark"] .story-quote-text { color: var(--canvas-heading); }
    [data-theme-mode="dark"] .story-quote-cite { color: var(--canvas-muted); }
    [data-theme-mode="dark"] .split-content h3 { color: var(--canvas-heading); }
    [data-theme-mode="dark"] .split-content p { color: var(--canvas-text); }
    [data-theme-mode="dark"] .stat-label { color: var(--canvas-heading); }
    [data-theme-mode="dark"] .stat-sub { color: var(--canvas-muted); }
    [data-theme-mode="dark"] .timeline-title { color: var(--canvas-heading); }
    [data-theme-mode="dark"] .timeline-desc { color: var(--canvas-text); }
    [data-theme-mode="dark"] .story-timeline { border-left-color: var(--canvas-surface-border); }
    [data-theme-mode="dark"] .story-timeline .timeline-dot { border-color: var(--canvas-bg); }
    [data-theme-mode="dark"] .story-stats-container { border-color: var(--canvas-surface-border); }
    [data-theme-mode="dark"] .story-author-card,
    [data-theme-mode="dark"] .story-audio-card { background-color: var(--canvas-surface); border-color: var(--canvas-surface-border); }
    [data-theme-mode="dark"] .author-name { color: var(--canvas-heading); }
    [data-theme-mode="dark"] .author-bio { color: var(--canvas-text); }
    [data-theme-mode="dark"] .author-social-link { background-color: var(--canvas-surface-border); color: var(--canvas-text); }
    [data-theme-mode="dark"] .author-social-link:hover { background-color: var(--primary-color); color: #ffffff; }
    [data-theme-mode="dark"] .skill-badge { background-color: var(--canvas-surface); color: var(--canvas-text); border-color: var(--canvas-surface-border); }
    .story-cover {
      position: relative;
      width: 100%;
      min-height: 85vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-size: cover;
      background-position: center;
      overflow: hidden;
    }
    .story-cover-video {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
      pointer-events: none;
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
      font-family: var(--story-font-heading);
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
      font-family: var(--story-font-heading);
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
    .story-two-col-container {
      max-width: 1040px;
      margin: 2.5rem auto;
      padding: 0 1rem;
    }
    .story-two-col-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .story-col-image figure { margin: 0; }
    .story-col-image img {
      width: 100%;
      height: 380px;
      object-fit: cover;
      border-radius: 6px;
    }
    .story-gallery-container {
      max-width: 1080px;
      margin: 3rem auto;
      padding: 0 1rem;
    }
    .story-gallery-grid {
      display: grid;
      gap: 1rem;
    }
    .story-gallery-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
    .story-gallery-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
    .story-gallery-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
    .gallery-item {
      overflow: hidden;
      border-radius: 6px;
    }
    .gallery-item img {
      width: 100%;
      height: 260px;
      object-fit: cover;
      display: block;
    }
    .story-split-container {
      max-width: 1040px;
      margin: 3rem auto;
      padding: 0 1.25rem;
    }
    .story-split-row {
      display: flex;
      align-items: center;
      gap: 3rem;
    }
    .story-split-row.media-right {
      flex-direction: row-reverse;
    }
    .split-media, .split-content {
      flex: 1;
    }
    .split-media img {
      width: 100%;
      height: 420px;
      object-fit: cover;
      border-radius: 8px;
    }
    .split-content h3 {
      font-family: var(--story-font-heading);
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    .split-content p {
      font-size: 1.1rem;
      line-height: 1.8;
      color: #475569;
    }
    .story-stats-container {
      max-width: 960px;
      margin: 3.5rem auto;
      padding: 2rem 1.5rem;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
    }
    .story-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      text-align: center;
    }
    .stat-number {
      font-family: var(--story-font-heading);
      font-size: clamp(2.5rem, 4.5vw, 3.75rem);
      font-weight: 700;
      color: #2563eb;
      line-height: 1.1;
      margin-bottom: 0.35rem;
    }
    .stat-label {
      font-size: 1.05rem;
      font-weight: 600;
      color: #0f172a;
    }
    .stat-sub {
      font-size: 0.85rem;
      color: #64748b;
    }
    .story-timeline-container {
      max-width: 780px;
      margin: 3rem auto;
      padding: 0 1.5rem;
    }
    .story-timeline {
      position: relative;
      padding-left: 2rem;
      border-left: 2px solid #e2e8f0;
    }
    .timeline-entry {
      position: relative;
      margin-bottom: 2rem;
    }
    .timeline-dot {
      position: absolute;
      left: -2.45rem;
      top: 0.3rem;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #2563eb;
      border: 3px solid #ffffff;
      box-shadow: 0 0 0 2px #2563eb;
    }
    .timeline-date {
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #2563eb;
    }
    .timeline-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
    }
    .timeline-desc {
      font-size: 1.05rem;
      color: #475569;
    }
    .story-callout-container {
      max-width: 780px;
      margin: 2.5rem auto;
      padding: 0 1.5rem;
    }
    .story-callout {
      padding: 1.5rem 1.75rem;
      border-radius: 8px;
      border-left: 4px solid;
    }
    .callout-info { border-color: #3b82f6; background-color: #eff6ff; }
    .callout-note { border-color: #8b5cf6; background-color: #f5f3ff; }
    .callout-tip { border-color: #10b981; background-color: #ecfdf5; }
    .callout-warning { border-color: #f59e0b; background-color: #fffbeb; }
    .callout-minimal { border-color: #64748b; background-color: #f8fafc; }
    .callout-accent { border-color: var(--primary-color); background-color: rgba(37, 99, 235, 0.06); }
    [data-theme-mode="dark"] .story-callout { background-color: #111827; }
    [data-theme-mode="dark"] .callout-info { border-color: #3b82f6; background-color: rgba(59, 130, 246, 0.12); }
    [data-theme-mode="dark"] .callout-note { border-color: #a78bfa; background-color: rgba(139, 92, 246, 0.12); }
    [data-theme-mode="dark"] .callout-tip { border-color: #10b981; background-color: rgba(16, 185, 129, 0.12); }
    [data-theme-mode="dark"] .callout-warning { border-color: #f59e0b; background-color: rgba(245, 158, 11, 0.12); }
    [data-theme-mode="dark"] .callout-minimal { border-color: #475569; background-color: #1e293b; }
    [data-theme-mode="dark"] .callout-accent { border-color: var(--primary-color); background-color: rgba(37, 99, 235, 0.15); }
    [data-theme-mode="dark"] .callout-header { color: var(--canvas-heading); }
    [data-theme-mode="dark"] .callout-body { color: var(--canvas-text); }
    .callout-header {
      font-weight: 700;
      font-size: 1.1rem;
      color: #0f172a;
      margin-bottom: 0.5rem;
    }
    .story-audio-container {
      max-width: 780px;
      margin: 2.5rem auto;
      padding: 0 1.5rem;
    }
    .story-audio-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .audio-icon-box {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #2563eb;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      flex-shrink: 0;
    }
    .audio-info { flex-grow: 1; }
    .audio-title { font-weight: 700; font-size: 1.05rem; color: #0f172a; }
    .audio-artist { font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem; }
    .story-audio-card audio { width: 100%; height: 36px; }
    .story-author-container {
      max-width: 780px;
      margin: 3.5rem auto;
      padding: 0 1.5rem;
    }
    .story-author-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 2rem;
      display: flex;
      align-items: center;
      gap: 1.75rem;
    }
    .author-avatar {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      object-fit: cover;
    }
    .author-name {
      font-family: var(--story-font-heading);
      font-size: 1.45rem;
      font-weight: 700;
      margin-bottom: 0.2rem;
    }
    .author-role {
      font-size: 0.85rem;
      font-weight: 600;
      color: #2563eb;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    .author-socials { display: flex; gap: 0.65rem; }
    .author-social-link {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #334155;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
    }
    .story-cta-container {
      max-width: 860px;
      margin: 3.5rem auto;
      padding: 0 1.5rem;
    }
    .story-cta-box {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: #ffffff;
      border-radius: 12px;
      padding: 3rem 2rem;
      text-align: center;
    }
    .cta-heading {
      font-family: var(--story-font-heading);
      font-size: clamp(1.75rem, 3vw, 2.35rem);
      font-weight: 700;
      margin-bottom: 0.75rem;
    }
    .cta-subtext {
      font-size: 1.1rem;
      color: #94a3b8;
      max-width: 580px;
      margin: 0 auto 1.75rem;
    }
    .btn-cta {
      display: inline-block;
      font-size: 1rem;
      font-weight: 600;
      padding: 0.75rem 1.75rem;
      border-radius: 8px;
      background-color: #2563eb;
      color: #ffffff;
      text-decoration: none;
    }
    .story-skills-container {
      max-width: 780px;
      margin: 2.5rem auto;
      padding: 0 1.5rem;
    }
    .skills-heading {
      font-size: 0.85rem;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      text-align: center;
      margin-bottom: 0.75rem;
    }
    .skills-wrapper {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
    }
    .skill-badge {
      font-size: 0.88rem;
      padding: 0.4rem 0.85rem;
      border-radius: 9999px;
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #e2e8f0;
    }
    .story-divider-container.spacing-sm { padding: 1.5rem 0; }
    .story-divider-container.spacing-md { padding: 2.75rem 0; }
    .story-divider-container.spacing-lg { padding: 4.5rem 0; }
    .divider-line { border: 0; height: 1px; background: #e2e8f0; width: 60%; margin: 0 auto; }
    .divider-asterisks { color: #94a3b8; font-size: 1.25rem; letter-spacing: 0.75rem; }
    .divider-dots { color: #cbd5e1; font-size: 1.5rem; letter-spacing: 0.5rem; }
    .story-pull-quote {
      border-left: 4px solid #2563eb;
      padding: 0.75rem 0 0.75rem 1.5rem;
      margin: 0;
    }
    .story-quote-text {
      font-family: var(--story-font-heading);
      font-size: 1.5rem;
      font-style: italic;
      color: #0f172a;
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
    /* Navbar Styles */
    .story-navbar-container {
      width: 100%;
      transition: background-color 0.2s ease, border-color 0.2s ease;
      z-index: 980;
    }
    .story-navbar-container.is-sticky {
      position: sticky;
      top: 0;
    }
    .story-navbar-container.style-glass {
      background-color: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }
    .story-navbar-container.style-clean {
      background-color: #ffffff;
      border-bottom: 1px solid #e2e8f0;
    }
    .story-navbar-container.style-transparent {
      background-color: transparent;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    }
    [data-theme-mode="dark"] .story-navbar-container.style-glass {
      background-color: rgba(13, 19, 34, 0.88);
      border-bottom-color: rgba(255, 255, 255, 0.08);
    }
    [data-theme-mode="dark"] .story-navbar-container.style-clean {
      background-color: #0d1322;
      border-bottom-color: #1f293d;
    }
    .story-navbar {
      max-width: 1140px;
      margin: 0 auto;
      padding: 0.85rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .story-nav-brand {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      text-decoration: none;
    }
    .story-nav-logo {
      height: 32px;
      width: auto;
      object-fit: contain;
      border-radius: 4px;
    }
    .story-nav-brand-text {
      display: flex;
      flex-direction: column;
    }
    .story-nav-brand-name {
      font-family: var(--story-font-heading);
      font-weight: 700;
      font-size: 1.15rem;
      color: var(--canvas-heading);
      text-decoration: none;
      line-height: 1.2;
    }
    .story-nav-brand-name:hover {
      color: var(--primary-color);
    }
    .story-nav-brand-sub {
      font-size: 0.72rem;
      color: var(--canvas-muted);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .story-nav-links {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .story-nav-link {
      font-size: 0.92rem;
      font-weight: 500;
      color: var(--canvas-text);
      text-decoration: none;
      transition: color 0.15s ease;
      white-space: nowrap;
    }
    .story-nav-link:hover {
      color: var(--primary-color);
    }
    .story-nav-action {
      display: flex;
      align-items: center;
    }
    .story-nav-cta {
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.35rem 0.9rem;
      border-radius: 9999px;
      background-color: var(--primary-color);
      border-color: var(--primary-color);
      color: #ffffff !important;
      text-decoration: none;
      transition: opacity 0.15s ease;
    }
    .story-nav-cta:hover {
      opacity: 0.9;
    }
    .story-nav-links-mobile {
      width: 100%;
      overflow-x: auto;
      display: flex;
      gap: 1.25rem;
      padding-top: 0.4rem;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      white-space: nowrap;
      scrollbar-width: none;
    }
    .story-nav-links-mobile::-webkit-scrollbar {
      display: none;
    }
    [data-theme-mode="dark"] .story-nav-links-mobile {
      border-top-color: rgba(255, 255, 255, 0.08);
    }
    [data-theme-mode="dark"] .story-nav-brand-name {
      color: #f8fafc;
    }
    [data-theme-mode="dark"] .story-nav-brand-sub {
      color: #94a3b8;
    }
    [data-theme-mode="dark"] .story-nav-link {
      color: #cbd5e1;
    }
    [data-theme-mode="dark"] .story-nav-link:hover {
      color: #93c5fd;
    }
    @media (max-width: 768px) {
      .story-two-col-grid { grid-template-columns: 1fr; }
      .story-split-row, .story-split-row.media-right { flex-direction: column; gap: 1.5rem; }
    }
  </style>
</head>
<body>
${content}
</body>
</html>`;
  }

  // Copy to clipboard with fallback
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

    // Typography Switcher (Curated Themes)
    document.querySelectorAll('[data-typography]').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.typography;
        applyTypography(theme, true);
      });
    });

    // Custom Typography Pairing Modal
    const btnOpenCustom = document.getElementById('btnOpenCustomTypography');
    const selectHeading = document.getElementById('customHeadingFont');
    const selectBody = document.getElementById('customBodyFont');
    const selectBaseScale = document.getElementById('customBaseScale');
    const previewHeading = document.getElementById('typographyPreviewHeading');
    const previewBody = document.getElementById('typographyPreviewBody');

    function updateCustomTypographyPreview() {
      if (!selectHeading || !selectBody) return;
      const hFont = selectHeading.value;
      const bFont = selectBody.value;
      const scale = selectBaseScale ? selectBaseScale.value : '100';
      if (previewHeading) {
        previewHeading.style.fontFamily = `'${hFont}', serif`;
      }
      if (previewBody) {
        previewBody.style.fontFamily = `'${bFont}', sans-serif`;
        previewBody.style.fontSize = `${scale}%`;
      }
    }

    if (btnOpenCustom) {
      btnOpenCustom.addEventListener('click', () => {
        const custom = state.customTypography || {
          headingFont: 'Playfair Display',
          bodyFont: 'Roboto',
          baseScale: '100'
        };
        if (selectHeading) selectHeading.value = custom.headingFont || 'Playfair Display';
        if (selectBody) selectBody.value = custom.bodyFont || 'Roboto';
        if (selectBaseScale) selectBaseScale.value = custom.baseScale || '100';
        updateCustomTypographyPreview();
        customTypographyModalInstance?.show();
      });
    }

    selectHeading?.addEventListener('change', updateCustomTypographyPreview);
    selectBody?.addEventListener('change', updateCustomTypographyPreview);
    selectBaseScale?.addEventListener('change', updateCustomTypographyPreview);

    document.getElementById('btnSaveCustomTypography')?.addEventListener('click', () => {
      saveState();
      state.customTypography = {
        headingFont: selectHeading?.value || 'Playfair Display',
        bodyFont: selectBody?.value || 'Roboto',
        baseScale: selectBaseScale?.value || '100'
      };
      applyTypography('custom', true);
      customTypographyModalInstance?.hide();
      showToast('Custom typography saved & applied!', 'sliders');
    });

    // Color Mode (Light / Dark) Toggle
    document.getElementById('btnToggleColorMode')?.addEventListener('click', () => {
      const current = state.colorMode || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyColorMode(next, true);
    });

    // Accent Color Palette Presets
    document.querySelectorAll('[data-accent]').forEach(btn => {
      btn.addEventListener('click', () => {
        const hex = btn.dataset.accent;
        const name = btn.dataset.accentName;
        applyAccentColor(hex, name, true);
      });
    });

    // Custom Accent Color Input
    const inputCustomAccent = document.getElementById('inputCustomAccent');
    if (inputCustomAccent) {
      inputCustomAccent.addEventListener('input', (e) => {
        applyAccentColor(e.target.value, 'Custom', false);
      });
      inputCustomAccent.addEventListener('change', (e) => {
        applyAccentColor(e.target.value, 'Custom', true);
      });
    }

    // Clear Canvas
    document.getElementById('btnClearAll')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all blocks? You can undo this action.')) {
        saveState();
        state.blocks = [];
        renderCanvas();
        showToast('Canvas cleared', 'info-circle');
      }
    });

    // --- Story Settings & Social Share SEO Modal ---
    function updateSocialCardPreview() {
      const inputTitle = document.getElementById('settingStoryTitle');
      const inputAuthor = document.getElementById('settingStoryAuthor');
      const inputDesc = document.getElementById('settingStoryDesc');
      const inputImage = document.getElementById('settingStoryImage');

      const titleVal = inputTitle?.value.trim() || state.title || 'The Silent Fjords of the North';
      const authorVal = inputAuthor?.value.trim() || state.author || 'Author';
      const descVal = inputDesc?.value.trim() || state.description || 'An expedition documenting vanishing glaciers and Arctic communities.';
      const imageVal = inputImage?.value.trim() || state.ogImage || '';

      const previewTitle = document.getElementById('socialPreviewTitle');
      const previewAuthor = document.getElementById('socialPreviewAuthor');
      const previewDesc = document.getElementById('socialPreviewDesc');
      const previewImage = document.getElementById('socialPreviewImage');
      const previewFallback = document.getElementById('socialPreviewFallback');
      const charCountEl = document.getElementById('storyDescCharCount');

      if (previewTitle) previewTitle.textContent = titleVal;
      if (previewAuthor) previewAuthor.textContent = authorVal;
      if (previewDesc) previewDesc.textContent = descVal;

      if (charCountEl) {
        const len = (inputDesc?.value || '').length;
        charCountEl.textContent = `${len} chars`;
        if (len > 160) {
          charCountEl.className = 'text-warning small fw-semibold';
        } else {
          charCountEl.className = 'text-muted small';
        }
      }

      if (previewImage && previewFallback) {
        if (imageVal) {
          previewImage.src = imageVal;
          previewImage.style.display = 'block';
          previewImage.style.opacity = '1';
          previewFallback.style.setProperty('display', 'none', 'important');
        } else {
          previewImage.src = '';
          previewImage.style.display = 'none';
          previewFallback.style.setProperty('display', 'flex', 'important');
        }
      }
    }

    function openStorySettingsModal() {
      const inputTitle = document.getElementById('settingStoryTitle');
      const inputAuthor = document.getElementById('settingStoryAuthor');
      const inputDesc = document.getElementById('settingStoryDesc');
      const inputImage = document.getElementById('settingStoryImage');

      if (inputTitle) inputTitle.value = state.title || '';
      if (inputAuthor) inputAuthor.value = state.author || '';
      if (inputDesc) inputDesc.value = state.description || '';
      if (inputImage) inputImage.value = state.ogImage || '';

      updateSocialCardPreview();
      storySettingsModalInstance?.show();
    }

    function autoDetectStorySettings() {
      if (!state.blocks || state.blocks.length === 0) {
        showToast('Canvas is empty, nothing to detect', 'info-circle');
        return;
      }

      let detectedTitle = '';
      let detectedAuthor = '';
      let detectedDesc = '';
      let detectedImage = '';

      for (const block of state.blocks) {
        const d = block.data || {};
        if (!detectedTitle) {
          if (block.type === 'cover' && d.title) detectedTitle = d.title;
          else if (block.type === 'heading' && d.text) detectedTitle = d.text;
        }
        if (!detectedAuthor) {
          if (block.type === 'cover' && d.byline) {
            detectedAuthor = d.byline.replace(/^by\s+/i, '').trim();
          } else if (block.type === 'authorBio' && d.name) {
            detectedAuthor = d.name;
          }
        }
        if (!detectedDesc) {
          if (block.type === 'cover' && d.tagline) {
            detectedDesc = d.tagline;
          } else if (block.type === 'text' && d.text) {
            const cleanText = d.text.replace(/[*_#`~\[\]()]/g, ' ').replace(/\s+/g, ' ').trim();
            detectedDesc = cleanText.length > 160 ? cleanText.substring(0, 157) + '...' : cleanText;
          }
        }
        if (!detectedImage) {
          if (d.imageUrl) detectedImage = d.imageUrl;
          else if (d.img1Url) detectedImage = d.img1Url;
        }
      }

      const inputTitle = document.getElementById('settingStoryTitle');
      const inputAuthor = document.getElementById('settingStoryAuthor');
      const inputDesc = document.getElementById('settingStoryDesc');
      const inputImage = document.getElementById('settingStoryImage');

      if (detectedTitle && inputTitle) inputTitle.value = detectedTitle;
      if (detectedAuthor && inputAuthor) inputAuthor.value = detectedAuthor;
      if (detectedDesc && inputDesc) inputDesc.value = detectedDesc;
      if (detectedImage && inputImage) inputImage.value = detectedImage;

      updateSocialCardPreview();
      showToast('Detected story metadata from blocks!', 'wand-magic-sparkles');
    }

    document.getElementById('btnOpenStorySettings')?.addEventListener('click', openStorySettingsModal);
    document.getElementById('btnAutoDetectSettings')?.addEventListener('click', autoDetectStorySettings);

    ['settingStoryTitle', 'settingStoryAuthor', 'settingStoryDesc', 'settingStoryImage'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', updateSocialCardPreview);
    });

    document.getElementById('btnSaveStorySettings')?.addEventListener('click', () => {
      saveState();
      state.title = document.getElementById('settingStoryTitle')?.value.trim() || 'The Silent Fjords of the North';
      state.author = document.getElementById('settingStoryAuthor')?.value.trim() || '';
      state.description = document.getElementById('settingStoryDesc')?.value.trim() || '';
      state.ogImage = document.getElementById('settingStoryImage')?.value.trim() || '';

      storySettingsModalInstance?.hide();
      showToast('Story settings & SEO metadata saved', 'gear');
    });

    // Export Dropdown actions
    document.getElementById('btnCopyFullHTML')?.addEventListener('click', () => {
      const html = generateFullStandaloneHTML();
      copyToClipboard(html, 'Full Page HTML copied to clipboard!');
    });

    document.getElementById('btnDownloadFullHTML')?.addEventListener('click', () => {
      const html = generateFullStandaloneHTML();
      const slug = (state.title || 'story-page')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'story-page';
      downloadFile(`${slug}.html`, html, 'text/html');
    });

    document.getElementById('btnCopySnippetHTML')?.addEventListener('click', () => {
      const snippet = getRenderedContentHTML(true);
      copyToClipboard(snippet, 'Self-contained snippet (with fonts) copied!');
    });

    document.getElementById('btnCopySnippetInheritHTML')?.addEventListener('click', () => {
      const snippet = getRenderedContentHTML(false);
      copyToClipboard(snippet, 'Snippet (inheriting site fonts) copied!');
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
            applyTypography(state.typography || 'classic', false);
            applyColorMode(state.colorMode || 'light', false);
            applyAccentColor(state.accentColor || '#2563eb', null, false);
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
      state.blocks = JSON.parse(JSON.stringify(SAMPLE_STORY));
    }

    applyTypography(state.typography || 'classic', false);
    applyColorMode(state.colorMode || 'light', false);
    applyAccentColor(state.accentColor || '#2563eb', null, false);
    renderCanvas();
    updateUndoRedoUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
