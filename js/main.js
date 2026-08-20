// Pure Theme - Main JavaScript
(function() {
  'use strict';

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

  // Wrap tables in scrollable containers for overflow handling
  var tables = document.querySelectorAll('.post-body > table');
  for (var i = 0; i < tables.length; i++) {
    var wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';
    tables[i].parentNode.insertBefore(wrapper, tables[i]);
    wrapper.appendChild(tables[i]);
  }

  // Table shadow management: only show shadows when content overflows
  function updateTableShadows() {
    var wrappers = document.querySelectorAll('.table-wrapper');
    for (var i = 0; i < wrappers.length; i++) {
      var w = wrappers[i];
      w.classList.toggle('has-overflow', w.scrollWidth > w.clientWidth);
    }
  }

  // Update on resize and initial load
  window.addEventListener('resize', updateTableShadows);
  updateTableShadows();
})();
