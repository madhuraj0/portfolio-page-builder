# Portfolio & Story Page Builder ✍️📸

A lightweight, zero-build, in-browser visual page builder designed for creating editorial portfolios, photo essays, and long-form visual stories.

Built with vanilla JavaScript, modern CSS, and Bootstrap 5. Works immediately with **GitHub Pages** with no setup or compilation required.

---

## ✨ Features

- **Block-Based Visual Layouts**:
  - **Cover Hero Banner**: Full-bleed hero with headline, tagline, byline, dateline, and adjustable dark overlay.
  - **Section Headings**: Styled editorial typography (H1, H2, H3).
  - **Narrative Paragraphs**: Multi-paragraph storytelling blocks.
  - **Wide Photo**: Centered high-resolution image with caption.
  - **Bleeding Image**: Edge-to-edge full-bleed photography.
  - **Pull Quotes**: Elegant editorial quotes with attribution.
  - **Web Embeds**: Responsive 16:9 frame for YouTube, Vimeo, Google Drive preview, or interactive maps.
  - **Captions & Footers**: Polished closing notes and credits.

- **Polished Authoring Experience**:
  - **No Annoying Browser Prompts**: Clean modal forms with dedicated input fields and live settings.
  - **Block Actions**: Move Up, Move Down, Edit, Duplicate, and Delete any block with one click.
  - **Undo & Redo**: Full history support with keyboard shortcuts (`Ctrl+Z` / `Ctrl+Y`).
  - **Responsive Viewport Previews**: Toggle between Desktop, Tablet (768px), and Mobile (400px) views directly inside the editor.
  - **Edit vs. Preview Mode**: Switch to distraction-free preview to experience the story as readers will see it.
  - **Auto-Save & Persistence**: Drafts are automatically saved in your browser (`localStorage`).

- **Multi-Format Export & Sharing**:
  - **Standalone HTML Page**: One-click download or copy of self-contained, clean HTML ready to publish anywhere.
  - **Post Snippet HTML**: Semantic HTML snippet ready to paste into CMSs like WordPress, Ghost, Substack, or Medium.
  - **Project File (JSON)**: Save and restore project files anytime to collaborate or resume editing on another device.

- **Security & Performance**:
  - **DOM XSS Sanitization**: All user-provided strings and URLs are safely escaped and sanitized.
  - **Zero Build Tools**: No `npm`, `webpack`, or dependencies to install. Pure HTML/CSS/JS that runs directly on GitHub Pages.

---

## 🚀 Live Demo on GitHub Pages

1. Fork or clone this repository.
2. Go to **Settings** > **Pages** in your GitHub repository.
3. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch` (or GitHub Actions).
   - **Branch**: Select `main` and folder `/ (root)`.
4. Click **Save**. Within 1–2 minutes, your builder will be live at:
   `https://<your-username>.github.io/portfolio-page-builder/`

---

## 💻 Local Usage

Simply clone and open `index.html` in any modern web browser:

```bash
git clone https://github.com/madhuraj0/portfolio-page-builder.git
cd portfolio-page-builder
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser.

---

## 📁 Project Architecture

```
portfolio-page-builder/
├── index.html                  # Editor shell, navigation, modals, and canvas
├── css/
│   └── styles.css             # Editor chrome and story layout typography
├── js/
│   └── app.js                 # State manager, block registry, exports, and history
├── .github/
│   └── workflows/
│       └── deploy.yml         # Automated GitHub Pages CI/CD workflow
├── LICENSE                    # MIT License
└── README.md                  # Project documentation
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
