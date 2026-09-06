/**
 * Chronicle Blog - Single Post Page Logic
 * Handles dynamic post rendering, table of contents, reading progress, and interactive comments.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof BLOG_POSTS === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id') || '1';

  const post = BLOG_POSTS.find(p => p.id === postId) || BLOG_POSTS[0];

  if (post) {
    renderPostPage(post);
    initReadingProgress();
    initTableOfContents();
    initShareButtons(post);
    initComments(post.id);
    renderRelatedPosts(post);
  }
});

/* --------------------------------------------------------------------------
   1. Render Post Details
   -------------------------------------------------------------------------- */
function renderPostPage(post) {
  // Update document title
  document.title = `${post.title} — Chronicle`;

  // Breadcrumbs
  const breadcrumbCategory = document.getElementById('breadcrumb-category');
  const breadcrumbTitle = document.getElementById('breadcrumb-title');
  if (breadcrumbCategory) breadcrumbCategory.textContent = post.category;
  if (breadcrumbTitle) breadcrumbTitle.textContent = post.title;

  // Header Elements
  const postCategory = document.getElementById('post-category');
  const postTitle = document.getElementById('post-title');
  const postAuthorAvatar = document.getElementById('post-author-avatar');
  const postAuthorName = document.getElementById('post-author-name');
  const postDate = document.getElementById('post-date');
  const postReadTime = document.getElementById('post-read-time');

  if (postCategory) postCategory.textContent = post.category;
  if (postTitle) postTitle.textContent = post.title;
  if (postAuthorAvatar) {
    postAuthorAvatar.src = post.author.avatar;
    postAuthorAvatar.alt = post.author.name;
  }
  if (postAuthorName) postAuthorName.textContent = post.author.name;
  if (postDate) postDate.textContent = post.date;
  if (postReadTime) postReadTime.textContent = post.readTime;

  // Cover Image
  const coverImg = document.getElementById('post-cover-img');
  const coverCaption = document.getElementById('post-cover-caption');
  if (coverImg) {
    coverImg.src = post.coverImage;
    coverImg.alt = post.title;
  }
  if (coverCaption && post.coverCaption) {
    coverCaption.textContent = post.coverCaption;
  }

  // Article Body
  const articleContent = document.getElementById('article-content');
  if (articleContent) {
    articleContent.innerHTML = post.content;
  }

  // Tags
  const tagsRow = document.getElementById('post-tags-row');
  if (tagsRow) {
    tagsRow.innerHTML = post.tags.map(t => `<span class="tag-badge">#${t}</span>`).join('');
  }

  // Author Bio Box
  const bioAvatar = document.getElementById('bio-author-avatar');
  const bioName = document.getElementById('bio-author-name');
  const bioRole = document.getElementById('bio-author-role');
  const bioDesc = document.getElementById('bio-author-desc');

  if (bioAvatar) bioAvatar.src = post.author.avatar;
  if (bioName) bioName.textContent = post.author.name;
  if (bioRole) bioRole.textContent = post.author.role;
  if (bioDesc) bioDesc.textContent = post.author.bio;
}

/* --------------------------------------------------------------------------
   2. Reading Progress Bar
   -------------------------------------------------------------------------- */
function initReadingProgress() {
  const progressBar = document.getElementById('reading-progress-bar');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  });
}

/* --------------------------------------------------------------------------
   3. Table of Contents Generator
   -------------------------------------------------------------------------- */
function initTableOfContents() {
  const tocList = document.getElementById('toc-list');
  const articleContent = document.getElementById('article-content');
  if (!tocList || !articleContent) return;

  const headings = articleContent.querySelectorAll('h2');
  if (headings.length === 0) {
    const tocCard = document.querySelector('.toc-card');
    if (tocCard) tocCard.style.display = 'none';
    return;
  }

  tocList.innerHTML = '';
  headings.forEach((heading, index) => {
    const anchorId = `section-${index + 1}`;
    heading.id = anchorId;

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${anchorId}`;
    a.textContent = heading.textContent;
    li.appendChild(a);
    tocList.appendChild(li);
  });

  // Highlight active TOC item on scroll
  window.addEventListener('scroll', () => {
    let current = '';
    headings.forEach(heading => {
      const top = heading.getBoundingClientRect().top;
      if (top <= 140) {
        current = heading.id;
      }
    });

    tocList.querySelectorAll('a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  });
}

/* --------------------------------------------------------------------------
   4. Share Buttons
   -------------------------------------------------------------------------- */
function initShareButtons(post) {
  const copyBtn = document.getElementById('share-copy-btn');
  const twitterBtn = document.getElementById('share-twitter-btn');
  const linkedinBtn = document.getElementById('share-linkedin-btn');

  const pageUrl = window.location.href;
  const pageTitle = encodeURIComponent(post.title);

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(pageUrl).then(() => {
        if (typeof showToast === 'function') {
          showToast('Article link copied to clipboard!');
        }
      }).catch(() => {
        if (typeof showToast === 'function') {
          showToast('Unable to copy link.');
        }
      });
    });
  }

  if (twitterBtn) {
    twitterBtn.addEventListener('click', () => {
      const tweetUrl = `https://twitter.com/intent/tweet?text=${pageTitle}&url=${encodeURIComponent(pageUrl)}`;
      window.open(tweetUrl, '_blank', 'noopener,noreferrer');
    });
  }

  if (linkedinBtn) {
    linkedinBtn.addEventListener('click', () => {
      const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
      window.open(liUrl, '_blank', 'noopener,noreferrer');
    });
  }
}

/* --------------------------------------------------------------------------
   5. Interactive Comments
   -------------------------------------------------------------------------- */
function getComments(postId) {
  const stored = localStorage.getItem(`chronicle_comments_${postId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // Fallback
    }
  }

  if (typeof INITIAL_COMMENTS !== 'undefined' && INITIAL_COMMENTS[postId]) {
    return INITIAL_COMMENTS[postId];
  }

  return [];
}

function saveComments(postId, comments) {
  localStorage.setItem(`chronicle_comments_${postId}`, JSON.stringify(comments));
}

function initComments(postId) {
  const commentsList = document.getElementById('comments-list');
  const commentsCount = document.getElementById('comments-count');
  const commentForm = document.getElementById('comment-form');

  function render() {
    const comments = getComments(postId);
    if (commentsCount) {
      commentsCount.textContent = `(${comments.length})`;
    }

    if (!commentsList) return;

    if (comments.length === 0) {
      commentsList.innerHTML = `
        <div style="text-align:center; padding: 2rem; color: var(--text-muted);">
          Be the first to share your thoughts on this story!
        </div>
      `;
      return;
    }

    commentsList.innerHTML = comments.map(c => `
      <div class="comment-item">
        <img class="comment-avatar" src="${c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}" alt="${c.author}" />
        <div class="comment-content">
          <div class="comment-meta">
            <span class="comment-author-name">${c.author}</span>
            <span class="comment-date">${c.date}</span>
          </div>
          <p class="comment-text">${c.text}</p>
        </div>
      </div>
    `).join('');
  }

  render();

  if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('comment-name');
      const textInput = document.getElementById('comment-text');

      if (!nameInput.value.trim() || !textInput.value.trim()) return;

      const newComment = {
        id: 'c_' + Date.now(),
        author: nameInput.value.trim(),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        date: 'Just now',
        text: textInput.value.trim()
      };

      const currentComments = getComments(postId);
      currentComments.push(newComment);
      saveComments(postId, currentComments);

      render();
      commentForm.reset();

      if (typeof showToast === 'function') {
        showToast('Your comment was posted successfully!');
      }
    });
  }
}

/* --------------------------------------------------------------------------
   6. Related Posts
   -------------------------------------------------------------------------- */
function renderRelatedPosts(currentPost) {
  const container = document.getElementById('related-posts-grid');
  if (!container || typeof BLOG_POSTS === 'undefined') return;

  // Find posts in the same category, or fallback to any other posts
  let related = BLOG_POSTS.filter(p => p.id !== currentPost.id && p.category === currentPost.category);
  if (related.length < 2) {
    const others = BLOG_POSTS.filter(p => p.id !== currentPost.id && !related.includes(p));
    related = [...related, ...others].slice(0, 2);
  } else {
    related = related.slice(0, 2);
  }

  container.innerHTML = related.map(post => `
    <article class="post-card">
      <div class="card-img-wrap">
        <a href="post.html?id=${post.id}">
          <img src="${post.coverImage}" alt="${post.title}" loading="lazy" />
        </a>
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
  `).join('');
}
