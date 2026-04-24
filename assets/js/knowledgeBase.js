(function () {
  var flowModules = window.HSBCFlowModules || {};

  function getModuleEntries(moduleName) {
    return Array.isArray(flowModules[moduleName]) ? flowModules[moduleName] : [];
  }

  var knowledgeBaseEntries = []
    .concat(getModuleEntries('accountOpening'))
    .concat(getModuleEntries('fxHedging'))
    .concat(getModuleEntries('mainlandBranch'));

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
        actions: ['我想了解如何開立匯豐商業戶口。', '我是現有客戶，想要進行交易。']
      },
      initialMessagesByEntry: {
        'assistant-account-opening': {
          sender: 'ai',
          type: 'text',
          content: '您好！我是滙豐萬事屋。請問今日有什麼可以幫到您的企業？',
          actions: ['我想了解如何開立匯豐商業戶口。', '我是現有客戶，想要進行交易。']
        },
        'assistant-fx-hedging': {
          sender: 'ai',
          type: 'text',
          content: '🔔近期日圓（JPY）波動加劇。根據過往交易記錄，您可能面臨匯率波動導致成本上升的風險。如您希穩定未來採購成本，可考慮使用外匯對沖方案（例如：遠期外匯合約等）。是否需要我為您進行快速評估並提供可行選項？'
        },
        'assistant-mainland-branch': {
          sender: 'ai',
          type: 'text',
          content: '您好，我可以接續為您分析拓展內地分店的方案與所需準備。',
          actions: ['拓展內地分店']
        },
        'account-opening-followup': {
          sender: 'ai',
          type: 'text',
          content: '公司註冊及基本資料已處理完成，以下接續開戶後半部分流程。',
          actions: [],
          flowId: 'account-opening-flow',
          stepId: 'account-business-supporting',
          appendStepPrompt: true,
          topicId: 'account-opening-flow'
        },
        'all-flows': {
          sender: 'ai',
          type: 'text',
          content: '您好！我是滙豐萬事屋。請問今日有什麼可以幫到您的企業？',
          actions: ['開立匯豐商業戶口', '外匯對沖', '拓展內地分店']
        },
        'locked-screen': {
          sender: 'ai',
          type: 'text',
          content: '🔔近期日圓（JPY）波動加劇。根據過往交易記錄，您可能面臨匯率波動導致成本上升的風險。如您希穩定未來採購成本，可考慮使用外匯對沖方案（例如：遠期外匯合約等）。是否需要我為您進行快速評估並提供可行選項？'
        },
        'video-loan': {
          sender: 'ai',
          type: 'text',
          content: '歡迎返回。我可以延續剛才的 SME Loan 內容，幫您收窄貸款方向、了解申請資格，或整理申請前文件。',
          actions: ['我想了解中小企貸款方案。', '我想查看貸款申請資格。', '我想知道貸款前要準備哪些文件。']
        },
        'video-account-opening': {
          sender: 'ai',
          type: 'text',
          content: '您好！我是滙豐萬事屋。請問今日有什麼可以幫到您的企業？',
          actions: ['我想了解如何開立匯豐商業戶口。', '我是現有客戶，想要進行交易。']
        },
        'video-fx-hedging': {
          sender: 'ai',
          type: 'text',
          content: '🔔近期日圓（JPY）波動加劇。根據過往交易記錄，您可能面臨匯率波動導致成本上升的風險。如您希穩定未來採購成本，可考慮使用外匯對沖方案（例如：遠期外匯合約等）。是否需要我為您進行快速評估並提供可行選項？'
        },
        'video-mainland-expansion': {
          sender: 'ai',
          type: 'text',
          content: '歡迎返回。我可以接續剛才的拓展內地分店內容，幫您比較三個常見方案、整理開店準備清單，或查看文件方向。',
          actions: ['拓展內地分店', '我想查看一般準備清單', '我想了解常見所需文件']
        }
      }
    }
  });
}());
