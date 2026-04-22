Object.assign(window, {
  HSBCKnowledgeBase: {
    knowledgeBase: [
      {
        trigger: '貸款 / SME Loan',
        keywords: ['貸款', 'loan', '借錢', '週轉'],
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
                  nextStepId: 'loan-next-step'
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
                  nextStepId: 'loan-next-step'
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
                  nextStepId: 'loan-next-step'
                }
              ]
            },
            {
              id: 'loan-next-step',
              prompt: {
                type: 'text',
                content: '第十步，我已為您整理貸款需求摘要：用途為「{{loan-purpose}}」，金額為「{{loan-amount}}」，營運階段為「{{loan-business-stage}}」，營業額區間為「{{loan-turnover}}」，融資偏好為「{{loan-collateral}}」，期望時程為「{{loan-urgency}}」，往來狀況為「{{loan-banking}}」，文件狀態為「{{loan-documents}}」。如以上正確，請確認下一步。'
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
              content: '了解。我可以協助您由公司設立到開立匯豐商業戶口的整個流程。'
            },
            {
              type: 'text',
              content: '我會用 10 個步驟了解您的公司狀況、開戶方式與文件準備情況，再給您下一步建議。'
            }
          ],
          startStepId: 'account-company-status',
          steps: [
            {
              id: 'account-company-status',
              prompt: {
                type: 'text',
                content: '第一步，您目前屬於哪一個階段？'
              },
              choices: [
                {
                  action: '尚未成立公司',
                  exactKeywords: ['未'],
                  keywords: ['未成立', '未成立公司', '還未成立', '公司未成立', '未有公司'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，您現階段可先整理日後開戶所需的基本資料。'
                    }
                  ],
                  nextStepId: 'account-location'
                },
                {
                  action: '剛成立未營運',
                  keywords: ['剛成立', '新成立', '未營運'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，您可按新成立公司的文件要求準備開戶資料。'
                    }
                  ],
                  nextStepId: 'account-location'
                },
                {
                  action: '已營運一段時間',
                  keywords: ['已經營運', '營運一段時間', '已成立', '公司已成立', '已經成立', '已'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，您可直接按現有業務資料和公司文件規劃開戶。'
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
                content: '第二步，公司將會或已經在哪裏成立？'
              },
              choices: [
                {
                  action: '香港',
                  exactKeywords: ['香港'],
                  keywords: ['香港公司', 'hk'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，香港公司一般會用到公司註冊證明、商業登記證 (BR) 及董事身份證明文件。'
                    }
                  ],
                  nextStepId: 'account-structure'
                },
                {
                  action: '內地',
                  exactKeywords: ['內地'],
                  keywords: ['中國內地', '內地公司', '大陸'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，如屬內地公司，通常要按公司架構提供當地註冊文件及實益擁有人資料。'
                    }
                  ],
                  nextStepId: 'account-structure'
                },
                {
                  action: '其他地區',
                  exactKeywords: ['其他地區'],
                  keywords: ['海外', '其他', '境外'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，境外公司通常需要更完整的註冊文件、股權架構及實益擁有人資料。'
                    }
                  ],
                  nextStepId: 'account-structure'
                }
              ]
            },
            {
              id: 'account-structure',
              prompt: {
                type: 'text',
                content: '第三步，公司的架構較接近以下哪一類？'
              },
              choices: [
                {
                  action: '獨資或合夥',
                  keywords: ['獨資', '合夥'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，架構相對簡單時，文件清單通常較直接。'
                    }
                  ],
                  nextStepId: 'account-directors'
                },
                {
                  action: '有限公司',
                  keywords: ['有限公司', 'limited'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，有限公司一般需提供公司註冊文件及董事資料。'
                    }
                  ],
                  nextStepId: 'account-directors'
                },
                {
                  action: '多層股權或海外架構',
                  keywords: ['多層股權', '海外架構', '複雜架構'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，較複雜的股權架構通常需要額外的實益擁有人及架構證明。'
                    }
                  ],
                  nextStepId: 'account-directors'
                }
              ]
            },
            {
              id: 'account-directors',
              prompt: {
                type: 'text',
                content: '第四步，公司大概有多少位董事或授權簽署人需要參與開戶？'
              },
              choices: [
                {
                  action: '1位',
                  exactKeywords: ['1位'],
                  keywords: ['一位', '1個'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，單一簽署安排一般較容易整理文件與預約。'
                    }
                  ],
                  nextStepId: 'account-channel'
                },
                {
                  action: '2至4位',
                  keywords: ['2至4位', '二至四位'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，如有多位董事，建議及早確認每位需提交的身份文件。'
                    }
                  ],
                  nextStepId: 'account-channel'
                },
                {
                  action: '5位或以上',
                  keywords: ['5位或以上', '五位或以上'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，人數較多時最好先整理完整簽署及實益擁有人名單。'
                    }
                  ],
                  nextStepId: 'account-channel'
                }
              ]
            },
            {
              id: 'account-channel',
              prompt: {
                type: 'text',
                content: '第五步，您較傾向用哪種方式辦理開戶？'
              },
              choices: [
                {
                  action: '透過 HSBC Sprint App',
                  keywords: ['sprint app', 'app開戶'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，如情況合適，Sprint App 可作為較方便的申請渠道。'
                    }
                  ],
                  nextStepId: 'account-business-type'
                },
                {
                  action: '親身到商業客戶服務中心',
                  keywords: ['親身', '服務中心', '分行'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，如需面談或文件較複雜，親身辦理會較清晰。'
                    }
                  ],
                  nextStepId: 'account-business-type'
                },
                {
                  action: '先比較兩種方式',
                  keywords: ['比較', '先看看'],
                  responses: [
                    {
                      type: 'text',
                      content: '可以，我會先以流程與文件準備角度幫您整理。'
                    }
                  ],
                  nextStepId: 'account-business-type'
                }
              ]
            },
            {
              id: 'account-business-type',
              prompt: {
                type: 'text',
                content: '第六步，您的主要業務類型較接近哪一類？'
              },
              choices: [
                {
                  action: '貿易',
                  keywords: ['貿易', '進出口'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，貿易業務開戶時通常需要較多業務往來資料作支持。'
                    }
                  ],
                  nextStepId: 'account-needs'
                },
                {
                  action: '服務業',
                  keywords: ['服務業', '顧問', '專業服務'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，服務業一般會集中展示業務模式、合約或收款安排。'
                    }
                  ],
                  nextStepId: 'account-needs'
                },
                {
                  action: '電商或科技',
                  keywords: ['電商', '科技', '平台'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，電商或科技公司通常需要說明平台模式及資金流向。'
                    }
                  ],
                  nextStepId: 'account-needs'
                }
              ]
            },
            {
              id: 'account-needs',
              prompt: {
                type: 'text',
                content: '第七步，您開戶後最主要需要哪一類銀行服務？'
              },
              choices: [
                {
                  action: '本地日常收支',
                  keywords: ['本地', '日常收支'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，這類需求通常以基本戶口功能和網上理財為主。'
                    }
                  ],
                  nextStepId: 'account-documents'
                },
                {
                  action: '跨境收款付款',
                  keywords: ['跨境', '收款付款', '海外收款'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，如涉及跨境交易，之後可一併留意多幣種及匯款安排。'
                    }
                  ],
                  nextStepId: 'account-documents'
                },
                {
                  action: '多幣種及網上銀行',
                  keywords: ['多幣種', '網上銀行', '數碼理財'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，這類需求通常會更重視數碼渠道及跨幣種管理功能。'
                    }
                  ],
                  nextStepId: 'account-documents'
                }
              ]
            },
            {
              id: 'account-documents',
              prompt: {
                type: 'text',
                content: '第八步，您目前的開戶文件準備情況如何？'
              },
              choices: [
                {
                  action: '已備齊主要文件',
                  keywords: ['已備齊', '文件齊'],
                  responses: [
                    {
                      type: 'text',
                      content: '很好，這樣通常較容易進入下一步申請或預約。'
                    }
                  ],
                  nextStepId: 'account-timeline'
                },
                {
                  action: '已準備部分文件',
                  keywords: ['部分文件', '準備了一部分'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，之後可優先補齊公司註冊及身份證明文件。'
                    }
                  ],
                  nextStepId: 'account-timeline'
                },
                {
                  action: '未開始準備',
                  keywords: ['未開始', '未準備'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，稍後我可以先給您一份較實用的基本文件清單。'
                    }
                  ],
                  nextStepId: 'account-timeline'
                }
              ]
            },
            {
              id: 'account-timeline',
              prompt: {
                type: 'text',
                content: '第九步，您希望大概何時完成開戶？'
              },
              choices: [
                {
                  action: '一星期內',
                  keywords: ['一星期內', '盡快'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，若時間較緊，文件完整度會特別重要。'
                    }
                  ],
                  nextStepId: 'account-next-step'
                },
                {
                  action: '本月內',
                  keywords: ['本月內', '一個月內'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，這個時間表通常足夠安排文件整理與申請。'
                    }
                  ],
                  nextStepId: 'account-next-step'
                },
                {
                  action: '先了解流程',
                  keywords: ['先了解', '之後再決定'],
                  responses: [
                    {
                      type: 'text',
                      content: '可以，先把流程與文件要求釐清會更穩妥。'
                    }
                  ],
                  nextStepId: 'account-next-step'
                }
              ]
            },
            {
              id: 'account-next-step',
              prompt: {
                type: 'text',
                content: '第十步，我已為您整理開戶摘要：目前階段為「{{account-company-status}}」，成立地為「{{account-location}}」，公司架構為「{{account-structure}}」，參與開戶人數為「{{account-directors}}」，偏好渠道為「{{account-channel}}」，主要業務為「{{account-business-type}}」，核心銀行需求為「{{account-needs}}」，文件狀態為「{{account-documents}}」，期望時程為「{{account-timeline}}」。如以上正確，請確認下一步。'
              },
              choices: [
                {
                  action: '確認並查看文件清單',
                  keywords: ['文件清單', '需要甚麼文件'],
                  responses: [
                    {
                      type: 'text',
                      content: '我已按您的摘要整理出基本文件方向。一般商業開戶會先準備商業登記證、公司註冊文件、董事及授權簽署人身份證明，以及視乎業務模式提供補充資料。'
                    },
                    {
                      type: 'text',
                      content: '若公司架構或業務較複雜，可能還需要補充股權架構、實益擁有人及業務證明文件。',
                      actions: ['我想了解不同公司架構的文件要求', '我想知道哪些文件最常缺漏']
                    }
                  ],
                  clearFlow: true
                },
                {
                  action: '確認並了解 HSBC Sprint App 開戶',
                  keywords: ['sprint', 'app開戶'],
                  responses: [
                    {
                      type: 'text',
                      content: '如情況合適，我已按您的摘要整理出較適合先了解的方向，您可先了解透過 HSBC Sprint App 辦理商業開戶的流程與文件要求。'
                    },
                    {
                      type: 'text',
                      content: '在正式申請前，先確認公司架構、董事資料及主要業務資料是否齊備，通常會較有效率。',
                      actions: ['我想知道 Sprint App 開戶流程', '我想了解 App 開戶需要哪些資料']
                    }
                  ],
                  clearFlow: true
                },
                {
                  action: '確認並預約商業客戶服務中心',
                  keywords: ['預約', '服務中心', '分行'],
                  responses: [
                    {
                      type: 'text',
                      content: '可以。我已根據您的摘要整理出會面前準備方向。若您想親身辦理，建議先確認方便的地區、時間，以及當日可帶備的開戶文件。'
                    },
                    {
                      type: 'text',
                      content: '如資料較複雜，預先整理公司架構與董事名單，通常能讓會面更聚焦。',
                      actions: ['我想預約商業客戶服務中心', '我想先比較 App 與親身開戶']
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
                      content: '可以，我們重新整理您的開戶需求。'
                    }
                  ],
                  nextStepId: 'account-company-status'
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
                  nextStepId: 'fx-next-step'
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
                  nextStepId: 'fx-next-step'
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
                  nextStepId: 'fx-next-step'
                }
              ]
            },
            {
              id: 'fx-next-step',
              prompt: {
                type: 'text',
                content: '第十步，我已為您整理外匯對沖摘要：主要貨幣為「{{fx-currency}}」，風險方向為「{{fx-direction}}」，交易頻率為「{{fx-frequency}}」，金額區間為「{{fx-amount}}」，偏好工具為「{{fx-solution}}」，關注期限為「{{fx-timing}}」，風險偏好為「{{fx-risk-preference}}」，銀行關係為「{{fx-banking}}」，文件準備為「{{fx-documents}}」。如以上正確，請確認下一步。'
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
        trigger: '內地擴張',
        keywords: ['內地擴張', '擴張', '內地市場', '中國市場'],
        flow: {
          id: 'mainland-expansion-flow',
          introResponses: [
            {
              type: 'text',
              content: '了解。我可以協助您逐步整理進入內地市場或擴張內地業務的方向。'
            },
            {
              type: 'text',
              content: '我會用 10 個步驟了解您的擴張階段、地區、行業和配套需要，再給您下一步建議。'
            }
          ],
          startStepId: 'mainland-stage',
          steps: [
            {
              id: 'mainland-stage',
              prompt: {
                type: 'text',
                content: '第一步，您目前的內地擴張進度屬於哪一個階段？'
              },
              choices: [
                {
                  action: '剛開始規劃',
                  keywords: ['規劃', '初步'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，現階段適合先梳理進入模式、時間表及所需支援。'
                    }
                  ],
                  nextStepId: 'mainland-model'
                },
                {
                  action: '已接觸客戶或供應商',
                  keywords: ['接觸客戶', '接觸供應商'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，您已進入較具體的市場接觸階段。'
                    }
                  ],
                  nextStepId: 'mainland-model'
                },
                {
                  action: '準備正式落地',
                  keywords: ['正式落地', '準備成立'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，這通常需要同時考慮公司設立、銀行服務及風險管理安排。'
                    }
                  ],
                  nextStepId: 'mainland-model'
                }
              ]
            },
            {
              id: 'mainland-model',
              prompt: {
                type: 'text',
                content: '第二步，您較傾向以下哪一種進入模式？'
              },
              choices: [
                {
                  action: '設立內地公司',
                  keywords: ['設立公司', '內地公司'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，設立實體通常需要較完整地規劃公司架構與銀行配套。'
                    }
                  ],
                  nextStepId: 'mainland-region'
                },
                {
                  action: '跨境銷售到內地',
                  keywords: ['跨境銷售', '出口內地'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，跨境模式通常會較關注收付款、物流及匯率安排。'
                    }
                  ],
                  nextStepId: 'mainland-region'
                },
                {
                  action: '尋找供應鏈或合作夥伴',
                  keywords: ['供應鏈', '合作夥伴'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，這類模式一般需要更早確認合作結構與交易安排。'
                    }
                  ],
                  nextStepId: 'mainland-region'
                }
              ]
            },
            {
              id: 'mainland-region',
              prompt: {
                type: 'text',
                content: '第三步，您較聚焦哪一個內地地區？'
              },
              choices: [
                {
                  action: '大灣區',
                  keywords: ['大灣區', 'gba'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，大灣區通常是港商較常見的擴張起點。'
                    }
                  ],
                  nextStepId: 'mainland-industry'
                },
                {
                  action: '華東地區',
                  keywords: ['華東', '上海', '江浙'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，華東地區常見於製造、貿易及高增值服務業務布局。'
                    }
                  ],
                  nextStepId: 'mainland-industry'
                },
                {
                  action: '其他地區',
                  keywords: ['其他地區', '其他城市'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，不同地區在行政安排與合作資源上可能有不同重點。'
                    }
                  ],
                  nextStepId: 'mainland-industry'
                }
              ]
            },
            {
              id: 'mainland-industry',
              prompt: {
                type: 'text',
                content: '第四步，您的主要行業較接近哪一類？'
              },
              choices: [
                {
                  action: '製造業',
                  keywords: ['製造', '工廠'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，製造業通常會較關注供應鏈、設備與跨境資金流安排。'
                    }
                  ],
                  nextStepId: 'mainland-scale'
                },
                {
                  action: '貿易批發',
                  keywords: ['貿易', '批發'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，貿易批發業務通常較重視跨境收付款與匯率管理。'
                    }
                  ],
                  nextStepId: 'mainland-scale'
                },
                {
                  action: '服務或科技',
                  keywords: ['服務', '科技', 'tech'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，服務或科技業務一般更著重業務模式、客戶來源與收款安排。'
                    }
                  ],
                  nextStepId: 'mainland-scale'
                }
              ]
            },
            {
              id: 'mainland-scale',
              prompt: {
                type: 'text',
                content: '第五步，您預計的擴張規模較接近哪一類？'
              },
              choices: [
                {
                  action: '試點項目',
                  keywords: ['試點', '先試'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，試點模式通常適合先驗證市場與資金安排。'
                    }
                  ],
                  nextStepId: 'mainland-banking-needs'
                },
                {
                  action: '中型擴張',
                  keywords: ['中型', '逐步擴張'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，這通常需要同時規劃銀行服務與日後擴張節奏。'
                    }
                  ],
                  nextStepId: 'mainland-banking-needs'
                },
                {
                  action: '大規模投資',
                  keywords: ['大規模', '大額投資'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，較大規模項目通常需要更完整的融資及風險管理安排。'
                    }
                  ],
                  nextStepId: 'mainland-banking-needs'
                }
              ]
            },
            {
              id: 'mainland-banking-needs',
              prompt: {
                type: 'text',
                content: '第六步，您目前最需要哪一類銀行支援？'
              },
              choices: [
                {
                  action: '收付款與賬戶安排',
                  keywords: ['收付款', '賬戶'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，這通常會先聚焦開戶、多幣種與跨境收付款配套。'
                    }
                  ],
                  nextStepId: 'mainland-compliance'
                },
                {
                  action: '融資支援',
                  keywords: ['融資', '貸款'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，如涉及擴張融資，通常需要更早準備用途與業務預測資料。'
                    }
                  ],
                  nextStepId: 'mainland-compliance'
                },
                {
                  action: '外匯與風險管理',
                  keywords: ['外匯', '風險管理'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，如涉及跨境資金流，外匯與風險管理通常需要一併規劃。'
                    }
                  ],
                  nextStepId: 'mainland-compliance'
                }
              ]
            },
            {
              id: 'mainland-compliance',
              prompt: {
                type: 'text',
                content: '第七步，您目前對內地合規或行政安排的準備情況如何？'
              },
              choices: [
                {
                  action: '已有專業顧問協助',
                  keywords: ['顧問', '專業顧問'],
                  responses: [
                    {
                      type: 'text',
                      content: '很好，如已有顧問，通常較容易同步規劃公司設立與銀行安排。'
                    }
                  ],
                  nextStepId: 'mainland-timeline'
                },
                {
                  action: '由內部團隊處理',
                  keywords: ['內部團隊'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，內部處理時建議及早整理時間表與責任分工。'
                    }
                  ],
                  nextStepId: 'mainland-timeline'
                },
                {
                  action: '想先了解要求',
                  keywords: ['先了解', '未開始'],
                  responses: [
                    {
                      type: 'text',
                      content: '可以，先釐清基本要求通常有助減少後續來回確認。'
                    }
                  ],
                  nextStepId: 'mainland-timeline'
                }
              ]
            },
            {
              id: 'mainland-timeline',
              prompt: {
                type: 'text',
                content: '第八步，您預計何時推進內地擴張計劃？'
              },
              choices: [
                {
                  action: '3個月內',
                  keywords: ['3個月內', '三個月內'],
                  responses: [
                    {
                      type: 'text',
                      content: '了解，若時間較緊，建議同步規劃公司設立、賬戶與資金安排。'
                    }
                  ],
                  nextStepId: 'mainland-partners'
                },
                {
                  action: '6至12個月',
                  keywords: ['6至12個月', '半年至一年'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，這個時間表較適合逐步驗證地區與合作模式。'
                    }
                  ],
                  nextStepId: 'mainland-partners'
                },
                {
                  action: '長期規劃中',
                  keywords: ['長期', '規劃中'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，先建立整體路線圖會較適合您目前的階段。'
                    }
                  ],
                  nextStepId: 'mainland-partners'
                }
              ]
            },
            {
              id: 'mainland-partners',
              prompt: {
                type: 'text',
                content: '第九步，您目前在內地的合作資源情況如何？'
              },
              choices: [
                {
                  action: '已有合作夥伴',
                  keywords: ['已有合作夥伴', '已有夥伴'],
                  responses: [
                    {
                      type: 'text',
                      content: '很好，已有合作資源通常可讓市場切入和資金安排更明確。'
                    }
                  ],
                  nextStepId: 'mainland-next-step'
                },
                {
                  action: '正在尋找合作夥伴',
                  keywords: ['正在尋找', '物色夥伴'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白，在合作模式未定前，先保留彈性的銀行與資金安排會較穩妥。'
                    }
                  ],
                  nextStepId: 'mainland-next-step'
                },
                {
                  action: '尚未確定',
                  keywords: ['未確定', '尚未確定'],
                  responses: [
                    {
                      type: 'text',
                      content: '收到，先聚焦市場策略與進入模式會較適合目前階段。'
                    }
                  ],
                  nextStepId: 'mainland-next-step'
                }
              ]
            },
            {
              id: 'mainland-next-step',
              prompt: {
                type: 'text',
                content: '第十步，我已為您整理內地擴張摘要：目前階段為「{{mainland-stage}}」，進入模式為「{{mainland-model}}」，重點地區為「{{mainland-region}}」，行業類型為「{{mainland-industry}}」，擴張規模為「{{mainland-scale}}」，所需銀行支援為「{{mainland-banking-needs}}」，合規準備為「{{mainland-compliance}}」，推進時程為「{{mainland-timeline}}」，合作資源為「{{mainland-partners}}」。如以上正確，請確認下一步。'
              },
              choices: [
                {
                  action: '確認並了解跨境金融方案',
                  keywords: ['跨境金融', '方案'],
                  responses: [
                    {
                      type: 'text',
                      content: '我已按您的摘要整理出跨境金融重點。若您想先了解跨境金融方案，可先聚焦收付款安排、賬戶架構、多幣種需求及是否涉及融資或外匯管理。'
                    },
                    {
                      type: 'text',
                      content: '之後再按實際進入模式和地區，進一步收窄較適合的配套。',
                      actions: ['我想了解跨境收付款安排', '我想知道內地擴張常見的銀行支援']
                    }
                  ],
                  clearFlow: true
                },
                {
                  action: '確認並聯絡跨境業務團隊',
                  keywords: ['跨境團隊', '聯絡團隊'],
                  responses: [
                    {
                      type: 'text',
                      content: '可以。我已依照您的摘要整理出溝通重點，建議您先整理目標地區、進入模式、時間表、預算規模及目前最需要的銀行支援。'
                    },
                    {
                      type: 'text',
                      content: '如已有合作夥伴或初步商業計劃，也可一併準備以便更聚焦討論。',
                      actions: ['請給我與跨境團隊溝通的重點', '我想整理內地擴張的準備清單']
                    }
                  ],
                  clearFlow: true
                },
                {
                  action: '確認並預約諮詢',
                  keywords: ['預約', '諮詢'],
                  responses: [
                    {
                      type: 'text',
                      content: '明白。我已先整理好跨境擴張摘要。若要預約諮詢，建議先確認方便的日期、地區，以及您最想優先處理的跨境議題。'
                    },
                    {
                      type: 'text',
                      content: '如可預先整理公司背景、擴張目標及預計時間表，會更有助會面聚焦。',
                      actions: ['我想預約商業諮詢', '我想先看看內地擴張準備重點']
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
                      content: '可以，我們重新整理您的內地擴張需求。'
                    }
                  ],
                  nextStepId: 'mainland-stage'
                }
              ]
            }
          ]
        }
      }
    ],
    defaultResponses: [
      {
        type: 'text',
        content: '抱歉，我不太明白您的問題。您可以輸入「貸款」、「開戶」、「外匯對沖」或「內地擴張」等關鍵詞，或直接查詢相關服務。',
        actions: ['我想查詢中小企貸款', '我想了解如何開立匯豐商業戶口', '我想了解外匯對沖', '我想查詢內地擴張支援']
      }
    ],
    initialMessage: {
      sender: 'ai',
      type: 'text',
      content: '您好！我是匯豐中小企 AI 助手。請問今日有什麼可以幫到您的企業？',
      actions: ['我想查詢中小企貸款的最新方案。', '我想了解如何開立匯豐商業戶口。', '我想了解外匯對沖方案。', '我想查詢內地擴張支援。']
    }
  }
});