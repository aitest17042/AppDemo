(function () {
  var setup = {
    brandName: 'HSBC NEX',
    logoAlt: 'HSBC NEX',
    onlineLabel: 'Online',
    signInLabel: 'Sign in',
    signInLoadingLabel: 'Signing in...',
    signOutLabel: 'Sign out',
    composerPlaceholder: 'Type your question...',
    presentationSequence: [
      {
        path: '02_account-opening-start.html',
        title: 'Start',
        summary: 'Begin the journey.',
        guide: [
          { question: 'Start the journey', column: 'common', flowId: 'account-opening-start', stepId: 'account-company-status', launchInput: 'I want to open an HSBC business account.', action: 'Press', value: 'I want to open an HSBC business account.' },
          { question: 'Company incorporated?', column: 'common', flowId: 'account-opening-start', stepId: 'account-company-status', action: 'Choose a path', values: ['Yes', 'Not yet'] },
          { question: 'Company registration service', column: 'no', branch: 'No / Company registration', flowId: 'account-opening-start', stepId: 'account-registry-fee-confirm', action: 'Press one', values: ['Confirm service', 'Not now'] },
          { question: 'Registration documents', column: 'no', branch: 'No / Company registration', flowId: 'account-opening-start', stepId: 'account-registry-documents', action: 'Use the upload button', detail: 'Upload several company-registration documents together. The app will identify the required information.' },
          { question: 'Business information', column: 'no', branch: 'No / Company registration', flowId: 'account-opening-start', stepId: 'account-registry-business-info', action: 'Type', detail: 'Enter business activity, expected turnover and operating address, then press Send.' },
          { question: 'Status updates', column: 'no', branch: 'No / Company registration', flowId: 'account-opening-start', stepId: 'account-notification-consent', action: 'Press one', values: ['Turn on notifications', 'Not now'] },
          { question: 'iOS notification access', column: 'no', branch: 'No / Company registration', flowId: 'account-opening-start', stepId: 'account-ios-notification-permission', action: 'Press one', values: ['Allow', 'Don’t Allow'] },
          { question: 'Incorporation location', column: 'yes', branch: 'Yes / Existing company', flowId: 'account-opening-start', stepId: 'account-location', action: 'Press one', values: ['Hong Kong', 'Other location'] },
          { question: 'Authorisation', column: 'yes', branch: 'Yes / Existing company', flowId: 'account-opening-start', stepId: 'account-authorization', action: 'Press one', values: ['Yes, authorise', 'Not now'] },
          { question: 'Identity verification', column: 'yes', branch: 'Yes / Existing company', flowId: 'account-opening-start', stepId: 'account-supporting-upload', action: 'Use the upload button', detail: 'Upload the selfie and identity document.' },
          { question: 'Verification confirmation', column: 'yes', branch: 'Yes / Existing company', flowId: 'account-opening-start', stepId: 'account-verification-confirm', action: 'Press', value: 'Confirm' },
          { question: 'Company information', column: 'yes', branch: 'Yes / Existing company', flowId: 'account-opening-start', stepId: 'account-company-registration-info', action: 'Type', detail: 'Enter the company name, director/shareholder structure and main business activity, then press Send.' },
          { question: 'Electronic signature', column: 'yes', branch: 'Yes / Existing company', flowId: 'account-opening-start', stepId: 'account-esign', action: 'Press', value: 'e-sign' }
        ],
        controls: [
          'Press "I want to open an HSBC business account." to start.',
          'Press "Yes" or "Not yet".',
          'Press "Hong Kong" or "Other location".',
          'Press "Yes, authorise" or "Not now".',
          'Use the upload button for the identity document step.',
          'Press "Confirm" after verification.',
          'Enter the company information, then press send.',
          'Press "e-sign" to submit the application.'
        ],
        questions: [
          { question: 'Has your company already been incorporated?', startInput: 'I want to open an HSBC business account.', answers: ['Yes', 'Not yet'] },
          { question: 'Where do you plan to incorporate your company?', answers: ['Hong Kong', 'Other location'] },
          { question: 'Would you like to authorise me to help complete this journey?', answers: ['Yes, authorise', 'Not now'] },
          { question: 'Upload a clear selfie showing your face and identity document.', answers: ['Face verification completed', 'Document verification completed'] },
          { question: 'If these details are correct, enter "Confirm".', answers: ['Confirm'] },
          { question: 'Please provide the company name, director/shareholder structure and main business activity.', answers: ['Company information received', 'An electronic signature is required next'] },
          { question: 'Please complete the electronic signature (e-sign).', answers: ['e-sign'] }
        ]
      },
      {
        path: '01_account-country-selection.html',
        title: 'Country selection',
        summary: 'Select the countries.',
        guide: [
          { question: 'Country selection', action: 'Press the switch', detail: 'Choose Singapore, United Kingdom, United Arab Emirates, India or Malaysia.' },
          { question: 'Document details', action: 'Review', detail: 'Read the submitted and additional document details in the expanded row.' }
        ],
        controls: [
          'Press the switch beside Singapore, United Kingdom, United Arab Emirates, India or Malaysia.',
          'Review the submitted and additional document details in the expanded row.'
        ],
        questions: [
          { question: 'Which countries would you like to select?', answers: ['Singapore', 'United Kingdom', 'United Arab Emirates', 'India', 'Malaysia'] },
          { question: 'What documents are required after selecting a country?', answers: ['View submitted documents', 'View additional documents'] }
        ]
      },
      {
        path: '03_account-opening-complete.html',
        title: 'Complete',
        summary: 'Review the completed journey.',
        guide: [
          { question: 'OpenRice follow-up', flowId: 'account-opening-complete', stepId: 'account-followup-openrice-offer', action: 'Press one', values: ['Yes, open OpenRice', 'Not now'] },
          { question: 'Submission authorisation', flowId: 'account-opening-complete', stepId: 'account-followup-openrice-authorize', action: 'Press', value: 'Authorise and submit' }
        ],
        controls: [
          'Press "Yes, open OpenRice" or "Not now".',
          'Press "Authorise and submit" to finish the follow-up.'
        ],
        questions: [
          { question: 'Would you like help setting up Instagram or OpenRice?', answers: ['Yes, open OpenRice', 'Not now'] },
          { question: 'Would you like to authorise submission now?', answers: ['Authorise and submit'] }
        ]
      }
    ]
  };

  window.HSBCAppSetup = setup;

  function applySharedHeader() {
    var logo = document.querySelector('.app-logo');
    var appName = document.querySelector('.app-name-with-status');
    var onlineIndicator = document.querySelector('.online-indicator');
    var messageInput = document.getElementById('messageInput');
    var signInButton = document.querySelector('[data-auth-action="login"], [data-country-auth="login"]');

    if (logo) {
      logo.alt = setup.logoAlt;
    }

    if (appName && onlineIndicator) {
      appName.firstChild.textContent = setup.brandName;
      onlineIndicator.setAttribute('aria-label', setup.onlineLabel);
    }

    if (messageInput) {
      messageInput.setAttribute('placeholder', setup.composerPlaceholder);
    }

    if (signInButton) {
      signInButton.textContent = setup.signInLabel;
    }
  }

  applySharedHeader();
})();
