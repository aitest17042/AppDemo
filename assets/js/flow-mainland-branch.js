window.HSBCFlowModules = window.HSBCFlowModules || {};
window.HSBCFlowModuleConfigs = window.HSBCFlowModuleConfigs || {};

window.HSBCFlowModules.mainlandBranch = [
  {
    trigger: '拓展內地分店',
    keywords: ['建議', '內地分店', '國內開分店', '開分店', '內地擴張'],
    topicId: 'mainland-branch-flow',
    flow: {
      id: 'mainland-branch-flow',
      introResponses: [
        {
          type: 'text',
          content: '明白，根據分析了您的帳戶，我建議您可以考慮向新市場拓展；\n\n另外，在您同意下，我亦可參考您在本行的歷史收支與交易行為特徵，例如收款渠道分佈、付款週期、幣種使用及現金流穩定性等，為您模擬最可能適合您的幾個方案選項，並列出每個選項的注意事項與文件準備方向。'
        }
      ],
      startStepId: 'mainland-branch-consent',
      steps: [
        {
          id: 'mainland-branch-consent',
          prompt: {
            type: 'text',
            content: '請問您是否同意我使用上述資訊作分析，以便提供更貼合您情況的建議？'
          },
          choices: [
            {
              action: '同意',
              keywords: ['同意', '可以', '好'],
              responses: [
                {
                  type: 'text',
                  content: '感謝確認。根據您在本行的交易趨勢與營運特徵，我為您模擬了三個最常見且與您情況匹配度較高的拓展方案，並給出優先建議（Top Choice）。'
                },
                {
                  type: 'text',
                  content: 'Top Choice：先在大灣區以自營模式開設首間試點餐廳，配合跨境收款、供應商付款及初期營運資金安排。'
                },
                {
                  type: 'text',
                  content: '我已附上三個方案供您逐一查看，您可點擊並查看方案詳情。',
                  actionPresentation: 'direct-reply',
                  actions: ['大灣區試點店（Top Choice）', '合資經營分店', '加盟／品牌授權模式']
                },
              ],
              clearFlow: true
            },
            {
              action: '不同意',
              keywords: ['不同意', '暫不同意', '暫時不同意'],
              responses: [
                {
                  type: 'text',
                  content: '明白。如您暫時不希望我使用上述資訊，我仍可先提供一般性準備建議。'
                },
                {
                  type: 'text',
                  content: '一般而言，拓展內地餐廳分店可先整理目標城市、開店模式、預算、供應鏈安排，以及公司與負責人的基本證明文件。',
                  actions: ['我想查看一般準備清單', '我想了解常見所需文件']
                }
              ],
              clearFlow: true
            }
          ]
        }
      ]
    }
  },
  {
    trigger: '查看方案 1：大灣區試點店（Top Choice）',
    keywords: ['查看方案 1', '方案 1', '大灣區試點店', '大灣區試點店（top choice）', 'top choice'],
    topicId: 'mainland-branch-flow',
    responses: [
      {
        type: 'text',
        content: '大灣區試點店（Top Choice）：較適合已有穩定香港餐飲營運、希望先以一間內地試點店測試客流與供應鏈安排的企業。'
      },
      {
        type: 'text',
        content: '注意事項：先確認落戶城市、租約期、食品經營相關牌照、收款工具、員工招聘與薪酬支付安排，並預留首 6 至 12 個月的營運資金緩衝。'
      },
      {
        type: 'text',
        content: '文件準備方向：香港公司註冊及商業登記文件、董事及實益擁有人身份證明、最近營運流水或管理帳、開店商業計劃、門店預算、意向租約或選址資料、主要供應商名單。',
        actions: ['立即開立內地戶口', '返回三個方案總覽']
      }
    ]
  },
  {
    trigger: '開立內地戶口',
    keywords: ['開立內地戶口', '立即開立內地戶口', '內地戶口'],
    topicId: 'mainland-branch-flow',
    flow: {
      id: 'mainland-account-opening-flow',
      startStepId: 'mainland-account-authorization',
      steps: [
        {
          id: 'mainland-account-authorization',
          prompt: {
            type: 'text',
            content: '請授權我們將您的資料給滙豐（中國），審核完畢後可直接開通內地戶口。',
            actionPresentation: 'direct-reply',
            actions: ['授權']
          },
          routes: [
            {
              action: '授權',
              keywords: ['授權', '同意', '可以', '好'],
              responses: [
                {
                  type: 'text',
                  content: '已遞交您的資料，當開戶步驟完成後我們會再發送訊息及電郵給您，請留意。'
                }
              ],
              nextStepId: 'mainland-verified-partner-offer'
            }
          ]
        },
        {
          id: 'mainland-verified-partner-offer',
          prompt: {
            type: 'text',
            content: '在這期間，建議您瀏覽 HSBC Verified Partner 以準備您的拓展。',
            actions: ['瀏覽 HSBC Verified Partner']
          },
          routes: [
            {
              action: '瀏覽 HSBC Verified Partner',
              keywords: ['瀏覽 hsbc verified partner', 'hsbc verified partner', '瀏覽 verified partner', 'verified partner'],
              responses: [
                {
                  type: 'partner-carousel',
                  cardHeading: 'HSBC Verified Partner',
                  cardCategory: '餐飲業',
                  partnerCards: [
                    {
                      href: './tran_one-year-later.html',
                      logo: './assets/media/icons/nailong_logo.png',
                      name: '奶龙国际',
                      rating: '100分/5分'
                    },
                    {
                      href: './tran_one-year-later.html',
                      logo: './assets/media/icons/yumchina_logo.png',
                      name: '百胜中国',
                      rating: '5分/5分'
                    },
                    {
                      href: './tran_one-year-later.html',
                      logo: './assets/media/icons/bolex_logo.png',
                      name: '上海宝立食品科技股份有限公司',
                      rating: '100分/5分'
                    }
                  ]
                }
              ],
              clearFlow: true
            }
          ]
        }
      ]
    }
  },
  {
    trigger: '查看方案 2：合資經營分店',
    keywords: ['查看方案 2', '方案 2', '合資經營分店', '合資經營'],
    topicId: 'mainland-branch-flow',
    responses: [
      {
        type: 'text',
        content: '合資經營分店：較適合已找到內地合作方、希望借助本地團隊加快選址、招募與營運落地的企業。'
      },
      {
        type: 'text',
        content: '注意事項：應先釐清股權與分工、品牌使用權、資金調撥、董事會或授權機制，以及退出安排，避免日後營運與現金管理出現分歧。'
      },
      {
        type: 'text',
        content: '文件準備方向：合作方背景資料與 KYC 文件、合作框架或 term sheet、預計股權架構、投資金額與注資時間表、收益分配模型、品牌授權與內控安排。',
        actions: ['大灣區試點店（Top Choice）', '合資經營分店', '加盟／品牌授權模式']
      }
    ]
  },
  {
    trigger: '查看方案 3：加盟／品牌授權模式',
    keywords: ['查看方案 3', '方案 3', '加盟', '品牌授權模式'],
    topicId: 'mainland-branch-flow',
    responses: [
      {
        type: 'text',
        content: '加盟／品牌授權模式：較適合希望以較輕資產方式拓展，並把部分門店投資與日常營運交由合作方承擔的企業。'
      },
      {
        type: 'text',
        content: '注意事項：需要特別留意品牌一致性、加盟商篩選、品質控制、費用結算、知識產權保護，以及培訓與審核制度。'
      },
      {
        type: 'text',
        content: '文件準備方向：商標或品牌權屬證明、加盟或授權合約草案、營運手冊、培訓安排、加盟費與持續服務費結算方式、門店審核與稽核框架。',
        actions: ['大灣區試點店（Top Choice）', '合資經營分店', '加盟／品牌授權模式']
      }
    ]
  },
  {
    trigger: '返回三個方案總覽',
    keywords: ['返回三個方案總覽', '方案總覽', '返回總覽'],
    topicId: 'mainland-branch-flow',
    responses: [
      {
        type: 'text',
        content: '目前較建議您先從方案 1 的試點店路線開始評估，再按實際合作資源與投資節奏比較另外兩個方案。',
        actions: ['大灣區試點店（Top Choice）', '合資經營分店', '加盟／品牌授權模式']
      }
    ]
  },
  {
    trigger: '我想查看一般準備清單',
    keywords: ['一般準備清單', '準備清單'],
    topicId: 'mainland-branch-flow',
    responses: [
      {
        type: 'text',
        content: '一般準備清單可先由五部分入手：目標城市與選址、開店模式、自有資金與現金流預算、供應鏈及人手安排、以及公司與負責人證明文件。'
      },
      {
        type: 'text',
        content: '若之後您願意讓我使用交易特徵作分析，我亦可以再為您模擬較貼合的拓展方案。',
        actions: ['拓展內地分店', '我想了解常見所需文件']
      }
    ]
  },
  {
    trigger: '我想了解常見所需文件',
    keywords: ['常見所需文件', '所需文件', '文件'],
    topicId: 'mainland-branch-flow',
    responses: [
      {
        type: 'text',
        content: '常見文件可包括：香港公司註冊及商業登記文件、董事及實益擁有人身份證明、營運流水或管理帳、門店商業計劃、選址或租約資料、供應商及合作方資料，以及視乎模式需要的品牌授權或合作框架文件。'
      },
      {
        type: 'text',
        content: '如您想進一步比較三個拓展方案，我可以即時帶您返回方案總覽。',
        actions: ['返回三個方案總覽', '拓展內地分店']
      }
    ]
  }
];

window.HSBCFlowModuleConfigs.mainlandBranch = {
  topicId: 'mainland-branch-flow',
  initialMessagesByTopic: {
    'mainland-branch-flow': {
      sender: 'ai',
      type: 'text',
      content: '您好！我是滙豐萬事屋。請問今日有什麼可以幫到您的企業？',
      actions: ['我想過數。', '我要兌換外幣。']
    }
  },
  defaultResponses: [
    {
      type: 'text',
      content: '您好！我是滙豐萬事屋。請問今日有什麼可以幫到您的企業？',
      actions: ['我想過數。', '我要兌換外幣。']
    }
  ]
};