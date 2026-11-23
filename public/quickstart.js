const caseIndex = JSON.parse(document.querySelector('[data-case-index]')?.dataset.caseIndex ?? '[]');
  // 继续上次推理
  const resumeCard = document.querySelector('[data-qs-resume]');
  const resumeTitle = document.querySelector('[data-qs-resume-title]');
  if (resumeCard && resumeTitle) {
    try {
      let lastSlug = null;
      let lastTitle = null;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith('inferred:progress:') && localStorage.getItem(k) === 'reading') {
          const casePath = k.replace('inferred:progress:', '');
          const slug = casePath.replace(/^\/cases\//, '');
          const match = caseIndex.find((c) => c.slug === slug);
          if (match) {
            lastSlug = slug;
            lastTitle = match.title;
          }
        }
      }
      if (lastSlug && lastTitle) {
        resumeCard.setAttribute('href', `/cases/${lastSlug}/`);
        resumeTitle.textContent = lastTitle;
        resumeCard.removeAttribute('hidden');
      }
    } catch (_) {}
  }

  // 今日推荐
  const dailyCard = document.querySelector('[data-qs-daily]');
  const dailyTitle = document.querySelector('[data-qs-daily-title]');
  if (dailyCard && dailyTitle && caseIndex.length > 0) {
    const dayIndex = Math.floor(Date.now() / 86400000) % caseIndex.length;
    const pick = caseIndex[dayIndex];
    dailyCard.setAttribute('href', `/cases/${pick.slug}/`);
    dailyTitle.textContent = pick.title;
  }

  // 随机开案
  const randomBtn = document.querySelector('[data-qs-random]');
  if (randomBtn && caseIndex.length > 0) {
    randomBtn.addEventListener('click', () => {
      const pick = caseIndex[Math.floor(Math.random() * caseIndex.length)];
      window.location.href = `/cases/${pick.slug}/`;
    });
  }
