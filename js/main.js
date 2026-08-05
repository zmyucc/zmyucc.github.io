// Pure Theme - Main JavaScript
(function() {
  'use strict';

  // --- Wrap post-body tables in scrollable containers ---
  function wrapTables() {
    var tables = document.querySelectorAll('.post-body table');
    for (var i = 0; i < tables.length; i++) {
      var table = tables[i];
      // Skip tables that are inside a highlight figure (code blocks)
      if (table.closest('figure.highlight')) continue;
      // Skip already-wrapped tables
      if (table.parentNode.classList.contains('table-wrapper')) continue;

      var wrapper = document.createElement('div');
      wrapper.className = 'table-wrapper';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
  }

  wrapTables();

  // Back to top button
  var backToTop = document.createElement('div');
  backToTop.className = 'back-to-top';
  backToTop.innerHTML = '&#8593;';
  backToTop.style.display = 'none';
  document.body.appendChild(backToTop);

  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      backToTop.style.display = 'block';
    } else {
      backToTop.style.display = 'none';
    }
  });

  backToTop.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
