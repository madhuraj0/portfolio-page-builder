# Portfolio & Story Page Builder ✍️📸

A lightweight, zero-build, in-browser visual page builder designed for creating editorial portfolios, photo essays, and long-form visual stories.

Built with vanilla JavaScript, modern CSS, and Bootstrap 5. Works immediately with **GitHub Pages** with no setup or compilation required.

---

## ✨ 20 Editorial & Portfolio Blocks

### 📸 Media
1. **Cover Hero**: Full-bleed hero banner with title, tagline, byline, dateline, and adjustable dark overlay.
2. **Wide Photo**: High-resolution centered photograph with caption.
3. **Bleed Photo**: Edge-to-edge full-bleed immersive imagery.
4. **2-Col Photos**: Side-by-side photo comparison or dual-photo pairing.
5. **Photo Gallery**: Responsive 2, 3, or 4-column photo grid.
6. **Web Embed**: Responsive 16:9 frame for YouTube, Vimeo, Google Drive preview, or maps.
7. **Audio Player**: Minimalist audio card for field recordings, interviews, or music tracks.

### ✍️ Narrative & Structure
8. **Section Heading**: Editorial serif typography across H1, H2, and H3 levels.
9. **Paragraph Text**: Multi-paragraph narrative storytelling.
10. **Split Media + Text**: 50/50 responsive split with image and narrative side-by-side.
11. **Pull Quote**: Large editorial quote with attribution.
12. **Callout Box**: Styled accent box with color themes (`Info`, `Note`, `Tip`, `Warning`).
13. **Section Divider**: Hairline rule, editorial asterisks (`* * *`), dots (`• • •`), or custom spacing.

### 🌟 Profile & Impact
14. **Big Stats**: Key metric highlights with large numbers and subtitles.
15. **Timeline**: Vertical milestone timeline with dates, titles, and descriptions.
16. **Skills / Tech Pills**: Tag pills for tools, cameras, and technical skills.
17. **Author Bio**: Creator card with avatar, role, bio paragraph, and social links.
18. **CTA Banner**: High-impact call-to-action banner with headline and action button.
19. **Standalone Caption**: Italicized centered commentary note.
20. **Story Footer**: Clean closing credits and copyright.

---

## 🛠️ Editor Features

- **Modal Form Editing**: Zero intrusive browser prompts. Dedicated input fields, sliders, and live options.
- **Block Controls**: Move Up, Move Down, Edit, Duplicate, and Delete any block with one click.
- **History (Undo / Redo)**: Full keyboard shortcut support (`Ctrl+Z` / `Ctrl+Y`).
- **Responsive Viewport Previews**: Toggle Desktop, Tablet (768px), and Mobile (400px) frames directly in the builder.
- **Preview vs. Edit Mode**: Experience the final article cleanly without builder controls.
- **Auto-Save**: Changes automatically save to browser `localStorage`.
- **Clean HTML & JSON Exports**:
  - **Copy Full Page HTML**: Copy complete standalone HTML to clipboard.
  - **Download as .html File**: Download `story-page.html` ready to double-click and open.
  - **Copy Article Snippet (CMS)**: Copy clean inner markup for WordPress, Ghost, Substack, or Medium.
  - **Save / Open Project (JSON)**: Re-open and edit projects anytime.
- **Built-in XSS Protection**: All user inputs and embedded URLs are safely sanitized.

---

## 🚀 Live Demo on GitHub Pages

Check out the live deployment:  
👉 **[https://madhuraj0.github.io/portfolio-page-builder/](https://madhuraj0.github.io/portfolio-page-builder/)**

---

## 💻 Local Usage

Simply clone and open `index.html` in any modern web browser:

```bash
git clone https://github.com/madhuraj0/portfolio-page-builder.git
cd portfolio-page-builder
python3 -m http.server 8000
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
