import { marked } from 'marked';

/**
 * SPA controller for sidebar + content
 */

const BLOG_INDEX_URL = './static/assets/blogs/index.json';
const RESUME_URL = 'https://docs.google.com/document/d/1k2DykOWzGUJDyEUucN_9BKA7eyEeuJnOn75vVY4Cdjs/edit?tab=t.0'; // Update to your public resume link
let HOME_HTML = '';

// Helpers
function toMonthKey(dateStr) {
  // dateStr format 'YYYY-MM-DD' or 'YYYY-MM'
  const [y, m] = dateStr.split('-');
  return `${y}-${m}`;
}

function groupByMonth(posts) {
  // { 'YYYY-MM': [post, ...], ... } sorted desc by key
  const buckets = {};
  for (const p of posts) {
    if (!p?.date || !p?.title || !p?.url) continue;
    const key = toMonthKey(p.date);
    (buckets[key] ||= []).push(p);
  }
  // sort each month by date desc
  Object.values(buckets).forEach(list => list.sort((a,b) => (b.date > a.date ? 1 : -1)));
  // return entries sorted by YYYY-MM desc
  return Object.entries(buckets).sort((a,b) => (a[0] < b[0] ? 1 : -1));
}


function renderBlogsList(posts) {
  const container = document.getElementById('blogs-list');
  if (!container) return;
  container.innerHTML = '';

  if (!Array.isArray(posts) || posts.length === 0) {
    container.innerHTML = '<p style="opacity:0.8">No blog posts yet.</p>';
    return;
  }

  // Sort by title ascending
  const sorted = [...posts].sort((a, b) => (a.title || '').localeCompare(b.title || ''));

  const ul = document.createElement('ul');
  for (const post of sorted) {
    if (!post?.title || !post?.path) continue;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = post.title;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      showBlog(post.path, post.title);
    });
    li.appendChild(a);
    ul.appendChild(li);
  }
  container.appendChild(ul);
}

async function showBlog(mdPath, title) {
  const content = document.getElementById('content');
  if (!content) return;
  try {
    const res = await fetch(mdPath, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const md = await res.text();
    const html = marked.parse(md);
    content.innerHTML = `
      <article class="blog-post">
        <h1>${title}</h1>
        ${html}
      </article>
    `;
    window.scrollTo(0, 0);
  } catch (e) {
    content.innerHTML = `<p style="color:#f88">Failed to load blog: ${title}</p>`;
  }
}

function renderProjects() {
  const content = document.getElementById('content');
  if (!content) return;
  content.innerHTML = `
    <section id="projects-host" class="projects-section">
      <iframe class="projects-frame" src="./src/portfolio.html" title="Projects"></iframe>
    </section>
  `;
  window.scrollTo(0, 0);
}
// Events + init
async function loadBlogs() {
  try {
    const res = await fetch(BLOG_INDEX_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const posts = await res.json();
    renderBlogsList(posts);
  } catch (e) {
    const container = document.getElementById('blogs-list');
    if (container) container.innerHTML = '<p style="color:#f88">Failed to load blogs.</p>';
    // console.error(e);
  }
}

function wireNav() {
  const homeBtn = document.getElementById('nav-home');
  if (homeBtn) {
    homeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const content = document.getElementById('content');
      if (content) {
        content.innerHTML = HOME_HTML;
        window.scrollTo(0, 0);
      }
    });
  }

  const resume = document.getElementById('nav-resume');
  if (resume) resume.setAttribute('href', RESUME_URL);

  // Projects button navigates via inline onclick in HTML
}

document.addEventListener('DOMContentLoaded', async () => {
  const content = document.getElementById('content');
  if (content) HOME_HTML = content.innerHTML;
  wireNav();
  await loadBlogs();
});
