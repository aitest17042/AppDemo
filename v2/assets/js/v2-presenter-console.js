(function () {
  var guide = (window.HSBCAppSetup && window.HSBCAppSetup.presentationGuide) || null;
  var statusNode = document.getElementById('presenterStatus');
  var nowShowingNode = document.getElementById('nowShowing');
  var nowSummaryNode = document.getElementById('nowSummary');
  var guideNode = document.getElementById('nowFlowGuide');
  var sessionOptionsNode = document.getElementById('sessionOptions');
  var displayWindow = null;

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderGuideItem(item, index) {
    var actionButtons = '';
    var detail = item.detail ? '<p>' + escapeHtml(item.detail) + '</p>' : '';

    if (Array.isArray(item.values)) {
      actionButtons = '<div class="v2-presenter-guide-options">' + item.values.map(function (value) {
        return '<button class="v2-presenter-guide-button" type="button" data-guide-value="' + encodeURIComponent(value) + '" data-guide-command="' + escapeHtml(item.command || 'seed-input') + '" data-guide-country-code="' + escapeHtml(item.countryCode || '') + '">' + escapeHtml(value) + '</button>';
      }).join('') + '</div>';
    } else if (item.value) {
      actionButtons = '<button class="v2-presenter-guide-button" type="button" data-guide-value="' + encodeURIComponent(item.value) + '" data-guide-command="' + escapeHtml(item.command || 'seed-input') + '" data-guide-country-code="' + escapeHtml(item.countryCode || '') + '">' + escapeHtml(item.value) + '</button>';
    }

    return '<li class="v2-presenter-guide-item is-launchable" data-guide-flow-id="' + escapeHtml(item.flowId || '') + '" data-guide-step-id="' + escapeHtml(item.stepId || '') + '" data-guide-launch-input="' + encodeURIComponent(item.launchInput || '') + '"><strong>' + String(index + 1).padStart(2, '0') + ' / ' + escapeHtml(item.question) + '</strong><span>' + escapeHtml(item.action) + '</span>' + actionButtons + detail + '</li>';
  }

  function getSessionVariant() {
    try {
      return window.sessionStorage.getItem('hsbc-v2-passport-animation') || 'nex-passport';
    } catch (error) {
      return 'nex-passport';
    }
  }

  function setSessionVariant(variantId) {
    var safeVariant = variantId === 'country-stamp' || variantId === 'country-opening' || variantId === 'nex-passport'
      ? variantId
      : 'nex-passport';

    try {
      window.sessionStorage.setItem('hsbc-v2-passport-animation', safeVariant);
    } catch (error) {
      return;
    }

    if (sessionOptionsNode) {
      sessionOptionsNode.querySelectorAll('[data-animation-variant]').forEach(function (button) {
        button.classList.toggle('is-active', button.getAttribute('data-animation-variant') === safeVariant);
      });
    }
  }

  function renderSessionOptions() {
    var sessionOptions = Array.isArray(guide && guide.sessionOptions) ? guide.sessionOptions : [];

    if (!sessionOptionsNode || sessionOptions.length === 0) {
      return;
    }

    var activeVariant = getSessionVariant();
    sessionOptionsNode.innerHTML = sessionOptions.map(function (option) {
      return '<button class="v2-session-option' + (option.id === activeVariant ? ' is-active' : '') + '" type="button" data-animation-variant="' + escapeHtml(option.id || '') + '" data-animation-country-code="' + escapeHtml(option.countryCode || 'HK') + '"><span>' + escapeHtml(option.label || option.id || 'Animation') + '</span><small>' + escapeHtml(option.detail || '') + '</small></button>';
    }).join('');

    setSessionVariant(activeVariant);
  }

  function renderGuide() {
    if (!guide) {
      nowShowingNode.textContent = 'No guide available';
      nowSummaryNode.textContent = '';
      guideNode.innerHTML = '';
      renderSessionOptions();
      return;
    }

    nowShowingNode.textContent = guide.title;
    nowSummaryNode.textContent = guide.summary;
    guideNode.innerHTML = '<ol>' + guide.guide.map(renderGuideItem).join('') + '</ol>';
    renderSessionOptions();
  }

  function sendCommand(command, text, extra) {
    if (!displayWindow || displayWindow.closed) {
      statusNode.textContent = 'Open the Start display first';
      return;
    }

    displayWindow.postMessage(Object.assign({
      type: 'hsbc-presenter-command',
      command: command,
      text: text,
      commandId: 'v2-' + Date.now() + '-' + Math.random().toString(36).slice(2)
    }, extra || {}), '*');
    displayWindow.focus();
  }

  function openDisplay() {
    if (!guide) {
      return;
    }

    displayWindow = window.open(guide.path, 'hsbc-v2-display');
    statusNode.textContent = displayWindow && !displayWindow.closed ? 'Display connected' : 'Pop-up blocked';
  }

  guideNode.addEventListener('click', function (event) {
    var guideButton = event.target.closest('[data-guide-value]');
    var guideItem = event.target.closest('[data-guide-flow-id]');

    if (guideButton) {
      sendCommand(guideButton.getAttribute('data-guide-command') || 'seed-input', decodeURIComponent(guideButton.getAttribute('data-guide-value')), {
        countryCode: guideButton.getAttribute('data-guide-country-code') || ''
      });
      return;
    }

    if (guideItem) {
      var launchInput = decodeURIComponent(guideItem.getAttribute('data-guide-launch-input') || '');
      if (launchInput) {
        sendCommand('send-text', launchInput);
      } else {
        sendCommand('start-flow-step', '', {
          flowId: guideItem.getAttribute('data-guide-flow-id'),
          stepId: guideItem.getAttribute('data-guide-step-id')
        });
      }
    }
  });

  if (sessionOptionsNode) {
    sessionOptionsNode.addEventListener('click', function (event) {
      var optionButton = event.target.closest('[data-animation-variant]');

      if (!optionButton) {
        return;
      }

      var variantId = optionButton.getAttribute('data-animation-variant') || 'nex-passport';
      var countryCode = optionButton.getAttribute('data-animation-country-code') || 'HK';
      setSessionVariant(variantId);
      statusNode.textContent = 'Showing animation on display';
      sendCommand('show-passport-animation', '', {
        variant: variantId,
        countryCode: countryCode
      });
    });
  }

  document.getElementById('openDisplayButton').addEventListener('click', openDisplay);

  window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'hsbc-presenter-state') {
      statusNode.textContent = 'Display connected';
    }
  });

  renderGuide();
})();
