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
          content: '抱歉，我不太明白您的問題。您可以輸入「貸款」、「優惠」、「交易」或「外匯」等關鍵詞，或直接查詢相關服務。',
          actions: ['我想查詢中小企貸款的最新方案。', '我想查詢最新優惠', '我想進行交易', '我想進行外匯交易']
        }
      ],
      initialMessage: {
        sender: 'ai',
        type: 'text',
        content: '您好！我是滙豐萬事屋。請問今日有什麼可以幫到您的企業？',
        actions: ['我想了解如何開立滙豐商業戶口。', '我是現有客戶，想要進行交易。']
      },
      initialMessagesByPageId: {
        'assistant-all-flows': {
          sender: 'ai',
          type: 'text',
          content: '您好！我是滙豐萬事屋。請問今日有什麼可以幫到您的企業？',
          actions: ['我想了解如何開立滙豐商業戶口。', '我是現有客戶，想要進行交易。']
        }
      },
      initialMessagesByTopic: initialMessagesByTopic,
      defaultResponsesByTopic: defaultResponsesByTopic
    }
  });
}());
