(function () {
  var setup = {
    brandName: 'Nex Passport',
    logoAlt: 'Nex Passport',
    onlineLabel: 'Online',
    signInLabel: 'Sign in',
    signInLoadingLabel: 'Signing in...',
    signOutLabel: 'Sign out',
    composerPlaceholder: 'Type your question...',
    presentationGuide: {
        path: '01_account-opening-start.html',
        title: 'Start',
        summary: 'Begin the account-opening journey.',
        sessionOptions: [
          { id: 'nex-passport', label: 'HK account opening', detail: 'Preview the Domestic Account passport cover, page turn, and HK stamp.', countryCode: 'HK' },
          { id: 'country-opening', label: 'Country account opening', detail: 'Preview the International Account passport cover, page turn, and SG stamp.', countryCode: 'SG' }
        ],
        guide: [
          { question: 'Start', column: 'common', flowId: 'account-opening-start', stepId: 'account-identity-upload', launchInput: 'I want to open', action: 'Press', value: 'I want to open' },
          { question: 'Identity photo', column: 'common', flowId: 'account-opening-start', stepId: 'account-identity-upload', action: 'Press', value: 'Upload', detail: 'In the chat answer box, press "Upload", then pick a photo of yourself holding your ID.' },
          { question: 'Verify identity', column: 'common', flowId: 'account-opening-start', stepId: 'account-identity-verified', action: 'Press one', values: ['Verify', 'Enter Manually'], detail: 'Review:\n- ID Type: China Resident Identity Card\n- ID No.: 110102200001018882\n- Name: 王小白' },
          { question: 'Choose BR records', column: 'common', flowId: 'account-opening-start', stepId: 'account-br-selection', action: 'Press one', values: ['Harbour Peak Limited', 'Northstar Trading Limited', 'Southstar Trading Limited'], detail: 'Choose any company to continue.' },
          { question: 'Account complete', column: 'common', flowId: 'account-opening-start', stepId: 'account-br-selection', action: 'Wait', detail: 'Wait 1 second for verification and 3 seconds while the accounts open, then wait 5 seconds for the sign-in question.' },
          { question: 'Sign in choice', column: 'common', flowId: 'account-opening-start', stepId: 'account-sign-in-choice', action: 'Press one', values: ['Sign In', 'Maybe Later'], detail: 'One dialog shows both the question and "Please choose an option to continue."' },
          { question: 'Post sign-in analysis', column: 'common', flowId: 'account-opening-start', stepId: 'account-sign-in-choice', action: 'Wait', detail: 'If you press "Sign In", a persistent "Signed in." bubble appears before the 3-second "Analysing your data..." animation.' },
          { question: 'International account follow-up', column: 'common', flowId: 'account-opening-start', stepId: 'account-other-country-offer', action: 'Press one', values: ['Yes', 'Maybe Later'], command: 'send-text', detail: 'For this demo, press "Yes" to show the country account selector.' }
        ],
        controls: [
          'Press "I want to open".',
          'In the chat answer box, press "Upload", then select the photo file.',
          'Review the ID details, then press "Verify".',
          'Choose any BR record to continue.',
          'Wait 1 second for verification, 3 seconds for account opening, then 5 seconds for the sign-in question.',
          'Press "Sign In" or "Maybe Later" when prompted.',
          'If you choose "Sign In", wait for "Signed in.", then the 3-second "Analysing your data..." animation, then choose "Yes" or "Maybe Later".',
          'After choosing "Yes", use the country switch answer box. HK stays switched on, and each other country requires confirmation under its row before activation.',
          'After confirmation, the app shows checking/analying messages, asks consent, then creates Certificate of Incorporation and opens the selected country account.'
        ],
        questions: [
          { question: 'Would you like to open an account?', startInput: 'I want to open', answers: ['I want to open'] },
          { question: 'Review identity and continue.', answers: ['Verify', 'Enter Manually', 'Cancel'] },
          { question: 'Which BR record would you like to open?', answers: ['Harbour Peak Limited', 'Northstar Trading Limited', 'Southstar Trading Limited'] },
          { question: 'Would you like to sign in now?', answers: ['Sign In', 'Maybe Later'] },
          { question: 'Open accounts in other countries?', answers: ['Yes', 'Maybe Later'] }
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
