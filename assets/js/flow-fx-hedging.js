window.HSBCFlowModules = window.HSBCFlowModules || {};
window.HSBCFlowModuleConfigs = window.HSBCFlowModuleConfigs || {};

window.HSBCFlowModules.fxHedging = [
  {
    trigger: '外匯對沖',
    exactKeywords: ['ok', 'okay', '外匯對沖'],
    keywords: ['外匯對沖', 'hedging', 'forex', 'fx', '日圓', 'jpy', '匯率風險'],
    flow: {
      id: 'fx-hedging-flow',
      introResponses: [
        {
          type: 'thinking',
          content: '正在分析您的交易記錄'
        },
        {
          type: 'text',
          content: '根據客戶過去12個月的帳戶活動進行分析，了解您每月需要支付 JPY 3,000,000，並於每月月底支付，建議您進行外匯對沖。',
          delayMs: 1500
        },
        {
          type: 'text',
          content: '現在交易外匯對沖可享 10% 手續費優惠。'
        },
        {
          type: 'image',
          content: './assets/media/icons/fx_hedging_promotion.png',
          imageTitle: '外匯對沖優惠',
          imageSubtitle: '現在交易外匯對沖可享 10% 手續費優惠。',
          imageAlt: '外匯對沖優惠推廣圖片'
        }
      ],
      startStepId: 'fx-trade-intent',
      steps: [
        {
          id: 'fx-trade-intent',
          prompt: {
            type: 'text',
            content: '您想交易外匯對沖嗎？'
          },
          choices: [
            {
              exactKeywords: ['進行交易'],
              keywords: ['做埋', '直接做', '進行交易'],
              responses: [],
              nextStepId: 'fx-risk-disclaimer'
            }
          ]
        },
        {
          id: 'fx-risk-disclaimer',
          prompt: {
            type: 'text',
            content: '以下為重要提示：外匯對沖屬金融產品安排，可能涉及成本及到期交割責任；若市場走勢與預期相反，亦可能出現機會成本或其他風險，您是否同意？'
          },
          choices: [
            {
              exactKeywords: ['同意'],
              keywords: ['好', 'ok', 'okay', '可以'],
              responses: [],
              nextStepId: 'fx-proposal'
            }
          ]
        },
        {
          id: 'fx-proposal',
          prompt: {
            type: 'text',
            content: '好的，接下來我會先為您生成一個建議框架：覆蓋期間：未來 3 個月；覆蓋金額：每月 JPY 3,000,000（可選擇先覆蓋 50%）；到期日：每月月尾（對應您的付款日）。'
          },
          choices: [
            {
              action: '我想調整覆蓋金額，覆蓋率或到期日',
              keywords: ['調整', '覆蓋率', '到期日', '覆蓋金額'],
              responses: [
                {
                  type: 'text',
                  content: '可以，請直接告訴我您想調整哪一項，例如「覆蓋率改為 70%」或「到期日改為月中」。'
                }
              ],
              nextStepId: 'fx-adjust-request'
            },
            {
              exactKeywords: ['直接做'],
              keywords: ['直接做', '做埋', '照做', '直接進行'],
              responses: [],
              nextStepId: 'fx-trade-confirm'
            }
          ]
        },
        {
          id: 'fx-adjust-request',
          inputMode: 'text',
          inputPlaceholder: '例如：覆蓋率改為 70% 或 到期日改為月中',
          prompt: {
            type: 'text',
            content: '請輸入您想調整的覆蓋金額、覆蓋率或到期日。'
          },
          captureResponses: [
            {
              type: 'text',
              content: '已收到您的調整要求：{{fx-adjust-request}}。'
            }
          ],
          nextStepId: 'fx-adjusted-proposal'
        },
        {
          id: 'fx-adjusted-proposal',
          prompt: {
            type: 'text',
            content: '我已按您的要求更新建議框架：{{fx-adjust-request}}。如沒有其他修改，可以直接做。'
          },
          choices: [
            {
              action: '得，直接做',
              exactKeywords: ['得，直接做'],
              keywords: ['直接做', '做埋', '照做', '直接進行'],
              responses: [],
              nextStepId: 'fx-trade-confirm'
            },
            {
              action: '我想再調整',
              keywords: ['再調整', '修改'],
              responses: [],
              nextStepId: 'fx-adjust-request'
            }
          ]
        },
        {
          id: 'fx-trade-confirm',
          prompt: {
            type: 'text',
            content: '交易明細如下：未來 3 個月，每月 JPY 3,000,000，先覆蓋 50%，到期日設於每月月尾，產品為遠期外匯合約。請確認。'
          },
          choices: [
            {
              action: '確認',
              exactKeywords: ['確認'],
              keywords: ['confirm', 'ok'],
              responses: [
                {
                  type: 'thinking',
                  content: '正在提交外匯對沖交易'
                },
                {
                  type: 'text',
                  content: '交易成功。',
                  delayMs: 1400
                }
              ],
              nextStepId: 'fx-trade-record'
            }
          ]
        },
        {
          id: 'fx-trade-record',
          prompt: {
            type: 'text',
            content: '您可點擊下方按鈕查閱交易記錄。'
          },
          choices: [
            {
              action: '查閱交易記錄',
              keywords: ['交易記錄', '查閱交易記錄'],
              responses: [
                {
                  type: 'text',
                  content: '已為您整理本次交易記錄，您可稍後於交易紀錄頁查看。'
                }
              ],
              clearFlow: true
            }
          ]
        }
      ]
    }
  }
];

window.HSBCFlowModuleConfigs.fxHedging = {
  topicId: 'fx-hedging-flow',
  initialMessagesByTopic: {
    'fx-hedging-flow': {
      sender: 'ai',
      type: 'text',
      content: '🔔近期日圓（JPY）波動加劇。根據過往交易記錄，您可能面臨匯率波動導致成本上升的風險。如您希穩定未來採購成本，可考慮使用外匯對沖方案（例如：遠期外匯合約等）。是否需要我為您進行快速評估並提供可行選項？',
      actions: []
    }
  },
  defaultResponses: [
    {
      type: 'text',
      content: '🔔近期日圓（JPY）波動加劇。根據過往交易記錄，您可能面臨匯率波動導致成本上升的風險。如您希穩定未來採購成本，可考慮使用外匯對沖方案（例如：遠期外匯合約等）。是否需要我為您進行快速評估並提供可行選項？',
      actions: []
    }
  ]
};
