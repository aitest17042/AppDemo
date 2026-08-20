(function () {
  var workspaceLayout = document.getElementById('workspaceLayout');
  var knowledgeBase = window.HSBCKnowledgeBase || null;

  if (!workspaceLayout) {
    return;
  }

  var navigationStateKey = 'hsbc-presenter-navigation-open';
  var featuredTopicOrder = ['account-opening-start', 'fx-hedging-flow', 'mainland-branch-flow'];
  var topicPageById = {
    'account-opening-start': 'app_account-opening-start.html',
    'fx-hedging-flow': 'app_fx-hedging.html',
    'mainland-branch-flow': 'app_mainland-branch.html'
  };
  var topicDemoScripts = {
    'account-opening-start': [
      { kind: 'text', value: '我最近被人炒咗，我唔想再做社畜啦，我要做拉麵店老闆！但係要點做' },
      { kind: 'text', value: '未啊' },
      { kind: 'text', value: 'HK?' },
      { kind: 'text', value: '哦，好，授權' },
      { kind: 'upload', value: '', label: '上傳自拍 + 身分證明文件' },
      { kind: 'text', value: '確認囉' },
      { kind: 'text', value: '公司名稱「拉王有限公司」，1 名董事兼股東，主要經營拉麵餐廳，計劃於九龍開業' },
      { kind: 'text', value: 'e-sign' }
    ],
    'fx-hedging-flow': [
      { kind: 'text', value: 'ok' },
      { kind: 'text', value: '進行交易' },
      { kind: 'text', value: '同意' },
      { kind: 'text', value: '直接做' },
      { kind: 'text', value: '確認' }
    ],
    'mainland-branch-flow': [
      { kind: 'text', value: '最近生意幾好，您有什麼建議嗎？' },
      { kind: 'text', value: '同意' },
      { kind: 'text', value: '大灣區試點店（Top Choice）' },
      { kind: 'text', value: '立即開立內地戶口' },
      { kind: 'text', value: '授權' },
      { kind: 'text', value: '瀏覽 HSBC Verified Partner' }
    ]
  };

  var currentPageId = document.body.getAttribute('data-page-id') || '';
  var rootPathPrefix = getRootPathPrefix();
  var demoPages = [
    {
      id: 'lock-screen',
      path: 'loks_account-opening.html',
      kicker: 'Entry',
      title: 'Lock Screen',
      description: '從鎖屏通知進入已登入的外匯對沖示範。'
    },
    {
      id: 'assistant-account-opening-start',
      path: 'app_account-opening-start.html',
      kicker: 'Demo 01',
      title: '開戶',
      description: '未登入狀態的開戶示範頁。'
    },
    {
      id: 'assistant-fx-hedging',
      path: 'app_fx-hedging.html',
      kicker: 'Demo 02',
      title: '外匯對沖',
      description: '已登入狀態的外匯對沖示範頁，包含分析、優惠推廣與交易確認。'
    },
    {
      id: 'assistant-mainland-branch',
      path: 'app_mainland-branch.html',
      kicker: 'Demo 03',
      title: '拓展內地分店',
      description: '已登入狀態的內地分店拓展示範頁。'
    }
  ];
  var videoPages = [
    {
      id: 'feature-demo-account-opening',
      path: 'vid_v1.html',
      kicker: 'Feature 01',
      title: '基本功能及外部 API 連結',
      description: '以開戶 flow 示範基本對話、文件上傳與證件分析。',
      topicLabel: '開戶'
    },
    {
      id: 'feature-demo-fx-hedging',
      path: 'vid_v2.html',
      kicker: 'Feature 02',
      title: '用戶行為分析及軟性產品推廣',
      description: '以外匯對沖 flow 示範行為分析、優惠推廣與交易引導。',
      topicLabel: '外匯對沖'
    },
    {
      id: 'feature-demo-mainland-expansion',
      path: 'vid_v3.html',
      kicker: 'Feature 03',
      title: '諮詢功能及大數據分析',
      description: '以拓展內地分店 flow 示範諮詢功能及大數據分析。',
      topicLabel: '拓展內地分店'
    },
    {
      id: 'video-mainland-expansion',
      path: 'vid_v4.html',
      kicker: 'Video 04',
      title: 'Mainland Branch Expansion Film',
      description: 'Original standalone cinematic playback for the branch expansion journey.',
      topicLabel: '拓展內地分店'
    },
  ];
  var allPages = demoPages.concat(videoPages);

  function getRootPathPrefix() {
    var pathname = window.location.pathname || '';

    return /\/vid\/[^/]+$/i.test(pathname) ? '../' : './';
  }

  function getPageHref(path, queryString) {
    var href = rootPathPrefix + path;

    if (queryString) {
      href += queryString.charAt(0) === '?' ? queryString : '?' + queryString;
    }

    return href;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function getTopicEntries() {
    if (!knowledgeBase || !Array.isArray(knowledgeBase.knowledgeBase)) {
      return [];
    }

    return knowledgeBase.knowledgeBase.filter(function (entry) {
      return entry.flow && entry.flow.startStepId;
    }).map(function (entry, index) {
      var flow = entry.flow || {};
      var topicId = typeof entry.topicId === 'string' && entry.topicId
        ? entry.topicId
        : (typeof flow.id === 'string' && flow.id ? flow.id : String(entry.trigger || ''));
      var demoScript = topicDemoScripts[topicId] || [];
      var featuredIndex = featuredTopicOrder.indexOf(topicId);
      var steps = Array.isArray(flow.steps) ? flow.steps : [];
      var lastStep = steps.length > 0 ? steps[steps.length - 1] : null;
      var introResponses = Array.isArray(flow.introResponses) ? flow.introResponses : [];
      var lastIntro = introResponses.length > 0 ? introResponses[introResponses.length - 1] : null;
      var title = String(entry.trigger || 'Topic ' + (index + 1)).split('/')[0].trim();
      var starter = Array.isArray(entry.keywords) && entry.keywords.length > 0 ? entry.keywords[0] : title;
      var defaultCopy = demoScript.find(function (step) {
        return step.kind === 'text' && step.value;
      });
      var summaryEnabled = Boolean(
        lastStep &&
        lastStep.prompt &&
        typeof lastStep.prompt.content === 'string' &&
        /摘要|確認/.test(lastStep.prompt.content)
      );

      return {
        featuredIndex: featuredIndex,
        topicId: topicId,
        title: title,
        starter: starter,
        defaultCopy: defaultCopy ? defaultCopy.value : starter,
        stepsCount: steps.length,
        hasSummaryConfirm: summaryEnabled,
        demoScript: demoScript,
        copy: lastIntro && lastIntro.content
          ? lastIntro.content
          : 'Open the guided conversation flow for this topic.',
        href: getPageHref(topicPageById[topicId] || 'app_account-opening-start.html')
      };
    }).filter(function (topic) {
      return topic.featuredIndex !== -1;
    }).sort(function (left, right) {
      return left.featuredIndex - right.featuredIndex;
    });
  }

  function renderTopicDemoScript(topic) {
    if (!Array.isArray(topic.demoScript) || topic.demoScript.length === 0) {
      return '';
    }

    return '' +
      '<div class="navigation-topic-script">' +
        '<span class="navigation-topic-script-label">Demo Inputs</span>' +
        '<div class="navigation-topic-script-list">' +
          topic.demoScript.map(function (step, index) {
            var label = step.label || step.value || '';
            return '' +
              '<button class="navigation-topic-script-btn' + (step.kind === 'upload' ? ' is-upload' : '') + '" type="button" data-demo-kind="' + escapeHtml(step.kind || 'text') + '" data-demo-text="' + escapeHtml(step.value || '') + '" title="' + escapeHtml(label) + '">' +
                '<span class="navigation-topic-script-index">' + String(index + 1) + '</span>' +
                '<span class="navigation-topic-script-text">' + escapeHtml(label) + '</span>' +
              '</button>';
          }).join('') +
        '</div>' +
      '</div>';
  }

  function renderTopicCards(topicEntries) {
    if (!topicEntries.length) {
      return '';
    }

    function getCopyLabel(copyText) {
      return 'Copy: ' + copyText;
    }

    return '' +
      '<section class="navigation-section">' +
        '<p class="navigation-section-label">Assistant Topics</p>' +
        '<div class="navigation-topic-list">' +
          topicEntries.map(function (topic) {
            var metaParts = [];

            if (topic.stepsCount > 0) {
              metaParts.push(topic.stepsCount + ' Steps');
            }

            if (topic.hasSummaryConfirm) {
              metaParts.push('Summary Confirm');
            }

            return '' +
              '<a class="navigation-topic-button" href="' + escapeHtml(topic.href) + '">' +
                '<span class="navigation-topic-button-title">' + escapeHtml(topic.title) + '</span>' +
                '<span class="navigation-topic-button-meta">' + escapeHtml(metaParts.join(' · ')) + '</span>' +
                '<span class="navigation-topic-button-copy">' + escapeHtml(topic.copy) + '</span>' +
                renderTopicDemoScript(topic) +
                '<span class="navigation-topic-actions">'
                  + '<button class="navigation-topic-copy-btn" type="button" data-topic-id="' + escapeHtml(topic.topicId) + '" data-default-copy="' + escapeHtml(topic.defaultCopy) + '" data-copy="' + escapeHtml(topic.defaultCopy) + '" title="Copy next suggested input">' + escapeHtml(getCopyLabel(topic.defaultCopy)) + '</button>'
                + '</span>' +
              '</a>';
          }).join('') +
        '</div>' +
      '</section>';
  }

  function renderFlowStats(topicEntries) {
    var maxSteps;
    var summaryCount;

    if (!topicEntries.length) {
      return '';
    }

    maxSteps = topicEntries.reduce(function (currentMax, topic) {
      return Math.max(currentMax, topic.stepsCount || 0);
    }, 0);
    summaryCount = topicEntries.filter(function (topic) {
      return topic.hasSummaryConfirm;
    }).length;

    return '';
  }

  function renderVideoCards() {
    return '' +
      '<section class="navigation-section">' +
        '<p class="navigation-section-label">Video Stories</p>' +
        '<div class="navigation-page-list">' +
          videoPages.map(function (page) {
            var isActive = page.id === currentPageId;

            return '' +
              '<a class="navigation-page-link' + (isActive ? ' is-active' : '') + '" href="' + escapeHtml(getPageHref(page.path)) + '"' + (isActive ? ' aria-current="page"' : '') + '>' +
                '<span class="navigation-page-link-kicker">' + escapeHtml(page.kicker) + '</span>' +
                '<span class="navigation-page-link-title">' + escapeHtml(page.title) + '</span>' +
                '<span class="navigation-page-link-copy">' + escapeHtml(page.description + ' Return topic: ' + page.topicLabel + '.') + '</span>' +
                '<span class="navigation-page-link-state">' + (isActive ? 'Current Page' : 'Open Video') + '</span>' +
              '</a>';
          }).join('') +
        '</div>' +
      '</section>';
  }

  var topicEntries = getTopicEntries();

  var currentPage = allPages.find(function (page) {
    return page.id === currentPageId;
  }) || demoPages[0];

  var toggle = document.createElement('button');
  toggle.id = 'presenterNavigationToggle';
  toggle.className = 'navigation-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-controls', 'presenterNavigationPanel');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Show Navigation');
  toggle.setAttribute('title', 'Show Navigation');
  toggle.innerHTML =
    '<span class="navigation-toggle-icon" aria-hidden="true">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"></path></svg>' +
    '</span>';

  var panel = document.createElement('aside');
  panel.id = 'presenterNavigationPanel';
  panel.className = 'navigation-panel';
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML =
    '<div class="navigation-panel-inner">' +
      '<div class="navigation-panel-header">' +
        '<div>' +
          '<p class="navigation-kicker">Presenter</p>' +
          '<h2>Navigation</h2>' +
        '</div>' +
      '</div>' +
      '<section class="navigation-section">' +
        '<p class="navigation-section-label">Current Screen</p>' +
        '<div class="navigation-current-screen">' +
          '<span class="navigation-current-screen-kicker">Now Showing</span>' +
          '<strong>' + currentPage.title + '</strong>' +
          '<p>' + currentPage.description + '</p>' +
        '</div>' +
      '</section>' +
      '<section class="navigation-section">' +
        '<p class="navigation-section-label">Demo Screens</p>' +
        '<div class="navigation-page-list">' +
          demoPages.map(function (page) {
            var isActive = page.id === currentPageId;
            return '' +
              '<a class="navigation-page-link' + (isActive ? ' is-active' : '') + '" href="' + escapeHtml(getPageHref(page.path)) + '"' + (isActive ? ' aria-current="page"' : '') + '>' +
                '<span class="navigation-page-link-kicker">' + page.kicker + '</span>' +
                '<span class="navigation-page-link-title">' + page.title + '</span>' +
                '<span class="navigation-page-link-copy">' + page.description + '</span>' +
                '<span class="navigation-page-link-state">' + (isActive ? 'Current Page' : 'Open Page') + '</span>' +
              '</a>';
          }).join('') +
        '</div>' +
      '</section>' +
      renderVideoCards() +
      /* Flow Snapshot section removed */
      renderTopicCards(topicEntries) +
      '<section class="navigation-section">' +
        '<p class="navigation-section-label">Presenter Note</p>' +
        '<p class="navigation-session-note">The topic cards and flow stats are generated from the assistant knowledge base, so future flow updates stay in sync here after reload.</p>' +
      '</section>' +
    '</div>';

  workspaceLayout.appendChild(toggle);
  workspaceLayout.appendChild(panel);

  function setTopicCopyButton(button, copyText) {
    var resolvedText = copyText || button.getAttribute('data-default-copy') || '';

    button.setAttribute('data-copy', resolvedText);
    button.textContent = 'Copy: ' + resolvedText;
    button.setAttribute('title', resolvedText ? 'Copy next suggested input: ' + resolvedText : 'Copy next suggested input');
  }

  function updateTopicCopyButtons(activeTopicId, suggestedInput) {
    var copyButtons = panel.querySelectorAll('.navigation-topic-copy-btn');

    Array.prototype.forEach.call(copyButtons, function (button) {
      var topicId = button.getAttribute('data-topic-id') || '';
      var defaultCopy = button.getAttribute('data-default-copy') || '';
      var nextCopy = activeTopicId && topicId === activeTopicId && suggestedInput ? suggestedInput : defaultCopy;

      setTopicCopyButton(button, nextCopy);
    });
  }

  function copyToClipboard(text) {
    if (!text || !window.navigator || !window.navigator.clipboard || typeof window.navigator.clipboard.writeText !== 'function') {
      return;
    }

    window.navigator.clipboard.writeText(text).catch(function () {
      // Ignore clipboard failures and fall back to input insertion only.
    });
  }

  function seedMessageInput(text) {
    var input = document.getElementById('messageInput');

    if (text) {
      copyToClipboard(text);
    }

    if (!input || !text) {
      return;
    }

    input.value = text;
    input.focus();

    var evt = document.createEvent('Event');
    evt.initEvent('input', true, true);
    input.dispatchEvent(evt);
  }

  function triggerUploadPicker() {
    var uploadButton = document.getElementById('uploadButton');

    if (!uploadButton || uploadButton.hidden || uploadButton.disabled) {
      return false;
    }

    uploadButton.click();
    return true;
  }

  window.addEventListener('hsbc-navigation-state-change', function (event) {
    var detail = event && event.detail ? event.detail : {};

    updateTopicCopyButtons(detail.activeTopicId || '', detail.suggestedInput || '');
  });

  updateTopicCopyButtons('', '');

  var isOpen = readOpenState();

  function readOpenState() {
    try {
      return window.sessionStorage.getItem(navigationStateKey) === 'true';
    } catch (error) {
      return false;
    }
  }

  function writeOpenState(nextValue) {
    try {
      window.sessionStorage.setItem(navigationStateKey, String(nextValue));
    } catch (error) {
      // Ignore storage failures and keep the in-memory state.
    }
  }

  function setOpen(nextValue) {
    isOpen = nextValue;
    writeOpenState(nextValue);
    workspaceLayout.classList.toggle('is-navigation-open', nextValue);
    toggle.setAttribute('aria-expanded', String(nextValue));
    panel.setAttribute('aria-hidden', String(!nextValue));
    toggle.setAttribute('aria-label', nextValue ? 'Hide Navigation' : 'Show Navigation');
    toggle.setAttribute('title', nextValue ? 'Hide Navigation' : 'Show Navigation');
  }

  toggle.addEventListener('click', function () {
    setOpen(!isOpen);
  });

  // Prevent navigation panel from auto-closing when clicking links or buttons inside the panel
  panel.addEventListener('click', function (event) {
    // Only close if the close button is clicked (handled above)
    // Do not close for any other click inside the panel
    // Prevent bubbling to any global click handler that might close the panel
    event.stopPropagation();
  });

  setOpen(isOpen);

  // Remove auto-close on outside click

  // Auto-close on outside click and Escape key intentionally disabled per requirements.

  // Copy starter to input box when copy button is clicked
  panel.addEventListener('click', function (event) {
    var demoBtn = event.target.closest('.navigation-topic-script-btn');
    var copyBtn = event.target.closest('.navigation-topic-copy-btn');

    if (demoBtn) {
      if ((demoBtn.getAttribute('data-demo-kind') || 'text') === 'upload') {
        triggerUploadPicker();
      } else {
        seedMessageInput(demoBtn.getAttribute('data-demo-text') || '');
      }

      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (copyBtn) {
      var copyText = copyBtn.getAttribute('data-copy');
      seedMessageInput(copyText);
      event.preventDefault();
      event.stopPropagation();
    }
  });
})();