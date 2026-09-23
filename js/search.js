// Pure Theme - Local Search (lazy loaded with cache)
(function() {
  'use strict';

  var overlay = document.getElementById('search-overlay');
  var input = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  var closeBtn = document.getElementById('search-close');

  if (!overlay || !input || !results || !closeBtn) return;

  var searchData = null;
  var isLoading = false;
  var CACHE_KEY = 'pure-search-data';

  // Load search.xml lazily with sessionStorage cache
  function loadSearchData(callback) {
    // Try cache first
    try {
      var cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        searchData = JSON.parse(cached);
        callback();
        return;
      }
    } catch (e) {
      // sessionStorage unavailable or corrupted, proceed to fetch
    }

    if (isLoading) return;
    isLoading = true;

    results.innerHTML = '<div class="search-no-results">搜索数据加载中...</div>';

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/search.xml', true);
    xhr.onload = function() {
      isLoading = false;
      if (xhr.status === 200) {
        parseSearchData(xhr.responseXML);
        // Cache in sessionStorage
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(searchData));
        } catch (e) {}
        callback();
      }
    };
    xhr.onerror = function() {
      isLoading = false;
      results.innerHTML = '<div class="search-no-results">搜索数据加载失败，请确保已安装 hexo-generator-search 插件。</div>';
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

  // search.xml stores each post body as rendered HTML. Convert it to plain
  // text before matching or showing snippets, otherwise tags such as
  // <p>, <figure class="highlight"> leak into the results as literal text.
  function stripHtml(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return (div.textContent || '').replace(/\s+/g, ' ').trim();
  }

  // Plain-text view of an entry, computed on first use and cached on the item.
  // Stripping here (instead of at parse time) also fixes snippets for entries
  // restored from a stale sessionStorage cache written by an older version.
  function plainContent(item) {
    if (item._text == null) {
      item._text = stripHtml(item.content);
    }
    return item._text;
  }

  function doSearch(query) {
    if (!searchData) {
      results.innerHTML = '<div class="search-no-results">搜索数据加载中...</div>';
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
      var plain = plainContent(item);
      if (plain.toLowerCase().indexOf(q) !== -1) {
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
      results.innerHTML = '<div class="search-no-results">未找到与 "' + escapeHtml(query) + '" 相关的结果</div>';
      return;
    }

    var html = '<ul class="search-results-list">';
    for (var j = 0; j < matches.length; j++) {
      var m = matches[j];
      var snippet = getSnippet(plainContent(m.item), q, 120);
      var catHtml = m.item.categories ? '<span class="search-result-category">' + escapeHtml(m.item.categories) + '</span>' : '';
      html += '<li class="search-result-item">';
      html += '<a href="' + m.item.url + '" class="search-result-title">' + highlightMatch(m.item.title, q) + '</a>';
      html += '<div class="search-result-snippet">' + snippet + '</div>';
      html += catHtml;
      html += '</li>';
    }
    html += '</ul>';

    // Show total count at the bottom
    html += '<div class="search-more">共找到 ' + matches.length + ' 条结果</div>';

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

    // Lazy-load search data when overlay is first opened
    if (!searchData) {
      loadSearchData(function() {
        // If user has already typed something, show results
        if (input.value.trim()) {
          doSearch(input.value);
        } else {
          // Show load completion message
          results.innerHTML = '<div class="search-no-results">搜索数据加载完成，请输入关键词进行搜索</div>';
        }
      });
    }
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

  // Data is now loaded lazily when search is first opened — no preloading
})();
