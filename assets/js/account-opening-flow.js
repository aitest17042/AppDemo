window.HSBCFlowModules = window.HSBCFlowModules || {};

window.HSBCFlowModules.accountOpening = [
  {
    trigger: '開戶 / Account Opening',
    keywords: ['開戶', 'account', '銀行卡', '開帳戶'],
    flow: {
      id: 'account-opening-flow',
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
            content: '為了確認您適用的開戶流程，我先請問：您已經成立公司了嗎？'
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
                  content: '請先準備您的身分證明文件：香港身份證（HKID）或護照。'
                },
                {
                  type: 'text',
                  content: '請在光線充足的位置，拍攝一張自拍照：您本人清晰入鏡，並同時手持該身分證明文件，文件上的姓名及證件號碼需清晰可見。'
                },
                {
                  type: 'text',
                  content: '完成後請上載該相片，我會立即進行核對。'
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
              content: '文件內容識別已完成：\n\n證件類別：香港身份證\n\n證件編號：A123456(6)\n\n姓名：小白'
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
          prompt: {
            type: 'text',
            content: '我將開始收集必要資料，並在每一步提供摘要供您確認。接下來我會先收集公司名稱、董事/股東安排及基本業務資料，並提供所需文件清單與狀態追蹤，讓您清楚每一步進度。請先提供公司名稱、董事/股東安排及基本業務資料。'
          },
          captureResponses: [
            {
              type: 'text',
              content: '我已收到您提供的公司名稱、董事/股東安排及基本業務資料。'
            },
            {
              type: 'text',
              content: '我已協助整理公司設立申請資料，並已向公司註冊處提交，以取得 CI 及 BR。'
            },
            {
              type: 'text',
              content: '通知您：公司設立已完成。接下來我將為您啟動 HSBC 香港商業戶口開立，並預先填寫開戶表格。'
            },
            {
              type: 'text',
              content: '為加快審核及減少補件，我需要您提供以下與業務相關文件或資料（如適用，提供其一或多項即可）：'
            },
            {
              type: 'text',
              content: '1. 業務證明：餐廳 IG / Facebook 專頁、官方網站、外賣平台店舖頁面截圖（如 OpenRice / Foodpanda / Deliveroo 等）。'
            },
            {
              type: 'text',
              content: '2. 交易佐證：已發出或已收取的發票、收據、採購單、供應商合約或報價單。'
            },
            {
              type: 'text',
              content: '3. 租務文件：店舖租約或租務意向書（如已簽）。'
            },
            {
              type: 'text',
              content: '4. 營運資料：菜單、價目表、開業日期、主要供應商名稱（如有）。'
            },
            {
              type: 'text',
              content: '5. 資金來源佐證（如需要）：注資紀錄或相關說明。'
            }
          ],
          nextStepId: 'account-business-supporting'
        },
        {
          id: 'account-business-supporting',
          inputMode: 'text-or-file',
          inputPlaceholder: '例如：IG 連結、官方網站網址，或直接描述您準備提供的業務文件',
          uploadPlaceholder: '此步驟可直接輸入連結，或使用上傳按鈕加入 PDF / 相片',
          fileAccept: '.pdf,.png,.jpg,.jpeg,.doc,.docx',
          prompt: {
            type: 'text',
            content: '請選擇最方便的方式提供：您可直接回覆連結，例如 IG URL；或上載 PDF / 相片，我會為您整理並附加至開戶申請檔案。'
          },
          captureResponses: [
            {
              type: 'text',
              content: '我已收到並整理您提供的業務相關文件或資料，正進行文件驗證、CDD 核對及開戶摘要草擬。'
            },
            {
              type: 'text',
              content: '我已根據公司註冊資料預填開戶表格。下一步將進行電子簽署：您檢視摘要後一次過簽署提交；完成後我會持續為您更新審核進度，直至戶口開立完成。'
            }
          ],
          nextStepId: 'account-esign'
        },
        {
          id: 'account-esign',
          prompt: {
            type: 'text',
            content: '如您準備好，請輸入「OK + e-sign」完成電子簽署。'
          },
          routes: [
            {
              action: 'OK + e-sign',
              keywords: ['ok + e-sign', 'ok', 'e-sign', 'esign', '電子簽署'],
              responses: [
                {
                  type: 'text',
                  content: '已收到您的電子簽署並成功提交開戶申請，我會持續為您更新審核進度，如需補充文件亦會即時通知。'
                },
                {
                  type: 'text',
                  content: '審核已完成。'
                },
                {
                  type: 'text',
                  content: '恭喜您，您的 HSBC 香港商業戶口已成功開立。'
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