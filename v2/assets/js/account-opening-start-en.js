window.HSBCFlowModules = window.HSBCFlowModules || {};
window.HSBCFlowModuleConfigs = window.HSBCFlowModuleConfigs || {};

var accountOpeningEntriesEn = window.HSBCFlowModules.accountOpening = window.HSBCFlowModules.accountOpening || [];
var accountOpeningConfigEn = window.HSBCFlowModuleConfigs.accountOpening = window.HSBCFlowModuleConfigs.accountOpening || {
  defaultResponsesByTopic: {},
  initialMessagesByTopic: {}
};

var accountRegistrationServiceFeeCopy = 'A company registry service fee applies. Once you provide sufficient documents and your account is approved, the fee will be credited directly to your account.';

accountOpeningEntriesEn.push({
  trigger: 'Account Opening',
  keywords: ['open account', 'account opening', 'business account', 'company account', 'account'],
  topicId: 'account-opening-start',
  flow: {
    id: 'account-opening-start',
    introResponses: [{ type: 'text', content: 'Understood. I can guide you through setting up your company and opening an HSBC business account in one streamlined journey.' }],
    startStepId: 'account-company-status',
    steps: [
      { id: 'account-company-status', prompt: { type: 'text', content: 'To find the right account-opening journey, has your company already been incorporated?' }, routes: [
        { action: 'Not yet', exactKeywords: ['not yet'], keywords: ['not yet', 'no', 'not incorporated'], responses: [{ type: 'text', content: 'I can help you register your company with the company registry before continuing with the business-account application.' }], nextStepId: 'account-registry-fee-confirm' },
        { action: 'Yes', exactKeywords: ['yes'], keywords: ['yes', 'already incorporated', 'incorporated'], responses: [{ type: 'text', content: 'Great. I can continue with the HSBC business account-opening journey for your existing company.' }], nextStepId: 'account-location' }
      ] },
      { id: 'account-registry-fee-confirm', prompt: { type: 'text', content: accountRegistrationServiceFeeCopy + '\n\nWould you like to confirm this service and continue?' }, routes: [
        { action: 'Confirm service', keywords: ['confirm service', 'confirm', 'yes', 'agree', 'continue'], responses: [{ type: 'text', content: 'Thank you. Please upload several company-registration documents together.' }], nextStepId: 'account-registry-documents' },
        { action: 'Not now', keywords: ['not now', 'no', 'cancel'], responses: [{ type: 'text', content: 'Understood. I will pause the company-registration service. You can continue when you are ready.' }], clearFlow: true }
      ] },
      { id: 'account-registry-documents', inputMode: 'file', uploadPlaceholder: 'Upload several company-registration documents', fileAccept: '.png,.jpg,.jpeg,.pdf', responseDelayMs: 1800, prompt: { type: 'text', content: 'Please upload several company-registration documents together.' }, captureResponses: [{ type: 'text', content: 'Documents uploaded. I have identified the following information:\n\n✓ Proposed company name\n✓ Hong Kong registered office address\n✓ Business nature and activity description\n✓ Directors and shareholders details\n✓ Identity documents for all directors and shareholders\n✓ Residential address proof\n✓ Corporate shareholder / ownership documents, if applicable' }], nextStepId: 'account-registry-business-info' },
      { id: 'account-registry-business-info', inputMode: 'text', inputPlaceholder: 'For example: business activity, expected turnover and operating address', prompt: { type: 'text', content: 'Please provide information about your business, including your business activity, expected turnover and operating address.' }, captureResponses: [{ type: 'text', content: 'Thank you. I have received your business information and will prepare the company registry submission.' }], nextStepId: 'account-notification-consent' },
      { id: 'account-notification-consent', prompt: { type: 'text', content: 'We will send you status updates by notification and email. Please turn on notifications so you do not miss an update.' }, routes: [
        { action: 'Turn on notifications', keywords: ['turn on notifications', 'enable notifications', 'notifications', 'yes', 'allow'], responses: [], nextStepId: 'account-ios-notification-permission' },
        { action: 'Not now', keywords: ['not now', 'no'], responses: [{ type: 'text', content: 'You can turn on notifications later, but you may miss application status updates.' }], nextStepId: 'account-ios-notification-permission' }
      ] },
      { id: 'account-ios-notification-permission', prompt: { type: 'permission', content: 'HSBC NEX Would Like to Send You Notifications', cardHeading: 'Stay up to date', cardCategory: 'Notifications', actions: ['Allow', 'Don’t Allow'] }, routes: [
        { action: 'Allow', keywords: ['allow', 'turn on notifications', 'yes'], responses: [{ type: 'text', content: 'Notifications are now on. We will send status updates by notification and email.' }], nextStepId: 'account-authorization' },
        { action: 'Don’t Allow', keywords: ['don’t allow', 'dont allow', 'no'], responses: [{ type: 'text', content: 'Notifications remain off. We will still send status updates by email.' }], nextStepId: 'account-authorization' }
      ] },
      { id: 'account-location', prompt: { type: 'text', content: 'Where do you plan to incorporate your company?' }, routes: [
        { action: 'Hong Kong', keywords: ['hong kong', 'hk', 'hongkong'], responses: [{ type: 'text', content: 'I will start the Hong Kong company-formation and business-account journey. With your authorisation, I can organise the information, prepare documents for signature and submit the relevant applications.' }], nextStepId: 'account-authorization' },
        { action: 'Other location', keywords: ['other', 'overseas', 'china', 'mainland'], responses: [{ type: 'text', content: 'For this demonstration, I will show the Hong Kong company-formation and business-account journey.' }], nextStepId: 'account-authorization' }
      ] },
      { id: 'account-authorization', prompt: { type: 'text', content: 'Would you like to authorise me to help complete this journey?' }, routes: [
        { action: 'Yes, authorise', keywords: ['authorise', 'authorize', 'agree', 'yes', 'ok'], responses: [{ type: 'text', content: 'Thank you. To protect your information and meet the application requirements, I need to verify your identity first.' }, { type: 'text', content: 'Please prepare your HKID or passport, together with a clear selfie of yourself.' }], nextStepId: 'account-supporting-upload' },
        { action: 'Not now', keywords: ['no', 'not now', 'do not authorise', 'do not authorize'], responses: [{ type: 'text', content: 'Understood. When you are ready to authorise the journey, I can start with identity verification.' }], clearFlow: true }
      ] },
      { id: 'account-supporting-upload', inputMode: 'file', uploadPlaceholder: 'Use the upload button to add your selfie and identity document', fileAccept: '.png,.jpg,.jpeg,.pdf', responseDelayMs: 3000, prompt: { type: 'text', content: 'Upload a clear selfie showing your face and identity document. I will check them now.' }, captureResponses: [{ type: 'text', content: 'Face verification completed.' }, { type: 'text', content: 'Document verification completed:\n\nDocument type: Hong Kong passport\nDocument number: P1234567\nName: Alex Wong' }], nextStepId: 'account-verification-confirm' },
      { id: 'account-verification-confirm', prompt: { type: 'text', content: 'If these details are correct, enter “Confirm”.' }, routes: [{ action: 'Confirm', keywords: ['confirm', 'correct', 'ok', 'yes'], responses: [], nextStepId: 'account-company-registration-info' }] },
      { id: 'account-company-registration-info', inputMode: 'text', inputPlaceholder: 'For example: company name, director/shareholder structure and main business activity', prompt: { type: 'text', content: 'I will collect the required company information and show a summary at each stage. Please provide the company name, director/shareholder structure and main business activity.' }, captureResponses: [{ type: 'text', content: 'I have received the company information. After the BR and CR registration, we will proceed with the HSBC business-account application.' }], nextStepId: 'account-esign' },
        { id: 'account-esign', responseDelayMs: 0, prompt: { type: 'text', content: 'Please complete the electronic signature (e-sign).' }, routes: [{ action: 'e-sign', keywords: ['e-sign', 'esign', 'electronic signature'], responses: [{ type: 'thinking', content: 'Connecting to the external API' }, { type: 'text', content: 'Application submitted successfully. If approved, you will receive a confirmation within two to three business days and can sign in to your business account from HSBC NEX.', delayMs: 2000 }], clearFlow: true }] }
    ]
  }
});

accountOpeningConfigEn.defaultResponsesByTopic['account-opening-start'] = [{ type: 'text', content: 'Hello. I am HSBC NEX. How can I help your business today?', actions: ['I want to open an HSBC business account.', 'I am an existing customer and want to make a transaction.'] }];
accountOpeningConfigEn.initialMessagesByTopic['account-opening-start'] = { sender: 'ai', type: 'text', content: 'Hello. I am HSBC NEX. How can I help your business today?', actions: ['I want to open an HSBC business account.', 'I am an existing customer and want to make a transaction.'] };
