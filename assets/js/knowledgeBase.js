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
          content: '抱歉，我不太明白您的問題。您可以輸入「過數」、「外匯」或「優惠」等關鍵詞，或直接查詢相關服務。',
          actions: ['我想進行過數。', '我想了解外匯交易方案。', '我想了解優惠活動。']
        }
      ],
      initialMessage: {
        sender: 'ai',
        type: 'text',
        content: '您好！我是滙豐萬事屋。請問今日有什麼可以幫到您的企業？',
        actions: ['我想了解如何開立匯豐商業戶口。', '我是現有客戶，想要進行交易。']
      },
      initialMessagesByEntry: {
        'locked-screen': {
          sender: 'ai',
          type: 'text',
          content: '🔔近期日圓（JPY）波動加劇。根據過往交易記錄，您可能面臨匯率波動導致成本上升的風險。如您希穩定未來採購成本，可考慮使用外匯對沖方案（例如：遠期外匯合約等）。是否需要我為您進行快速評估並提供可行選項？',
          actions: ['我想了解外匯對沖建議。', '我想了解跨境付款安排。', '我想查看近期匯率風險摘要。']
        },
        'video-account-opening': {
          sender: 'ai',
          type: 'text',
          content: '歡迎返回。我可以接續剛才的開戶示範，由公司設立、身分核實，到香港商業戶口申請提交流程。',
          actions: ['開戶']
        },
        'video-fx-hedging': {
          sender: 'ai',
          type: 'text',
          content: '歡迎返回。我可以接續剛才的外匯對沖示範，根據交易行為分析風險重點，並提供較貼近情況的產品建議。',
          actions: ['外匯對沖', '我想比較外匯對沖工具。', '我想整理外匯風險重點。']
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
})();
