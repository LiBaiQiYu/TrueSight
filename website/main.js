document.documentElement.classList.add('js');

const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('main-nav');
const themeButtons = [...document.querySelectorAll('[data-theme-choice]')];
const themeColor = document.querySelector('meta[name="theme-color"]');

function applySiteTheme(theme, persist) {
  const next = theme === 'standard' ? 'standard' : 'truesight'
  document.documentElement.dataset.theme = next
  themeButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.themeChoice === next))
  })
  if (themeColor) themeColor.setAttribute('content', next === 'standard' ? '#f4f7fb' : '#f6fbf8')
  if (persist) {
    try {
      localStorage.setItem('truesight.site.theme', next)
    } catch (error) {
      /* localStorage may be unavailable */
    }
  }
}

applySiteTheme(document.documentElement.dataset.theme || 'truesight', false)

themeButtons.forEach((button) => {
  button.addEventListener('click', () => applySiteTheme(button.dataset.themeChoice, true))
})

window.addEventListener('storage', (event) => {
  if (event.key !== 'truesight.site.theme') return
  applySiteTheme(event.newValue || 'truesight', false)
})

function syncHeader() {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 8);
}

syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      document.body.classList.remove('nav-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const copyButtons = document.querySelectorAll('[data-copy]');

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  area.remove();
}

copyButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const text = button.getAttribute('data-copy') || '';
    const previous = button.textContent;
    try {
      await copyText(text);
      button.textContent = '已复制';
      button.classList.add('copied');
      window.setTimeout(() => {
        button.textContent = previous;
        button.classList.remove('copied');
      }, 1400);
    } catch {
      button.textContent = '复制失败';
      window.setTimeout(() => {
        button.textContent = previous;
      }, 1400);
    }
  });
});

const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.getAttribute('data-delay') || 0);
        window.setTimeout(() => entry.target.classList.add('is-visible'), delay);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];

if ('IntersectionObserver' in window && sections.length && navLinks.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
  );
  sections.forEach((section) => sectionObserver.observe(section));
}
