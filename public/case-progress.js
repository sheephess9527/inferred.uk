const { caseSlug, siteStatus, caseQuestions } = JSON.parse(document.querySelector('[data-case-config]').dataset.caseConfig);
  if (caseQuestions) window.__inferredDeductionItems = caseQuestions;

  function syncEyebrow() {
    var eyebrow = document.querySelector('[data-case-eyebrow]');
    var text = eyebrow && eyebrow.querySelector('[data-case-eyebrow-text]');
    if (!text) return;
    try {
      var p = localStorage.getItem('inferred:progress:/cases/' + caseSlug);
      if (p === 'solved') text.textContent = '已结案';
      else if (p === 'reading') text.textContent = '推理中';
      else text.textContent = siteStatus === 'solved' ? '已解' : '未解';
    } catch (_) {}
  }
  try {
    var key = 'inferred:progress:/cases/' + caseSlug;
    if (localStorage.getItem(key) !== 'solved') {
      localStorage.setItem(key, 'reading');
    }
  } catch (_) {}
  syncEyebrow();
  window.addEventListener('inferred:case-solved', syncEyebrow);
