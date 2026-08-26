(function () {
  var appData = window.HSBCKnowledgeBase;
  var appSetup = window.HSBCAppSetup || {};

  if (!appData) {
    console.error('HSBCKnowledgeBase did not load.');
    return;
  }

  var chatArea = document.getElementById('chatArea');
  var messageList = document.getElementById('messageList');
  var phoneScreen = document.querySelector('.phone-screen');
  var messageInput = document.getElementById('messageInput');
  var sendButton = document.getElementById('sendButton');
  var uploadButton = document.getElementById('uploadButton');
  var fileUploadInput = document.getElementById('fileUploadInput');
  var statusTime = document.getElementById('statusTime');
  var timelineLabel = document.getElementById('timelineLabel');
  var headerActions = document.querySelector('.header-actions');
  var allowAllTopics = document.body.getAttribute('data-allow-all-topics') === 'true';
  var defaultTopicId = document.body.getAttribute('data-default-topic-id') || '';

  if (!chatArea || !messageList || !phoneScreen || !messageInput || !sendButton || !uploadButton || !fileUploadInput || !statusTime || !timelineLabel) {
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
    pendingRewindSnapshot: null,
    thinkingMessageId: null,
    currentTopicId: initialRouteState.initialTopicId || defaultTopicId || null,
    passportAnimationTimeoutId: null,
    passportAnimationAutoCollapseId: null,
    passportBlockedMessages: []
  };

  var authState = {
    isLoggedIn: document.body.getAttribute('data-auto-login') === 'true' || Boolean(headerActions && headerActions.querySelector('.header-user')) || isSessionSignedIn(),
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
  var renderState = {
    renderedKeys: []
  };

  function isSessionSignedIn() {
    try {
      return window.sessionStorage.getItem('hsbc-v2-signed-in') === 'true';
    } catch (error) {
      return false;
    }
  }

  function setSessionSignedIn(isSignedIn) {
    try {
      if (isSignedIn) {
        window.sessionStorage.setItem('hsbc-v2-signed-in', 'true');
      } else {
        window.sessionStorage.removeItem('hsbc-v2-signed-in');
      }
    } catch (error) {
      return;
    }
  }

  function updateSignedInSuggestions() {
    var hasUserMessage = state.messages.some(function (message) {
      return message.sender === 'user';
    });
    var firstAssistantMessage;

    if (!authState.isLoggedIn || hasUserMessage) {
      return;
    }

    firstAssistantMessage = state.messages.find(function (message) {
      return message.sender === 'ai' && message.type === 'text';
    });

    if (firstAssistantMessage) {
      firstAssistantMessage.actions = ['My latest transaction', 'HKD to SGD current rate'];
      renderMessages();
    }
  }

  function resetSignedOutSuggestions() {
    var firstAssistantMessage = state.messages.find(function (message) {
      return message.sender === 'ai' && message.type === 'text';
    });

    if (firstAssistantMessage) {
      firstAssistantMessage.actions = ['I want to open an HSBC business account.', 'I am an existing customer and want to make a transaction.'];
      renderMessages();
    }
  }

  function isUkAccountOpen() {
    try {
      return window.sessionStorage.getItem('hsbc-v2-uk-account-open') === 'true';
    } catch (error) {
      return false;
    }
  }

  function setUkAccountOpen(isOpen) {
    try {
      if (isOpen) {
        window.sessionStorage.setItem('hsbc-v2-uk-account-open', 'true');
      } else {
        window.sessionStorage.removeItem('hsbc-v2-uk-account-open');
      }
    } catch (error) {
      return;
    }
  }

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
      countryOptions: Array.isArray(message.countryOptions)
        ? message.countryOptions.map(function (countryCode) {
            return String(countryCode || '').trim();
          }).filter(Boolean)
        : [],
      selectedCountryCodes: message.selectedCountryCodes && typeof message.selectedCountryCodes === 'object'
        ? Object.assign({}, message.selectedCountryCodes)
        : {},
      pendingCountryCode: typeof message.pendingCountryCode === 'string' ? message.pendingCountryCode : '',
      countryCode: typeof message.countryCode === 'string' ? message.countryCode : '',
      confirmTemplate: typeof message.confirmTemplate === 'string' ? message.confirmTemplate : '',
      files: Array.isArray(message.files)
        ? message.files.map(function (file) {
            return cloneUploadedFile(file);
          })
        : [],
      rewindSnapshot: message.rewindSnapshot || null
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

  function saveConversationForCountryReturn() {
    if (!window.sessionStorage || getCurrentPagePath() !== '01_account-opening-start.html') {
      return;
    }

    try {
      window.sessionStorage.setItem('hsbc-v2-start-chat', JSON.stringify({
        messages: state.messages,
        activeFlowId: state.activeFlowId,
        activeFlowStepId: state.activeFlowStepId,
        currentTopicId: state.currentTopicId,
        flowAnswers: state.flowAnswers
      }));
    } catch (error) {
      return;
    }
  }

  function restoreConversationForCountryReturn() {
    var snapshot;

    if (!window.sessionStorage || getCurrentPagePath() !== '01_account-opening-start.html') {
      return;
    }

    try {
      snapshot = JSON.parse(window.sessionStorage.getItem('hsbc-v2-start-chat') || 'null');
      window.sessionStorage.removeItem('hsbc-v2-start-chat');
    } catch (error) {
      return;
    }

    if (!snapshot || !Array.isArray(snapshot.messages)) {
      return;
    }

    state.messages = snapshot.messages.map(function (message) {
      return createAssistantMessage(message);
    });
    state.activeFlowId = snapshot.activeFlowId || null;
    state.activeFlowStepId = snapshot.activeFlowStepId || null;
    state.currentTopicId = snapshot.currentTopicId || null;
    state.flowAnswers = snapshot.flowAnswers || {};
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
    return '<button class="login-button' + (authState.isLoading ? ' is-loading' : '') + '" type="button" data-auth-action="login"' + (authState.isLoading ? ' disabled aria-busy="true"' : '') + '>' + (authState.isLoading ? (appSetup.signInLoadingLabel || 'Signing in...') : (appSetup.signInLabel || 'Sign in')) + '</button>';
  }

  function getUserMenuMarkup() {
    return '' +
      '<div class="header-user-menu">' +
        '<button class="header-user header-user-trigger" type="button" data-auth-action="toggle-menu" aria-haspopup="menu" aria-expanded="false" aria-label="Signed-in user menu">' +
          '<img class="header-user-avatar" src="./assets/media/icons/chiikawa_icon.png" alt="Signed-in user" />' +
          '<span class="header-user-verified" aria-hidden="true">' +
            '<svg width="8" height="8" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">' +
              '<path d="M2.5 6.2 4.8 8.4 9.5 3.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>' +
          '</span>' +
        '</button>' +
        '<div class="header-user-dropdown" role="menu" hidden>' +
          '<button class="header-user-dropdown-item" type="button" data-auth-action="logout" role="menuitem">' + (appSetup.signOutLabel || 'Sign out') + '</button>' +
        '</div>' +
      '</div>' +
      '<button class="header-expand-trigger" type="button" data-auth-action="toggle-header-panel" aria-expanded="false" aria-label="Expand account menu">⌄</button>' +
      '<div class="header-expand-panel" hidden>' +
        '<div class="header-expand-option header-expand-country">' +
          '<button class="header-expand-option-button" type="button">Country <span>HK</span></button>' +
          '<div class="header-country-menu">' +
            ['HK', 'SG', 'UK', 'UAE', 'IN', 'MY'].map(function (country) {
              var isOpen = country === 'HK' || (country === 'UK' && isUkAccountOpen());
              return '<button class="header-country-option' + (isOpen ? ' is-current' : '') + '" type="button" data-country-code="' + country + '"><span>' + country + '</span><span class="header-country-switch" role="switch" aria-checked="' + (isOpen ? 'true' : 'false') + '"><span></span></span></button>';
            }).join('') +
            '<div class="header-country-confirm" hidden><p>Using your NEX Passport, we can help you open a UK account directly.</p><div><button type="button" data-country-confirm="yes">Confirm</button><button type="button" data-country-confirm="no">Cancel</button></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="header-expand-option header-expand-products">' +
          '<button class="header-expand-option-button" type="button">Products <span>⌄</span></button>' +
          '<div class="header-products-menu"><button class="header-product-option" type="button" data-product-code="Borrow">Borrow</button><button class="header-product-option" type="button" data-product-code="Card">Card <span>⌄</span></button><div class="header-card-menu" hidden><button class="header-card-option" type="button" data-card-code="Credit card"><span>Credit card</span><span class="header-product-switch" role="switch" aria-checked="false"><span></span></span></button><button class="header-card-option" type="button" data-card-code="Debit card"><span>Debit card</span><span class="header-product-switch" role="switch" aria-checked="false"><span></span></span></button><div class="header-product-confirm" hidden><p></p><div><button type="button" data-product-confirm="yes">Confirm</button><button type="button" data-product-confirm="no">Cancel</button></div></div></div><button class="header-product-option" type="button" data-product-code="Investment">Investment</button><button class="header-product-option" type="button" data-product-code="Trade">Trade</button><button class="header-product-option" type="button" data-product-code="Other Products & Solutions">Other Products &amp; Solutions</button></div>' +
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
    setupHeaderExpandPanel();
  }

  function setupHeaderExpandPanel() {
    var panel = headerActions.querySelector('.header-expand-panel');
    var countryOption = headerActions.querySelector('.header-expand-country');
    var productsOption = headerActions.querySelector('.header-expand-products');
    var countryMenu = headerActions.querySelector('.header-country-menu');
    var productsMenu = headerActions.querySelector('.header-products-menu');
    var commonMenu;

    if (!panel || !countryOption || !productsOption || !countryMenu || !productsMenu || panel.querySelector('.header-common-submenu')) {
      return;
    }

    function syncActiveCountryLabel() {
      var label = headerActions.querySelector('.header-expand-country .header-expand-option-button span');
      var activeCountries = Array.prototype.slice.call(headerActions.querySelectorAll('.header-country-option.is-current'))
        .map(function (option) { return option.getAttribute('data-country-code'); });

      if (label) {
        label.textContent = activeCountries.join(', ');
      }
    }

    commonMenu = document.createElement('div');
    commonMenu.className = 'header-common-submenu';
    commonMenu.appendChild(countryMenu);
    productsOption.remove();
    var selectProductButton = document.createElement('button');
    selectProductButton.className = 'header-select-product';
    selectProductButton.type = 'button';
    selectProductButton.textContent = 'Select product';
    countryMenu.appendChild(selectProductButton);
    commonMenu.appendChild(productsMenu);
    panel.appendChild(commonMenu);

    productsMenu.querySelectorAll('.header-product-option').forEach(function (option) {
      if (!option.querySelector('span')) {
        option.insertAdjacentHTML('beforeend', '<span>⌄</span>');
      }
    });

    var defaultDebitCard = productsMenu.querySelector('[data-card-code="Debit card"]');
    if (defaultDebitCard) {
      defaultDebitCard.classList.add('is-current');
      defaultDebitCard.querySelector('.header-product-switch').setAttribute('aria-checked', 'true');
    }

    function moveSelectProductButton(countryCode) {
      var selectedOption = countryMenu.querySelector('[data-country-code="' + countryCode + '"]');
      if (selectedOption) {
        selectedOption.insertAdjacentElement('afterend', selectProductButton);
      }
    }

    moveSelectProductButton(countryMenu.querySelector('.header-country-option.is-current').getAttribute('data-country-code'));

    countryOption.addEventListener('mouseenter', function () {
      panel.classList.add('show-country-menu');
      panel.classList.remove('show-products-menu');
    });
    countryOption.addEventListener('focusin', function () {
      panel.classList.add('show-country-menu');
      panel.classList.remove('show-products-menu');
    });

    syncActiveCountryLabel();
  }

  function beginLoginLoading(delayMs) {
    var loadingDelay = typeof delayMs === 'number' && delayMs >= 0 ? delayMs : 1000;

    if (authState.isLoading || authState.isLoggedIn) {
      return;
    }

    authState.isLoading = true;
    renderAuthControl();

    authState.loginTimeoutId = window.setTimeout(function () {
      authState.isLoading = false;
      authState.loginTimeoutId = null;
      authState.isLoggedIn = true;
      setSessionSignedIn(true);
      renderAuthControl();
      updateSignedInSuggestions();
    }, loadingDelay);
  }

  function initializeAuthControl() {
    if (!headerActions) {
      return;
    }

    renderAuthControl();

    headerActions.addEventListener('click', function (event) {
      var actionTarget = event.target.closest('[data-auth-action]');
      var countryOption = event.target.closest('.header-country-option');
      var countryConfirm = event.target.closest('[data-country-confirm]');
      var productOption = event.target.closest('.header-product-option');
      var cardOption = event.target.closest('.header-card-option');
      var productConfirm = event.target.closest('[data-product-confirm]');
      var selectProductButton = event.target.closest('.header-select-product');
      var action;

      if (selectProductButton) {
        var expandPanel = headerActions.querySelector('.header-expand-panel');
        var activeCountry = expandPanel.getAttribute('data-selected-country') || 'HK';
        var selectedCountryOption = headerActions.querySelector('[data-country-code="' + activeCountry + '"]');
        if (selectedCountryOption && selectedCountryOption.classList.contains('is-current')) {
          expandPanel.classList.add('show-products-menu');
          expandPanel.classList.remove('show-country-products');
          headerActions.querySelector('.header-products-menu').setAttribute('data-country', activeCountry);
        }
        return;
      }

      if (productConfirm) {
        var productConfirmBox = headerActions.querySelector('.header-product-confirm');
        if (productConfirm.getAttribute('data-product-confirm') === 'yes') {
          var pendingProduct = productConfirmBox.getAttribute('data-pending-product') || '';
          productConfirmBox.hidden = true;
          showThinkingMessage();
          updateThinkingMessage({ content: 'Verifying your data' });
          var productVerificationTimeout = window.setTimeout(function () {
            var selectedCard = headerActions.querySelector('[data-card-code="' + pendingProduct + '"]');
            if (selectedCard) {
              selectedCard.classList.add('is-current');
              selectedCard.querySelector('.header-product-switch').setAttribute('aria-checked', 'true');
            }
            removeThinkingMessage();

            if (normalizeInput(pendingProduct) === 'credit card') {
              queueAssistantMessages([
                {
                  type: 'credit-card-creation',
                  content: 'Congratulations! Your Credit card is opened.',
                  autoCollapseMs: 5000,
                  delayMs: 0
                },
                {
                  type: 'text',
                  content: 'Your ' + pendingProduct + ' is opened.',
                  delayMs: 0
                }
              ]);
              return;
            }

            state.messages.push(createAssistantMessage({ sender: 'ai', type: 'text', content: 'Your ' + pendingProduct + ' is opened.' }));
            renderMessages();
          }, 2000);
          state.timeouts.push(productVerificationTimeout);
        } else if (productConfirmBox) {
          productConfirmBox.hidden = true;
        }
        return;
      }

      if (cardOption) {
        var cardCode = cardOption.getAttribute('data-card-code') || '';
        if (cardOption.classList.contains('is-current')) {
          return;
        }
        var productConfirmBox = headerActions.querySelector('.header-product-confirm');
        productConfirmBox.setAttribute('data-pending-product', cardCode);
        productConfirmBox.querySelector('p').textContent = 'Using your NEX Passport, we can help you open a ' + cardCode + ' directly.';
        cardOption.insertAdjacentElement('afterend', productConfirmBox);
        productConfirmBox.hidden = false;
        return;
      }

      if (productOption && productOption.getAttribute('data-product-code') === 'Card') {
        var cardMenu = headerActions.querySelector('.header-card-menu');
        cardMenu.hidden = false;
        return;
      }

      if (countryConfirm) {
        var countryConfirmBox = headerActions.querySelector('.header-country-confirm');
        if (countryConfirm.getAttribute('data-country-confirm') === 'yes') {
          var pendingCountry = countryConfirmBox.getAttribute('data-pending-country') || '';
          countryConfirmBox.hidden = true;
          showThinkingMessage();
          updateThinkingMessage({ content: 'Verifying your data' });
          var verificationTimeout = window.setTimeout(function () {
            if (pendingCountry === 'UK') {
              setUkAccountOpen(true);
            }
            var selectedCountry = headerActions.querySelector('[data-country-code="' + pendingCountry + '"]');
            if (selectedCountry) {
              selectedCountry.classList.add('is-current');
              selectedCountry.querySelector('.header-country-switch').setAttribute('aria-checked', 'true');
            }
            syncChatCountrySwitchStates(pendingCountry, true);
            headerActions.querySelector('.header-expand-panel').classList.add('show-country-products');
            var countryLabel = headerActions.querySelector('.header-expand-country .header-expand-option-button span');
            if (countryLabel) {
              countryLabel.textContent = Array.prototype.slice.call(headerActions.querySelectorAll('.header-country-option.is-current')).map(function (option) { return option.getAttribute('data-country-code'); }).join(', ');
            }
            removeThinkingMessage();
            state.messages.push(createAssistantMessage({ sender: 'ai', type: 'text', content: 'Your ' + pendingCountry + ' account is opened.' }));
            renderMessages();
          }, 2000);
          state.timeouts.push(verificationTimeout);
        }
        var selectedCountryCode = countryConfirmBox.getAttribute('data-pending-country') || '';
        var selectedCountryOption = headerActions.querySelector('[data-country-code="' + selectedCountryCode + '"]');
        if (selectedCountryOption) {
          selectedCountryOption.insertAdjacentElement('afterend', headerActions.querySelector('.header-select-product'));
        }
        if (countryConfirmBox) {
          countryConfirmBox.hidden = true;
        }
        return;
      }

      if (countryOption) {
        var selectedCountryCode = countryOption.getAttribute('data-country-code') || '';
        var countryConfirmBox = headerActions.querySelector('.header-country-confirm');
        if (countryOption.classList.contains('is-current')) {
          countryOption.insertAdjacentElement('afterend', headerActions.querySelector('.header-select-product'));
          headerActions.querySelector('.header-expand-panel').setAttribute('data-selected-country', selectedCountryCode);
          headerActions.querySelector('.header-expand-panel').classList.remove('show-products-menu', 'show-country-products');
          return;
        }
        if (selectedCountryCode !== 'HK') {
          countryConfirmBox.setAttribute('data-pending-country', selectedCountryCode);
          countryConfirmBox.querySelector('p').textContent = 'Using your NEX Passport, we can help you open a ' + selectedCountryCode + ' account directly.';
          countryOption.insertAdjacentElement('afterend', countryConfirmBox);
          countryConfirmBox.hidden = false;
          return;
        }
        countryOption.classList.add('is-current');
        countryOption.querySelector('.header-country-switch').setAttribute('aria-checked', 'true');
        syncChatCountrySwitchStates(selectedCountryCode, true);
        countryOption.insertAdjacentElement('afterend', headerActions.querySelector('.header-select-product'));
        headerActions.querySelector('.header-expand-panel').setAttribute('data-selected-country', selectedCountryCode);
        headerActions.querySelector('.header-expand-panel').classList.remove('show-products-menu', 'show-country-products');
        var countryLabel = headerActions.querySelector('.header-expand-country .header-expand-option-button span');
        if (countryLabel) {
          countryLabel.textContent = Array.prototype.slice.call(headerActions.querySelectorAll('.header-country-option.is-current')).map(function (option) { return option.getAttribute('data-country-code'); }).join(', ');
        }
        return;
      }

      if (!actionTarget) {
        return;
      }

      action = actionTarget.getAttribute('data-auth-action');

      if (action === 'login') {
        beginLoginLoading(1000);
        return;
      }

      if (action === 'toggle-menu') {
        setUserMenuOpen(!authState.isMenuOpen);
        return;
      }

      if (action === 'toggle-header-panel') {
        var panel = headerActions.querySelector('.header-expand-panel');
        var expandTrigger = headerActions.querySelector('.header-expand-trigger');
        var isPanelOpen = panel && panel.hidden;

        if (panel) {
          panel.hidden = !isPanelOpen;
          if (!isPanelOpen) {
            panel.classList.remove('show-products-menu', 'show-country-products');
          }
        }
        if (expandTrigger) {
          expandTrigger.setAttribute('aria-expanded', String(Boolean(isPanelOpen)));
        }
        return;
      }

      if (action === 'logout') {
        authState.isLoading = false;
        authState.isLoggedIn = false;
        setSessionSignedIn(false);
        setUkAccountOpen(false);
        renderAuthControl();
        resetSignedOutSuggestions();
      }
    });

    document.addEventListener('click', function (event) {
      if (!authState.isMenuOpen || headerActions.contains(event.target)) {
        if (headerActions.contains(event.target)) {
          return;
        }
      }

      var panel = headerActions.querySelector('.header-expand-panel');
      var expandTrigger = headerActions.querySelector('.header-expand-trigger');
      if (panel && !panel.hidden) {
        panel.hidden = true;
        panel.classList.remove('show-products-menu', 'show-country-products');
        if (expandTrigger) {
          expandTrigger.setAttribute('aria-expanded', 'false');
        }
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
      countryOptions: Array.isArray(message.countryOptions)
        ? message.countryOptions.map(function (countryCode) {
            return String(countryCode || '').trim();
          }).filter(Boolean)
        : [],
      selectedCountryCodes: message.selectedCountryCodes && typeof message.selectedCountryCodes === 'object'
        ? Object.assign({}, message.selectedCountryCodes)
        : {},
      pendingCountryCode: typeof message.pendingCountryCode === 'string' ? message.pendingCountryCode : '',
      countryCode: typeof message.countryCode === 'string' ? message.countryCode : '',
      confirmTemplate: typeof message.confirmTemplate === 'string' ? message.confirmTemplate : '',
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

    return names.length + ' files: ' + names.join(', ');
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
      userMessage: 'Uploaded: ' + summary
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

  function getNexPassportBrandMarkup() {
    return '<span class="nex-passport-token"><span class="nex-passport-icon" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="3" width="14" height="18" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M12 7V17" stroke="currentColor" stroke-width="1.4"/><path d="M8.5 10.2C9.2 9.4 10.4 8.8 12 8.8C13.6 8.8 14.8 9.4 15.5 10.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M8.5 13.8C9.2 14.6 10.4 15.2 12 15.2C13.6 15.2 14.8 14.6 15.5 13.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></span><span class="nex-passport-text">NEX Passport</span></span>';
  }

  function formatChatText(value) {
    return escapeHtml(value).replace(/nex passport(?!\s+by\s+hsbc)/gi, getNexPassportBrandMarkup());
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
    header.textContent = files.length > 1 ? 'Upload preview (' + files.length + ')' : 'Upload preview';
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

    return 'Today ' + pad2(hours) + ':' + minutes + ' ' + meridiem;
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
            actions: ['Open an HSBC business account']
          }
        ];
      case 'fx-hedging-flow':
        return [
          {
            type: 'text',
            content: 'This page supports the FX hedging journey. Enter “FX hedging” to begin.',
            actions: ['FX hedging']
          }
        ];
      case 'mainland-branch-flow':
        return [
          {
            type: 'text',
            content: 'This page supports the mainland branch expansion journey. You can start the journey directly.',
            actions: ['Mainland branch expansion']
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
      return value || 'Not provided';
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
      countryOptions: Array.isArray(response.countryOptions)
        ? response.countryOptions.map(function (countryCode) {
            return interpolateTemplate(countryCode, flowDefinition);
          })
        : [],
      selectedCountryCodes: response.selectedCountryCodes && typeof response.selectedCountryCodes === 'object'
        ? Object.assign({}, response.selectedCountryCodes)
        : {},
      pendingCountryCode: typeof response.pendingCountryCode === 'string' ? response.pendingCountryCode : '',
      countryCode: typeof response.countryCode === 'string' ? response.countryCode : '',
      confirmTemplate: typeof response.confirmTemplate === 'string' ? response.confirmTemplate : '',
      delayMs: typeof response.delayMs === 'number' ? response.delayMs : null,
      delayAfterPassportCollapse: typeof response.delayAfterPassportCollapse === 'number' ? response.delayAfterPassportCollapse : 0,
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
        : 'Press "Upload" to add a sample document';
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
        content: 'Sorry, I did not understand that.',
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
      }, index * 28);

      presenterState.typingTimeoutIds.push(timeoutId);
    });
  }

  function startFlowAtStep(flowId, stepId) {
    var flowDefinition = getFlowDefinition(flowId);
    var promptResponses;

    if (!flowDefinition || !stepId || !getFlowStep(flowDefinition, stepId)) {
      return;
    }

    clearPresenterTyping();
    state.timeouts.forEach(function (timeoutId) {
      window.clearTimeout(timeoutId);
    });

    state.timeouts = [];
    state.pendingRewindSnapshot = null;
    state.messages = state.messages.filter(function (message) {
      return message.type !== 'thinking';
    });
    state.thinkingMessageId = null;
    state.flowAnswers = {};
    setCurrentTopic(flowId);
    setActiveFlow(flowId, stepId);

    promptResponses = getStepPromptResponses(flowDefinition, stepId);
    promptResponses.forEach(function (response) {
      response.id = createMessageId();
      response.sender = 'ai';
      state.messages.push(createAssistantMessage(response));
    });

    renderMessages();
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

    if (command === 'start-flow-step') {
      startFlowAtStep(data.flowId ? String(data.flowId) : '', data.stepId ? String(data.stepId) : '');
      return;
    }

    if (command === 'show-passport-animation') {
      var requestedVariant = data && typeof data.variant === 'string' ? data.variant : getPassportAnimationVariant();
      var requestedCountryCode = data && typeof data.countryCode === 'string' && data.countryCode ? data.countryCode : 'HK';
      showPassportAnimationOverlay({ countryCode: requestedCountryCode }, requestedVariant);
      return;
    }

    if (command === 'select-country-offer') {
      var countryOfferMessage = state.messages.filter(function (message) {
        return message && message.type === 'country-switch-selector';
      }).slice(-1)[0];

      if (countryOfferMessage) {
        selectCountryOfferOption(countryOfferMessage.id, data && data.countryCode ? String(data.countryCode) : '');
      }
      return;
    }

    if (command === 'confirm-country-offer') {
      var pendingCountryOfferMessage = state.messages.filter(function (message) {
        return message && message.type === 'country-switch-selector' && message.pendingCountryCode;
      }).slice(-1)[0];

      if (pendingCountryOfferMessage) {
        confirmCountryOfferOption(pendingCountryOfferMessage.id, 'yes');
      }
      return;
    }

    if (command === 'approve-country-consent') {
      var countryConsentMessage = state.messages.filter(function (message) {
        return message && message.type === 'country-open-consent';
      }).slice(-1)[0];

      if (countryConsentMessage) {
        handleCountryConsentAction(countryConsentMessage.id, 'Yes');
      }
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
      fileUploadInput.click();
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
            content: getStepInputMode(step) === 'file' ? 'I received your uploaded document.' : 'I received your information.',
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
            content: 'Please press "Upload" to add the document for this step.',
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
              content: 'Enter the link or information for this step, or press "Upload" to add a document.',
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
                content: 'Enter the link or information for this step, or press "Upload" to add a document.',
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
            content: 'Enter the information for this step, then press send.',
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

    if (activeFlowStep) {
      matchedTransition = getMatchedFlowTransition(activeFlowStep, input);

      if (matchedTransition) {
        setFlowStepAnswer(state.activeFlowId, activeFlowStep.id, getTransitionAnswerLabel(matchedTransition, input));

        if (matchedTransition.autoSignIn) {
          beginLoginLoading(matchedTransition.autoSignInDelayMs);
        }

        transitionResponses = cloneResponses(matchedTransition.responses, activeFlowDefinition);

        if (matchedTransition.clearFlow) {
          clearFlowAnswers(state.activeFlowId);
          setActiveFlow(null, null);
        } else if (matchedTransition.nextStepId) {
          setActiveFlow(state.activeFlowId, matchedTransition.nextStepId);
          if (!matchedTransition.skipNextPromptResponses) {
            transitionResponses = transitionResponses.concat(getStepPromptResponses(activeFlowDefinition, matchedTransition.nextStepId));
          }
        }

        return transitionResponses.length > 0 ? transitionResponses : getDefaultResponses();
      }

      return getInvalidKeywordResponses();
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

  function createConversationSnapshot() {
    return {
      messages: JSON.parse(JSON.stringify(state.messages)),
      activeFlowId: state.activeFlowId,
      activeFlowStepId: state.activeFlowStepId,
      currentTopicId: state.currentTopicId,
      flowAnswers: JSON.parse(JSON.stringify(state.flowAnswers))
    };
  }

  function restoreConversationSnapshot(snapshot) {
    state.timeouts.forEach(function (timeoutId) {
      window.clearTimeout(timeoutId);
    });

    state.timeouts = [];
    state.thinkingMessageId = null;
    state.pendingRewindSnapshot = null;
    state.messages = snapshot.messages || [];
    state.activeFlowId = snapshot.activeFlowId || null;
    state.activeFlowStepId = snapshot.activeFlowStepId || null;
    state.currentTopicId = snapshot.currentTopicId || null;
    state.flowAnswers = snapshot.flowAnswers || {};
    renderMessages();
  }

  function dismissPermissionPrompt() {
    state.messages = state.messages.filter(function (message) {
      return message.type !== 'permission';
    });

    renderMessages();
  }

  function createPermissionOverlay(message) {
    var overlay = document.createElement('div');
    var card = document.createElement('div');

    overlay.className = 'ios-permission-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Notification permission request');
    card.className = 'ios-permission-card';
    card.innerHTML =
      '<div class="ios-permission-icon" aria-hidden="true">&#128276;</div>' +
      '<div class="ios-permission-copy">' +
        '<strong>' + formatChatText(message.content || 'Notification access requested') + '</strong>' +
      '</div>' +
      '<div class="ios-permission-actions">' +
        (Array.isArray(message.actions) ? message.actions.map(function (action) {
          return '<button class="ios-permission-button" type="button" data-action="' + escapeHtml(action) + '">' + escapeHtml(action) + '</button>';
        }).join('') : '') +
      '</div>';

    overlay.appendChild(card);
    return overlay;
  }

  function getCountryOfferConfirmCopy(message, countryCode) {
    var template = typeof message.confirmTemplate === 'string' && message.confirmTemplate
      ? message.confirmTemplate
      : 'Using your NEX Passport, we can help you open a {{country}} account directly.';

    return template.replace('{{country}}', countryCode || '');
  }

  function isHeaderCountryOpen(countryCode) {
    var countryOption;

    if (!headerActions || !countryCode) {
      return false;
    }

    countryOption = headerActions.querySelector('[data-country-code="' + countryCode + '"]');
    return Boolean(countryOption && countryOption.classList.contains('is-current'));
  }

  function syncChatCountrySwitchStates(countryCode, isOn) {
    var hasChanges = false;

    if (!countryCode || countryCode === 'HK') {
      return;
    }

    state.messages.forEach(function (message) {
      if (!message || message.type !== 'country-switch-selector') {
        return;
      }

      message.selectedCountryCodes = message.selectedCountryCodes && typeof message.selectedCountryCodes === 'object'
        ? message.selectedCountryCodes
        : {};

      if (isOn && message.selectedCountryCodes[countryCode] !== true) {
        message.selectedCountryCodes[countryCode] = true;
        hasChanges = true;
      }

      if (!isOn && message.selectedCountryCodes[countryCode] === true) {
        delete message.selectedCountryCodes[countryCode];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      renderMessages();
    }
  }

  function syncHeaderCountrySwitchState(countryCode, isOn) {
    var option;
    var switchNode;
    var countryLabel;

    if (!headerActions || !countryCode) {
      return;
    }

    option = headerActions.querySelector('[data-country-code="' + countryCode + '"]');

    if (!option) {
      return;
    }

    switchNode = option.querySelector('.header-country-switch');

    if (isOn) {
      option.classList.add('is-current');
      if (switchNode) {
        switchNode.setAttribute('aria-checked', 'true');
      }
      if (countryCode === 'UK') {
        setUkAccountOpen(true);
      }
    } else {
      option.classList.remove('is-current');
      if (switchNode) {
        switchNode.setAttribute('aria-checked', 'false');
      }
      if (countryCode === 'UK') {
        setUkAccountOpen(false);
      }
    }

    countryLabel = headerActions.querySelector('.header-expand-country .header-expand-option-button span');
    if (countryLabel) {
      countryLabel.textContent = Array.prototype.slice.call(headerActions.querySelectorAll('.header-country-option.is-current')).map(function (countryOption) { return countryOption.getAttribute('data-country-code'); }).join(', ');
    }
  }

  function createCountrySwitchAnswerContent(message) {
    var options = Array.isArray(message.countryOptions) ? message.countryOptions : [];
    var selectedCountryCodes = message.selectedCountryCodes && typeof message.selectedCountryCodes === 'object'
      ? message.selectedCountryCodes
      : {};
    var pendingCountryCode = typeof message.pendingCountryCode === 'string' ? message.pendingCountryCode : '';
    var optionMarkup = options.map(function (countryCode) {
      var isFixedOn = countryCode === 'HK';
      var isCurrent = isFixedOn || selectedCountryCodes[countryCode] === true || isHeaderCountryOpen(countryCode);
      var switchClassName = 'country-switch-answer-toggle' + (isCurrent ? ' is-current' : '') + (isFixedOn ? ' is-fixed-on' : '');
      var promptCopy = getCountryOfferConfirmCopy(message, countryCode);
      var confirmMarkup = pendingCountryCode === countryCode && !isFixedOn
        ? '<div class="country-switch-answer-confirm"><p>' + formatChatText(promptCopy) + '</p><div><button type="button" data-country-offer-message-id="' + escapeHtml(message.id || '') + '" data-country-offer-confirm="yes">Confirm</button><button type="button" data-country-offer-message-id="' + escapeHtml(message.id || '') + '" data-country-offer-confirm="no">Cancel</button></div></div>'
        : '';

      return '' +
        '<div class="country-switch-answer-item" data-country-offer-item="' + escapeHtml(countryCode) + '" data-country-offer-message-id="' + escapeHtml(message.id || '') + '">' +
        '<div class="country-switch-answer-option">' +
          '<span class="country-switch-answer-copy">' +
            '<span class="country-switch-answer-code">' + escapeHtml(countryCode) + '</span>' +
          '</span>' +
          '<button class="' + switchClassName + '" type="button" data-country-offer-message-id="' + escapeHtml(message.id || '') + '" data-country-offer-switch="' + escapeHtml(countryCode) + '" role="switch" aria-checked="' + (isCurrent ? 'true' : 'false') + '"' + (isFixedOn ? ' disabled aria-disabled="true"' : '') + '><span></span></button>' +
        '</div>' +
        confirmMarkup +
        '</div>';
    }).join('');

    return '<div class="country-switch-answer-box"><div class="country-switch-answer-list">' + optionMarkup + '</div></div>';
  }

  function getCountrySwitchMessageById(messageId) {
    if (!messageId) {
      return null;
    }

    return state.messages.find(function (message) {
      return message.id === messageId && message.type === 'country-switch-selector';
    }) || null;
  }

  function selectCountryOfferOption(messageId, countryCode) {
    var message = getCountrySwitchMessageById(messageId);

    if (!message || !countryCode || countryCode === 'HK' || (message.selectedCountryCodes && message.selectedCountryCodes[countryCode] === true)) {
      return;
    }

    message.pendingCountryCode = countryCode;
    renderMessages();
  }

  function confirmCountryOfferOption(messageId, decision) {
    var message = getCountrySwitchMessageById(messageId);
    var pendingCountryCode;

    if (!message) {
      return;
    }

    pendingCountryCode = message.pendingCountryCode || '';

    if (decision === 'yes' && pendingCountryCode) {
      queueCountryOfferPostConfirmSequence(pendingCountryCode);
    }

    message.pendingCountryCode = '';
    renderMessages();
  }

  function appendAssistantMessage(message) {
    var messageId = createMessageId();
    var messageType = message && typeof message.type === 'string' ? message.type : '';
    var shouldActivateCountry = Boolean(message && message.activateCountryOnShown && message.countryCode);
    var activationCountryCode = shouldActivateCountry ? String(message.countryCode) : '';

    if (messageType !== 'passport-creation' && messageType !== 'credit-card-creation' && phoneScreen.querySelector('.passport-creation-overlay')) {
      state.passportBlockedMessages.push(message);
      return;
    }

    message.id = messageId;
    message.sender = 'ai';
    state.messages.push(createAssistantMessage(message));
    renderMessages();

    if (shouldActivateCountry) {
      syncChatCountrySwitchStates(activationCountryCode, true);
      syncHeaderCountrySwitchState(activationCountryCode, true);
    }

    if (messageType === 'thinking') {
      var dismissTimeoutId = window.setTimeout(function () {
        var hasMessage = state.messages.some(function (item) {
          return item && item.id === messageId && item.type === 'thinking';
        });

        if (!hasMessage) {
          return;
        }

        state.messages = state.messages.filter(function (item) {
          return !item || item.id !== messageId;
        });
        renderMessages();
      }, 2000);

      state.timeouts.push(dismissTimeoutId);
    }
  }

  function queueAssistantMessages(messages) {
    var cumulativeDelay = 0;

    if (!Array.isArray(messages) || messages.length === 0) {
      return;
    }

    messages.forEach(function (message, index) {
      var delayMs = typeof message.delayMs === 'number'
        ? Math.max(0, message.delayMs)
        : (index === 0 ? 0 : 800);

      cumulativeDelay += delayMs;

      var timeoutId = window.setTimeout(function () {
        appendAssistantMessage(message);
      }, cumulativeDelay);

      state.timeouts.push(timeoutId);
    });
  }

  function queueCountryOfferPostConfirmSequence(countryCode) {
    if (!countryCode) {
      return;
    }

    queueAssistantMessages([
      { type: 'thinking', content: 'Checking your account data', delayMs: 0 },
      { type: 'thinking', content: 'Analysing ' + countryCode + ' database', delayMs: 2000 },
      {
        type: 'country-open-consent',
        content: 'The "Certificate of Incorporation" is needed to open a ' + countryCode + ' account. May I use your NEX Passport data to open one?',
        countryCode: countryCode,
        delayMs: 2000
      }
    ]);
  }

  function handleCountryConsentAction(messageId, decision) {
    var message = state.messages.find(function (item) {
      return item && item.id === messageId && item.type === 'country-open-consent';
    });
    var countryCode;
    var normalizedDecision;

    if (!message) {
      return;
    }

    countryCode = message.countryCode || '';
    normalizedDecision = normalizeInput(decision || '');

    message.type = 'text';
    message.actions = [];
    message.actionPresentation = '';

    state.messages.push(createAssistantMessage({
      id: createMessageId(),
      sender: 'user',
      type: 'text',
      content: decision,
      actions: []
    }));
    renderMessages();

    if (normalizedDecision !== 'yes' && normalizedDecision !== 'consent' && normalizedDecision !== 'confirm') {
      queueAssistantMessages([
        { type: 'text', content: 'Understood. We will pause opening the ' + countryCode + ' account for now.', delayMs: 400 }
      ]);
      return;
    }

    queueAssistantMessages([
      { type: 'thinking', content: 'Creating Certificate of Incorporation', delayMs: 0 },
      { type: 'text', content: 'Certificate of Incorporation created.\nID: 16XXXXXXX', delayMs: 2000 },
      { type: 'thinking', content: 'Opening ' + countryCode + ' account', delayMs: 2000 },
      {
        type: 'passport-creation',
        content: 'Your NEX Passport is created',
        countryCode: countryCode,
        delayMs: 0
      },
      {
        type: 'text',
        content: 'Congratulations, your ' + countryCode + ' account is opened. Customer ID 1XXXXXXX',
        countryCode: countryCode,
        activateCountryOnShown: true,
        delayMs: 5000
      }
    ]);
  }

  function clearCountryOfferPendingIfNeeded(excludedMessageId) {
    var hasChanges = false;

    state.messages.forEach(function (message) {
      if (!message || message.type !== 'country-switch-selector') {
        return;
      }

      if (excludedMessageId && message.id === excludedMessageId) {
        return;
      }

      if (message.pendingCountryCode) {
        message.pendingCountryCode = '';
        hasChanges = true;
      }
    });

    if (hasChanges) {
      renderMessages();
    }
  }

  function renderMessage(message) {
    var row = document.createElement('div');
    row.className = 'message-row ' + message.sender;

    var bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    if (message.type === 'verification-loading') {
      bubble.className += ' thinking-bubble verification-thinking-bubble';
      bubble.innerHTML = '<p>' + formatChatText(message.content) + '</p><span class="verification-spinner" aria-label="Loading"></span>';
    } else if (message.type === 'thinking') {
      bubble.className += ' thinking-bubble verification-thinking-bubble';
      bubble.innerHTML = '<p>' + formatChatText(message.content) + '</p><span class="verification-spinner" aria-label="Loading"></span>';
    } else if (message.type === 'partner-carousel') {
      bubble.className += ' partner-carousel-bubble';
      bubble.innerHTML =
        '<div class="partner-carousel-header">' +
          '<strong>' + escapeHtml(message.cardHeading || 'HSBC Verified Partner') + '</strong>' +
          '<span>' + escapeHtml(message.cardCategory || '') + '</span>' +
        '</div>' +
        '<div class="partner-carousel-track">' +
          (Array.isArray(message.partnerCards) ? message.partnerCards.map(function (card) {
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
            '<strong>' + escapeHtml(message.imageTitle || 'HSBC NEX information') + '</strong>' +
            '<span>' + escapeHtml(message.imageSubtitle || 'Select to view details and terms') + '</span>' +
          '</div>' +
        '</div>';
    } else if (message.type === 'file-preview') {
      bubble.className += ' file-preview-bubble';
      bubble.appendChild(createFilePreviewContent(Array.isArray(message.files) ? message.files : []));
    } else if (message.type === 'passport-creation') {
      bubble.className += ' passport-creation-bubble';
      bubble.innerHTML =
        '<div class="passport-collapsed-box">' +
          getNexPassportBrandMarkup() +
        '</div>';
    } else if (message.type === 'credit-card-creation') {
      bubble.className += ' passport-creation-bubble';
      bubble.innerHTML =
        '<div class="passport-collapsed-box credit-card-collapsed-box">' +
          '<span class="credit-card-collapsed-icon" aria-hidden="true"></span>' +
          '<span class="credit-card-collapsed-label">Credit Card</span>' +
        '</div>';
    } else if (message.type === 'country-switch-selector') {
      bubble.className += ' country-switch-answer-bubble';
      bubble.innerHTML = '<p>' + formatChatText(message.content) + '</p>' + createCountrySwitchAnswerContent(message);
    } else if (message.type === 'country-open-consent') {
      bubble.innerHTML = '<p>' + formatChatText(message.content) + '</p>' +
        '<div class="direct-reply-box">' +
          '<button class="direct-reply-button" type="button" data-country-consent-message-id="' + escapeHtml(message.id || '') + '" data-country-consent-action="Yes"><span>Yes</span></button>' +
          '<button class="direct-reply-button" type="button" data-country-consent-message-id="' + escapeHtml(message.id || '') + '" data-country-consent-action="Maybe Later"><span>Maybe Later</span></button>' +
        '</div>';
    } else {
      var actionsMarkup = '';
      var isSingleUploadAction = Array.isArray(message.actions) && message.actions.length === 1 && normalizeInput(message.actions[0]) === 'upload';
      var isDirectReply = message.actionPresentation === 'direct-reply' || isSingleUploadAction;

      if (Array.isArray(message.actions) && message.actions.length > 0) {
        actionsMarkup = isSingleUploadAction
          ? '<div class="answer-pill-box">' +
              '<button class="answer-pill-button" type="button" data-action="' + escapeHtml(message.actions[0]) + '"><span>' + escapeHtml(message.actions[0]) + '</span></button>' +
            '</div>'
          : (isDirectReply
            ? '<div class="direct-reply-box">' +
                message.actions
                  .map(function (action) {
                    return '<button class="direct-reply-button" type="button" data-action="' + escapeHtml(action) + '"><span>' + escapeHtml(action) + '</span></button>';
                  })
                  .join('') +
              '</div>'
            : '<div class="actions-box">' +
              '<div class="label">Please type your response or choose one of the following:</div>' +
              '<div class="action-list">' +
                message.actions
                  .map(function (action) {
                    return '<button class="action-button" type="button" data-action="' + escapeHtml(action) + '"><span>「' + escapeHtml(action) + '」</span>' + createChevron() + '</button>';
                  })
                  .join('') +
              '</div>' +
            '</div>');
      }

      bubble.innerHTML = '<p>' + formatChatText(message.content) + '</p>' + actionsMarkup;
    }

    if (message.sender === 'ai' && message.rewindSnapshot && message.type !== 'thinking') {
      bubble.classList.add('has-rewind-control');
      bubble.insertAdjacentHTML('beforeend', '<button class="message-rewind-button" type="button" data-rewind-message-id="' + escapeHtml(message.id || '') + '" aria-label="Go back one step" title="Go back one step">&lt;</button>');
    }

    row.appendChild(bubble);
    return row;
  }

  messageList.addEventListener('click', function (event) {
    var rewindButton = event.target.closest('[data-rewind-message-id]');
    var message;

    if (!rewindButton) {
      return;
    }

    message = state.messages.find(function (item) {
      return item.id === rewindButton.getAttribute('data-rewind-message-id');
    });

    if (message && message.rewindSnapshot) {
      restoreConversationSnapshot(message.rewindSnapshot);
    }
  });

  function scrollToLatest() {
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function getPassportAnimationVariant(countryCode) {
    var variant = 'nex-passport';
    var normalizedCountryCode = typeof countryCode === 'string' ? countryCode.toUpperCase() : '';

    try {
      variant = window.sessionStorage.getItem('hsbc-v2-passport-animation') || 'nex-passport';
    } catch (error) {
      variant = 'nex-passport';
    }

    if (normalizedCountryCode && normalizedCountryCode !== 'HK') {
      if (variant === 'country-stamp' || variant === 'country-opening') {
        return variant;
      }

      return 'country-opening';
    }

    return variant === 'country-stamp' || variant === 'country-opening' || variant === 'nex-passport'
      ? variant
      : 'nex-passport';
  }

  function clearPassportAnimationOverlay() {
    var overlay = phoneScreen.querySelector('.passport-creation-overlay');
    var blockedMessages;
    var cumulativeDelay = 0;

    if (overlay) {
      overlay.remove();
    }

    if (state.passportAnimationTimeoutId) {
      window.clearTimeout(state.passportAnimationTimeoutId);
      state.passportAnimationTimeoutId = null;
    }

    if (state.passportAnimationAutoCollapseId) {
      window.clearTimeout(state.passportAnimationAutoCollapseId);
      state.passportAnimationAutoCollapseId = null;
    }

    blockedMessages = state.passportBlockedMessages.splice(0);
    blockedMessages.forEach(function (message) {
      cumulativeDelay += Math.max(0, message.delayAfterPassportCollapse || 0);

      if (cumulativeDelay === 0) {
        appendAssistantMessage(message);
        return;
      }

      var timeoutId = window.setTimeout(function () {
        appendAssistantMessage(message);
      }, cumulativeDelay);

      state.timeouts.push(timeoutId);
    });
  }

  function collapsePassportAnimationOverlay(overlay) {
    var passportTokens;
    var targetToken;
    var passportBook;
    var targetBounds;
    var bookBounds;
    var targetScale;

    if (!overlay || overlay.classList.contains('is-collapsing')) {
      return;
    }

    passportTokens = messageList.querySelectorAll('.passport-creation-bubble .nex-passport-token');
    targetToken = passportTokens.length > 0 ? passportTokens[passportTokens.length - 1] : null;
    passportBook = overlay.querySelector('.passport-creation-book');

    if (targetToken && passportBook) {
      targetBounds = targetToken.getBoundingClientRect();
      bookBounds = passportBook.getBoundingClientRect();
      targetScale = Math.max(0.1, Math.min(0.34, targetBounds.height / bookBounds.height));
      overlay.style.setProperty('--passport-collapse-x', (targetBounds.left + targetBounds.width / 2) - (bookBounds.left + bookBounds.width / 2) + 'px');
      overlay.style.setProperty('--passport-collapse-y', (targetBounds.top + targetBounds.height / 2) - (bookBounds.top + bookBounds.height / 2) + 'px');
      overlay.style.setProperty('--passport-collapse-scale', String(targetScale));
    }

    overlay.classList.add('is-collapsing');
    state.passportAnimationTimeoutId = window.setTimeout(function () {
      clearPassportAnimationOverlay();
    }, 650);
  }

  function showPassportAnimationOverlay(message, explicitVariant) {
    var overlay = phoneScreen.querySelector('.passport-creation-overlay');
    var countryCode = (message && typeof message.countryCode === 'string' && message.countryCode) ? message.countryCode : 'HK';
    var variant = explicitVariant || getPassportAnimationVariant(countryCode);
    var isCreditCardVariant = variant === 'credit-card';
    var isHongKong = countryCode.toUpperCase() === 'HK';
    var countryNames = {
      HK: 'Hong Kong',
      SG: 'Singapore',
      UK: 'United Kingdom',
      UAE: 'United Arab Emirates',
      IN: 'India',
      MY: 'Malaysia'
    };
    var accountType = (countryNames[countryCode.toUpperCase()] || countryCode.toUpperCase()) + ' Account';
    var passportTitle = isCreditCardVariant
      ? 'Congratulations!<br>Your Credit card is opened.'
      : (isHongKong
        ? 'Congratulations!<br>Your NEX Passport is created'
        : 'Congratulations!<br>A new visa is added to your NEX Passport.');
    var passportPages = '<div class="passport-creation-book">' +
      '<div class="passport-creation-page passport-creation-country-page">' +
        '<span class="passport-creation-account-type">' + escapeHtml(accountType) + '</span>' +
        '<span class="passport-creation-stamp" aria-label="Stamped in ' + escapeHtml(countryCode) + '">' + escapeHtml(countryCode) + '</span>' +
      '</div>' +
      '<div class="passport-creation-page passport-creation-cover">' +
        '<span class="passport-creation-cover-label">NEX<br><span>PASSPORT</span></span>' +
      '</div>' +
    '</div>';
    var creditCardVisual = '<div class="credit-card-creation-wrap">' +
      '<div class="credit-card-creation-card" aria-label="Credit card opened animation">' +
        '<span class="credit-card-chip" aria-hidden="true"></span>' +
        '<span class="credit-card-brand" aria-hidden="true">HSBC</span>' +
      '</div>' +
    '</div>';

    if (overlay) {
      overlay.remove();
    }

    overlay = document.createElement('div');
    overlay.className = 'passport-creation-overlay passport-variant-' + variant + (isHongKong ? ' passport-market-hk' : ' passport-market-international');
    overlay.innerHTML =
      '<div class="passport-creation-scene">' +
        '<div class="passport-creation-title">' + passportTitle + '</div>' +
        (isCreditCardVariant
          ? creditCardVisual
          : ('<div class="passport-creation-page-wrap">' +
              passportPages +
            '</div>')) +
      '</div>';

    phoneScreen.appendChild(overlay);
    overlay.addEventListener('click', function () {
      collapsePassportAnimationOverlay(overlay);
    });

    if (message && typeof message.autoCollapseMs === 'number' && message.autoCollapseMs > 0) {
      state.passportAnimationAutoCollapseId = window.setTimeout(function () {
        collapsePassportAnimationOverlay(overlay);
      }, message.autoCollapseMs);
    }
  }

  function getRenderableMessages() {
    var permissionMessage = null;
    var renderableMessages = [];

    state.messages.forEach(function (message) {
      if (message.type === 'permission') {
        permissionMessage = message;
        return;
      }

      renderableMessages.push(message);
    });

    return {
      permissionMessage: permissionMessage,
      renderableMessages: renderableMessages
    };
  }

  function getMessageRenderKey(message) {
    return JSON.stringify([
      message && message.id ? message.id : '',
      message && message.sender ? message.sender : '',
      message && message.type ? message.type : '',
      message && message.content ? message.content : '',
      message && message.actionPresentation ? message.actionPresentation : '',
      Array.isArray(message && message.actions) ? message.actions : [],
      message && message.pendingCountryCode ? message.pendingCountryCode : '',
      message && message.countryCode ? message.countryCode : '',
      message && message.selectedCountryCodes ? message.selectedCountryCodes : {},
      Array.isArray(message && message.files) ? message.files.map(function (file) {
        return [file.name || '', file.size || 0, file.type || ''];
      }) : []
    ]);
  }

  function renderMessages() {
    var payload = getRenderableMessages();
    var permissionMessage = payload.permissionMessage;
    var renderableMessages = payload.renderableMessages;
    var nextKeys = renderableMessages.map(getMessageRenderKey);
    var previousKeys = renderState.renderedKeys;
    var canAppendOnly = previousKeys.length <= nextKeys.length;
    var shouldFullRerender = false;
    var hasDomUpdate = false;
    var appendStartIndex;
    var existingPermissionOverlay = phoneScreen.querySelector('.ios-permission-overlay');
    var index;

    if (existingPermissionOverlay) {
      existingPermissionOverlay.remove();
    }

    if (state.messages.some(function (message) {
      return message && (message.type === 'passport-creation' || message.type === 'credit-card-creation') && !message._celebrationOverlayShown;
    })) {
      var latestPassportMessage = state.messages.filter(function (message) {
        return message && (message.type === 'passport-creation' || message.type === 'credit-card-creation') && !message._celebrationOverlayShown;
      }).slice(-1)[0] || null;

      if (latestPassportMessage) {
        var celebrationVariant = latestPassportMessage.type === 'credit-card-creation'
          ? 'credit-card'
          : getPassportAnimationVariant(latestPassportMessage.countryCode);
        showPassportAnimationOverlay(latestPassportMessage, celebrationVariant);
        latestPassportMessage._celebrationOverlayShown = true;
      }
    }

    if (canAppendOnly) {
      for (index = 0; index < previousKeys.length; index += 1) {
        if (previousKeys[index] !== nextKeys[index]) {
          canAppendOnly = false;
          break;
        }
      }
    }

    if (!canAppendOnly) {
      shouldFullRerender = true;
    }

    if (shouldFullRerender) {
      messageList.innerHTML = '';
      renderableMessages.forEach(function (message) {
        messageList.appendChild(renderMessage(message));
      });
      hasDomUpdate = true;
    } else {
      appendStartIndex = previousKeys.length;
      for (index = appendStartIndex; index < renderableMessages.length; index += 1) {
        messageList.appendChild(renderMessage(renderableMessages[index]));
        hasDomUpdate = true;
      }
    }

    renderState.renderedKeys = nextKeys;

    if (permissionMessage) {
      phoneScreen.appendChild(createPermissionOverlay(permissionMessage));
    }

    if (hasDomUpdate) {
      scrollToLatest();
    }
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

    if (isFileStep) {
      messageInput.value = '';
    }

    messageInput.disabled = isFileStep;
    messageInput.placeholder = isFileStep
      ? (activeStep && typeof activeStep.uploadPlaceholder === 'string'
        ? activeStep.uploadPlaceholder
        : 'Press "Upload" in the chat to add a document for this step.')
      : (activeStep && typeof activeStep.inputPlaceholder === 'string'
        ? activeStep.inputPlaceholder
        : (inputMode === 'text-or-file' && activeStep && typeof activeStep.uploadPlaceholder === 'string'
          ? activeStep.uploadPlaceholder
          : defaultComposerPlaceholder));

    if (inputMode === 'text-or-file' && activeStep && typeof activeStep.inputPlaceholder === 'string' && activeStep.inputPlaceholder) {
      messageInput.placeholder = activeStep.inputPlaceholder;
    }

    uploadButton.hidden = true;
    uploadButton.disabled = true;
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
    var rewindSnapshot = state.pendingRewindSnapshot;

    showThinkingMessage();
    state.pendingRewindSnapshot = null;

    if (rewindSnapshot) {
      var thinkingMessage = state.messages.find(function (message) {
        return message.id === state.thinkingMessageId;
      });

      if (thinkingMessage) {
        thinkingMessage.rewindSnapshot = rewindSnapshot;
      }
    }

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

          if (response.type !== 'passport-creation' && response.type !== 'credit-card-creation' && phoneScreen.querySelector('.passport-creation-overlay')) {
            response.rewindSnapshot = rewindSnapshot;
            state.passportBlockedMessages.push(response);
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
          response.rewindSnapshot = rewindSnapshot;
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
    var rewindSnapshot;

    if (!submission) {
      return;
    }

    rewindSnapshot = createConversationSnapshot();
    state.pendingRewindSnapshot = rewindSnapshot;

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
    return;
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
    var countryItem = event.target.closest('[data-country-offer-item]');
    var countrySwitchButton = event.target.closest('[data-country-offer-switch]');
    var countryConfirmButton = event.target.closest('[data-country-offer-confirm]');
    var countryConsentButton = event.target.closest('[data-country-consent-action]');
    var actionText;
    var messageId;
    var countryCode;
    var activeStep;
    var inputMode;

    if (linkTarget) {
      window.location.href = linkTarget.getAttribute('data-link-target') || '';
      return;
    }

    if (countrySwitchButton) {
      messageId = countrySwitchButton.getAttribute('data-country-offer-message-id') || '';
      clearCountryOfferPendingIfNeeded(messageId);
      selectCountryOfferOption(messageId, countrySwitchButton.getAttribute('data-country-offer-switch') || '');
      return;
    }

    if (countryConfirmButton) {
      messageId = countryConfirmButton.getAttribute('data-country-offer-message-id') || '';
      confirmCountryOfferOption(messageId, countryConfirmButton.getAttribute('data-country-offer-confirm') || '');
      return;
    }

    if (countryItem) {
      messageId = countryItem.getAttribute('data-country-offer-message-id') || '';
      countryCode = countryItem.getAttribute('data-country-offer-item') || '';
      clearCountryOfferPendingIfNeeded(messageId);
      selectCountryOfferOption(messageId, countryCode);
      return;
    }

    if (countryConsentButton) {
      messageId = countryConsentButton.getAttribute('data-country-consent-message-id') || '';
      handleCountryConsentAction(messageId, countryConsentButton.getAttribute('data-country-consent-action') || '');
      return;
    }

    clearCountryOfferPendingIfNeeded('');

    if (!actionButton) {
      return;
    }

    actionText = (actionButton.getAttribute('data-action') || '').trim();
    activeStep = getActiveFlowStep();
    inputMode = getStepInputMode(activeStep);

    if (inputMode === 'file' && normalizeInput(actionText) === 'upload') {
      fileUploadInput.click();
      return;
    }

    sendMessage(actionText);
  });

  document.addEventListener('click', function (event) {
    if (event.target.closest('.country-switch-answer-box')) {
      return;
    }

    clearCountryOfferPendingIfNeeded('');
  });

  phoneScreen.addEventListener('click', function (event) {
    var actionButton = event.target.closest('.ios-permission-overlay [data-action]');

    if (actionButton) {
      sendMessage(actionButton.getAttribute('data-action') || '');
      dismissPermissionPrompt();
    }
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
  updateSignedInSuggestions();
  restoreConversationForCountryReturn();
  renderMessages();
  setComposerState();
  autoStartInitialAction();
  consumeInitialRouteParams();
})();