(function () {
  var workspaceLayout = document.getElementById('workspaceLayout');
  var knowledgeBase = window.HSBCKnowledgeBase || null;

  if (!workspaceLayout) {
    return;
  }

  var navigationStateKey = 'hsbc-presenter-navigation-open';

  var currentPageId = document.body.getAttribute('data-page-id') || '';
  var rootPathPrefix = getRootPathPrefix();
  var demoPages = [
    {
      id: 'lock-screen',
      path: 'locked-screen.html',
      kicker: 'Entry',
      title: 'Lock Screen',
      description: 'Start the demo from the black wallpaper notification view.'
    },
    {
      id: 'assistant-chat',
      path: 'index.html',
      kicker: 'Conversation',
      title: 'Assistant Chat',
      description: 'Open the HSBC SME assistant with guided flows, summary confirmation, and animated reply states.'
    }
  ];
  var videoPages = [
    {
      id: 'video-loan',
      path: 'vid/v1.html',
      kicker: 'Video 01',
      title: 'SME Loan Film',
      description: 'Cinematic playback for the SME loan journey.',
      topicLabel: '貸款'
    },
    {
      id: 'video-account-opening',
      path: 'vid/v2.html',
      kicker: 'Video 02',
      title: 'Account Opening Film',
      description: 'Cinematic playback for the business account opening journey.',
      topicLabel: '開戶'
    },
    {
      id: 'video-fx-hedging',
      path: 'vid/v3.html',
      kicker: 'Video 03',
      title: 'FX Hedging Film',
      description: 'Cinematic playback for the FX hedging journey.',
      topicLabel: '外匯對沖'
    },
    {
      id: 'video-mainland-expansion',
      path: 'vid/v4.html',
      kicker: 'Video 04',
      title: 'Mainland Expansion Film',
      description: 'Cinematic playback for the mainland expansion journey.',
      topicLabel: '內地擴張'
    }
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

    return knowledgeBase.knowledgeBase.map(function (entry, index) {
      var flow = entry.flow || {};
      var steps = Array.isArray(flow.steps) ? flow.steps : [];
      var lastStep = steps.length > 0 ? steps[steps.length - 1] : null;
      var introResponses = Array.isArray(flow.introResponses) ? flow.introResponses : [];
      var lastIntro = introResponses.length > 0 ? introResponses[introResponses.length - 1] : null;
      var title = String(entry.trigger || 'Topic ' + (index + 1)).split('/')[0].trim();
      var starter = Array.isArray(entry.keywords) && entry.keywords.length > 0 ? entry.keywords[0] : title;
      var summaryEnabled = Boolean(
        lastStep &&
        lastStep.prompt &&
        typeof lastStep.prompt.content === 'string' &&
        /摘要|確認/.test(lastStep.prompt.content)
      );

      return {
        title: title,
        starter: starter,
        stepsCount: steps.length,
        hasSummaryConfirm: summaryEnabled,
        copy: lastIntro && lastIntro.content
          ? lastIntro.content
          : 'Open the guided conversation flow for this topic.',
        href: getPageHref('index.html', 'topic=' + encodeURIComponent(starter))
      };
    });
  }

  function renderTopicCards(topicEntries) {
    if (!topicEntries.length) {
      return '';
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

            // Add starter text and copy button for demo
            return '' +
              '<a class="navigation-topic-button" href="' + escapeHtml(topic.href) + '">' +
                '<span class="navigation-topic-button-title">' + escapeHtml(topic.title) + '</span>' +
                '<span class="navigation-topic-button-meta">' + escapeHtml(metaParts.join(' · ')) + '</span>' +
                '<span class="navigation-topic-button-copy">' + escapeHtml(topic.copy) + '</span>' +
                '<span class="navigation-topic-starter">'
                  + 'Type: <span class="navigation-topic-starter-text">' + escapeHtml(topic.starter) + '</span>'
                  + ' <button class="navigation-topic-copy-btn" data-copy="' + escapeHtml(topic.starter) + '" title="Copy to chat input">Copy</button>'
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
  toggle.innerHTML =
    '<span id="presenterNavigationToggleCopy">Show Navigation</span>' +
    '<span class="navigation-toggle-icon" aria-hidden="true">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>' +
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
          '<p class="navigation-panel-copy">Use this shared control to move between demo screens, cinematic videos, and assistant topics from one place.</p>' +
        '</div>' +
      '</div>' +
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
      '<section class="navigation-section">' +
        '<p class="navigation-section-label">Current Screen</p>' +
        '<div class="navigation-current-screen">' +
          '<span class="navigation-current-screen-kicker">Now Showing</span>' +
          '<strong>' + currentPage.title + '</strong>' +
          '<p>' + currentPage.description + '</p>' +
        '</div>' +
      '</section>' +
      /* Flow Snapshot section removed */
      renderTopicCards(topicEntries) +
      '<section class="navigation-section">' +
        '<p class="navigation-section-label">Presenter Note</p>' +
        '<p class="navigation-session-note">The topic cards and flow stats are generated from the assistant knowledge base, so future flow updates stay in sync here after reload.</p>' +
      '</section>' +
    '</div>';

  workspaceLayout.appendChild(toggle);
  workspaceLayout.appendChild(panel);

  var toggleCopy = document.getElementById('presenterNavigationToggleCopy');
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

    if (toggleCopy) {
      toggleCopy.textContent = nextValue ? 'Hide Navigation' : 'Show Navigation';
    }
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
    var copyBtn = event.target.closest('.navigation-topic-copy-btn');
    if (copyBtn) {
      var copyText = copyBtn.getAttribute('data-copy');
      var input = document.getElementById('messageInput');
      if (input && copyText) {
        input.value = copyText;
        input.focus();
        var evt = document.createEvent('Event');
        evt.initEvent('input', true, true);
        input.dispatchEvent(evt);
      }
      event.preventDefault();
      event.stopPropagation();
    }
  });
})();