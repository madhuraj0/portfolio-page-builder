# Portfolio & Story Page Builder ✍️📸

A lightweight, in-browser visual page builder for crafting editorial portfolios, photo essays, and long-form visual stories. Zero build tools, zero frameworks, 100% client-side.

👉 **[Live Demo](https://madhuraj0.github.io/portfolio-page-builder/)**

---

## Highlights

- **28+ Editorial Blocks**: Hero covers, full-bleed imagery, comparison sliders, interactive maps, audio players, FAQs, and custom code widgets.
- **Drag-and-Drop Reordering**: Rearrange story blocks on the canvas with visual drop guides.
- **Accidental Delete Protection**: Instant Undo snackbar and full undo/redo history (`Ctrl+Z` / `Ctrl+Y`).
- **Curated Photo Picker & Local Dropzone**: Browse curated Unsplash photography or drop in local images (auto-compressed to web-ready 1600px).
- **Curated & Custom Typography**: 5 editorial font pairings or custom Google Font pairings with base-scale control.
- **Dark & Light Themes**: Real-time theme toggle with customizable brand accent colors.
- **Instant Previews**: Toggle Desktop, Tablet, and Mobile viewports, or open a live standalone preview in a new browser tab.
- **Zero-Dependency Exports**: Export self-contained HTML files with embedded fonts and SEO metadata, ready to host anywhere.

---

## Quick Start

1. **Add Blocks**: Click any block in the palette to append it to your story.
2. **Reorder**: Grab the grip handle (`⠿`) on any block to drag it up or down.
3. **Edit**: Double-click any block to open its settings and content editor.
4. **Choose Photos**: Click **Choose...** on image fields to pick curated photos or upload local files.
5. **Preview & Export**: Use **Export > Open Live Preview in New Tab** to preview full-screen, or **Download as .html** to publish.

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl` / `Cmd` + `Z` | Undo last change |
| `Ctrl` / `Cmd` + `Y` | Redo change |
| `Double Click` on block | Quick Edit block modal |
| `Drag Handle` (`⠿`) | Drag to reorder block |

---

## Block Directory

### 📸 Media
- **Cover Hero**: Full-bleed hero banner with title, tagline, byline, dateline, and image or ambient video background.
- **Before / After Slider**: Draggable image comparison slider with custom labels and width options.
- **Wide Photo**: Centered editorial photograph with caption.
- **Bleed Photo**: Edge-to-edge full-width imagery.
- **2-Col Photos**: Side-by-side dual photograph comparison.
- **Photo Gallery**: Responsive 2, 3, or 4-column photo grid.
- **Web Embed**: 16:9 responsive frame for YouTube, Vimeo, or web embeds.
- **Audio Player**: Audio card for field recordings, interviews, or podcasts.
- **Map Embed**: Interactive Google Maps or OpenStreetMap embed with custom zoom levels.
- **Code Widget**: Custom HTML, SVG vectors, CodePen, or iframe embeds with card or terminal frames.

### ✍️ Narrative
- **Table of Contents / Outline**: Auto-scans document headings to build a smooth-scrolling jump index.
- **Section Heading**: Editorial headings across H1, H2, and H3.
- **Paragraph Text**: Narrative text with markdown formatting and overflow containment.
- **Split Media + Text**: 50/50 responsive split pairing imagery with narrative text.
- **Pull Quote**: Large quote callout with source citation.
- **Callout Box**: Styled aside box (`Info`, `Note`, `Tip`, `Warning`, `Accent`).
- **Interactive Accordion / FAQ**: Collapsible panels for project breakdowns or FAQs.
- **Section Divider**: Hairline rule, editorial asterisks (`* * *`), or spaced dots.

### 🌟 Structure & Profile
- **Story Topbar / Navbar**: Sticky or static navigation bar with logo, jump links, and CTA button.
- **Client Testimonial**: Review card with 1–5 star ratings, quote, reviewer avatar, and company.
- **Big Stats**: Key numerical highlights and metric callouts.
- **Timeline**: Milestone timeline with dates, titles, and descriptions.
- **Skills Pills**: Tag pills for technologies, cameras, or capabilities.
- **Author Bio**: Profile card with avatar, role, bio, and social links.
- **Contact Form**: Responsive inquiry form supporting direct `mailto:` or Formspree API.
- **CTA Banner**: Call-to-action banner with headline and button.
- **Standalone Caption**: Centered editorial note or italic commentary.
- **Story Footer**: Closing copyright and colophon credits.

---

## Local Development

No build steps, package managers, or compilers needed:

```bash
git clone https://github.com/madhuraj0/portfolio-page-builder.git
cd portfolio-page-builder
python3 -m http.server 8000
```

Open `http://localhost:8000` in any modern web browser.

---

## License

MIT License. Free for personal and commercial use.
