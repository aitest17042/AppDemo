(function () {
  function ensureLineStructure(lineNode, caretClassName) {
    var contentNode;
    var textNode;
    var caretNode;

    lineNode.textContent = '';

    contentNode = document.createElement('span');
    contentNode.className = 'typing-run';
    contentNode.style.display = 'inline';
    contentNode.style.maxWidth = '100%';
    contentNode.style.minWidth = '0';

    textNode = document.createElement('span');
    textNode.className = 'typing-text';

    caretNode = document.createElement('span');
    caretNode.className = caretClassName || 'typing-caret';
    caretNode.setAttribute('aria-hidden', 'true');

    contentNode.appendChild(textNode);
    contentNode.appendChild(caretNode);
    lineNode.appendChild(contentNode);

    return {
      textNode: textNode,
      caretNode: caretNode
    };
  }

  function typeCharacters(targetNode, text, speed, onComplete) {
    var content = String(text || '');
    var index = 0;

    function step() {
      if (index >= content.length) {
        if (typeof onComplete === 'function') {
          onComplete();
        }

        return;
      }

      targetNode.textContent += content.charAt(index);
      index += 1;
      window.setTimeout(step, speed || 80);
    }

    step();
  }

  function bindAdvanceTriggers(options) {
    var activated = false;
    var guardNode = options && options.guardNode ? options.guardNode : null;
    var handler = options && typeof options.onAdvance === 'function' ? options.onAdvance : null;
    var canAdvance = options && typeof options.canAdvance === 'function' ? options.canAdvance : null;

    function tryAdvance() {
      if (activated) {
        return;
      }

      if (canAdvance && !canAdvance()) {
        return;
      }

      if (handler() === false) {
        return;
      }

      activated = true;
    }

    if (!handler) {
      return;
    }

    document.addEventListener('click', function (event) {
      if (guardNode && guardNode.contains(event.target)) {
        return;
      }

      tryAdvance();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      if (guardNode && document.activeElement === guardNode) {
        return;
      }

      tryAdvance();
    });
  }

  window.HSBCStoryTransition = {
    ensureLineStructure: ensureLineStructure,
    typeCharacters: typeCharacters,
    bindAdvanceTriggers: bindAdvanceTriggers
  };
}());