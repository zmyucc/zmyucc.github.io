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
})();
