(function () {
  var sequence = (window.HSBCAppSetup && window.HSBCAppSetup.presentationSequence) || [];

  var sequenceNode = document.getElementById('presenterSequence');
  var statusNode = document.getElementById('presenterStatus');
  var nowShowingNode = document.getElementById('nowShowing');
  var nowSummaryNode = document.getElementById('nowSummary');
  var nowFlowGuideNode = document.getElementById('nowFlowGuide');
  var displayWindow = null;
  var activeIndex = -1;

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getAnswers(item) {
    if (Array.isArray(item.answers)) {
      return item.answers;
    }

    return item.answer ? [item.answer] : [];
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

    var branchLabel = item.branch ? '<em class="v2-presenter-guide-branch">' + escapeHtml(item.branch) + '</em>' : '';
    var targetLabel = item.flowId && item.stepId ? '<button class="v2-presenter-guide-target" type="button" data-guide-jump="true">Jump to ' + escapeHtml(item.stepId) + '</button>' : '';

    return '<li class="v2-presenter-guide-item' + (item.flowId && item.stepId ? ' is-launchable' : '') + '" data-guide-flow-id="' + escapeHtml(item.flowId || '') + '" data-guide-step-id="' + escapeHtml(item.stepId || '') + '" data-guide-launch-input="' + encodeURIComponent(item.launchInput || '') + '"><strong>' + String(index + 1).padStart(2, '0') + ' / ' + escapeHtml(item.question) + '</strong>' + branchLabel + '<span>' + escapeHtml(item.action) + '</span>' + actionButtons + detail + targetLabel + '</li>';
  }

  function renderSequence() {
    sequenceNode.innerHTML = sequence.map(function (item, index) {
      return '<button class="v2-presenter-step' + (index === activeIndex ? ' is-active' : '') + '" type="button" data-index="' + index + '">' +
        '<span class="v2-presenter-step-number">' + String(index + 1).padStart(2, '0') + '</span>' +
        '<strong>' + item.title + '</strong>' +
      '</button>';
    }).join('');
  }

  function updateNowShowing() {
    if (activeIndex < 0) {
      nowShowingNode.textContent = 'Nothing selected';
      nowSummaryNode.textContent = 'Open a display page to begin.';
      nowFlowGuideNode.innerHTML = '';
      return;
    }

    nowShowingNode.textContent = sequence[activeIndex].title;
    nowSummaryNode.textContent = sequence[activeIndex].summary;
    var guide = sequence[activeIndex].guide;
    var commonItems = guide.filter(function (item) { return item.column === 'common'; });
    var yesItems = guide.filter(function (item) { return item.column === 'yes'; });
    var noItems = guide.filter(function (item) { return item.column === 'no'; });
    var hasBranches = yesItems.length > 0 || noItems.length > 0;
    var commonMarkup = commonItems.length > 0 ? '<ol class="v2-presenter-guide-common">' + commonItems.map(renderGuideItem).join('') + '</ol>' : '';
    var branchMarkup = hasBranches
      ? '<div class="v2-presenter-guide-columns"><section><h4>Yes / Existing company</h4><ol>' + yesItems.map(renderGuideItem).join('') + '</ol></section><section><h4>No / Company registration</h4><ol>' + noItems.map(renderGuideItem).join('') + '</ol></section></div>'
      : '<ol>' + guide.map(renderGuideItem).join('') + '</ol>';

    nowFlowGuideNode.innerHTML = '<p class="v2-presenter-flow-guide-heading">Presentation guide</p>' + commonMarkup + branchMarkup;
  }

  function openStep(index) {
    var item = sequence[index];
    activeIndex = index;
    displayWindow = window.open(item.path, 'hsbc-v2-display');
    statusNode.textContent = displayWindow && !displayWindow.closed ? 'Display connected' : 'Pop-up blocked';
    renderSequence();
    updateNowShowing();
  }

  function sendCommand(command, text, extra) {
    if (!displayWindow || displayWindow.closed) {
      statusNode.textContent = 'Open a display first';
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

  function moveBy(delta) {
    var nextIndex = activeIndex + delta;
    if (nextIndex >= 0 && nextIndex < sequence.length) {
      openStep(nextIndex);
    }
  }

  sequenceNode.addEventListener('click', function (event) {
    var button = event.target.closest('[data-index]');
    if (button) {
      openStep(Number(button.getAttribute('data-index')));
    }
  });

  nowFlowGuideNode.addEventListener('click', function (event) {
    var guideButton = event.target.closest('[data-guide-value]');
    var jumpButton = event.target.closest('[data-guide-jump]');
    var guideItem = event.target.closest('[data-guide-flow-id]');

    if (guideButton) {
      sendCommand('seed-input', decodeURIComponent(guideButton.getAttribute('data-guide-value')));
      return;
    }

    if (jumpButton && guideItem) {
      statusNode.textContent = 'Starting ' + guideItem.getAttribute('data-guide-step-id');
      sendCommand('start-flow-step', '', {
        flowId: guideItem.getAttribute('data-guide-flow-id'),
        stepId: guideItem.getAttribute('data-guide-step-id')
      });
      return;
    }

    if (guideItem && guideItem.getAttribute('data-guide-flow-id') && guideItem.getAttribute('data-guide-step-id')) {
      var launchInput = decodeURIComponent(guideItem.getAttribute('data-guide-launch-input') || '');

      if (launchInput) {
        sendCommand('send-text', launchInput);
        return;
      }

      statusNode.textContent = 'Starting ' + guideItem.getAttribute('data-guide-step-id');
      sendCommand('start-flow-step', '', {
        flowId: guideItem.getAttribute('data-guide-flow-id'),
        stepId: guideItem.getAttribute('data-guide-step-id')
      });
    }
  });

  document.getElementById('previousButton').addEventListener('click', function () { moveBy(-1); });
  document.getElementById('nextButton').addEventListener('click', function () { moveBy(1); });

  window.addEventListener('message', function (event) {
    if (!event.data || event.data.type !== 'hsbc-presenter-state') {
      return;
    }

    statusNode.textContent = 'Display connected';
    nowShowingNode.textContent = event.data.pageTitle || 'Display connected';
    nowSummaryNode.textContent = event.data.pagePath || '';
  });

  renderSequence();
  updateNowShowing();
})();
