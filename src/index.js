/**
 * SPA controller for sidebar + content
 */

const BLOG_INDEX_URL = './src/blogs.json';
const RESUME_URL = 'https://drive.google.com/your-share-id/view?usp=sharing'; // Update to your public resume link

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

// Rendering
function renderHome() {
  const content = document.getElementById('content');
  if (!content) return;
  content.innerHTML = `
      <section class="home-section">
        <h1>Welcome!</h1>
        <p>Hi, I'm Alan. I build things across the stack, experiment with 3D/graphics, and write about what I learn. Use the navigation on the left to explore my projects, read my blogs, or connect via socials.</p>
      </section>
    `;
}

function renderBlogsList(posts) {
  const container = document.getElementById('blogs-list');
  if (!container) return;
  container.innerHTML = '';

  const grouped = groupByMonth(posts);
  if (grouped.length === 0) {
    container.innerHTML = '<p style="opacity:0.8">No blog posts yet.</p>';
    return;
  }

  for (const [monthKey, list] of grouped) {
    const section = document.createElement('div');
    section.className = 'blogs-month';
    section.innerHTML = `<h4>${monthKey}</h4>`;
    const ul = document.createElement('ul');
    for (const post of list) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = post.url;
      a.textContent = post.title;
      a.target = post.external === false ? '_self' : '_blank';
      a.rel = 'noopener';
      li.appendChild(a);
      ul.appendChild(li);
    }
    section.appendChild(ul);
    container.appendChild(section);
  }
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
  document.getElementById('nav-home')?.addEventListener('click', renderHome);
  // Resume is just a link; ensure href always up to date
  const resume = document.getElementById('nav-resume');
  if (resume) resume.setAttribute('href', RESUME_URL);
  // Projects button navigates via inline onclick in HTML
}

document.addEventListener('DOMContentLoaded', async () => {
  wireNav();
  renderHome();
  await loadBlogs();
});
