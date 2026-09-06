# Chronicle — Modern General Blog Website

A responsive, high-performance general blog website built with clean semantic HTML5, modern CSS3 (custom properties design system with dark/light themes), and modular vanilla JavaScript.

---

## ✨ Features

- 🌓 **Dark & Light Mode**: Seamless theme switcher with OS preference detection and `localStorage` persistence.
- 📱 **Fully Responsive**: Mobile-first layout with smooth navigation drawer, fluid typography, and responsive CSS grid.
- 📖 **Dynamic Article Reader (`post.html`)**: Deep-linkable via `?id=...` parameter (e.g. `post.html?id=1`), reading progress indicator, automatic Table of Contents generator with active scroll spy.
- 💬 **Interactive Comments**: Users can submit comments with instantaneous preview and persistent `localStorage` storage.
- 🔍 **Live Search & Filter**: Instant search by article titles, keywords, excerpts, or author names; category tabs (Technology, Lifestyle, Travel, Science, Culture) and interactive tags cloud.
- 🔖 **Bookmarking System**: Save favorite articles for later reading with local storage persistence.
- 📬 **Newsletter & Feedback**: Subscription forms and contact forms with animated toast feedback.
- 🚀 **Zero Dependencies**: Pure HTML, CSS, and vanilla JS. Works right out of the box in any browser without needing `npm install` or bundlers.

---

## 📂 Project Structure

```
website/
├── index.html          # Homepage (Hero story, category tabs, live search, article grid, sidebar)
├── post.html           # Single article viewer (TOC, progress bar, share buttons, comments)
├── about.html          # About the publication, manifesto, impact stats, editorial team
├── contact.html        # Interactive contact form, editorial details, FAQ accordion
├── css/
│   └── style.css       # Design tokens, dark/light themes, typography, layout, animations
├── js/
│   ├── posts-data.js   # Structured article dataset & initial comments
│   ├── app.js          # Core app logic: themes, search, filter, bookmarks, toasts, mobile menu
│   └── post.js         # Single post loader, table of contents, progress tracker, comments
└── README.md           # Documentation
```

---

## 🚀 How to Run & Preview

You can open `index.html` directly in any web browser by double-clicking it or using a local development server:

### Option 1: Direct File Opening
Double click `index.html` in your file explorer or open with Google Chrome, Microsoft Edge, or Firefox.

### Option 2: Using Node.js `npx serve`
```bash
npx serve .
```

### Option 3: Using Python
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

---

## 🛠️ Adding New Articles

To add or modify blog posts, simply update the array in [`js/posts-data.js`](file:///c:/Users/Lapzone.pk/Desktop/website/js/posts-data.js):

```javascript
{
  id: "7",
  slug: "your-article-slug",
  title: "Your Article Title",
  excerpt: "Brief summary shown on cards...",
  category: "Technology", // e.g. Technology, Lifestyle, Travel, Science, Culture
  tags: ["Tech", "Future"],
  author: {
    name: "Your Name",
    role: "Writer",
    avatar: "https://...",
    bio: "Brief author bio..."
  },
  date: "Sep 6, 2026",
  readTime: "5 min read",
  featured: false,
  views: "1.2k",
  coverImage: "https://...",
  coverCaption: "Photo caption...",
  content: `<p>Your article content in HTML...</p>`
}
```
All cards, category filters, searches, and the article reader will automatically pick up the new post!
