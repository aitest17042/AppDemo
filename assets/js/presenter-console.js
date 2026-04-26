(function () {
  var appRoot = document.getElementById('presenterConsoleApp');
  var statusNode = document.getElementById('presenterConsoleStatus');
  var floatingPageNode = document.getElementById('presenterConsoleFloatingPage');
  var floatingStepNode = document.getElementById('presenterConsoleFloatingStep');
  var floatingSummaryNode = document.getElementById('presenterConsoleFloatingSummary');
  var floatingDetailNode = document.getElementById('presenterConsoleFloatingDetail');
  var sequenceListNode = document.getElementById('presenterConsoleSequenceList');
  var timerNode = document.getElementById('presenterConsoleTimer');
  var timerToggleButton = document.getElementById('presenterConsoleTimerToggle');
  var timerResetButton = document.getElementById('presenterConsoleTimerReset');
  var prevStepButton = document.getElementById('presenterConsolePrevStep');
  var nextStepButton = document.getElementById('presenterConsoleNextStep');
  var knowledgeBase = window.HSBCKnowledgeBase || null;
  var displayWindow = null;
  var displayWindowName = 'hsbc-demo-display';
  var currentDisplayPath = '';
  var timerStartedAt = Date.now();
  var timerElapsedMs = 0;
  var timerIntervalId = null;
  var isTimerRunning = true;
  var lastDisplayState = {
    pageId: '',
    pageTitle: '',
    pagePath: '',
    activeTopicId: '',
    suggestedInput: ''
  };
  var featuredTopicOrder = ['account-opening-start', 'account-opening-complete', 'fx-hedging-flow', 'mainland-branch-flow'];
  var topicPageById = {
    'account-opening-start': 'app_account-opening-start.html',
    'account-opening-complete': 'app_account-opening-complete.html',
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
    'account-opening-complete': [
      { kind: 'text', value: 'ok, openrice' },
      { kind: 'text', value: '授權並直接提交' }
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
  var presentSequence = [
    { order: 1, pageId: 'story-brand-intro', path: 'tran_brand-intro.html', title: '滙豐萬事屋', summary: '開場品牌頁。', kicker: 'Intro' },
    { order: 2, pageId: 'story-home', path: 'tran_home.html', title: '首頁', summary: '小白的創業故事由此開始。', kicker: 'Story 01' },
    { order: 3, pageId: 'feature-demo-account-opening', path: 'vid_v1.html', title: 'vid_v1.html', summary: '展示開戶功能與外部 API 連結。', kicker: 'Step 02' },
    { order: 4, pageId: 'transition-after-v1', path: 'tran_v1transition.html', title: '創業念頭過場', summary: '動畫文字 + 思想 bubble：我最近被人炒咗，我唔想再做社畜啦，不如開公司啦，但係要點做⋯⋯ → 滙豐萬事屋？', kicker: 'Transition' },
    { order: 5, pageId: 'assistant-account-opening-start', path: 'app_account-opening-start.html', title: 'app_account-opening-start.html', summary: '進入開戶示範上半部分。', kicker: 'Step 03' },
    { order: 6, pageId: 'story-two-days-later', path: 'tran_two-days-later.html', title: '兩天後。。。', summary: '過場頁，交代時間推進。', kicker: 'Step 04' },
    { order: 7, pageId: 'lock-screen-account-opening', path: 'loks_account-opening.html', title: '開戶成功 Lock Screen', summary: '展示開戶成功及 BR / CR 推送。', kicker: 'Step 05' },
    { order: 8, pageId: 'assistant-account-opening-complete', path: 'app_account-opening-complete.html', title: 'app_account-opening-complete.html', summary: '展示開戶完成後的後續服務與已完成項目。', kicker: 'Step 06' },
    { order: 9, pageId: 'feature-demo-fx-hedging', path: 'vid_v2.html', title: 'vid_v2.html', summary: '進入外匯對沖影片與優惠推廣。', kicker: 'Step 07' },
    { order: 10, pageId: 'lock-screen-fx', path: 'loks_fx-hedging.html', title: 'FX Lock Screen', summary: '展示日圓風險提醒與外匯對沖入口。', kicker: 'Step 08' },
    { order: 11, pageId: 'assistant-fx-hedging', path: 'app_fx-hedging.html', title: 'app_fx-hedging.html', summary: '展示分析、優惠推廣、交易確認及查閱交易記錄。', kicker: 'Step 09' },
    { order: 12, pageId: 'feature-demo-mainland-expansion', path: 'vid_v3.html', title: 'vid_v3.html', summary: '進入內地分店拓展影片。', kicker: 'Step 10' },
    { order: 13, pageId: 'assistant-mainland-branch', path: 'app_mainland-branch.html', title: 'app_mainland-branch.html', summary: '展示內地分店建議、內地戶口授權與 Verified Partner 推薦。', kicker: 'Step 11' },
    { order: 14, pageId: 'video-mainland-expansion', path: 'vid_v4.html', title: 'vid_v4.html', summary: '播放拓展內地分店影片。', kicker: 'Step 12' },
    { order: 15, pageId: 'story-ending', path: 'tran_ending.html', title: 'tran_ending.html', summary: '播放結尾影片並展示故事完結頁。', kicker: 'Step 13' }
  ];

  if (!appRoot || !statusNode || !floatingPageNode || !floatingStepNode || !floatingSummaryNode || !floatingDetailNode || !sequenceListNode || !timerNode || !timerToggleButton || !timerResetButton || !prevStepButton || !nextStepButton || !knowledgeBase || !Array.isArray(knowledgeBase.knowledgeBase)) {
    return;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function normalizePath(path) {
    return String(path || '')
      .split('#')[0]
      .split('?')[0]
      .replace(/^\.\//, '')
      .replace(/^\//, '');
  }

  function createCommandId() {
    return 'presenter-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  }

  function getStepById(flow, stepId) {
    var steps = flow && Array.isArray(flow.steps) ? flow.steps : [];

    return steps.find(function (step) {
      return step.id === stepId;
    }) || null;
  }

  function getStepTransitions(step) {
    if (!step) {
      return [];
    }

    if (Array.isArray(step.choices) && step.choices.length > 0) {
      return step.choices;
    }

    return Array.isArray(step.routes) ? step.routes : [];
  }

  function getAcceptedKeywords(transition) {
    var keywords = [];

    if (Array.isArray(transition.exactKeywords)) {
      keywords = keywords.concat(transition.exactKeywords);
    }

    if (Array.isArray(transition.keywords)) {
      keywords = keywords.concat(transition.keywords);
    }

    if (typeof transition.action === 'string' && transition.action) {
      keywords.unshift(transition.action);
    }

    return keywords.filter(Boolean).filter(function (keyword, index, list) {
      return list.indexOf(keyword) === index;
    });
  }

  function getSuccessfulKeywordSteps(entry, demoScript) {
    var flow = entry && entry.flow ? entry.flow : null;
    var steps = [];
    var currentStep;
    var scriptIndex = 1;
    var guard = 0;

    if (!flow || !flow.startStepId) {
      return steps;
    }

    steps.push({
      label: '啟動 Flow',
      acceptedKeywords: Array.isArray(entry.keywords) ? entry.keywords.slice() : []
    });

    currentStep = getStepById(flow, flow.startStepId);

    while (currentStep && guard < 50) {
      var transitions = getStepTransitions(currentStep);
      var inputMode = currentStep.inputMode || '';
      var recommended = demoScript[scriptIndex] || null;
      var nextTransition = transitions[0] || null;
      var acceptedKeywords = [];

      if (recommended && recommended.kind === 'text' && transitions.length > 0) {
        nextTransition = transitions.find(function (transition) {
          return getAcceptedKeywords(transition).some(function (keyword) {
            return String(recommended.value || '').toLowerCase().indexOf(String(keyword).toLowerCase()) !== -1 || String(keyword).toLowerCase().indexOf(String(recommended.value || '').toLowerCase()) !== -1;
          });
        }) || nextTransition;
      }

      if (inputMode === 'text' || inputMode === 'text-or-file') {
        acceptedKeywords = recommended && recommended.kind === 'text' && recommended.value
          ? [recommended.value]
          : ['自由輸入'];
      } else if (inputMode === 'file') {
        acceptedKeywords = ['上傳檔案'];
      } else if (nextTransition) {
        acceptedKeywords = getAcceptedKeywords(nextTransition);
      }

      steps.push({
        label: currentStep.prompt && currentStep.prompt.content ? currentStep.prompt.content : currentStep.id,
        acceptedKeywords: acceptedKeywords
      });

      if (inputMode === 'text' || inputMode === 'text-or-file' || inputMode === 'file') {
        currentStep = currentStep.nextStepId ? getStepById(flow, currentStep.nextStepId) : null;
        scriptIndex += 1;
        guard += 1;
        continue;
      }

      if (!nextTransition || nextTransition.clearFlow || !nextTransition.nextStepId) {
        break;
      }

      currentStep = getStepById(flow, nextTransition.nextStepId);
      scriptIndex += 1;
      guard += 1;
    }

    return steps;
  }

  function getTopicEntries() {
    return knowledgeBase.knowledgeBase
      .filter(function (entry) {
        return entry.flow && entry.flow.startStepId;
      })
      .map(function (entry, index) {
        var flow = entry.flow || {};
        var topicId = typeof flow.id === 'string' && flow.id ? flow.id : String(entry.trigger || index);
        var featuredIndex = featuredTopicOrder.indexOf(topicId);
        var demoScript = topicDemoScripts[topicId] || [];
        var title = String(entry.trigger || 'Topic ' + (index + 1)).split('/')[0].trim();
        var introResponses = Array.isArray(flow.introResponses) ? flow.introResponses : [];
        var lastIntro = introResponses.length > 0 ? introResponses[introResponses.length - 1] : null;

        return {
          topicId: topicId,
          featuredIndex: featuredIndex,
          title: title,
          description: lastIntro && lastIntro.content ? lastIntro.content : 'Open the guided conversation flow for this topic.',
          pagePath: topicPageById[topicId] || 'app_account-opening-start.html',
          demoScript: demoScript,
          successSteps: getSuccessfulKeywordSteps(entry, demoScript)
        };
      })
      .filter(function (topic) {
        return topic.featuredIndex !== -1;
      })
      .sort(function (left, right) {
        return left.featuredIndex - right.featuredIndex;
      });
  }

  function setStatus(text) {
    statusNode.textContent = text;
  }

  function ensureDisplayWindow(path) {
    var normalizedPath = normalizePath(path);

    if (displayWindow && !displayWindow.closed && currentDisplayPath === normalizedPath) {
      displayWindow.focus();
      setStatus('展示頁：' + normalizedPath);
      return displayWindow;
    }

    displayWindow = window.open('./' + normalizedPath, displayWindowName);

    if (displayWindow) {
      currentDisplayPath = normalizedPath;
      displayWindow.focus();
      setStatus('展示頁：' + normalizedPath);
    } else {
      setStatus('未能開啟展示頁，請檢查瀏覽器是否阻擋彈出視窗');
    }

    return displayWindow;
  }

  function postCommand(command, retryCount) {
    var attempts = typeof retryCount === 'number' ? retryCount : 0;

    if (!displayWindow || displayWindow.closed) {
      return;
    }

    displayWindow.postMessage(command, '*');

    if (attempts > 0) {
      window.setTimeout(function () {
        postCommand(command, attempts - 1);
      }, 350);
    }
  }

  function findSequenceItemByPath(path) {
    var normalizedPath = normalizePath(path);

    return presentSequence.find(function (item) {
      return normalizePath(item.path) === normalizedPath;
    }) || null;
  }

  function findSequenceItemByState(detail) {
    return findSequenceItemByPath(detail.pagePath) || presentSequence.find(function (item) {
      return item.pageId === detail.pageId;
    }) || null;
  }

  function updateSequenceHighlights(item) {
    var activePath = item ? normalizePath(item.path) : '';
    var sequenceCards = appRoot.querySelectorAll('[data-sequence-path]');
    var sequenceListItems = sequenceListNode.querySelectorAll('[data-sequence-list-path]');

    Array.prototype.forEach.call(sequenceCards, function (card) {
      var isActive = normalizePath(card.getAttribute('data-sequence-path') || '') === activePath;
      var details = card.querySelector('[data-sequence-topic-details]');

      card.classList.toggle('is-active', isActive);

      if (details) {
        details.open = isActive;
      }
    });

    Array.prototype.forEach.call(sequenceListItems, function (listItem) {
      listItem.classList.toggle('is-active', normalizePath(listItem.getAttribute('data-sequence-list-path') || '') === activePath);
    });
  }

  function scrollSequenceIntoView(item) {
    var activePath;
    var card;
    var listItem;

    if (!item) {
      return;
    }

    activePath = normalizePath(item.path);
    card = appRoot.querySelector('[data-sequence-path="' + activePath + '"]');
    listItem = sequenceListNode.querySelector('[data-sequence-list-path="' + activePath + '"]');

    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (listItem) {
      listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function updateStepNavigation(item) {
    var index = item ? presentSequence.findIndex(function (sequenceItem) {
      return sequenceItem.pageId === item.pageId;
    }) : -1;

    prevStepButton.disabled = index <= 0;
    nextStepButton.disabled = index === -1 || index >= presentSequence.length - 1;
  }

  function updateCurrentDisplay(detail) {
    var sequenceItem = findSequenceItemByState(detail) || findSequenceItemByPath(currentDisplayPath);
    var detailParts = [];

    if (detail && detail.pagePath) {
      currentDisplayPath = normalizePath(detail.pagePath);
    }

    if (detail.activeTopicId) {
      detailParts.push('Topic：' + detail.activeTopicId);
    }

    if (detail.suggestedInput) {
      detailParts.push('建議輸入：' + detail.suggestedInput);
    }

    floatingPageNode.textContent = sequenceItem ? sequenceItem.title : (detail.pageTitle || detail.pageId || detail.pagePath || '未收到展示頁');
    floatingStepNode.textContent = sequenceItem
      ? 'Step ' + sequenceItem.order + ' / ' + String(presentSequence.length)
      : 'Step - / ' + String(presentSequence.length);
    floatingSummaryNode.textContent = sequenceItem ? sequenceItem.summary : '等待展示頁回報目前頁面。';
    floatingDetailNode.textContent = detailParts.length > 0 ? detailParts.join(' | ') : '目前未提供進一步聊天狀態。';
    updateSequenceHighlights(sequenceItem);
    updateStepNavigation(sequenceItem);
    if (sequenceItem) {
      scrollSequenceIntoView(sequenceItem);
    }
  }

  function navigateDisplay(path) {
    var sequenceItem = findSequenceItemByPath(path);

    ensureDisplayWindow(path);
    updateCurrentDisplay({
      pageId: sequenceItem ? sequenceItem.pageId : '',
      pageTitle: sequenceItem ? sequenceItem.title : '',
      pagePath: normalizePath(path),
      activeTopicId: '',
      suggestedInput: ''
    });
  }

  function navigateSequenceByOffset(offset) {
    var currentItem = findSequenceItemByPath(currentDisplayPath) || presentSequence[0] || null;
    var currentIndex = currentItem ? presentSequence.findIndex(function (item) {
      return item.pageId === currentItem.pageId;
    }) : -1;
    var nextIndex = currentIndex + offset;
    var nextItem;

    if (nextIndex < 0 || nextIndex >= presentSequence.length) {
      return;
    }

    nextItem = presentSequence[nextIndex];

    if (nextItem) {
      navigateDisplay(nextItem.path);
    }
  }

  function sendStepToDisplay(topic, step) {
    ensureDisplayWindow(topic.pagePath);

    if (!displayWindow || displayWindow.closed) {
      return;
    }

    postCommand({
      type: 'hsbc-presenter-command',
      commandId: createCommandId(),
      command: step.kind === 'upload' ? 'trigger-upload' : 'seed-input',
      text: step.value || ''
    }, 5);
  }

  function sendSuggestedInput(topicId) {
    var topic = topicsById[topicId];
    var nextInput = lastDisplayState.activeTopicId === topicId && lastDisplayState.suggestedInput
      ? lastDisplayState.suggestedInput
      : '';

    if (!topic || !nextInput) {
      return;
    }

    ensureDisplayWindow(topic.pagePath);
    postCommand({
      type: 'hsbc-presenter-command',
      commandId: createCommandId(),
      command: 'seed-input',
      text: nextInput
    }, 2);
  }

  function sendCurrentInput(topicId) {
    var topic = topicsById[topicId];

    if (!topic) {
      return;
    }

    ensureDisplayWindow(topic.pagePath);
    postCommand({
      type: 'hsbc-presenter-command',
      commandId: createCommandId(),
      command: 'send-current-input',
      text: ''
    }, 2);
  }

  function getTopicForSequenceItem(item) {
    if (!item) {
      return null;
    }

    if (item.pageId === 'assistant-account-opening-start') {
      return topicsById['account-opening-start'] || null;
    }

    if (item.pageId === 'assistant-account-opening-complete') {
      return topicsById['account-opening-complete'] || null;
    }

    if (item.pageId === 'assistant-fx-hedging') {
      return topicsById['fx-hedging-flow'] || null;
    }

    if (item.pageId === 'assistant-mainland-branch') {
      return topicsById['mainland-branch-flow'] || null;
    }

    return null;
  }

  function renderSequenceTopicControls(topic) {
    if (!topic) {
      return '';
    }

    return '' +
      '<details class="presenter-sequence-topic-block" data-sequence-topic-details>' +
        '<summary class="presenter-sequence-topic-summary">' +
          '<span class="presenter-sequence-topic-summary-title">Demo inputs / QA</span>' +
          '<span class="presenter-sequence-topic-summary-meta">' + String(topic.demoScript.length) + ' inputs · ' + String(topic.successSteps.length) + ' checkpoints</span>' +
        '</summary>' +
        '<div class="presenter-sequence-topic-panel">' +
          '<div class="presenter-sequence-topic-layout">' +
            '<div class="presenter-sequence-topic-main">' +
              '<div class="presenter-console-step-list presenter-console-step-list-embedded">' +
                topic.demoScript.map(function (step, index) {
                  var label = step.label || step.value || '';
                  return '' +
                    '<button class="presenter-console-step-btn' + (step.kind === 'upload' ? ' is-upload' : '') + '" type="button" data-topic-id="' + escapeHtml(topic.topicId) + '" data-step-index="' + String(index) + '">' +
                      '<span class="presenter-console-step-index">' + String(index + 1) + '</span>' +
                      '<span class="presenter-console-step-text">' + escapeHtml(label) + '</span>' +
                    '</button>';
                }).join('') +
              '</div>' +
              '<div class="presenter-console-topic-footer presenter-console-topic-footer-embedded">' +
                '<button class="presenter-console-action-btn is-ghost" type="button" data-send-suggested="' + escapeHtml(topic.topicId) + '">填入目前建議輸入</button>' +
                '<button class="presenter-console-action-btn" type="button" data-send-current="' + escapeHtml(topic.topicId) + '">發送目前輸入</button>' +
              '</div>' +
            '</div>' +
            '<div class="presenter-console-keyword-section presenter-console-keyword-section-embedded">' +
              '<span class="presenter-console-keyword-label">成功登關</span>' +
              '<div class="presenter-console-keyword-list presenter-console-keyword-list-compact">' +
                topic.successSteps.map(function (step, index) {
                  return '' +
                    '<div class="presenter-console-keyword-card presenter-console-keyword-card-compact">' +
                      '<div class="presenter-console-keyword-head presenter-console-keyword-head-compact">' +
                        '<span class="presenter-console-keyword-step presenter-console-keyword-step-compact">Step ' + String(index + 1) + '</span>' +
                        '<strong>' + escapeHtml(step.label) + '</strong>' +
                      '</div>' +
                      '<div class="presenter-console-keyword-tags presenter-console-keyword-tags-compact">' +
                        step.acceptedKeywords.map(function (keyword) {
                          return '<span class="presenter-console-keyword-tag presenter-console-keyword-tag-compact">' + escapeHtml(keyword) + '</span>';
                        }).join('') +
                      '</div>' +
                    '</div>';
                }).join('') +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</details>';
  }

  function renderSequenceSection() {
    return '' +
      '<section class="presenter-console-section">' +
        '<div class="presenter-console-section-header">' +
          '<p class="presenter-console-section-kicker">Sequence</p>' +
          '<h2>按 Present 次序顯示</h2>' +
        '</div>' +
        '<div class="presenter-sequence-list">' +
          presentSequence.map(function (item) {
            var topic = getTopicForSequenceItem(item);

            return '' +
              '<article class="presenter-sequence-card" data-sequence-path="' + escapeHtml(item.path) + '">' +
                '<button class="presenter-sequence-bubble" type="button" data-page-path="' + escapeHtml(item.path) + '">' +
                  '<div class="presenter-sequence-index">' + String(item.order) + '</div>' +
                  '<div class="presenter-sequence-copy">' +
                    '<h3>' + escapeHtml(item.title) + '</h3>' +
                    '<p>' + escapeHtml(item.summary) + '</p>' +
                  '</div>' +
                '</button>' +
                '<div class="presenter-sequence-detail-wrap">' +
                  renderSequenceTopicControls(topic) +
                '</div>' +
              '</article>';
          }).join('') +
        '</div>' +
      '</section>';
  }

  function formatTimer(seconds) {
    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;

    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  }

  function getElapsedTimerSeconds() {
    var elapsedMs = timerElapsedMs;

    if (isTimerRunning) {
      elapsedMs += Date.now() - timerStartedAt;
    }

    return Math.floor(elapsedMs / 1000);
  }

  function updateTimer() {
    var elapsedSeconds = getElapsedTimerSeconds();
    timerNode.textContent = formatTimer(elapsedSeconds);
  }

  function startTimer() {
    if (isTimerRunning) {
      return;
    }

    isTimerRunning = true;
    timerStartedAt = Date.now();
    timerToggleButton.textContent = 'Stop';
    updateTimer();
  }

  function stopTimer() {
    if (!isTimerRunning) {
      return;
    }

    timerElapsedMs += Date.now() - timerStartedAt;
    isTimerRunning = false;
    timerToggleButton.textContent = 'Start';
    updateTimer();
  }

  function resetTimer() {
    timerElapsedMs = 0;
    timerStartedAt = Date.now();
    updateTimer();
  }

  var topicEntries = getTopicEntries();
  var topicsById = topicEntries.reduce(function (result, topic) {
    result[topic.topicId] = topic;
    return result;
  }, {});

  appRoot.innerHTML = renderSequenceSection();

  sequenceListNode.innerHTML = presentSequence.map(function (item) {
    return '' +
      '<li class="presenter-console-floating-sequence-item" data-sequence-list-path="' + escapeHtml(item.path) + '">' +
        '<button class="presenter-console-floating-sequence-btn" type="button" data-page-path="' + escapeHtml(item.path) + '">' + String(item.order) + '. ' + escapeHtml(item.title) + '</button>' +
      '</li>';
  }).join('');

  timerToggleButton.addEventListener('click', function () {
    if (isTimerRunning) {
      stopTimer();
      return;
    }

    startTimer();
  });

  timerResetButton.addEventListener('click', function () {
    resetTimer();
  });

  prevStepButton.addEventListener('click', function () {
    navigateSequenceByOffset(-1);
  });

  nextStepButton.addEventListener('click', function () {
    navigateSequenceByOffset(1);
  });

  updateTimer();
  timerIntervalId = window.setInterval(updateTimer, 1000);

  window.addEventListener('message', function (event) {
    var data = event.data || {};

    if (!data || data.type !== 'hsbc-presenter-state') {
      return;
    }

    lastDisplayState = {
      pageId: data.pageId || '',
      pageTitle: data.pageTitle || '',
      pagePath: data.pagePath || '',
      activeTopicId: data.activeTopicId || '',
      suggestedInput: data.suggestedInput || ''
    };

    if (lastDisplayState.pagePath) {
      currentDisplayPath = normalizePath(lastDisplayState.pagePath);
    }

    setStatus('已連接：' + (lastDisplayState.pageTitle || lastDisplayState.pagePath || lastDisplayState.pageId || '展示頁'));
    updateCurrentDisplay(lastDisplayState);
  });

  appRoot.addEventListener('click', function (event) {
    var pageButton = event.target.closest('[data-page-path]');
    var stepButton = event.target.closest('[data-topic-id][data-step-index]');
    var suggestedButton = event.target.closest('[data-send-suggested]');
    var sendCurrentButton = event.target.closest('[data-send-current]');
    var topic;
    var stepIndex;

    if (pageButton) {
      navigateDisplay(pageButton.getAttribute('data-page-path') || 'tran_brand-intro.html');
      return;
    }

    if (stepButton) {
      topic = topicsById[stepButton.getAttribute('data-topic-id') || ''];
      stepIndex = Number(stepButton.getAttribute('data-step-index') || -1);

      if (!topic || !Array.isArray(topic.demoScript) || !topic.demoScript[stepIndex]) {
        return;
      }

      sendStepToDisplay(topic, topic.demoScript[stepIndex]);
      return;
    }

    if (suggestedButton) {
      sendSuggestedInput(suggestedButton.getAttribute('data-send-suggested') || '');
      return;
    }

    if (sendCurrentButton) {
      sendCurrentInput(sendCurrentButton.getAttribute('data-send-current') || '');
    }
  });

  sequenceListNode.addEventListener('click', function (event) {
    var pageButton = event.target.closest('[data-page-path]');

    if (!pageButton) {
      return;
    }

    navigateDisplay(pageButton.getAttribute('data-page-path') || 'tran_brand-intro.html');
  });

  updateCurrentDisplay({
    pageId: '',
    pageTitle: '',
    pagePath: '',
    activeTopicId: '',
    suggestedInput: ''
  });
})();
