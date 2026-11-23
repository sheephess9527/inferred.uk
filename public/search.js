  window.addEventListener('DOMContentLoaded', function () {
    if (typeof PagefindUI === 'undefined') {
      var fb = document.getElementById('search-fallback');
      if (fb) fb.hidden = false;
      return;
    }
    var ui = new PagefindUI({
      element: '#pagefind-search',
      showSubResults: false,
      showImages: false,
      excerptLength: 24,
      translations: {
        placeholder: '搜索案卷、线索、诡计类型…',
        clear_search: '清空',
        load_more: '加载更多结果',
        search_label: '站内搜索',
        zero_results: '没有找到与「[SEARCH_TERM]」相关的内容',
        many_results: '找到 [COUNT] 条与「[SEARCH_TERM]」相关的结果',
        one_result: '找到 [COUNT] 条与「[SEARCH_TERM]」相关的结果',
        searching: '正在搜索「[SEARCH_TERM]」…',
      },
    });
    // 支持 /search/?q=关键词 直达（首页 WebSite SearchAction 也指向该格式）
    var q = new URLSearchParams(window.location.search).get('q');
    if (q) ui.triggerSearch(q);
  });
