window.HSBCFlowModules = window.HSBCFlowModules || {};
window.HSBCFlowModuleConfigs = window.HSBCFlowModuleConfigs || {};

var hsbcAccountOpeningCompleteEntries = window.HSBCFlowModules.accountOpening = window.HSBCFlowModules.accountOpening || [];
var hsbcAccountOpeningCompleteConfig = window.HSBCFlowModuleConfigs.accountOpening = window.HSBCFlowModuleConfigs.accountOpening || {
  defaultResponsesByTopic: {},
  initialMessagesByTopic: {}
};

hsbcAccountOpeningCompleteEntries.push({
  trigger: '開戶完成 / Account Completion',
  topicId: 'account-opening-complete',
  flow: {
    id: 'account-opening-complete',
    startStepId: 'account-followup-openrice-offer',
    steps: [
      {
        id: 'account-followup-openrice-offer',
        prompt: {
          type: 'text',
          content: '分析：檢視到你的公司業務是拉面店，根據我們的數據分折，在香港一般的餐廳亦會開IG / OpenRice帳號，需要我幫你開嗎？',
          actions: ['ok, openrice']
        },
        routes: [
          {
            action: 'ok, openrice',
            keywords: ['ok, openrice', 'openrice', 'ok openrice', 'ok', '好', '需要', '幫我開', '開openrice'],
            responses: [],
            nextStepId: 'account-followup-openrice-authorize'
          }
        ]
      },
      {
        id: 'account-followup-openrice-authorize',
        prompt: {
          type: 'text',
          content: '註冊OpenRice需要你的帳號名、店名、電郵，因你已登入滙豐萬事屋，我可以直接幫你填寫，請問你是否授權並直接提交？',
          actionPresentation: 'direct-reply',
          actions: ['授權並直接提交']
        },
        routes: [
          {
            action: '授權並直接提交',
            keywords: ['授權並直接提交', '授權', '直接提交', '同意', '可以', 'ok'],
            responses: [
              {
                type: 'text',
                content: '帳號：siubak\n店名：拉王\n電郵：siubak@gmail.com'
              },
              {
                type: 'text',
                content: '成功遞交，如成功批核，你在30分鐘後將會收到確認電郵，確認後可直接從「滙豐萬事屋」直接登入 OpenRice',
                delayMs: 1200
              }
            ],
            clearFlow: true
          }
        ]
      }
    ]
  }
});

hsbcAccountOpeningCompleteConfig.defaultResponsesByTopic['account-opening-complete'] = [
  {
    type: 'text',
    content: '公司已註冊及開戶已處理完成，因此裝置為你的授權裝置，已直接幫你登入。',
    actions: ['查看你的戶口。']
  }
];

hsbcAccountOpeningCompleteConfig.initialMessagesByTopic['account-opening-complete'] = {
  sender: 'ai',
  type: 'text',
  content: '公司已註冊及開戶已處理完成，因此裝置為你的授權裝置，已直接幫你登入。',
  actions: ['查看你的戶口。']
};
