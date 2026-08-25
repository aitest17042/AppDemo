(function () {
  var setup = {
    brandName: 'HSBC NEX',
    logoAlt: 'HSBC NEX',
    onlineLabel: 'Online',
    signInLabel: 'Sign in',
    signInLoadingLabel: 'Signing in...',
    signOutLabel: 'Sign out',
    composerPlaceholder: 'Type your question...',
    presentationGuide: {
        path: '01_account-opening-start.html',
        title: 'Start',
        summary: 'Begin the account-opening journey.',
        guide: [
          { question: 'Start', column: 'common', flowId: 'account-opening-start', stepId: 'account-identity-upload', launchInput: 'I want to open', action: 'Press', value: 'I want to open' },
          { question: 'Identity photo', column: 'common', flowId: 'account-opening-start', stepId: 'account-identity-upload', action: 'Use the upload button', detail: 'Upload a photo of yourself holding your ID.' },
          { question: 'Verify identity', column: 'common', flowId: 'account-opening-start', stepId: 'account-identity-verified', action: 'Press one', values: ['Verify', 'Cancel'], detail: 'Review:\n- ID Type: China Resident Identity Card\n- ID No.: 110102200001018882\n- Name: 王小白' },
          { question: 'Choose BR records', column: 'common', flowId: 'account-opening-start', stepId: 'account-br-selection', action: 'Press one', values: ['All'], detail: 'Type "All"' },
          { question: 'Account complete', column: 'common', flowId: 'account-opening-start', stepId: 'account-br-selection', action: 'Wait', detail: 'NEX verifies the records, then shows the account-opened message.' }
        ],
        controls: [
          'Press "I want to open".',
          'Upload a photo of yourself holding your ID.',
          'Review the ID details, then press "Verify".',
          'Choose a BR record, then type "All" in the display console.',
          'Wait for the verification and account-opened message.'
        ],
        questions: [
          { question: 'Would you like to open an account?', startInput: 'I want to open', answers: ['I want to open'] },
          { question: 'Upload your identity photo.', answers: ['Verify', 'Cancel'] },
          { question: 'Which BR record would you like to open?', answers: ['Harbour Peak Limited', 'Northstar Trading Limited', 'Southstar Trading Limited'] },
          { question: 'Your account is open.', answers: [] }
        ]
      }
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
