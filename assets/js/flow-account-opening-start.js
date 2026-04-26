window.HSBCFlowModules = window.HSBCFlowModules || {};
window.HSBCFlowModuleConfigs = window.HSBCFlowModuleConfigs || {};

var hsbcAccountOpeningStartEntries = window.HSBCFlowModules.accountOpening = window.HSBCFlowModules.accountOpening || [];
var hsbcAccountOpeningConfig = window.HSBCFlowModuleConfigs.accountOpening = window.HSBCFlowModuleConfigs.accountOpening || {
  defaultResponsesByTopic: {},
  initialMessagesByTopic: {}
};

hsbcAccountOpeningStartEntries.push({
  trigger: '開戶 / Account Opening',
  keywords: ['開立匯豐商業戶口', '開公司', '開戶', 'account', '銀行卡', '開帳戶','老闆'],
  topicId: 'account-opening-start',
  flow: {
    id: 'account-opening-start',
    introResponses: [
      {
        type: 'text',
        content: '了解。我可以協助您由公司設立到香港商業戶口開立的一站式流程。'
      }
    ],
    startStepId: 'account-company-status',
    steps: [
      {
        id: 'account-company-status',
        prompt: {
          type: 'text',
          content: '為了確認您適用的開戶流程，請問您已經成立公司了嗎？'
        },
        routes: [
          {
            action: '未',
            exactKeywords: ['未'],
            keywords: ['未', '未成立', '未成立公司', '還未成立', '公司未成立', '未有公司', 'not yet'],
            responses: [],
            nextStepId: 'account-location'
          },
          {
            action: '已',
            exactKeywords: ['已'],
            keywords: ['已', '已成立', '已經成立', 'yes'],
            responses: [
              {
                type: 'text',
                content: '明白。如公司已成立，我也可以協助您接續香港商業戶口開立流程。'
              }
            ],
            nextStepId: 'account-location'
          }
        ]
      },
      {
        id: 'account-location',
        prompt: {
          type: 'text',
          content: '您打算在哪裡成立公司？'
        },
        routes: [
          {
            action: 'HK',
            exactKeywords: ['hk'],
            keywords: ['香港', '香港公司', 'hk', 'hong kong', 'hongkong', 'hkg'],
            responses: [
              {
                type: 'text',
                content: '好的，我將為您啟動「香港公司設立 + 商業戶口開立」一站式流程。如您同意，我可以在您授權下協助整理資料、生成待簽文件並提交公司設立申請；公司成立後，我會預填商業戶口開戶表格，最後您只需電子簽署即可提交開戶。'
              }
            ],
            nextStepId: 'account-authorization'
          },
          {
            action: '其他地區',
            keywords: ['內地', '中國內地', '內地公司', '大陸', '海外', '其他', '境外'],
            responses: [
              {
                type: 'text',
                content: '這次示範我先按「香港公司設立 + 商業戶口開立」流程為您展示後續步驟。'
              }
            ],
            nextStepId: 'account-authorization'
          }
        ]
      },
      {
        id: 'account-authorization',
        prompt: {
          type: 'text',
          content: '請問您是否授權我協助您完成整個流程？'
        },
        routes: [
          {
            action: '好，授權',
            keywords: ['授權', '同意', '可以', '好', 'ok'],
            responses: [
              {
                type: 'text',
                content: '感謝您的授權。為保障您的資料安全，並符合開戶及後續申請流程要求，我需要先為您進行身分核實。完成後我才可繼續協助您提交公司設立及開戶相關申請。'
              },
              {
                type: 'text',
                content: '請先準備您的身分證明文件：香港身份證（HKID）或護照。以及一張您本人清晰入鏡的自拍照'
              }
            ],
            nextStepId: 'account-supporting-upload'
          },
          {
            action: '暫不授權',
            keywords: ['不', '否', '未授權'],
            responses: [
              {
                type: 'text',
                content: '明白。當您準備好授權後，我可以再由身分核實開始協助您完成流程。'
              }
            ],
            clearFlow: true
          }
        ]
      },
      {
        id: 'account-supporting-upload',
        inputMode: 'file',
        uploadPlaceholder: '此步驟請使用上傳按鈕加入自拍連同身份證明文件的相片',
        fileAccept: '.png,.jpg,.jpeg,.pdf',
        responseDelayMs: 3000,
        prompt: {
          type: 'text',
          content: '請上載您本人清晰入鏡並手持身分證明文件的相片，我會立即進行核對。'
        },
        captureResponses: [
          {
            type: 'text',
            content: '面容識別已完成。'
          },
          {
            type: 'text',
            content: '文件內容識別已完成：\n\n證件類別：香港身份證\n證件編號：A123456(6)\n姓名：小白'
          }
        ],
        nextStepId: 'account-verification-confirm'
      },
      {
        id: 'account-verification-confirm',
        prompt: {
          type: 'text',
          content: '如以上資料正確，請輸入「確認」。'
        },
        routes: [
          {
            action: '確認',
            keywords: ['確認', '正確', 'ok', 'yes'],
            responses: [],
            nextStepId: 'account-company-registration-info'
          }
        ]
      },
      {
        id: 'account-company-registration-info',
        inputMode: 'text',
        inputPlaceholder: '例如：公司名稱「小白拉麵有限公司」，1 名董事兼股東，主要經營拉麵餐廳，計劃於九龍開業',
        skipNextPromptResponses: true,
        prompt: {
          type: 'text',
          content: '我將開始收集必要資料，並在每一步提供摘要供您確認。接下來我會先收集公司名稱、董事/股東安排及基本業務資料，並提供所需文件清單與狀態追蹤，讓您清楚每一步進度。請先提供公司名稱、董事/股東安排及基本業務資料。'
        },
        captureResponses: [
          {
            type: 'text',
            content: '我已收到您提供的公司名稱、董事/股東安排及基本業務資料。在完成BR及CR登記後，我們會直接幫您開立滙豐商業戶口。現在需要您的電子簽署（e-sign）。'
          }
        ],
        nextStepId: 'account-esign'
      },
      {
        id: 'account-esign',
        responseDelayMs: 0,
        prompt: {
          type: 'text',
          content: '請完成電子簽署（e-sign）。'
        },
        routes: [
          {
            action: 'e-sign',
            keywords: ['e-sign', 'esign', '電子簽署'],
            responses: [
              {
                type: 'thinking',
                content: '正在連接外部API'
              },
              {
                type: 'text',
                content: '已成功遞交申請，如成功批核，您在兩至三個工作日內將會收到確認通知，確認後可直接從「滙豐萬事屋」直接登入您的商業戶口。',
                delayMs: 2000
              }
            ],
            clearFlow: true
          }
        ]
      }
    ]
  }
});

hsbcAccountOpeningConfig.defaultResponsesByTopic['account-opening-start'] = [
  {
    type: 'text',
    content: '您好！我是滙豐萬事屋。請問今日有什麼可以幫到您的企業？',
    actions: ['我想了解如何開立匯豐商業戶口。', '我是現有客戶，想要進行交易。']
  }
];

hsbcAccountOpeningConfig.initialMessagesByTopic['account-opening-start'] = {
  sender: 'ai',
  type: 'text',
  content: '您好！我是滙豐萬事屋。請問今日有什麼可以幫到您的企業？',
  actions: ['我想了解如何開立匯豐商業戶口。', '我是現有客戶，想要進行交易。']
};
