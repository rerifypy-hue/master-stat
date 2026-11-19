// Academic Portal Interactive JS
document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  // Live Search
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const sections = document.querySelectorAll('.section-title, .subsection-title, .callout, .course-card');
      
      if (!query) {
        sections.forEach(el => el.style.opacity = '1');
        return;
      }
      
      sections.forEach(el => {
        const text = el.textContent.toLowerCase();
        if (text.includes(query)) {
          el.style.opacity = '1';
        } else {
          el.style.opacity = '0.25';
        }
      });
    });
  }

  // Sidebar Scrollspy
  const headings = document.querySelectorAll('.section-title[id]');
  const sidebarLinks = document.querySelectorAll('.sidebar-menu a[href^="#"]');

  if (headings.length && sidebarLinks.length) {
    window.addEventListener('scroll', () => {
      let current = '';
      headings.forEach(heading => {
        const top = heading.getBoundingClientRect().top;
        if (top <= 120) {
          current = heading.getAttribute('id');
        }
      });

      sidebarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    });
  }
});
