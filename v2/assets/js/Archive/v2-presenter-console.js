(function () {
  var guide = (window.HSBCAppSetup && window.HSBCAppSetup.presentationGuide) || null;
  var statusNode = document.getElementById('presenterStatus');
  var nowShowingNode = document.getElementById('nowShowing');
  var nowSummaryNode = document.getElementById('nowSummary');
  var guideNode = document.getElementById('nowFlowGuide');
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
        return '<button class="v2-presenter-guide-button" type="button" data-guide-value="' + encodeURIComponent(value) + '">' + escapeHtml(value) + '</button>';
      }).join('') + '</div>';
    } else if (item.value) {
      actionButtons = '<button class="v2-presenter-guide-button" type="button" data-guide-value="' + encodeURIComponent(item.value) + '">' + escapeHtml(item.value) + '</button>';
    }

    return '<li class="v2-presenter-guide-item is-launchable" data-guide-flow-id="' + escapeHtml(item.flowId || '') + '" data-guide-step-id="' + escapeHtml(item.stepId || '') + '" data-guide-launch-input="' + encodeURIComponent(item.launchInput || '') + '"><strong>' + String(index + 1).padStart(2, '0') + ' / ' + escapeHtml(item.question) + '</strong><span>' + escapeHtml(item.action) + '</span>' + actionButtons + detail + '</li>';
  }

  function renderGuide() {
    if (!guide) {
      nowShowingNode.textContent = 'No guide available';
      nowSummaryNode.textContent = '';
      guideNode.innerHTML = '';
      return;
    }

    nowShowingNode.textContent = guide.title;
    nowSummaryNode.textContent = guide.summary;
    guideNode.innerHTML = '<ol>' + guide.guide.map(renderGuideItem).join('') + '</ol>';
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
      sendCommand('seed-input', decodeURIComponent(guideButton.getAttribute('data-guide-value')));
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

  document.getElementById('openDisplayButton').addEventListener('click', openDisplay);

  window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'hsbc-presenter-state') {
      statusNode.textContent = 'Display connected';
    }
  });

  renderGuide();
})();
