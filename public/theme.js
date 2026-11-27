(function () {
  var THEME_KEY = 'inferred:theme';
  var THEME_COLORS = { dark: '#181816', light: '#F6F4EF' };
  var STATUS_BAR = { dark: 'black-translucent', light: 'default' };
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

  function storedTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      return saved === 'light' || saved === 'dark' ? saved : null;
    } catch (e) {
      return null;
    }
  }

  function systemTheme() {
    return media && media.matches ? 'light' : 'dark';
  }

  window.inferredStoredTheme = storedTheme;
  window.inferredSystemTheme = systemTheme;

  window.inferredApplyTheme = function (theme) {
    var resolved = theme === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = resolved;
    var themeColor = document.getElementById('meta-theme-color');
    var statusBar = document.getElementById('meta-status-bar');
    if (themeColor) themeColor.setAttribute('content', THEME_COLORS[resolved]);
    if (statusBar) statusBar.setAttribute('content', STATUS_BAR[resolved]);
  };

  window.inferredApplyTheme(storedTheme() || systemTheme());

  if (media) {
    var onChange = function () {
      if (!storedTheme()) {
        window.inferredApplyTheme(systemTheme());
        window.dispatchEvent(new CustomEvent('inferred:theme-changed'));
      }
    };
    if (media.addEventListener) media.addEventListener('change', onChange);
    else if (media.addListener) media.addListener(onChange);
  }
})();
