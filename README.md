# MiniAsk — Privacy-First Developer Q&A

MiniAsk is a privacy-first developer Q&A website and offline heuristic demo answer engine refactored exclusively with pure **HTML5, CSS3, and Vanilla JavaScript**.

It requires **no build tools, no Node.js backend, no external databases, and no third-party AI APIs**. Everything runs client-side in standard web browsers, with state and preferences stored securely in browser `LocalStorage`.

---

## 🎨 Approved Brand Palette

The user interface strictly adheres to the four approved brand colors:

| Color Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Maroon** | `#790D16` | Brand identity, primary CTAs, active highlights, key borders |
| **Beige** | `#E5D3AF` | Card borders, category tags, secondary badges, soft accents |
| **Ivory** | `#F5EFE1` | Light page canvas, typography on dark surfaces |
| **Powder Blue** | `#AEC4D4` | Accent pill tags, focus indicators, code syntax highlights |

Both **Light** and **Dark** themes are built exclusively using custom CSS variables derived from this palette, providing high contrast and smooth transitions.

---

## 📂 Project Structure

```text
mini-ask/
├── frontend/
│   ├── index.html          # Main application page (Semantic HTML5)
│   ├── css/
│   │   └── style.css       # Responsive styling, CSS variables & themes
│   ├── js/
│   │   ├── main.js         # Core application logic, event listeners & rendering
│   │   ├── questions.js    # Seed Q&A dataset & offline heuristic demo answer engine
│   │   ├── storage.js      # Type-safe Browser LocalStorage persistence controller
│   │   └── utils.js        # Formatting, toasts, clipboard, and syntax helpers
│   ├── assets/
│   │   ├── images/
│   │   │   ├── logo.svg               # Scalable SVG brand logo
│   │   │   └── hero-illustration.svg  # Context sanitization vector graphic
│   │   └── icons/
│   │       ├── favicon.svg            # Scalable SVG favicon
│   │       ├── 32x32.png              # Standard desktop icon
│   │       ├── 128x128.png            # High-res application icon
│   │       └── icon.ico               # Windows desktop icon
│   └── README.md           # Frontend-specific documentation
├── .gitignore              # Clean gitignore for static web repository
└── README.md               # Main project documentation
```

---

## ✨ Features

- **Responsive Landing Page & Navigation**: Sticky header with logo, mobile drawer navigation, live bookmarks badge, and smooth anchor scrolling.
- **Interactive Question Input & Heuristic Answer Engine**:
  - Instant client-side analysis of queries.
  - Transparently labeled as a heuristic demo engine (no claims of real cloud AI).
  - Generates technical diagnoses and formatted code solutions with a 1-click **Copy Code** button.
  - Option to **Publish to Community Feed** directly, persisting to `LocalStorage`.
- **Trending Question Suggestions**: Clickable prompt pills for rapid testing of common scenarios (Python `TypeError`, CORS headers, CSS centering, local Ollama, SQLite WAL mode).
- **Community Q&A Feed**:
  - Pre-populated with realistic questions across multiple domains.
  - Author avatars, category badges, relative timestamps, view counts, and net votes.
  - Expandable and collapsible answer drawers with syntax-styled code snippets.
- **Search, Filter & Sort Controls**:
  - Live debounce search filtering across question titles, body text, answers, and tags.
  - Category pill filter tabs (All, Frontend, Backend, Security, Python, Desktop).
  - Sort by: Most Recent, Highest Upvoted, Most Viewed.
  - Toggle filter: **★ Saved Only** to view bookmarked questions.
- **Voting System**: Interactive upvote and downvote controls with per-user vote state saved to `LocalStorage`.
- **Bookmarks & Saved Questions**: Favorite questions with instantaneous star toggling and notification feedback.
- **Dark and Light Theme Toggle**: Seamless switch between light and dark modes with persistent memory.
- **Client-Side Form Validation**: Real-time feedback and validation on the contact/feedback form (required fields, email format, minimum length).
- **Accessible & Micro-Animated**: Semantic HTML5 tags, ARIA attributes, keyboard support, and smooth transitions.
- **Reset Demo Seeds**: Dedicated button in the footer to restore initial demo data at any time.

---

## 🚀 How to Run Locally

Because this project is a pure static website with relative asset paths and zero local `fetch()` calls:

### Option 1: Direct File Open (Zero Dependencies)
1. Open File Explorer.
2. Navigate to `frontend/index.html`.
3. Double-click `index.html` to open directly in your web browser (`file:///...`).
4. All features, styling, and LocalStorage persistence work immediately!

### Option 2: Local HTTP Server (Optional)
If you prefer testing via `http://localhost`:

**Python 3:**
```bash
cd frontend
python -m http.server 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

**VS Code Live Server:**
Open the project in VS Code, right-click `frontend/index.html`, and choose **Open with Live Server**.

---

## 🌐 Deploying to GitHub Pages

1. Push this repository to GitHub.
2. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment**:
     - Source: **Deploy from a branch**
     - Branch: `main` (or `master`)
     - Folder: `/ (root)` or `/frontend`
   - Click **Save**.
3. Your site will be published at:
   ```text
   https://<username>.github.io/<repository-name>/frontend/
   ```

---

## 🔒 Privacy & Architecture Notes

- **Zero Outgoing Network Calls**: The website makes zero external API requests.
- **Client-Side Persistence**: All votes, custom questions, bookmarks, feedback messages, and theme preferences reside purely inside the user's browser `LocalStorage`.
- **Extensible Heuristics**: Additional rules can be added in `frontend/js/questions.js` under the `generateDemoAnswer` method.

---

## 📄 License

MIT License — Feel free to use and extend for personal or commercial developer tools.
