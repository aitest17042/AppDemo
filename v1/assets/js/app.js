(function () {
  var appData = window.HSBCKnowledgeBase;

  if (!appData) {
    console.error('HSBCKnowledgeBase did not load.');
    return;
  }

  var chatArea = document.getElementById('chatArea');
  var messageList = document.getElementById('messageList');
  var messageInput = document.getElementById('messageInput');
  var sendButton = document.getElementById('sendButton');
  var uploadButton = document.getElementById('uploadButton');
  var fileUploadInput = document.getElementById('fileUploadInput');
  var statusTime = document.getElementById('statusTime');
  var timelineLabel = document.getElementById('timelineLabel');
  var headerActions = document.querySelector('.header-actions');
  var allowAllTopics = document.body.getAttribute('data-allow-all-topics') === 'true';
  var defaultTopic = document.body.getAttribute('data-default-topic') || '';
  var defaultTopicId = document.body.getAttribute('data-default-topic-id') || '';

  if (!chatArea || !messageList || !messageInput || !sendButton || !uploadButton || !fileUploadInput || !statusTime || !timelineLabel) {
    console.error('Chat UI failed to initialize.');
    return;
  }

  var allowedTopicIds = getAllowedTopicIds();
  var scopedKnowledgeBase = getScopedKnowledgeBase();
  var initialRouteState = getInitialRouteState();
  var defaultComposerPlaceholder = messageInput.getAttribute('placeholder') || '';

  var state = {
    messages: buildInitialMessages(initialRouteState),
    timeouts: [],
    activeFlowId: initialRouteState.initialFlowId || null,
    activeFlowStepId: initialRouteState.initialStepId || null,
    flowAnswers: {},
    thinkingMessageId: null,
    currentTopicId: initialRouteState.initialTopicId || defaultTopicId || null
  };

  var authState = {
    isLoggedIn: document.body.getAttribute('data-auto-login') === 'true' || Boolean(headerActions && headerActions.querySelector('.header-user')),
    isMenuOpen: false,
    isLoading: false,
    loginTimeoutId: null
  };
  var pageAutomationState = {
    initialActionStarted: false,
    initialActionTimeoutId: null
  };
  var presenterState = {
    handledCommandIds: Object.create(null),
    typingTimeoutIds: []
  };

  function getAllowedTopicIds() {
    var configured = (document.body.getAttribute('data-allowed-topic-ids') || '')
      .split(',')
      .map(function (value) {
        return String(value || '').trim();
      })
      .filter(Boolean);

    if (configured.length > 0) {
      return configured;
    }

    if (!allowAllTopics && defaultTopicId) {
      return [defaultTopicId];
    }

    return [];
  }

  function isEntryAllowed(entry) {
    var topicId;

    if (allowAllTopics || allowedTopicIds.length === 0) {
      return true;
    }

    topicId = getEntryTopicId(entry);
    return Boolean(topicId && allowedTopicIds.indexOf(topicId) !== -1);
  }

  function getScopedKnowledgeBase() {
    return Array.isArray(appData.knowledgeBase)
      ? appData.knowledgeBase.filter(function (entry) {
          return isEntryAllowed(entry);
        })
      : [];
  }

  function getInitialMessagePayload(config) {
    if (!config) {
      return {
        sender: 'ai',
        type: 'text',
        content: '',
        actions: [],
        actionPresentation: ''
      };
    }

    return {
      sender: typeof config.sender === 'string' ? config.sender : 'ai',
      type: typeof config.type === 'string' ? config.type : 'text',
      content: typeof config.content === 'string' ? config.content : '',
      actions: Array.isArray(config.actions) ? config.actions.slice() : [],
      actionPresentation: typeof config.actionPresentation === 'string' ? config.actionPresentation : ''
    };
  }

  function getInitialMessagePayloads(config) {
    if (Array.isArray(config)) {
      return config.map(function (message) {
        return getInitialMessagePayload(message);
      });
    }

    return [getInitialMessagePayload(config)];
  }

  function getInitialMessageConfig(pageId, topicId) {
    if (pageId && appData.initialMessagesByPageId && appData.initialMessagesByPageId[pageId]) {
      return appData.initialMessagesByPageId[pageId];
    }

    if (topicId && appData.initialMessagesByTopic && appData.initialMessagesByTopic[topicId]) {
      return appData.initialMessagesByTopic[topicId];
    }

    return appData.initialMessage || null;
  }

  function getInitialRouteState() {
    var pageId = document.body.getAttribute('data-page-id') || '';
    var initialFlowId = document.body.getAttribute('data-initial-flow-id') || '';
    var initialStepId = document.body.getAttribute('data-initial-step-id') || '';
    var initialTopicId = document.body.getAttribute('data-initial-topic-id') || initialFlowId || null;
    var initialMessages = getInitialMessagePayloads(getInitialMessageConfig(pageId, initialTopicId));

    return {
      entry: pageId,
      initialMessages: initialMessages,
      initialFlowId: initialFlowId || null,
      initialStepId: initialStepId || null,
      initialTopicId: initialTopicId,
      appendStepPrompt: document.body.getAttribute('data-append-step-prompt') === 'true' && Boolean(initialFlowId && initialStepId)
    };
  }

  function createAssistantMessage(message) {
    return {
      id: message.id || null,
      sender: typeof message.sender === 'string' ? message.sender : 'ai',
      type: typeof message.type === 'string' ? message.type : 'text',
      content: typeof message.content === 'string' ? message.content : '',
      cardHeading: typeof message.cardHeading === 'string' ? message.cardHeading : '',
      cardCategory: typeof message.cardCategory === 'string' ? message.cardCategory : '',
      partnerCards: Array.isArray(message.partnerCards)
        ? message.partnerCards.map(function (card) {
            return {
              href: typeof card.href === 'string' ? card.href : '',
              logo: typeof card.logo === 'string' ? card.logo : '',
              name: typeof card.name === 'string' ? card.name : '',
              rating: typeof card.rating === 'string' ? card.rating : ''
            };
          })
        : [],
      actions: Array.isArray(message.actions) ? message.actions.slice() : [],
      actionPresentation: typeof message.actionPresentation === 'string' ? message.actionPresentation : '',
      files: Array.isArray(message.files)
        ? message.files.map(function (file) {
            return cloneUploadedFile(file);
          })
        : []
    };
  }

  function buildInitialMessages(routeState) {
    var messages = routeState.initialMessages.map(function (message) {
      return createAssistantMessage(message);
    });
    var flowDefinition;
    var promptResponses;

    if (!routeState.appendStepPrompt || !routeState.initialFlowId || !routeState.initialStepId) {
      return messages;
    }

    flowDefinition = getFlowDefinition(routeState.initialFlowId);
    promptResponses = getStepPromptResponses(flowDefinition, routeState.initialStepId);

    return messages.concat(promptResponses.map(function (response) {
      response.sender = 'ai';
      return createAssistantMessage(response);
    }));
  }

  function getCurrentPagePath() {
    var pathname = window.location.pathname || '';
    var segments = pathname.split('/').filter(Boolean);

    return segments.length > 0 ? segments[segments.length - 1] : '';
  }

  function isAccountOpeningCompleteEntry() {
    return (document.body.getAttribute('data-page-id') || '') === 'assistant-account-opening-complete';
  }

  function appendAssistantMessages(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return;
    }

    messages.forEach(function (message) {
      message.id = createMessageId();
      message.sender = 'ai';
      state.messages.push(createAssistantMessage(message));
    });

    renderMessages();
  }

  function triggerFollowupLoginFlow() {
    var flowDefinition;
    var promptResponses;

    if (!isAccountOpeningCompleteEntry() || state.activeFlowStepId || authState.isLoading || !authState.isLoggedIn) {
      return;
    }

    flowDefinition = getFlowDefinition('account-opening-complete');
    promptResponses = getStepPromptResponses(flowDefinition, 'account-followup-openrice-offer');

    if (!flowDefinition || promptResponses.length === 0) {
      return;
    }

    setActiveFlow('account-opening-complete', 'account-followup-openrice-offer');
    appendAssistantMessages(promptResponses);
  }

  function getInitialActionConfig() {
    var text = document.body.getAttribute('data-initial-action-text') || '';
    var flowId = document.body.getAttribute('data-initial-action-flow-id') || '';
    var stepId = document.body.getAttribute('data-initial-action-step-id') || '';

    if (!text || !flowId || !stepId) {
      return null;
    }

    return {
      text: text,
      flowId: flowId,
      stepId: stepId
    };
  }

  function getInitialActionResponses(input) {
    var initialAction = getInitialActionConfig();
    var normalizedInput = normalizeInput(input || '');
    var flowDefinition;
    var promptResponses;

    if (!initialAction || normalizedInput !== normalizeInput(initialAction.text)) {
      return null;
    }

    flowDefinition = getFlowDefinition(initialAction.flowId);

    if (!flowDefinition) {
      return null;
    }

    setCurrentTopic(initialAction.flowId);
    setActiveFlow(initialAction.flowId, initialAction.stepId);
    promptResponses = getStepPromptResponses(flowDefinition, initialAction.stepId);
    return promptResponses.length > 0 ? promptResponses : null;
  }

  function autoStartInitialAction() {
    var initialAction = getInitialActionConfig();

    if (!initialAction || pageAutomationState.initialActionStarted || document.body.getAttribute('data-auto-start-initial-action') !== 'true' || !authState.isLoggedIn) {
      return;
    }

    pageAutomationState.initialActionStarted = true;
    pageAutomationState.initialActionTimeoutId = window.setTimeout(function () {
      pageAutomationState.initialActionTimeoutId = null;
      sendMessage(initialAction.text);
    }, 500);
  }

  function getLoginButtonMarkup() {
    return '<button class="login-button' + (authState.isLoading ? ' is-loading' : '') + '" type="button" data-auth-action="login"' + (authState.isLoading ? ' disabled aria-busy="true"' : '') + '>' + (authState.isLoading ? '登入中...' : '登入') + '</button>';
  }

  function getUserMenuMarkup() {
    return '' +
      '<div class="header-user-menu">' +
        '<button class="header-user header-user-trigger" type="button" data-auth-action="toggle-menu" aria-haspopup="menu" aria-expanded="false" aria-label="已登入用戶選單">' +
          '<img class="header-user-avatar" src="./assets/media/icons/chiikawa_icon.png" alt="已登入用戶" />' +
          '<span class="header-user-verified" aria-hidden="true">' +
            '<svg width="8" height="8" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">' +
              '<path d="M2.5 6.2 4.8 8.4 9.5 3.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>' +
          '</span>' +
        '</button>' +
        '<div class="header-user-dropdown" role="menu" hidden>' +
          '<button class="header-user-dropdown-item" type="button" data-auth-action="logout" role="menuitem">登出</button>' +
        '</div>' +
      '</div>';
  }

  function setUserMenuOpen(isOpen) {
    var trigger;
    var dropdown;

    authState.isMenuOpen = Boolean(isOpen && authState.isLoggedIn);

    if (!headerActions) {
      return;
    }

    trigger = headerActions.querySelector('.header-user-trigger');
    dropdown = headerActions.querySelector('.header-user-dropdown');

    if (trigger) {
      trigger.setAttribute('aria-expanded', authState.isMenuOpen ? 'true' : 'false');
    }

    if (dropdown) {
      dropdown.hidden = !authState.isMenuOpen;
    }
  }

  function renderAuthControl() {
    if (!headerActions) {
      return;
    }

    headerActions.innerHTML = authState.isLoggedIn ? getUserMenuMarkup() : getLoginButtonMarkup();
    setUserMenuOpen(false);
  }

  function beginLoginLoading() {
    if (authState.isLoading || authState.isLoggedIn) {
      return;
    }

    authState.isLoading = true;
    renderAuthControl();

    authState.loginTimeoutId = window.setTimeout(function () {
      authState.isLoading = false;
      authState.loginTimeoutId = null;
      authState.isLoggedIn = true;
      renderAuthControl();
      triggerFollowupLoginFlow();
    }, 3000);
  }

  function initializeAuthControl() {
    if (!headerActions) {
      return;
    }

    renderAuthControl();

    headerActions.addEventListener('click', function (event) {
      var actionTarget = event.target.closest('[data-auth-action]');
      var action;

      if (!actionTarget) {
        return;
      }

      action = actionTarget.getAttribute('data-auth-action');

      if (action === 'login') {
        beginLoginLoading();
        return;
      }

      if (action === 'toggle-menu') {
        setUserMenuOpen(!authState.isMenuOpen);
        return;
      }

      if (action === 'logout') {
        authState.isLoading = false;
        authState.isLoggedIn = false;
        renderAuthControl();
      }
    });

    document.addEventListener('click', function (event) {
      if (!authState.isMenuOpen || headerActions.contains(event.target)) {
        return;
      }

      setUserMenuOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && authState.isMenuOpen) {
        setUserMenuOpen(false);
      }
    });
  }

  function getEntryTopicId(entry) {
    if (!entry) {
      return null;
    }

    if (typeof entry.topicId === 'string' && entry.topicId) {
      return entry.topicId;
    }

    if (entry.flow && typeof entry.flow.id === 'string' && entry.flow.id) {
      return entry.flow.id;
    }

    if (typeof entry.trigger !== 'string' || !entry.trigger) {
      return null;
    }

    return String(entry.trigger).split('/')[0].trim() || null;
  }

  function setCurrentTopic(topicId) {
    state.currentTopicId = topicId || null;
  }

  function cloneMessage(message) {
    return {
      id: message.id || null,
      sender: message.sender,
      type: message.type,
      content: message.content,
      cardHeading: typeof message.cardHeading === 'string' ? message.cardHeading : '',
      cardCategory: typeof message.cardCategory === 'string' ? message.cardCategory : '',
      partnerCards: Array.isArray(message.partnerCards)
        ? message.partnerCards.map(function (card) {
            return {
              href: typeof card.href === 'string' ? card.href : '',
              logo: typeof card.logo === 'string' ? card.logo : '',
              name: typeof card.name === 'string' ? card.name : '',
              rating: typeof card.rating === 'string' ? card.rating : ''
            };
          })
        : [],
      imageTitle: typeof message.imageTitle === 'string' ? message.imageTitle : '',
      imageSubtitle: typeof message.imageSubtitle === 'string' ? message.imageSubtitle : '',
      imageAlt: typeof message.imageAlt === 'string' ? message.imageAlt : '',
      actions: Array.isArray(message.actions) ? message.actions.slice() : [],
      files: Array.isArray(message.files)
        ? message.files.map(function (file) {
            return cloneUploadedFile(file);
          })
        : []
    };
  }

  function createMessageId() {
    return 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  }

  function createTextSubmission(rawValue) {
    var value = String(rawValue || '').trim();

    if (!value) {
      return null;
    }

    return {
      kind: 'text',
      text: value,
      answer: value,
      userMessage: value
    };
  }

  function formatUploadedFileNames(files) {
    var names = files
      .map(function (file) {
        return file.name;
      })
      .filter(Boolean);

    if (names.length === 0) {
      return '';
    }

    if (names.length === 1) {
      return names[0];
    }

    return '共' + names.length + ' 份：' + names.join('、');
  }

  function createPreviewUrl(file) {
    if (!file || !file.type || file.type.indexOf('image/') !== 0) {
      return '';
    }

    if (!window.URL || typeof window.URL.createObjectURL !== 'function') {
      return '';
    }

    return window.URL.createObjectURL(file);
  }

  function cloneUploadedFile(file) {
    return {
      name: file && file.name ? file.name : 'untitled',
      type: file && file.type ? file.type : '',
      size: file && typeof file.size === 'number' ? file.size : 0,
      previewUrl: file && file.previewUrl ? file.previewUrl : ''
    };
  }

  function createFileSubmission(fileList) {
    var files = Array.prototype.slice.call(fileList || [])
      .filter(Boolean)
      .map(function (file) {
        return cloneUploadedFile({
          name: file.name || 'untitled',
          type: file.type || '',
          size: file.size || 0,
          previewUrl: createPreviewUrl(file)
        });
      });
    var summary = formatUploadedFileNames(files);

    if (!summary) {
      return null;
    }

    return {
      kind: 'file',
      files: files,
      text: summary,
      answer: summary,
      userMessage: '已上傳：' + summary
    };
  }

  function normalizeSubmission(rawValue) {
    if (typeof rawValue === 'string') {
      return createTextSubmission(rawValue);
    }

    if (!rawValue || typeof rawValue !== 'object') {
      return null;
    }

    if (rawValue.kind === 'text' || rawValue.kind === 'file') {
      return rawValue;
    }

    return null;
  }

  function getSubmissionText(submission) {
    return submission && typeof submission.text === 'string' ? submission.text : '';
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) {
      return bytes + ' B';
    }

    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    }

    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function getFileBadgeLabel(fileName) {
    var parts = String(fileName || '').split('.');
    var extension = parts.length > 1 ? parts.pop() : '';

    if (!extension) {
      return 'FILE';
    }

    return extension.slice(0, 4).toUpperCase();
  }

  function createFilePreviewContent(files) {
    var wrapper = document.createElement('div');
    var header = document.createElement('div');

    wrapper.className = 'uploaded-file-preview';
    header.className = 'uploaded-file-preview-header';
    header.textContent = files.length > 1 ? '上傳預覽 (' + files.length + ')' : '上傳預覽';
    wrapper.appendChild(header);

    files.forEach(function (file) {
      var item = document.createElement('div');
      var visual;
      var meta = document.createElement('div');
      var name = document.createElement('div');
      var detail = document.createElement('div');
      var detailParts = [];

      item.className = 'uploaded-file-preview-item';

      if (file.previewUrl) {
        visual = document.createElement('img');
        visual.className = 'uploaded-file-preview-thumb';
        visual.src = file.previewUrl;
        visual.alt = file.name || 'uploaded image preview';
      } else {
        visual = document.createElement('div');
        visual.className = 'uploaded-file-preview-badge';
        visual.textContent = getFileBadgeLabel(file.name);
      }

      meta.className = 'uploaded-file-preview-meta';
      name.className = 'uploaded-file-preview-name';
      name.textContent = file.name || 'untitled';

      if (file.type) {
        detailParts.push(file.type);
      }

      detailParts.push(formatFileSize(file.size || 0));
      detail.className = 'uploaded-file-preview-detail';
      detail.textContent = detailParts.join(' · ');

      meta.appendChild(name);
      meta.appendChild(detail);
      item.appendChild(visual);
      item.appendChild(meta);
      wrapper.appendChild(item);
    });

    return wrapper;
  }

  function pad2(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function normalizeInput(input) {
    return input.trim().toLowerCase();
  }

  function hasExactKeywordMatch(normalizedInput, exactKeywords) {
    if (!Array.isArray(exactKeywords) || exactKeywords.length === 0) {
      return false;
    }

    return exactKeywords.some(function (keyword) {
      return normalizedInput === String(keyword).trim().toLowerCase();
    });
  }

  function hasKeywordMatch(normalizedInput, keywords) {
    if (!Array.isArray(keywords) || keywords.length === 0) {
      return false;
    }

    return keywords.some(function (keyword) {
      return normalizedInput.includes(String(keyword).trim().toLowerCase());
    });
  }

  function matchesInputRule(normalizedInput, matcher) {
    return hasExactKeywordMatch(normalizedInput, matcher.exactKeywords) || hasKeywordMatch(normalizedInput, matcher.keywords);
  }

  function hasActionMatch(normalizedInput, matcher) {
    if (typeof matcher.action === 'string' && normalizeInput(matcher.action) === normalizedInput) {
      return true;
    }

    if (!Array.isArray(matcher.actions) || matcher.actions.length === 0) {
      return false;
    }

    return matcher.actions.some(function (action) {
      return normalizeInput(String(action)) === normalizedInput;
    });
  }

  function getStatusTimeText() {
    var now = new Date();
    var hours = now.getHours() % 12;

    if (hours === 0) {
      hours = 12;
    }

    return hours + ':' + pad2(now.getMinutes());
  }

  function getTimelineTimeText() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = pad2(now.getMinutes());
    var meridiem = hours < 12 ? 'AM' : 'PM';

    if (hours === 0) {
      hours = 12;
    } else if (hours > 12) {
      hours -= 12;
    }

    return '今天 ' + pad2(hours) + ':' + minutes + ' ' + meridiem;
  }

  function getKnowledgeEntryForInput(input) {
    var normalizedInput = normalizeInput(input);

    if (!normalizedInput) {
      return null;
    }

    return scopedKnowledgeBase.find(function (entry) {
      return matchesInputRule(normalizedInput, entry);
    }) || null;
  }

  function getFlowDefinition(flowId) {
    if (!flowId) {
      return null;
    }

    var matchedEntry = scopedKnowledgeBase.find(function (entry) {
      return entry.flow && entry.flow.id === flowId;
    });

    return matchedEntry ? matchedEntry.flow : null;
  }

  function getScopedDefaultResponses() {
    if (allowAllTopics || allowedTopicIds.length !== 1) {
      return appData.defaultResponses;
    }

    if (appData.defaultResponsesByTopic && Array.isArray(appData.defaultResponsesByTopic[allowedTopicIds[0]])) {
      return appData.defaultResponsesByTopic[allowedTopicIds[0]];
    }

    switch (allowedTopicIds[0]) {
      case 'account-opening-start':
        return [
          {
            type: 'text',
            actions: ['開立滙豐商業戶口']
          }
        ];
      case 'account-opening-complete':
        return [
          {
            type: 'text',
            content: '目前此頁只支援開戶完成後的後續服務流程。請先登入查看戶口資料。',
            actions: []
          }
        ];
      case 'fx-hedging-flow':
        return [
          {
            type: 'text',
            content: '目前此頁只支援外匯對沖流程。您可直接輸入「外匯對沖」開始。',
            actions: ['外匯對沖']
          }
        ];
      case 'mainland-branch-flow':
        return [
          {
            type: 'text',
            content: '目前此頁只支援拓展內地分店流程。您可直接開始相關方案流程。',
            actions: ['拓展內地分店']
          }
        ];
      default:
        return appData.defaultResponses;
    }
  }

  function getDefaultResponses() {
    return cloneResponses(getScopedDefaultResponses(), null);
  }

  function ensureFlowAnswers(flowId) {
    if (!flowId) {
      return null;
    }

    if (!state.flowAnswers[flowId]) {
      state.flowAnswers[flowId] = {};
    }

    return state.flowAnswers[flowId];
  }

  function clearFlowAnswers(flowId) {
    if (!flowId || !state.flowAnswers[flowId]) {
      return;
    }

    delete state.flowAnswers[flowId];
  }

  function getFlowStepAnswer(flowId, stepId) {
    if (!flowId || !stepId || !state.flowAnswers[flowId]) {
      return '';
    }

    return state.flowAnswers[flowId][stepId] || '';
  }

  function setFlowStepAnswer(flowId, stepId, answer) {
    var answers = ensureFlowAnswers(flowId);

    if (!answers || !stepId) {
      return;
    }

    answers[stepId] = answer;
  }

  function interpolateTemplate(content, flowDefinition) {
    if (typeof content !== 'string' || !flowDefinition) {
      return content;
    }

    return content.replace(/\{\{\s*([^}]+?)\s*\}\}/g, function (_, token) {
      var value = getFlowStepAnswer(flowDefinition.id, token.trim());
      return value || '未提供';
    });
  }

  function cloneResponse(response, flowDefinition) {
    return {
      type: response.type,
      content: interpolateTemplate(response.content, flowDefinition),
      cardHeading: interpolateTemplate(response.cardHeading, flowDefinition),
      cardCategory: interpolateTemplate(response.cardCategory, flowDefinition),
      partnerCards: Array.isArray(response.partnerCards)
        ? response.partnerCards.map(function (card) {
            return {
              href: interpolateTemplate(card.href, flowDefinition),
              logo: interpolateTemplate(card.logo, flowDefinition),
              name: interpolateTemplate(card.name, flowDefinition),
              rating: interpolateTemplate(card.rating, flowDefinition)
            };
          })
        : [],
      imageTitle: interpolateTemplate(response.imageTitle, flowDefinition),
      imageSubtitle: interpolateTemplate(response.imageSubtitle, flowDefinition),
      imageAlt: interpolateTemplate(response.imageAlt, flowDefinition),
      delayMs: typeof response.delayMs === 'number' ? response.delayMs : null,
      actionPresentation: typeof response.actionPresentation === 'string' ? response.actionPresentation : '',
      actions: Array.isArray(response.actions)
        ? response.actions.map(function (action) {
            return interpolateTemplate(action, flowDefinition);
          })
        : []
    };
  }

  function cloneResponses(responses, flowDefinition) {
    if (!Array.isArray(responses)) {
      return [];
    }

    return responses.map(function (response) {
      return cloneResponse(response, flowDefinition);
    });
  }

  function getFlowStep(flowDefinition, stepId) {
    if (!flowDefinition || !stepId || !Array.isArray(flowDefinition.steps)) {
      return null;
    }

    return flowDefinition.steps.find(function (step) {
      return step.id === stepId;
    }) || null;
  }

  function getActiveFlowStep() {
    var flowDefinition = getFlowDefinition(state.activeFlowId);

    if (!flowDefinition || !state.activeFlowStepId) {
      return null;
    }

    return getFlowStep(flowDefinition, state.activeFlowStepId);
  }

  function getStepActionLabels(step) {
    if (!step || !Array.isArray(step.choices)) {
      return [];
    }

    return step.choices
      .map(function (choice) {
        return choice.action;
      })
      .filter(Boolean);
  }

  function getStepPromptResponses(flowDefinition, stepId) {
    var step = getFlowStep(flowDefinition, stepId);
    var promptActions;

    if (!step || !step.prompt) {
      return [];
    }

    promptActions = Array.isArray(step.prompt.actions) && step.prompt.actions.length > 0
      ? step.prompt.actions.slice()
      : getStepActionLabels(step);

    return [
      {
        type: step.prompt.type || 'text',
        content: interpolateTemplate(step.prompt.content, flowDefinition),
        cardHeading: interpolateTemplate(step.prompt.cardHeading, flowDefinition),
        cardCategory: interpolateTemplate(step.prompt.cardCategory, flowDefinition),
        partnerCards: Array.isArray(step.prompt.partnerCards)
          ? step.prompt.partnerCards.map(function (card) {
              return {
                logo: interpolateTemplate(card.logo, flowDefinition),
                name: interpolateTemplate(card.name, flowDefinition),
                rating: interpolateTemplate(card.rating, flowDefinition)
              };
            })
          : [],
        actionPresentation: typeof step.prompt.actionPresentation === 'string' ? step.prompt.actionPresentation : '',
        actions: promptActions.map(function (action) {
          return interpolateTemplate(action, flowDefinition);
        })
      }
    ];
  }

  function getSuggestedInputForStep(step) {
    var promptActions;
    var inputMode;

    if (!step) {
      return '';
    }

    inputMode = getStepInputMode(step);

    promptActions = Array.isArray(step.prompt && step.prompt.actions) && step.prompt.actions.length > 0
      ? step.prompt.actions.slice()
      : getStepTransitions(step)
        .map(function (transition) {
          return transition && transition.action ? transition.action : '';
        })
        .filter(Boolean);

    if (promptActions.length > 0) {
      return promptActions[0];
    }

    if ((inputMode === 'text' || inputMode === 'text-or-file') && typeof step.inputPlaceholder === 'string' && step.inputPlaceholder) {
      return step.inputPlaceholder;
    }

    if ((inputMode === 'file' || inputMode === 'text-or-file') && typeof step.uploadPlaceholder === 'string' && step.uploadPlaceholder) {
      return step.uploadPlaceholder;
    }

    if (inputMode === 'file') {
      return typeof step.uploadPlaceholder === 'string' && step.uploadPlaceholder
        ? step.uploadPlaceholder
        : '請使用上傳按鈕加入示範文件';
    }

    return step.prompt && typeof step.prompt.content === 'string' ? step.prompt.content : '';
  }

  function getLatestAssistantSuggestedInput() {
    var index;
    var message;

    for (index = state.messages.length - 1; index >= 0; index -= 1) {
      message = state.messages[index];

      if (!message || message.sender !== 'ai' || !Array.isArray(message.actions) || message.actions.length === 0) {
        continue;
      }

      return message.actions[0];
    }

    return '';
  }

  function getLatestAssistantReplayMessage() {
    var index;
    var message;

    for (index = state.messages.length - 1; index >= 0; index -= 1) {
      message = state.messages[index];

      if (!message || message.sender !== 'ai' || message.type === 'thinking') {
        continue;
      }

      return createAssistantMessage({
        sender: 'ai',
        type: message.type,
        content: message.content,
        cardHeading: message.cardHeading || '',
        cardCategory: message.cardCategory || '',
        partnerCards: message.partnerCards || [],
        actions: message.actions || [],
        actionPresentation: message.actionPresentation || '',
        files: message.files || []
      });
    }

    return null;
  }

  function getInvalidKeywordResponses() {
    var lastAssistantMessage = getLatestAssistantReplayMessage();
    var responses = [
      {
        type: 'text',
        content: '抱歉，我不懂您的意思。',
        actions: []
      }
    ];

    if (lastAssistantMessage) {
      responses.push(lastAssistantMessage);
    }

    return responses;
  }

  function dispatchNavigationState() {
    var activeStep;
    var suggestedInput;
    var inputMode;
    var detail;

    if (typeof window.dispatchEvent !== 'function' || typeof window.CustomEvent !== 'function') {
      return;
    }

    activeStep = getActiveFlowStep();
    inputMode = getStepInputMode(activeStep);
    suggestedInput = getSuggestedInputForStep(activeStep) || getLatestAssistantSuggestedInput();

    detail = {
      activeTopicId: state.currentTopicId,
      suggestedInput: suggestedInput,
      isFileStep: inputMode === 'file' || inputMode === 'text-or-file'
    };

    window.dispatchEvent(new window.CustomEvent('hsbc-navigation-state-change', {
      detail: detail
    }));

    postPresenterState(detail);
  }

  function postPresenterState(detail) {
    if (!window.opener || window.opener.closed || typeof window.opener.postMessage !== 'function') {
      return;
    }

    window.opener.postMessage({
      type: 'hsbc-presenter-state',
      pageId: document.body.getAttribute('data-page-id') || '',
      pageTitle: document.body.getAttribute('data-page-title') || document.title || '',
      pagePath: getCurrentPagePath(),
      activeTopicId: detail && detail.activeTopicId ? detail.activeTopicId : '',
      suggestedInput: detail && detail.suggestedInput ? detail.suggestedInput : ''
    }, '*');
  }

  function seedMessageInput(text) {
    if (!messageInput || !text) {
      return;
    }

    messageInput.value = text;
    messageInput.focus();
    syncMessageInputViewport();

    var evt = document.createEvent('Event');
    evt.initEvent('input', true, true);
    messageInput.dispatchEvent(evt);
  }

  function syncMessageInputViewport() {
    if (!messageInput) {
      return;
    }

    if (typeof messageInput.setSelectionRange === 'function') {
      messageInput.setSelectionRange(messageInput.value.length, messageInput.value.length);
    }

    messageInput.scrollLeft = messageInput.scrollWidth;
  }

  function clearPresenterTyping() {
    presenterState.typingTimeoutIds.forEach(function (timeoutId) {
      window.clearTimeout(timeoutId);
    });
    presenterState.typingTimeoutIds = [];
  }

  function typeMessageInput(text) {
    var value = String(text || '');

    clearPresenterTyping();

    if (!messageInput) {
      return;
    }

    messageInput.focus();
    messageInput.value = '';
    setComposerState();

    value.split('').forEach(function (character, index) {
      var timeoutId = window.setTimeout(function () {
        var evt = document.createEvent('Event');

        messageInput.value += character;
        syncMessageInputViewport();
        evt.initEvent('input', true, true);
        messageInput.dispatchEvent(evt);
      }, index * 75);

      presenterState.typingTimeoutIds.push(timeoutId);
    });
  }

  function handlePresenterCommand(data) {
    var commandId = data && data.commandId ? String(data.commandId) : '';
    var command = data && data.command ? String(data.command) : '';
    var text = data && data.text ? String(data.text) : '';

    if (!commandId || presenterState.handledCommandIds[commandId]) {
      return;
    }

    presenterState.handledCommandIds[commandId] = true;

    if (command === 'seed-input') {
      typeMessageInput(text);
      return;
    }

    if (command === 'send-text') {
      sendMessage(text);
      return;
    }

    if (command === 'send-current-input') {
      if (!sendButton.disabled) {
        sendButton.click();
      }
      return;
    }

    if (command === 'trigger-upload') {
      if (!uploadButton.hidden && !uploadButton.disabled) {
        uploadButton.click();
      }
    }
  }

  function getEntryResponses(entry) {
    var baseResponses = Array.isArray(entry.responses) ? entry.responses : [];
    var introResponses;
    var startPromptResponses;

    if (!entry.flow || !entry.flow.startStepId) {
      return baseResponses;
    }

    if (baseResponses.length > 0) {
      return baseResponses;
    }

    introResponses = Array.isArray(entry.flow.introResponses) ? entry.flow.introResponses : [];
    startPromptResponses = getStepPromptResponses(entry.flow, entry.flow.startStepId);

    return cloneResponses(introResponses, entry.flow).concat(startPromptResponses);
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

  function getStepInputMode(step) {
    if (!step || (step.inputMode !== 'text' && step.inputMode !== 'file' && step.inputMode !== 'text-or-file')) {
      return '';
    }

    return step.inputMode;
  }

  function isCaptureStep(step) {
    return Boolean(getStepInputMode(step));
  }

  function getCaptureStepResponses(step, flowDefinition) {
    if (Array.isArray(step.captureResponses) && step.captureResponses.length > 0) {
      return cloneResponses(step.captureResponses, flowDefinition);
    }

    return [
      {
        type: 'text',
        content: getStepInputMode(step) === 'file' ? '已收到您上傳的文件。' : '已收到您輸入的資料。',
        actions: []
      }
    ];
  }

  function handleCaptureStepSubmission(step, flowDefinition, submission) {
    var inputMode = getStepInputMode(step);
    var answerValue;
    var responses;

    if (inputMode === 'file') {
      if (!submission || submission.kind !== 'file' || !Array.isArray(submission.files) || submission.files.length === 0) {
        return [
          {
            type: 'text',
            content: '這一步請使用下方的上傳按鈕加入示範文件。',
            actions: []
          }
        ];
      }

      answerValue = submission.answer || getSubmissionText(submission);
    } else if (inputMode === 'text-or-file') {
      if (submission && submission.kind === 'file') {
        if (!Array.isArray(submission.files) || submission.files.length === 0) {
          return [
            {
              type: 'text',
              content: '這一步請直接輸入連結或資料，或使用上傳按鈕加入示範文件。',
              actions: []
            }
          ];
        }

        answerValue = submission.answer || getSubmissionText(submission);
      } else {
        answerValue = getSubmissionText(submission);

        if (!answerValue) {
          return [
            {
              type: 'text',
              content: '這一步請直接輸入連結或資料，或使用上傳按鈕加入示範文件。',
              actions: []
            }
          ];
        }
      }
    } else {
      answerValue = getSubmissionText(submission);

      if (!answerValue) {
        return [
          {
            type: 'text',
            content: '這一步請先輸入資料，然後再按發送。',
            actions: []
          }
        ];
      }
    }

    setFlowStepAnswer(state.activeFlowId, step.id, answerValue);
    responses = getCaptureStepResponses(step, flowDefinition);

    if (step.clearFlow) {
      clearFlowAnswers(state.activeFlowId);
      setActiveFlow(null, null);
    } else if (step.nextStepId) {
      setActiveFlow(state.activeFlowId, step.nextStepId);

      if (!step.skipNextPromptResponses) {
        responses = responses.concat(getStepPromptResponses(flowDefinition, step.nextStepId));
      }
    }

    return responses.length > 0 ? responses : getDefaultResponses();
  }

  function getMatchedFlowTransition(step, input) {
    var normalizedInput = normalizeInput(input);

    return getStepTransitions(step).find(function (transition) {
      return hasActionMatch(normalizedInput, transition) || matchesInputRule(normalizedInput, transition);
    }) || null;
  }

  function getContextFreeResponseForInput(input) {
    var normalizedInput = normalizeInput(input);

    if (!normalizedInput || !Array.isArray(appData.contextFreeResponses)) {
      return null;
    }

    return appData.contextFreeResponses.find(function (entry) {
      return matchesInputRule(normalizedInput, entry);
    }) || null;
  }

  function setActiveFlow(flowId, stepId) {
    if (state.activeFlowId && state.activeFlowId !== flowId) {
      clearFlowAnswers(state.activeFlowId);
    }

    state.activeFlowId = flowId || null;
    state.activeFlowStepId = stepId || null;

    if (!flowId) {
      return;
    }

    ensureFlowAnswers(flowId);
  }

  function getTransitionAnswerLabel(transition, input) {
    if (typeof transition.action === 'string' && transition.action) {
      return transition.action;
    }

    return input;
  }

  function resolveResponses(rawSubmission) {
    var submission = normalizeSubmission(rawSubmission);
    var input = getSubmissionText(submission);
    var knowledgeEntry;
    var activeFlowStep = getActiveFlowStep();
    var activeFlowDefinition = getFlowDefinition(state.activeFlowId);
    var matchedTransition;
    var contextFreeResponse;
    var transitionResponses;

    if (!submission) {
      setCurrentTopic(null);
      setActiveFlow(null, null);
      return getDefaultResponses();
    }

    if (activeFlowStep && isCaptureStep(activeFlowStep)) {
      return handleCaptureStepSubmission(activeFlowStep, activeFlowDefinition, submission);
    }

    transitionResponses = getInitialActionResponses(input);

    if (transitionResponses) {
      return transitionResponses;
    }

    knowledgeEntry = getKnowledgeEntryForInput(input);

    if (knowledgeEntry) {
      setCurrentTopic(getEntryTopicId(knowledgeEntry));

      if (knowledgeEntry.flow && knowledgeEntry.flow.startStepId) {
        setActiveFlow(knowledgeEntry.flow.id, knowledgeEntry.flow.startStepId);
      } else {
        setActiveFlow(null, null);
      }

      return getEntryResponses(knowledgeEntry);
    }

    if (activeFlowStep) {
      matchedTransition = getMatchedFlowTransition(activeFlowStep, input);

      if (matchedTransition) {
        setFlowStepAnswer(state.activeFlowId, activeFlowStep.id, getTransitionAnswerLabel(matchedTransition, input));
        transitionResponses = cloneResponses(matchedTransition.responses, activeFlowDefinition);

        if (matchedTransition.clearFlow) {
          clearFlowAnswers(state.activeFlowId);
          setActiveFlow(null, null);
        } else if (matchedTransition.nextStepId) {
          setActiveFlow(state.activeFlowId, matchedTransition.nextStepId);
          transitionResponses = transitionResponses.concat(getStepPromptResponses(activeFlowDefinition, matchedTransition.nextStepId));
        }

        return transitionResponses.length > 0 ? transitionResponses : getDefaultResponses();
      }

      return getInvalidKeywordResponses();
    }

    contextFreeResponse = getContextFreeResponseForInput(input);

    if (contextFreeResponse) {
      setActiveFlow(null, null);
      setCurrentTopic(null);
      return contextFreeResponse.responses;
    }

    setActiveFlow(null, null);
    setCurrentTopic(null);
    return getDefaultResponses();
  }

  function updateTimeElements() {
    statusTime.textContent = getStatusTimeText();
    timelineLabel.textContent = getTimelineTimeText();
  }

  function createChevron() {
    return '<span class="chevron" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg></span>';
  }

  function createThinkingDots() {
    return '<span class="thinking-dots" aria-hidden="true"><span></span><span></span><span></span></span>';
  }

  function renderMessage(message) {
    var row = document.createElement('div');
    row.className = 'message-row ' + message.sender;

    var bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    if (message.type === 'thinking') {
      bubble.className += ' thinking-bubble';
      bubble.innerHTML = (message.content ? '<p>' + escapeHtml(message.content) + '</p>' : '') + createThinkingDots();
    } else if (message.type === 'partner-carousel') {
      bubble.className += ' partner-carousel-bubble';
      bubble.innerHTML =
        '<div class="partner-carousel-header">' +
          '<strong>' + escapeHtml(message.cardHeading || 'HSBC Verified Partner') + '</strong>' +
          '<span>' + escapeHtml(message.cardCategory || '') + '</span>' +
        '</div>' +
        '<div class="partner-carousel-track">' +
          (Array.isArray(message.partnerCards) ? message.partnerCards.map(function (card) {
            var tagName = card.href ? 'button' : 'article';
            var openTag = card.href
              ? '<button class="partner-card partner-card-button" type="button" data-link-target="' + escapeHtml(card.href || '') + '">'
              : '<article class="partner-card">';
            var closeTag = card.href ? '</button>' : '</article>';

            return '' +
              openTag +
                '<div class="partner-card-logo-wrap">' +
                  '<img class="partner-card-logo" src="' + escapeHtml(card.logo || '') + '" alt="' + escapeHtml((card.name || 'Verified Partner') + ' logo') + '">' +
                '</div>' +
                '<div class="partner-card-body">' +
                  '<strong>' + escapeHtml(card.name || '') + '</strong>' +
                  '<span>' + escapeHtml(card.rating || '') + '</span>' +
                '</div>' +
              closeTag;
          }).join('') : '') +
        '</div>';
    } else if (message.type === 'image') {
      bubble.innerHTML =
        '<div class="image-card">' +
          '<img src="' + escapeHtml(message.content) + '" alt="' + escapeHtml(message.imageAlt || 'HSBC Content') + '" referrerpolicy="no-referrer">' +
          '<div class="image-caption">' +
            '<strong>' + escapeHtml(message.imageTitle || '滙豐萬事屋資訊') + '</strong>' +
            '<span>' + escapeHtml(message.imageSubtitle || '點擊查看詳情及條款') + '</span>' +
          '</div>' +
        '</div>';
    } else if (message.type === 'file-preview') {
      bubble.className += ' file-preview-bubble';
      bubble.appendChild(createFilePreviewContent(Array.isArray(message.files) ? message.files : []));
    } else {
      var actionsMarkup = '';
      var isDirectReply = message.actionPresentation === 'direct-reply';

      if (Array.isArray(message.actions) && message.actions.length > 0) {
        actionsMarkup = isDirectReply
          ? '<div class="direct-reply-box">' +
              message.actions
                .map(function (action) {
                  return '<button class="direct-reply-button" type="button" data-action="' + escapeHtml(action) + '"><span>' + escapeHtml(action) + '</span></button>';
                })
                .join('') +
            '</div>'
          : '<div class="actions-box">' +
              '<div class="label">您可以試試問：</div>' +
              '<div class="action-list">' +
                message.actions
                  .map(function (action) {
                    return '<button class="action-button" type="button" data-action="' + escapeHtml(action) + '"><span>「' + escapeHtml(action) + '」</span>' + createChevron() + '</button>';
                  })
                  .join('') +
              '</div>' +
            '</div>';
      }

      bubble.innerHTML = '<p>' + escapeHtml(message.content) + '</p>' + actionsMarkup;
    }

    row.appendChild(bubble);
    return row;
  }

  function scrollToLatest() {
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function renderMessages() {
    messageList.innerHTML = '';

    state.messages.forEach(function (message) {
      messageList.appendChild(renderMessage(message));
    });

    scrollToLatest();
    setComposerState();
    dispatchNavigationState();
  }

  function findResponses(input) {
    return resolveResponses(input);
  }

  function removeThinkingMessage() {
    if (!state.thinkingMessageId) {
      return;
    }

    state.messages = state.messages.filter(function (message) {
      return message.id !== state.thinkingMessageId;
    });
    state.thinkingMessageId = null;
    renderMessages();
  }

  function showThinkingMessage() {
    var messageId = createMessageId();

    removeThinkingMessage();
    state.thinkingMessageId = messageId;
    state.messages.push({
      id: messageId,
      sender: 'ai',
      type: 'thinking',
      content: '',
      actions: []
    });
    renderMessages();
  }

  function updateThinkingMessage(response) {
    var thinkingMessage;

    if (!state.thinkingMessageId) {
      showThinkingMessage();
    }

    thinkingMessage = state.messages.find(function (message) {
      return message.id === state.thinkingMessageId;
    });

    if (!thinkingMessage) {
      return;
    }

    thinkingMessage.type = 'thinking';
    thinkingMessage.content = response.content;
    thinkingMessage.actions = response.actions || [];
    renderMessages();
  }

  function replaceThinkingMessage(response) {
    var thinkingMessage;

    if (!state.thinkingMessageId) {
      return false;
    }

    thinkingMessage = state.messages.find(function (message) {
      return message.id === state.thinkingMessageId;
    });

    if (!thinkingMessage) {
      state.thinkingMessageId = null;
      return false;
    }

    thinkingMessage.type = response.type;
    thinkingMessage.content = response.content;
    thinkingMessage.actions = response.actions || [];
    state.thinkingMessageId = null;
    renderMessages();
    return true;
  }

  function setComposerState() {
    var activeStep = getActiveFlowStep();
    var inputMode = getStepInputMode(activeStep);
    var isFileStep = inputMode === 'file';
    var allowsFileUpload = inputMode === 'file' || inputMode === 'text-or-file';

    if (isFileStep) {
      messageInput.value = '';
    }

    messageInput.disabled = isFileStep;
    messageInput.placeholder = isFileStep
      ? (activeStep && typeof activeStep.uploadPlaceholder === 'string'
        ? activeStep.uploadPlaceholder
        : '此步驟請使用上傳按鈕加入文件。')
      : (activeStep && typeof activeStep.inputPlaceholder === 'string'
        ? activeStep.inputPlaceholder
        : (inputMode === 'text-or-file' && activeStep && typeof activeStep.uploadPlaceholder === 'string'
          ? activeStep.uploadPlaceholder
          : defaultComposerPlaceholder));

    if (inputMode === 'text-or-file' && activeStep && typeof activeStep.inputPlaceholder === 'string' && activeStep.inputPlaceholder) {
      messageInput.placeholder = activeStep.inputPlaceholder;
    }

    uploadButton.hidden = !allowsFileUpload;
    uploadButton.disabled = !allowsFileUpload;
    fileUploadInput.accept = activeStep && typeof activeStep.fileAccept === 'string' ? activeStep.fileAccept : '';
    fileUploadInput.multiple = !(activeStep && activeStep.fileMultiple === false);
    sendButton.disabled = isFileStep || messageInput.value.trim().length === 0;
  }

  function getResponseDelayMs() {
    var activeStep = getActiveFlowStep();

    if (!activeStep || typeof activeStep.responseDelayMs !== 'number') {
      return 500;
    }

    return Math.max(0, activeStep.responseDelayMs);
  }

  function queueAssistantResponses(input) {
    var responseDelay = getResponseDelayMs();

    showThinkingMessage();

    var replyTimeout = window.setTimeout(function () {
      var responses = findResponses(input);
      var hasThinkingResponse = responses.some(function (response) {
        return response && response.type === 'thinking';
      });
      var cumulativeDelay = 0;

      responses.forEach(function (response, index) {
        var bubbleTimeout = window.setTimeout(function () {
          if (response.type === 'thinking') {
            updateThinkingMessage(response);
            return;
          }

          if (hasThinkingResponse && replaceThinkingMessage(response)) {
            return;
          }

          if (index === 0) {
            removeThinkingMessage();
          }

          response.id = createMessageId();
          response.sender = 'ai';
          state.messages.push(createAssistantMessage(response));
          renderMessages();
        }, cumulativeDelay);

        state.timeouts.push(bubbleTimeout);
        cumulativeDelay += typeof response.delayMs === 'number'
          ? Math.max(0, response.delayMs)
          : (index === 0 ? 0 : 800);
      });

      if (responses.length === 0) {
        removeThinkingMessage();
      }
    }, responseDelay);

    state.timeouts.push(replyTimeout);
  }

  function sendSubmission(submission) {
    if (!submission) {
      return;
    }

    state.messages.push({
      id: createMessageId(),
      sender: 'user',
      type: 'text',
      content: submission.userMessage,
      actions: []
    });

    if (submission.kind === 'file' && Array.isArray(submission.files) && submission.files.length > 0) {
      state.messages.push({
        id: createMessageId(),
        sender: 'user',
        type: 'file-preview',
        content: '',
        actions: [],
        files: submission.files.map(function (file) {
          return cloneUploadedFile(file);
        })
      });
    }

    renderMessages();
    messageInput.value = '';
    fileUploadInput.value = '';
    setComposerState();
    queueAssistantResponses(submission);
  }

  function sendMessage(rawValue) {
    sendSubmission(createTextSubmission(rawValue));
  }

  function sendUploadedFiles(fileList) {
    sendSubmission(createFileSubmission(fileList));
  }

  function consumeInitialRouteParams() {
    var params = new URLSearchParams(window.location.search);
    var hasEntry = params.has('entry');
    var queryTopic = params.get('topic');
    var nextUrl;

    if (!queryTopic && !hasEntry) {
      return;
    }

    if (queryTopic) {
      params.delete('topic');
    }

    if (hasEntry) {
      params.delete('entry');
    }

    if (!queryTopic && !hasEntry) {
      return;
    }

    nextUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + window.location.hash;

    if (window.history && typeof window.history.replaceState === 'function') {
      window.history.replaceState(null, '', nextUrl);
    }
  }

  sendButton.addEventListener('click', function () {
    sendMessage(messageInput.value);
  });

  uploadButton.addEventListener('click', function () {
    if (uploadButton.disabled) {
      return;
    }

    fileUploadInput.click();
  });

  fileUploadInput.addEventListener('change', function (event) {
    var files = event.target.files;
    if (files && files.length > 0) {
      sendUploadedFiles(files);
    }
    event.target.value = '';
  });

  messageInput.addEventListener('input', setComposerState);

  messageInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      sendMessage(messageInput.value);
    }
  });

  messageList.addEventListener('click', function (event) {
    var linkTarget = event.target.closest('[data-link-target]');
    var actionButton = event.target.closest('[data-action]');

    if (linkTarget) {
      window.location.href = linkTarget.getAttribute('data-link-target') || '';
      return;
    }

    if (!actionButton) {
      return;
    }

    sendMessage(actionButton.getAttribute('data-action') || '');
  });

  window.addEventListener('beforeunload', function () {
    if (authState.loginTimeoutId) {
      window.clearTimeout(authState.loginTimeoutId);
    }

    if (pageAutomationState.initialActionTimeoutId) {
      window.clearTimeout(pageAutomationState.initialActionTimeoutId);
    }

    clearPresenterTyping();

    state.timeouts.forEach(function (timeoutId) {
      window.clearTimeout(timeoutId);
    });
  });

  window.addEventListener('message', function (event) {
    var data = event.data || {};

    if (!data || data.type !== 'hsbc-presenter-command') {
      return;
    }

    handlePresenterCommand(data);
  });

  updateTimeElements();
  window.setInterval(updateTimeElements, 1000);
  initializeAuthControl();
  renderMessages();
  setComposerState();
  autoStartInitialAction();
  consumeInitialRouteParams();
})();