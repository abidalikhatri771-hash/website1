/**
 * Chronicle Blog - Main Application Logic
 * Handles themes, mobile navigation, search & filters, bookmarks, and toasts.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initScrollTop();
  initNewsletterForms();
  initFAQ();

  // If on Homepage
  if (document.getElementById('posts-grid')) {
    initHomePage();
  }
});

/* --------------------------------------------------------------------------
   1. Theme Management (Dark / Light Mode)
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('chronicle_theme');
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('chronicle_theme', newTheme);
      updateThemeIcon(newTheme);
      showToast(`Switched to ${newTheme} mode`);
    });
  }
}

function updateThemeIcon(theme) {
  const iconContainer = document.querySelector('#theme-toggle .theme-icon');
  if (!iconContainer) return;

  if (theme === 'dark') {
    // Sun icon for switching to light
    iconContainer.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    `;
  } else {
    // Moon icon for switching to dark
    iconContainer.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    `;
  }
}

/* --------------------------------------------------------------------------
   2. Mobile Navigation Toggle
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const menuToggle = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
      }
    });
  }
}

/* --------------------------------------------------------------------------
   3. Scroll to Top Floating Button
   -------------------------------------------------------------------------- */
function initScrollTop() {
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  if (!scrollTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --------------------------------------------------------------------------
   4. Toast Notifications
   -------------------------------------------------------------------------- */
function showToast(message) {
  let toast = document.getElementById('site-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'site-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
    <span>${message}</span>
  `;

  toast.classList.add('show');

  if (window.toastTimeout) {
    clearTimeout(window.toastTimeout);
  }

  window.toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* --------------------------------------------------------------------------
   5. Bookmarks Storage
   -------------------------------------------------------------------------- */
function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem('chronicle_bookmarks')) || [];
  } catch (e) {
    return [];
  }
}

function toggleBookmark(postId) {
  let bookmarks = getBookmarks();
  const index = bookmarks.indexOf(postId);
  let isBookmarked = false;

  if (index > -1) {
    bookmarks.splice(index, 1);
    showToast('Removed from your saved articles');
  } else {
    bookmarks.push(postId);
    isBookmarked = true;
    showToast('Saved to your bookmarks');
  }

  localStorage.setItem('chronicle_bookmarks', JSON.stringify(bookmarks));

  // Update bookmark button appearance on page
  document.querySelectorAll(`.card-bookmark-btn[data-id="${postId}"]`).forEach(btn => {
    btn.classList.toggle('bookmarked', isBookmarked);
  });
}

/* --------------------------------------------------------------------------
   6. Homepage Logic (Search, Filter, Render)
   -------------------------------------------------------------------------- */
let activeCategory = 'all';
let searchQuery = '';

function initHomePage() {
  renderHeroPost();
  renderArticles();
  renderTrending();
  renderTags();
  setupFilterListeners();
}

function renderHeroPost() {
  const heroContainer = document.getElementById('hero-spotlight');
  if (!heroContainer || typeof BLOG_POSTS === 'undefined') return;

  const heroPost = BLOG_POSTS.find(p => p.featured) || BLOG_POSTS[0];
  if (!heroPost) return;

  heroContainer.innerHTML = `
    <div class="hero-card">
      <div class="hero-img-wrap">
        <a href="post.html?id=${heroPost.id}">
          <img src="${heroPost.coverImage}" alt="${heroPost.title}" loading="eager" />
        </a>
      </div>
      <div class="hero-content">
        <span class="featured-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          Featured Story
        </span>
        <span class="category-badge">${heroPost.category}</span>
        <h1 class="hero-title">
          <a href="post.html?id=${heroPost.id}">${heroPost.title}</a>
        </h1>
        <p class="hero-excerpt">${heroPost.excerpt}</p>
        <div class="post-meta">
          <img class="author-avatar" src="${heroPost.author.avatar}" alt="${heroPost.author.name}" />
          <div class="author-info">
            <span class="author-name">${heroPost.author.name}</span>
            <div class="meta-details">
              <span>${heroPost.date}</span>
              <span class="meta-dot">•</span>
              <span>${heroPost.readTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderArticles() {
  const grid = document.getElementById('posts-grid');
  if (!grid || typeof BLOG_POSTS === 'undefined') return;

  const bookmarks = getBookmarks();

  // Filter posts
  const filtered = BLOG_POSTS.filter(post => {
    // Exclude featured hero from main list if 'all' is selected and no search
    const matchesCategory = activeCategory === 'all' || post.category.toLowerCase() === activeCategory.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === '' || 
      post.title.toLowerCase().includes(query) || 
      post.excerpt.toLowerCase().includes(query) || 
      post.tags.some(t => t.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No articles found</h3>
        <p>Try searching for a different keyword or select another category.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(post => {
    const isBookmarked = bookmarks.includes(post.id);
    return `
      <article class="post-card">
        <div class="card-img-wrap">
          <a href="post.html?id=${post.id}">
            <img src="${post.coverImage}" alt="${post.title}" loading="lazy" />
          </a>
          <button class="card-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
                  data-id="${post.id}" 
                  title="Bookmark article"
                  aria-label="Bookmark article">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        </div>
        <div class="card-body">
          <span class="category-badge">${post.category}</span>
          <h3 class="card-title">
            <a href="post.html?id=${post.id}">${post.title}</a>
          </h3>
          <p class="card-excerpt">${post.excerpt}</p>
          <div class="card-footer">
            <div class="card-author">
              <img src="${post.author.avatar}" alt="${post.author.name}" />
              <span class="card-author-name">${post.author.name}</span>
            </div>
            <span class="card-date">${post.readTime}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Attach bookmark events
  grid.querySelectorAll('.card-bookmark-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-id');
      toggleBookmark(id);
    });
  });
}

function renderTrending() {
  const trendingContainer = document.getElementById('trending-list');
  if (!trendingContainer || typeof BLOG_POSTS === 'undefined') return;

  const sortedByViews = [...BLOG_POSTS].sort((a, b) => parseFloat(b.views) - parseFloat(a.views)).slice(0, 4);

  trendingContainer.innerHTML = sortedByViews.map((post, idx) => `
    <li class="trending-item">
      <span class="trending-num">0${idx + 1}</span>
      <div class="trending-text">
        <h4><a href="post.html?id=${post.id}">${post.title}</a></h4>
        <span>${post.date} • ${post.views} views</span>
      </div>
    </li>
  `).join('');
}

function renderTags() {
  const tagsContainer = document.getElementById('tags-cloud');
  if (!tagsContainer || typeof BLOG_POSTS === 'undefined') return;

  const allTags = new Set();
  BLOG_POSTS.forEach(p => p.tags.forEach(t => allTags.add(t)));

  tagsContainer.innerHTML = Array.from(allTags).map(tag => `
    <button class="tag-badge" data-tag="${tag}">${tag}</button>
  `).join('');

  tagsContainer.querySelectorAll('.tag-badge').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.getAttribute('data-tag');
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.value = tag;
        searchQuery = tag;
        renderArticles();
        showToast(`Filtered by tag: ${tag}`);
      }
    });
  });
}

function setupFilterListeners() {
  // Category tabs
  const tabs = document.querySelectorAll('.category-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.getAttribute('data-category');
      renderArticles();
    });
  });

  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderArticles();
    });
  }
}

/* --------------------------------------------------------------------------
   7. Newsletter Subscription & Contact Forms
   -------------------------------------------------------------------------- */
function initNewsletterForms() {
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast(`Subscribed successfully! Welcome aboard.`);
        input.value = '';
      }
    });
  });
}

/* --------------------------------------------------------------------------
   8. FAQ Accordion
   -------------------------------------------------------------------------- */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        faqItems.forEach(i => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });
}
