window.HSBCFlowModules = window.HSBCFlowModules || {};
window.HSBCFlowModuleConfigs = window.HSBCFlowModuleConfigs || {};

var accountOpeningCompleteEntriesEn = window.HSBCFlowModules.accountOpening = window.HSBCFlowModules.accountOpening || [];
var accountOpeningCompleteConfigEn = window.HSBCFlowModuleConfigs.accountOpening = window.HSBCFlowModuleConfigs.accountOpening || { defaultResponsesByTopic: {}, initialMessagesByTopic: {} };

accountOpeningCompleteEntriesEn.push({
  trigger: 'Account Completion',
  keywords: ['account completed', 'account completion', 'openrice'],
  topicId: 'account-opening-complete',
  flow: {
    id: 'account-opening-complete',
    startStepId: 'account-followup-openrice-offer',
    steps: [
      { id: 'account-followup-openrice-offer', prompt: { type: 'text', content: 'Analysis: your business is a restaurant. Many restaurants in Hong Kong use Instagram or OpenRice. Would you like me to help set it up?' }, routes: [{ action: 'Yes, open OpenRice', keywords: ['yes', 'openrice', 'ok', 'please open'], responses: [{ type: 'text', content: 'OpenRice registration needs your account name, store name and email. As you are signed in to HSBC NEX, I can prefill and submit these details with your authorisation.' }], nextStepId: 'account-followup-openrice-authorize' }, { action: 'Not now', keywords: ['no', 'not now'], responses: [{ type: 'text', content: 'No problem. You can return to this offer whenever you are ready.' }], clearFlow: true }] },
      { id: 'account-followup-openrice-authorize', prompt: { type: 'text', content: 'Would you like to authorise submission now?' }, routes: [{ action: 'Authorise and submit', keywords: ['authorise', 'authorize', 'submit', 'yes', 'ok'], responses: [{ type: 'text', content: 'Account: siubak\nStore: Ramen King\nEmail: alex.wong@example.com' }, { type: 'text', content: 'Submitted successfully. If approved, you will receive a confirmation email within 30 minutes and can access OpenRice from HSBC NEX.' }], clearFlow: true }] }
    ]
  }
});

accountOpeningCompleteConfigEn.initialMessagesByTopic['account-opening-complete'] = { sender: 'ai', type: 'text', content: 'Your company registration and account opening are complete. This device is authorised, and you are already signed in.', actions: ['View your account.'] };
