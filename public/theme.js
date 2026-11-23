(function () {
  var THEME_COLORS = { dark: '#0E0E0C', light: '#E8E2D2' };
  var STATUS_BAR = { dark: 'black-translucent', light: 'default' };
  window.inferredApplyTheme = function (theme) {
    var resolved = theme === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = resolved;
    var themeColor = document.getElementById('meta-theme-color');
    var statusBar = document.getElementById('meta-status-bar');
    if (themeColor) themeColor.setAttribute('content', THEME_COLORS[resolved]);
    if (statusBar) statusBar.setAttribute('content', STATUS_BAR[resolved]);
  };
  try {
    var saved = localStorage.getItem('inferred:theme');
    if (saved === 'light' || saved === 'dark') {
      window.inferredApplyTheme(saved);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      window.inferredApplyTheme('light');
    }
  } catch (e) {}
})();
