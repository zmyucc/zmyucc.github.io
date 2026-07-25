// Pure Theme - Local Search
(function() {
  'use strict';

  var overlay = document.getElementById('search-overlay');
  var input = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  var closeBtn = document.getElementById('search-close');

  if (!overlay || !input || !results || !closeBtn) return;

  var searchData = null;

  // Load search.xml
  function loadSearchData() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/search.xml', true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        parseSearchData(xhr.responseXML);
      }
    };
    xhr.onerror = function() {
      results.innerHTML = '<div class="search-no-results">Failed to load search data. Make sure hexo-generator-search is installed.</div>';
    };
    xhr.send();
  }

  function parseSearchData(xml) {
    searchData = [];
    var entries = xml.getElementsByTagName('entry');
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var title = entry.getElementsByTagName('title')[0];
      var url = entry.getElementsByTagName('url')[0];
      var content = entry.getElementsByTagName('content')[0];
      var categories = entry.getElementsByTagName('categories')[0];

      searchData.push({
        title: title ? title.textContent : '',
        url: url ? url.textContent : '',
        content: content ? content.textContent : '',
        categories: categories ? categories.textContent : ''
      });
    }
  }

  function doSearch(query) {
    if (!searchData) {
      results.innerHTML = '<div class="search-no-results">Search data loading...</div>';
      return;
    }

    if (!query.trim()) {
      results.innerHTML = '';
      return;
    }

    var q = query.toLowerCase().trim();
    var matches = [];

    for (var i = 0; i < searchData.length; i++) {
      var item = searchData[i];
      var score = 0;

      if (item.title.toLowerCase().indexOf(q) !== -1) {
        score += 10;
      }
      if (item.content.toLowerCase().indexOf(q) !== -1) {
        score += 1;
      }
      if (item.categories.toLowerCase().indexOf(q) !== -1) {
        score += 2;
      }

      if (score > 0) {
        matches.push({ item: item, score: score });
      }
    }

    matches.sort(function(a, b) { return b.score - a.score; });

    if (matches.length === 0) {
      results.innerHTML = '<div class="search-no-results">No results found for "' + escapeHtml(query) + '"</div>';
      return;
    }

    var html = '<ul class="search-results-list">';
    for (var j = 0; j < Math.min(matches.length, 20); j++) {
      var m = matches[j];
      var snippet = getSnippet(m.item.content, q, 120);
      var catHtml = m.item.categories ? '<span class="search-result-category">' + escapeHtml(m.item.categories) + '</span>' : '';
      html += '<li class="search-result-item">';
      html += '<a href="' + m.item.url + '" class="search-result-title">' + highlightMatch(m.item.title, q) + '</a>';
      html += '<div class="search-result-snippet">' + snippet + '</div>';
      html += catHtml;
      html += '</li>';
    }
    html += '</ul>';

    if (matches.length > 20) {
      html += '<div class="search-more">Showing top 20 of ' + matches.length + ' results. Refine your search for more.</div>';
    }

    results.innerHTML = html;
  }

  function getSnippet(content, query, maxLen) {
    var lowerContent = content.toLowerCase();
    var idx = lowerContent.indexOf(query);
    if (idx === -1) {
      return escapeHtml(content.substring(0, maxLen)) + '...';
    }
    var start = Math.max(0, idx - 40);
    var end = Math.min(content.length, idx + query.length + maxLen);
    var snippet = (start > 0 ? '...' : '') + escapeHtml(content.substring(start, end)) + (end < content.length ? '...' : '');
    return snippet;
  }

  function highlightMatch(text, query) {
    var escaped = escapeHtml(text);
    var lower = escaped.toLowerCase();
    var qLower = query.toLowerCase();
    var idx = lower.indexOf(qLower);
    if (idx === -1) return escaped;

    var result = '';
    var lastIdx = 0;
    while (idx !== -1) {
      result += escaped.substring(lastIdx, idx);
      result += '<mark>' + escaped.substring(idx, idx + qLower.length) + '</mark>';
      lastIdx = idx + qLower.length;
      idx = lower.indexOf(qLower, lastIdx);
    }
    result += escaped.substring(lastIdx);
    return result;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function showSearch() {
    overlay.style.display = 'flex';
    input.value = '';
    results.innerHTML = '';
    setTimeout(function() { input.focus(); }, 100);
    document.body.style.overflow = 'hidden';
  }

  function hideSearch() {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Expose showSearch globally
  window.showPureSearch = showSearch;

  // Event listeners
  closeBtn.addEventListener('click', hideSearch);

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      hideSearch();
    }
  });

  input.addEventListener('input', function() {
    doSearch(input.value);
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.style.display === 'flex') {
      hideSearch();
    }
  });

  // Load data on page load
  loadSearchData();
})();
