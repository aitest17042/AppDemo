Object.assign(window, {
  HSBCKnowledgeBase: {
    knowledgeBase: [
      {
        trigger: '貸款 / SME Loan',
        keywords: ['我想查詢中小企貸款的最新方案', '貸款', 'loan', '借錢', '週轉'],
        flow: {
          id: 'loan-flow',
          introResponses: [
            {
              type: 'text',
              content: '了解。我可以協助您逐步釐清較適合的中小企貸款方向。'
            },
            {
              type: 'text',
              content: '我會用 10 個步驟了解您的資金用途、規模與時間表，最後再給您下一步建議。'
            }
          ],
          startStepId: 'loan-purpose',
          steps: [
            {
              id: 'loan-purpose',
              prompt: {
                type: 'text',
                content: '第一步，這筆融資主要會用在甚麼地方？'
              },
              choices: [
                {
                  action: '營運資金',
                  keywords: ['營運資金', '週轉', '現金流'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，您主要希望補充日常營運資金。'
                    }
                  ],
                  nextStepId: 'loan-amount'
                },
                {
                  action: '購置設備',
                  keywords: ['設備', '機器', '固定資產'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，您是為設備或固定資產安排資金。'
                    }
                  ],
                  nextStepId: 'loan-amount'
                },
                {
                  action: '擴展業務',
                  keywords: ['擴展', '增長', '開分店'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，您是為擴充團隊、據點或訂單準備資金。'
                    }
                  ],
                  nextStepId: 'loan-amount'
                }
              ]
            },
            {
              id: 'loan-amount',
              prompt: {
                type: 'text',
                content: '第二步，您預計需要多少資金？'
              },
              choices: [
                {
                  action: '50萬以下',
                  keywords: ['50萬以下', '五十萬以下', '細額'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，屬於較精簡的融資規模。'
                    }
                  ],
                  nextStepId: 'loan-business-stage'
                },
                {
                  action: '50萬至200萬',
                  keywords: ['50萬至200萬', '五十萬至二百萬'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，屬於常見的中小企擴張或週轉資金範圍。'
                    }
                  ],
                  nextStepId: 'loan-business-stage'
                },
                {
                  action: '200萬以上',
                  keywords: ['200萬以上', '二百萬以上'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，這可能需要較完整的財務與業務資料支持。'
                    }
                  ],
                  nextStepId: 'loan-business-stage'
                }
              ]
            },
            {
              id: 'loan-business-stage',
              prompt: {
                type: 'text',
                content: '第三步，公司目前營運多久？'
              },
              choices: [
                {
                  action: '少於1年',
                  keywords: ['少於1年', '新公司', '初創'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，新成立業務一般需要提供更清晰的資金用途和營運計劃。'
                    }
                  ],
                  nextStepId: 'loan-turnover'
                },
                {
                  action: '1至3年',
                  keywords: ['1至3年', '一至三年'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，已有一定營運紀錄，資料整理會相對直接。'
                    }
                  ],
                  nextStepId: 'loan-turnover'
                },
                {
                  action: '3年以上',
                  keywords: ['3年以上', '三年以上'],
                  responses: [
                    {
                      type: 'text',
                      content: '很好，較長的營運紀錄通常有助評估融資安排。'
                    }
                  ],
                  nextStepId: 'loan-turnover'
                }
              ]
            },
            {
              id: 'loan-turnover',
              prompt: {
                type: 'text',
                content: '第四步，公司的年營業額大概屬於哪一個區間？'
              },
              choices: [
                {
                  action: '500萬以下',
                  keywords: ['500萬以下', '五百萬以下'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，我會以較精簡的業務規模作為參考。'
                    }
                  ],
                  nextStepId: 'loan-collateral'
                },
                {
                  action: '500萬至3000萬',
                  keywords: ['500萬至3000萬', '五百萬至三千萬'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，這屬於不少成長型企業常見的規模。'
                    }
                  ],
                  nextStepId: 'loan-collateral'
                },
                {
                  action: '3000萬以上',
                  keywords: ['3000萬以上', '三千萬以上'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，較大規模融資通常可進一步比較多種產品組合。'
                    }
                  ],
                  nextStepId: 'loan-collateral'
                }
              ]
            },
            {
              id: 'loan-collateral',
              prompt: {
                type: 'text',
                content: '第五步，您較傾向哪一類融資安排？'
              },
              choices: [
                {
                  action: '無抵押貸款',
                  keywords: ['無抵押', '免抵押'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，您想先集中了解無抵押的貸款選項。'
                    }
                  ],
                  nextStepId: 'loan-urgency'
                },
                {
                  action: '可提供抵押或擔保',
                  keywords: ['抵押', '擔保'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，如可提供抵押或擔保，產品選擇通常會更廣。'
                    }
                  ],
                  nextStepId: 'loan-urgency'
                },
                {
                  action: '想了解政府擔保計劃',
                  keywords: ['政府擔保', '中小企融資擔保'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，政府擔保計劃通常是中小企常見的起點之一。'
                    }
                  ],
                  nextStepId: 'loan-urgency'
                }
              ]
            },
            {
              id: 'loan-urgency',
              prompt: {
                type: 'text',
                content: '第六步，您希望多快取得資金？'
              },
              choices: [
                {
                  action: '兩星期內',
                  keywords: ['兩星期內', '盡快', '急'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，時間較緊時一般要先確保文件齊備。'
                    }
                  ],
                  nextStepId: 'loan-banking'
                },
                {
                  action: '一個月內',
                  keywords: ['一個月內', '本月內'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，這個時間表通常較容易安排申請與跟進。'
                    }
                  ],
                  nextStepId: 'loan-banking'
                },
                {
                  action: '仍在規劃',
                  keywords: ['規劃中', '先了解'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，先比較方案會較適合您目前的階段。'
                    }
                  ],
                  nextStepId: 'loan-banking'
                }
              ]
            },
            {
              id: 'loan-banking',
              prompt: {
                type: 'text',
                content: '第七步，您目前是否已是匯豐商業客戶？'
              },
              choices: [
                {
                  action: '是，已持有商業戶口',
                  keywords: ['現有客戶', '商業戶口'],
                  responses: [
                    {
                      type: 'text',
                      content: '很好，現有商業戶口有助更順暢地對接後續融資安排。'
                    }
                  ],
                  nextStepId: 'loan-documents'
                },
                {
                  action: '不是，但可同步開戶',
                  keywords: ['未開戶', '同步開戶'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，如有需要，之後可同時了解開戶與貸款安排。'
                    }
                  ],
                  nextStepId: 'loan-documents'
                },
                {
                  action: '暫時未有計劃',
                  keywords: ['未有計劃', '暫時沒有'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，我先集中幫您梳理融資方向。'
                    }
                  ],
                  nextStepId: 'loan-documents'
                }
              ]
            },
            {
              id: 'loan-documents',
              prompt: {
                type: 'text',
                content: '第八步，申請文件目前準備情況如何？'
              },
              choices: [
                {
                  action: '已備齊財務資料',
                  keywords: ['已備齊', '文件齊'],
                  responses: [
                    {
                      type: 'text',
                      content: '很好，已有財務資料通常可加快初步評估。'
                    }
                  ],
                  nextStepId: 'loan-repayment'
                },
                {
                  action: '已準備部分資料',
                  keywords: ['部分資料', '準備了一部分'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，之後可再補齊公司與財務文件。'
                    }
                  ],
                  nextStepId: 'loan-repayment'
                },
                {
                  action: '未開始整理',
                  keywords: ['未開始', '未整理'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，稍後我可以先告訴您一般需要準備的基本文件。'
                    }
                  ],
                  nextStepId: 'loan-repayment'
                }
              ]
            },
            {
              id: 'loan-repayment',
              prompt: {
                type: 'text',
                content: '第九步，您較偏好哪種還款方式？'
              },
              choices: [
                {
                  action: '固定分期',
                  keywords: ['分期', '固定還款'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，固定分期較方便預算每月現金流。'
                    }
                  ],
                  nextStepId: 'loan-business-context'
                },
                {
                  action: '循環貸款',
                  keywords: ['循環', '循環貸款'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，循環額度較適合彈性運用資金。'
                    }
                  ],
                  nextStepId: 'loan-business-context'
                },
                {
                  action: '想先比較方案',
                  keywords: ['比較方案', '先比較'],
                  responses: [
                    {
                      type: 'text',
                      content: '可以，我會先以方案比較角度幫您整理下一步。'
                    }
                  ],
                  nextStepId: 'loan-business-context'
                }
              ]
            },
            {
              id: 'loan-business-context',
              inputMode: 'text',
              inputPlaceholder: '例如：希望 6 月提取 150 萬作存貨週轉，並先了解 24 個月還款安排',
              prompt: {
                type: 'text',
                content: '第十步，請輸入一段補充資料，示範您的融資用途、提款時間或其他重點。'
              },
              captureResponses: [
                {
                  type: 'text',
                  content: '已識別您輸入的貸款補充資料：{{loan-business-context}}。'
                }
              ],
              nextStepId: 'loan-supporting-upload'
            },
            {
              id: 'loan-supporting-upload',
              inputMode: 'file',
              uploadPlaceholder: '此步驟請使用上傳按鈕加入示範文件',
              fileAccept: '.pdf,.png,.jpg,.jpeg,.xls,.xlsx,.doc,.docx',
              prompt: {
                type: 'text',
                content: '第十一步，請上傳 1 至 2 份示範文件，例如財務報表、銀行流水或訂單資料。'
              },
              captureResponses: [
                {
                  type: 'text',
                  content: '已識別您上傳的文件：{{loan-supporting-upload}}。'
                },
                {
                  type: 'text',
                  content: '我已把補充資料和文件整理到摘要中，下一步請確認。'
                }
              ],
              nextStepId: 'loan-next-step'
            },
            {
              id: 'loan-next-step',
              prompt: {
                type: 'text',
                content: '第十二步，我已為您整理貸款需求摘要：用途為「{{loan-purpose}}」，金額為「{{loan-amount}}」，營運階段為「{{loan-business-stage}}」，營業額區間為「{{loan-turnover}}」，融資偏好為「{{loan-collateral}}」，期望時程為「{{loan-urgency}}」，往來狀況為「{{loan-banking}}」，文件狀態為「{{loan-documents}}」，補充說明為「{{loan-business-context}}」，上傳資料為「{{loan-supporting-upload}}」。如以上正確，請確認下一步。'
              },
              choices: [
                {
                  action: '確認並查看申請資格',
                  keywords: ['申請資格', '資格'],
                  responses: [
                    {
                      type: 'text',
                      content: '我已按您確認的摘要整理好初步資格重點。一般中小企貸款流程可先準備商業登記證、公司註冊文件、最近財務資料及銀行往來紀錄作初步評估。'
                    },
                    {
                      type: 'text',
                      content: '如您想聚焦政府擔保或無抵押貸款，我可以再進一步列出常見資格要求。',
                      actions: ['我想了解中小企融資擔保計劃', '我想知道一般貸款審批需時多久']
                    }
                  ],
                  clearFlow: true
                },
                {
                  action: '確認並聯絡客戶經理',
                  keywords: ['客戶經理', '聯絡'],
                  responses: [
                    {
                      type: 'text',
                      content: '可以。我已按您的摘要整理出會談重點，建議您先帶備融資金額、用途、營運年期及最近財務文件，方便客戶經理更快了解情況。'
                    },
                    {
                      type: 'text',
                      content: '如果您願意，我也可以先幫您整理一份與客戶經理溝通時可用的重點清單。',
                      actions: ['請給我與客戶經理溝通的重點清單', '我想了解貸款前需要準備哪些文件']
                    }
                  ],
                  clearFlow: true
                },
                {
                  action: '確認並預約融資諮詢',
                  keywords: ['預約', '諮詢'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白。我已先整理出融資摘要，您可再確認方便的日期、地區及想了解的貸款方向，之後安排合適的融資諮詢。'
                    },
                    {
                      type: 'text',
                      content: '如要提升會面效率，建議一併帶備公司基本資料、用途說明及最近營運數據。',
                      actions: ['我想預約商業客戶服務中心', '我想先看看貸款產品比較']
                    }
                  ],
                  clearFlow: true
                },
                {
                  action: '我想修改前面資料',
                  keywords: ['修改', '重整', '返回'],
                  responses: [
                    {
                      type: 'text',
                      content: '可以，我們重新整理您的貸款需求摘要。'
                    }
                  ],
                  nextStepId: 'loan-purpose'
                }
              ]
            }
          ]
        }
      },
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
      },
      {
        trigger: '外匯對沖',
        keywords: ['外匯對沖', 'forex', 'hedging'],
        flow: {
          id: 'fx-hedging-flow',
          introResponses: [
            {
              type: 'text',
              content: '了解。我可以協助您逐步釐清較適合的外匯對沖方向。'
            },
            {
              type: 'text',
              content: '我會用 10 個步驟了解您的貨幣風險、交易頻率與風險偏好，再給您下一步建議。'
            }
          ],
          startStepId: 'fx-currency',
          steps: [
            {
              id: 'fx-currency',
              prompt: {
                type: 'text',
                content: '第一步，您目前最主要面對哪一種貨幣風險？'
              },
              choices: [
                {
                  action: '美元',
                  exactKeywords: ['美元'],
                  keywords: ['usd', '美金'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，美元波動通常是中小企較常見的外匯風險來源之一。'
                    }
                  ],
                  nextStepId: 'fx-direction'
                },
                {
                  action: '人民幣',
                  exactKeywords: ['人民幣'],
                  keywords: ['rmb', 'cny'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，人民幣風險管理常與跨境收付款安排一併考慮。'
                    }
                  ],
                  nextStepId: 'fx-direction'
                },
                {
                  action: '多種貨幣',
                  keywords: ['多種貨幣', '多幣種'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，如涉及多種貨幣，通常更需要系統化地管理對沖安排。'
                    }
                  ],
                  nextStepId: 'fx-direction'
                }
              ]
            },
            {
              id: 'fx-direction',
              prompt: {
                type: 'text',
                content: '第二步，您的匯率風險主要來自收款還是付款？'
              },
              choices: [
                {
                  action: '主要是收款',
                  keywords: ['收款', '應收'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，您較關心未來收款時的匯率變動。'
                    }
                  ],
                  nextStepId: 'fx-frequency'
                },
                {
                  action: '主要是付款',
                  keywords: ['付款', '應付'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，您較關心採購或付款時的匯率成本。'
                    }
                  ],
                  nextStepId: 'fx-frequency'
                },
                {
                  action: '收付款都有',
                  keywords: ['收付款都有', '兩邊都有'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，這類情況通常需要更整體地看待資金流與對沖比例。'
                    }
                  ],
                  nextStepId: 'fx-frequency'
                }
              ]
            },
            {
              id: 'fx-frequency',
              prompt: {
                type: 'text',
                content: '第三步，這類外匯收付款大概有多頻密？'
              },
              choices: [
                {
                  action: '每月都有',
                  keywords: ['每月', '每個月'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，如屬每月常態性收付款，對沖安排通常可以較有規律。'
                    }
                  ],
                  nextStepId: 'fx-amount'
                },
                {
                  action: '每季為主',
                  keywords: ['每季', '季度'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，季度性安排一般可按訂單或應收應付週期規劃。'
                    }
                  ],
                  nextStepId: 'fx-amount'
                },
                {
                  action: '不定期',
                  keywords: ['不定期', '偶爾'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，不定期風險通常更需要先界定甚麼情況下才值得對沖。'
                    }
                  ],
                  nextStepId: 'fx-amount'
                }
              ]
            },
            {
              id: 'fx-amount',
              prompt: {
                type: 'text',
                content: '第四步，您大概想管理多少金額的外匯風險？'
              },
              choices: [
                {
                  action: '50萬以下',
                  keywords: ['50萬以下', '細額'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，較小額時通常會先考慮操作簡單的安排。'
                    }
                  ],
                  nextStepId: 'fx-solution'
                },
                {
                  action: '50萬至500萬',
                  keywords: ['50萬至500萬'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，這是很多中小企開始系統化管理匯率風險的常見區間。'
                    }
                  ],
                  nextStepId: 'fx-solution'
                },
                {
                  action: '500萬以上',
                  keywords: ['500萬以上'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，較大金額時通常更值得提早規劃對沖策略與比率。'
                    }
                  ],
                  nextStepId: 'fx-solution'
                }
              ]
            },
            {
              id: 'fx-solution',
              prompt: {
                type: 'text',
                content: '第五步，您目前較想了解哪一類工具？'
              },
              choices: [
                {
                  action: '遠期合約',
                  keywords: ['遠期', 'forward'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，遠期合約通常用於預先鎖定未來匯率。'
                    }
                  ],
                  nextStepId: 'fx-timing'
                },
                {
                  action: '期權方案',
                  keywords: ['期權', 'option'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，期權方案通常用於在保護風險與保留機會之間作平衡。'
                    }
                  ],
                  nextStepId: 'fx-timing'
                },
                {
                  action: '想先比較不同工具',
                  keywords: ['比較', '先比較'],
                  responses: [
                    {
                      type: 'text',
                      content: '可以，我會以較實用的比較角度幫您整理下一步。'
                    }
                  ],
                  nextStepId: 'fx-timing'
                }
              ]
            },
            {
              id: 'fx-timing',
              prompt: {
                type: 'text',
                content: '第六步，您最關心哪一段時間的匯率風險？'
              },
              choices: [
                {
                  action: '現有訂單或應收應付',
                  keywords: ['現有訂單', '應收應付'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，已確定的應收應付通常較容易界定對沖金額與期限。'
                    }
                  ],
                  nextStepId: 'fx-risk-preference'
                },
                {
                  action: '未來3個月',
                  keywords: ['3個月', '三個月'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，短期規劃通常較適合先建立基本對沖節奏。'
                    }
                  ],
                  nextStepId: 'fx-risk-preference'
                },
                {
                  action: '半年以上規劃',
                  keywords: ['半年', '長期'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，如屬較長期規劃，通常需要更靈活地安排對沖比例。'
                    }
                  ],
                  nextStepId: 'fx-risk-preference'
                }
              ]
            },
            {
              id: 'fx-risk-preference',
              prompt: {
                type: 'text',
                content: '第七步，您的風險偏好較接近哪一種？'
              },
              choices: [
                {
                  action: '希望盡量鎖定匯率',
                  keywords: ['鎖定匯率', '保守'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，較保守的風險偏好通常會優先考慮確定性較高的安排。'
                    }
                  ],
                  nextStepId: 'fx-banking'
                },
                {
                  action: '希望保留部分升值機會',
                  keywords: ['保留機會', '升值機會'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，這類偏好通常需要平衡保障與靈活性。'
                    }
                  ],
                  nextStepId: 'fx-banking'
                },
                {
                  action: '想先了解兩者差異',
                  keywords: ['差異', '先了解'],
                  responses: [
                    {
                      type: 'text',
                      content: '可以，我之後會以產品比較角度提供下一步建議。'
                    }
                  ],
                  nextStepId: 'fx-banking'
                }
              ]
            },
            {
              id: 'fx-banking',
              prompt: {
                type: 'text',
                content: '第八步，您目前與匯豐的商業銀行關係屬於哪一種？'
              },
              choices: [
                {
                  action: '已持有匯豐商業戶口',
                  keywords: ['現有商業戶口', '已開戶'],
                  responses: [
                    {
                      type: 'text',
                      content: '很好，現有商業戶口通常可讓後續安排更順暢。'
                    }
                  ],
                  nextStepId: 'fx-documents'
                },
                {
                  action: '只有個人戶口',
                  keywords: ['個人戶口'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，如要處理企業層面的外匯安排，之後可能需要配合商業銀行服務。'
                    }
                  ],
                  nextStepId: 'fx-documents'
                },
                {
                  action: '尚未開立任何戶口',
                  keywords: ['未開戶', '尚未開戶'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，我先集中幫您梳理外匯對沖需求。'
                    }
                  ],
                  nextStepId: 'fx-documents'
                }
              ]
            },
            {
              id: 'fx-documents',
              prompt: {
                type: 'text',
                content: '第九步，與外匯交易相關的支持文件目前準備情況如何？'
              },
              choices: [
                {
                  action: '已有交易單據及發票',
                  keywords: ['單據', '發票', '合約'],
                  responses: [
                    {
                      type: 'text',
                      content: '很好，有交易文件通常有助更具體地討論對沖安排。'
                    }
                  ],
                  nextStepId: 'fx-risk-context'
                },
                {
                  action: '已有部分文件',
                  keywords: ['部分文件'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，之後可再補充實際交易背景與金額資料。'
                    }
                  ],
                  nextStepId: 'fx-risk-context'
                },
                {
                  action: '未開始準備',
                  keywords: ['未開始', '未準備'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，稍後我可以先告訴您一般會用到哪些背景資料。'
                    }
                  ],
                  nextStepId: 'fx-risk-context'
                }
              ]
            },
            {
              id: 'fx-risk-context',
              inputMode: 'text',
              inputPlaceholder: '例如：未來 3 個月每月都有美元付款，希望先鎖定部分匯率',
              prompt: {
                type: 'text',
                content: '第十步，請輸入一段補充資料，示範您的交易背景、風險重點或想管理的期限。'
              },
              captureResponses: [
                {
                  type: 'text',
                  content: '已識別您輸入的外匯補充資料：{{fx-risk-context}}。'
                }
              ],
              nextStepId: 'fx-supporting-upload'
            },
            {
              id: 'fx-supporting-upload',
              inputMode: 'file',
              uploadPlaceholder: '此步驟請使用上傳按鈕加入示範文件',
              fileAccept: '.pdf,.png,.jpg,.jpeg,.xls,.xlsx,.csv,.doc,.docx',
              prompt: {
                type: 'text',
                content: '第十一步，請上傳 1 至 2 份示範文件，例如發票、訂單、收付款明細或交易清單。'
              },
              captureResponses: [
                {
                  type: 'text',
                  content: '已識別您上傳的文件：{{fx-supporting-upload}}。'
                },
                {
                  type: 'text',
                  content: '我已把補充資料和文件整理到摘要中，下一步請確認。'
                }
              ],
              nextStepId: 'fx-next-step'
            },
            {
              id: 'fx-next-step',
              prompt: {
                type: 'text',
                content: '第十二步，我已為您整理外匯對沖摘要：主要貨幣為「{{fx-currency}}」，風險方向為「{{fx-direction}}」，交易頻率為「{{fx-frequency}}」，金額區間為「{{fx-amount}}」，偏好工具為「{{fx-solution}}」，關注期限為「{{fx-timing}}」，風險偏好為「{{fx-risk-preference}}」，銀行關係為「{{fx-banking}}」，文件準備為「{{fx-documents}}」，補充說明為「{{fx-risk-context}}」，上傳資料為「{{fx-supporting-upload}}」。如以上正確，請確認下一步。'
              },
              choices: [
                {
                  action: '確認並比較外匯工具',
                  keywords: ['比較工具', '產品比較'],
                  responses: [
                    {
                      type: 'text',
                      content: '我已按您的摘要整理好工具比較方向。若您想先比較工具，可先從遠期合約、期權方案及風險承受程度三個角度了解差異。'
                    },
                    {
                      type: 'text',
                      content: '之後再根據交易頻率、金額與期限，判斷哪種方式較貼近您的業務需要。',
                      actions: ['我想了解遠期合約與期權的差別', '我想知道對沖方案通常如何收費']
                    }
                  ],
                  clearFlow: true
                },
                {
                  action: '確認並聯絡外匯專家',
                  keywords: ['外匯專家', '聯絡專家'],
                  responses: [
                    {
                      type: 'text',
                      content: '可以。我已根據您的摘要整理出溝通重點，建議您先整理主要貨幣、收付款週期、金額區間及希望管理的期限，方便專家更快掌握需要。'
                    },
                    {
                      type: 'text',
                      content: '如有現有訂單、發票或應收應付資料，也可一併準備作討論。',
                      actions: ['請給我與外匯專家溝通的重點', '我想了解需要準備哪些交易資料']
                    }
                  ],
                  clearFlow: true
                },
                {
                  action: '確認並安排回電諮詢',
                  keywords: ['回電', '電話諮詢'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白。我已先整理出回電前的需求摘要。若要安排回電，建議先確認您最關心的貨幣、期限、金額及希望達到的保障程度。'
                    },
                    {
                      type: 'text',
                      content: '這樣在電話溝通時通常更容易聚焦在適合的對沖方向。',
                      actions: ['我想先整理外匯風險重點', '我想了解回電前需準備甚麼資料']
                    }
                  ],
                  clearFlow: true
                },
                {
                  action: '我想修改前面資料',
                  keywords: ['修改', '重整', '返回'],
                  responses: [
                    {
                      type: 'text',
                      content: '可以，我們重新整理您的外匯對沖需求。'
                    }
                  ],
                  nextStepId: 'fx-currency'
                }
              ]
            }
          ]
        }
      },
      {
        trigger: '拓展內地分店',
        keywords: ['拓展內地分店', '內地分店', '國內開分店', '開分店', '內地擴張'],
        topicId: 'mainland-branch-flow',
        flow: {
          id: 'mainland-branch-flow',
          introResponses: [
            {
              type: 'text',
              content: '明白，我可以為您提供內地開設餐廳的一般性準備建議；另外，在您同意下，我亦可參考您在本行的歷史收支與交易行為特徵，例如收款渠道分佈、付款週期、幣種使用及現金流穩定性等，為您模擬最可能適合您的幾個方案選項，並列出每個選項的注意事項與文件準備方向。'
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
                      content: '我已附上三個方案供您逐一查看，您可按以下按鈕打開方案詳情。',
                      actions: ['查看方案 1：大灣區試點店（Top Choice）', '查看方案 2：合資經營分店', '查看方案 3：加盟／品牌授權模式']
                    }
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
        keywords: ['查看方案 1', '方案 1', '大灣區試點店', 'top choice'],
        topicId: 'mainland-branch-flow',
        responses: [
          {
            type: 'text',
            content: '方案 1｜大灣區試點店（Top Choice）：較適合已有穩定香港餐飲營運、希望先以一間內地試點店測試客流與供應鏈安排的企業。'
          },
          {
            type: 'text',
            content: '注意事項：先確認落戶城市、租約期、食品經營相關牌照、收款工具、員工招聘與薪酬支付安排，並預留首 6 至 12 個月的營運資金緩衝。'
          },
          {
            type: 'text',
            content: '文件準備方向：香港公司註冊及商業登記文件、董事及實益擁有人身份證明、最近營運流水或管理帳、開店商業計劃、門店預算、意向租約或選址資料、主要供應商名單。',
            actions: ['查看方案 2：合資經營分店', '查看方案 3：加盟／品牌授權模式', '返回三個方案總覽']
          }
        ]
      },
      {
        trigger: '查看方案 2：合資經營分店',
        keywords: ['查看方案 2', '方案 2', '合資經營分店', '合資經營'],
        topicId: 'mainland-branch-flow',
        responses: [
          {
            type: 'text',
            content: '方案 2｜合資經營分店：較適合已找到內地合作方、希望借助本地團隊加快選址、招募與營運落地的企業。'
          },
          {
            type: 'text',
            content: '注意事項：應先釐清股權與分工、品牌使用權、資金調撥、董事會或授權機制，以及退出安排，避免日後營運與現金管理出現分歧。'
          },
          {
            type: 'text',
            content: '文件準備方向：合作方背景資料與 KYC 文件、合作框架或 term sheet、預計股權架構、投資金額與注資時間表、收益分配模型、品牌授權與內控安排。',
            actions: ['查看方案 1：大灣區試點店（Top Choice）', '查看方案 3：加盟／品牌授權模式', '返回三個方案總覽']
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
            content: '方案 3｜加盟／品牌授權模式：較適合希望以較輕資產方式拓展，並把部分門店投資與日常營運交由合作方承擔的企業。'
          },
          {
            type: 'text',
            content: '注意事項：需要特別留意品牌一致性、加盟商篩選、品質控制、費用結算、知識產權保護，以及培訓與審核制度。'
          },
          {
            type: 'text',
            content: '文件準備方向：商標或品牌權屬證明、加盟或授權合約草案、營運手冊、培訓安排、加盟費與持續服務費結算方式、門店審核與稽核框架。',
            actions: ['查看方案 1：大灣區試點店（Top Choice）', '查看方案 2：合資經營分店', '返回三個方案總覽']
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
            actions: ['查看方案 1：大灣區試點店（Top Choice）', '查看方案 2：合資經營分店', '查看方案 3：加盟／品牌授權模式']
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
    ],
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
      content: '您好！我是匯豐中小企 AI 助手。請問今日有什麼可以幫到您的企業？',
      actions: ['我想查詢中小企貸款的最新方案。', '我想了解如何開立匯豐商業戶口。', '我想了解外匯對沖方案。', '我想了解拓展內地分店。']
    },
    initialMessagesByEntry: {
      'locked-screen': {
        sender: 'ai',
        type: 'text',
        content: '🔔近期日圓（JPY）波動加劇。根據過往交易記錄，您可能面臨匯率波動導致成本上升的風險。如您希穩定未來採購成本，可考慮使用外匯對沖方案（例如：遠期外匯合約等）。是否需要我為您進行快速評估並提供可行選項？',
        actions: ['我想了解外匯對沖建議。', '我想了解跨境付款安排。', '我想查看近期匯率風險摘要。']
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