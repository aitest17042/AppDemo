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
  var statusTime = document.getElementById('statusTime');
  var timelineLabel = document.getElementById('timelineLabel');

  if (!chatArea || !messageList || !messageInput || !sendButton || !statusTime || !timelineLabel) {
    console.error('Chat UI failed to initialize.');
    return;
  }

  var state = {
    messages: [cloneMessage(appData.initialMessage)],
    timeouts: [],
    activeFlowId: null,
    activeFlowStepId: null,
    flowAnswers: {},
    thinkingMessageId: null
  };

  function cloneMessage(message) {
    return {
      id: message.id || null,
      sender: message.sender,
      type: message.type,
      content: message.content,
      actions: Array.isArray(message.actions) ? message.actions.slice() : []
    };
  }

  function createMessageId() {
    return 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
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

    return appData.knowledgeBase.find(function (entry) {
      return matchesInputRule(normalizedInput, entry);
    }) || null;
  }

  function getFlowDefinition(flowId) {
    if (!flowId) {
      return null;
    }

    var matchedEntry = appData.knowledgeBase.find(function (entry) {
      return entry.flow && entry.flow.id === flowId;
    });

    return matchedEntry ? matchedEntry.flow : null;
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
        actions: promptActions.map(function (action) {
          return interpolateTemplate(action, flowDefinition);
        })
      }
    ];
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

  function resolveResponses(input) {
    var knowledgeEntry = getKnowledgeEntryForInput(input);
    var activeFlowStep = getActiveFlowStep();
    var activeFlowDefinition = getFlowDefinition(state.activeFlowId);
    var matchedTransition;
    var contextFreeResponse;
    var transitionResponses;

    if (knowledgeEntry) {
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

        return transitionResponses.length > 0 ? transitionResponses : appData.defaultResponses;
      }

      setActiveFlow(null, null);
      return appData.defaultResponses;
    }

    contextFreeResponse = getContextFreeResponseForInput(input);

    if (contextFreeResponse) {
      setActiveFlow(null, null);
      return contextFreeResponse.responses;
    }

    setActiveFlow(null, null);
    return appData.defaultResponses;
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
      bubble.innerHTML = createThinkingDots();
    } else if (message.type === 'image') {
      bubble.innerHTML =
        '<div class="image-card">' +
          '<img src="' + escapeHtml(message.content) + '" alt="HSBC Content" referrerpolicy="no-referrer">' +
          '<div class="image-caption">' +
            '<strong>HSBC SME 專屬資訊</strong>' +
            '<span>點擊查看詳情及條款</span>' +
          '</div>' +
        '</div>';
    } else {
      var actionsMarkup = '';

      if (Array.isArray(message.actions) && message.actions.length > 0) {
        actionsMarkup =
          '<div class="actions-box">' +
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

  function setComposerState() {
    sendButton.disabled = messageInput.value.trim().length === 0;
  }

  function queueAssistantResponses(input) {
    showThinkingMessage();

    var replyTimeout = window.setTimeout(function () {
      var responses = findResponses(input);

      responses.forEach(function (response, index) {
        var bubbleTimeout = window.setTimeout(function () {
          if (index === 0) {
            removeThinkingMessage();
          }

          state.messages.push({
            id: createMessageId(),
            sender: 'ai',
            type: response.type,
            content: response.content,
            actions: response.actions || []
          });
          renderMessages();
        }, index * 800);

        state.timeouts.push(bubbleTimeout);
      });

      if (responses.length === 0) {
        removeThinkingMessage();
      }
    }, 500);

    state.timeouts.push(replyTimeout);
  }

  function sendMessage(rawValue) {
    var value = rawValue.trim();

    if (!value) {
      return;
    }

    state.messages.push({
      sender: 'user',
      type: 'text',
      content: value,
      actions: []
    });

    renderMessages();
    messageInput.value = '';
    setComposerState();
    queueAssistantResponses(value);
  }

  function consumeInitialTopicFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var topic = params.get('topic');
    var nextUrl;

    if (!topic) {
      return;
    }

    sendMessage(topic);
    params.delete('topic');
    nextUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + window.location.hash;

    if (window.history && typeof window.history.replaceState === 'function') {
      window.history.replaceState(null, '', nextUrl);
    }
  }

  sendButton.addEventListener('click', function () {
    sendMessage(messageInput.value);
  });

  messageInput.addEventListener('input', setComposerState);

  messageInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      sendMessage(messageInput.value);
    }
  });

  messageList.addEventListener('click', function (event) {
    var actionButton = event.target.closest('[data-action]');

    if (!actionButton) {
      return;
    }

    sendMessage(actionButton.getAttribute('data-action') || '');
  });

  window.addEventListener('beforeunload', function () {
    state.timeouts.forEach(function (timeoutId) {
      window.clearTimeout(timeoutId);
    });
  });

  updateTimeElements();
  window.setInterval(updateTimeElements, 1000);
  renderMessages();
  setComposerState();
  consumeInitialTopicFromUrl();
})();