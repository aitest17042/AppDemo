(function () {
  function ensureLineStructure(lineNode, caretClassName) {
    var textNode;
    var caretNode;

    lineNode.textContent = '';

    textNode = document.createElement('span');
    textNode.className = 'typing-text';

    caretNode = document.createElement('span');
    caretNode.className = caretClassName || 'typing-caret';
    caretNode.setAttribute('aria-hidden', 'true');

    lineNode.appendChild(textNode);
    lineNode.appendChild(caretNode);

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

    if (!handler) {
      return;
    }

    document.addEventListener('click', function (event) {
      if (guardNode && guardNode.contains(event.target)) {
        return;
      }

      if (activated) {
        return;
      }

      activated = true;
      handler();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      if (guardNode && document.activeElement === guardNode) {
        return;
      }

      if (activated) {
        return;
      }

      activated = true;
      handler();
    });
  }

  window.HSBCStoryTransition = {
    ensureLineStructure: ensureLineStructure,
    typeCharacters: typeCharacters,
    bindAdvanceTriggers: bindAdvanceTriggers
  };
}());