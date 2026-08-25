window.HSBCFlowModules = window.HSBCFlowModules || {};
window.HSBCFlowModuleConfigs = window.HSBCFlowModuleConfigs || {};

var accountOpeningEntriesEn = window.HSBCFlowModules.accountOpening = window.HSBCFlowModules.accountOpening || [];
var accountOpeningConfigEn = window.HSBCFlowModuleConfigs.accountOpening = window.HSBCFlowModuleConfigs.accountOpening || {
  defaultResponsesByTopic: {},
  initialMessagesByTopic: {}
};

accountOpeningEntriesEn.push({
  trigger: 'Account Opening',
  keywords: ['i want to open', 'open account', 'account opening', 'business account', 'company account', 'account'],
  topicId: 'account-opening-start',
  flow: {
    id: 'account-opening-start',
    introResponses: [],
    startStepId: 'account-identity-upload',
    steps: [
      { id: 'account-identity-upload', inputMode: 'file', uploadPlaceholder: 'Upload a photo of yourself holding your ID', fileAccept: '.png,.jpg,.jpeg,.pdf', responseDelayMs: 1800, prompt: { type: 'text', content: 'Please upload a photo of yourself holding your ID.' }, captureResponses: [{ type: 'text', content: 'Thank you. Your identity has been verified.' }], nextStepId: 'account-identity-verified' },
      { id: 'account-identity-verified', prompt: { type: 'text', actionPresentation: 'direct-reply', content: '- ID Type: China Resident Identity Card\n- ID No.: 110102200001018882\n- Name: 王小白\n\nPlease choose an option to continue.', actions: ['Verify','Enter Manually'] }, routes: [
        { action: 'Verify', exactKeywords: ['verify', 'verified'], keywords: ['verify', 'verified', 'confirm', 'yes'], responses: [
          { type: 'thinking', content: 'Verifying your data with trusted sources and government data repositories', delayMs: 2000 },
          { type: 'text', content: 'We identified the following Business Registrations (BR) under your name. Which one would you like to open?', actions: ['Harbour Peak Limited', 'Northstar Trading Limited', 'Southstar Trading Limited'], delayMs: 0 }
        ], nextStepId: 'account-br-selection', skipNextPromptResponses: true },
        { action: 'Cancel', exactKeywords: ['cancel'], keywords: ['cancel', 'no'], responses: [{ type: 'text', content: 'Understood. I will stop the account-opening journey here.' }], clearFlow: true }
      ] },
      { id: 'account-br-selection', responseDelayMs: 0, prompt: { type: 'text', content: 'We identified the following Business Registrations (BR) under your name. Which one would you like to open?', actions: ['Harbour Peak Limited', 'Northstar Trading Limited', 'Southstar Trading Limited'] }, routes: [
        { action: 'Harbour Peak Limited', keywords: ['harbour peak limited', 'harbour peak'], responses: [], nextStepId: 'account-br-selection' },
        { action: 'Northstar Trading Limited', keywords: ['northstar trading limited', 'northstar trading'], responses: [], nextStepId: 'account-br-selection' },
        { action: 'Southstar Trading Limited', keywords: ['southstar trading limited', 'southstar trading'], responses: [], nextStepId: 'account-br-selection' },
        { action: 'All', exactKeywords: ['all'], keywords: ['all'], responses: [
          { type: 'thinking', content: 'Verifying your data', delayMs: 1000 },
          { type: 'thinking', content: 'Opening Your Accounts', delayMs: 3000 },
          { type: 'text', content: 'Congratulations, your HK account is opened. Customer ID 1XXXXXXX', delayMs: 0 },
          { type: 'text', content: 'Would you like to sign in now to manage your account or continue later?', actions: ['Sign In', 'Maybe Later'], delayMs: 0 },
 { type: 'thinking', content: 'Signing into HSBC', delayMs: 3000 },
{ type: 'text', content: 'We see you have active trading with foreign countries, would you like me to open accounts in other countries for you?', delayMs: 0 }
        
        ], clearFlow: true }
      ] }
    ]
  }
});

accountOpeningConfigEn.defaultResponsesByTopic['account-opening-start'] = [{ type: 'text', content: 'Hello. I am Nex Passport By HSBC. How can I help your business today?', actions: ['I want to open an HSBC business account.', 'I am an existing customer and want to make a transaction.'] }];
accountOpeningConfigEn.initialMessagesByTopic['account-opening-start'] = { sender: 'ai', type: 'text', content: 'Hello. I am Nex Passport By HSBC. How can I help your business today?', actions: ['I want to open an HSBC business account.', 'I am an existing customer and want to make a transaction.'] };