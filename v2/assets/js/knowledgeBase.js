(function () {
  var flowModules = window.HSBCFlowModules || {};
  var flowModuleConfigs = window.HSBCFlowModuleConfigs || {};

  function getModuleEntries(moduleName) {
    return Array.isArray(flowModules[moduleName]) ? flowModules[moduleName] : [];
  }

  function getModuleConfig(moduleName) {
    return flowModuleConfigs[moduleName] || {};
  }

  function mergeDefaultResponsesByTopic(target, source) {
    if (!source || typeof source !== 'object') {
      return target;
    }

    Object.keys(source).forEach(function (topicId) {
      if (Array.isArray(source[topicId])) {
        target[topicId] = source[topicId];
      }
    });

    return target;
  }

  function mergeInitialMessagesByTopic(target, source) {
    if (!source || typeof source !== 'object') {
      return target;
    }

    Object.keys(source).forEach(function (topicId) {
      if (source[topicId] && typeof source[topicId] === 'object') {
        target[topicId] = source[topicId];
      }
    });

    return target;
  }

  var knowledgeBaseEntries = []
    .concat(getModuleEntries('accountOpening'))
    .concat(getModuleEntries('fxHedging'))
    .concat(getModuleEntries('mainlandBranch'));

  var defaultResponsesByTopic = {};
  var initialMessagesByTopic = {};

  if (getModuleConfig('accountOpening').defaultResponsesByTopic) {
    mergeDefaultResponsesByTopic(defaultResponsesByTopic, getModuleConfig('accountOpening').defaultResponsesByTopic);
  } else if (Array.isArray(getModuleConfig('accountOpening').defaultResponses)) {
    defaultResponsesByTopic['account-opening-start'] = getModuleConfig('accountOpening').defaultResponses;
  }

  if (getModuleConfig('accountOpening').initialMessagesByTopic) {
    mergeInitialMessagesByTopic(initialMessagesByTopic, getModuleConfig('accountOpening').initialMessagesByTopic);
  }

  if (Array.isArray(getModuleConfig('fxHedging').defaultResponses)) {
    defaultResponsesByTopic['fx-hedging-flow'] = getModuleConfig('fxHedging').defaultResponses;
  }

  if (getModuleConfig('fxHedging').initialMessagesByTopic) {
    mergeInitialMessagesByTopic(initialMessagesByTopic, getModuleConfig('fxHedging').initialMessagesByTopic);
  }

  if (Array.isArray(getModuleConfig('mainlandBranch').defaultResponses)) {
    defaultResponsesByTopic['mainland-branch-flow'] = getModuleConfig('mainlandBranch').defaultResponses;
  }

  if (getModuleConfig('mainlandBranch').initialMessagesByTopic) {
    mergeInitialMessagesByTopic(initialMessagesByTopic, getModuleConfig('mainlandBranch').initialMessagesByTopic);
  }

  Object.assign(window, {
    HSBCKnowledgeBase: {
      knowledgeBase: knowledgeBaseEntries,
      defaultResponses: [
        {
          type: 'text',
          content: 'Sorry, I did not understand your question. You can ask about loans, offers, transactions or FX services.',
          actions: ['Show me the latest SME loan options.', 'Show me the latest offers.', 'I want to make a transaction.', 'I want to make an FX transaction.']
        }
      ],
      initialMessage: {
        sender: 'ai',
        type: 'text',
        content: 'Hello. I am HSBC NEX. How can I help your business today?',
        actions: ['I want to open an HSBC business account.', 'I am an existing customer and want to make a transaction.']
      },
      initialMessagesByPageId: {
        'assistant-all-flows': {
          sender: 'ai',
          type: 'text',
          content: 'Hello. I am HSBC NEX. How can I help your business today?',
          actions: ['I want to open an HSBC business account.', 'I am an existing customer and want to make a transaction.']
        }
      },
      initialMessagesByTopic: initialMessagesByTopic,
      defaultResponsesByTopic: defaultResponsesByTopic
    }
  });
}());
