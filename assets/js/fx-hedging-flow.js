window.HSBCFlowModules = window.HSBCFlowModules || {};

window.HSBCFlowModules.fxHedging = [
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
  }
];