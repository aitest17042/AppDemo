(function () {
  function getCurrentPagePath() {
    var pathname = window.location.pathname || '';
    var segments = pathname.split('/').filter(Boolean);

    return segments.length > 0 ? segments[segments.length - 1] : '';
  }

  function postPresenterDisplayState() {
    if (!window.opener || window.opener.closed || typeof window.opener.postMessage !== 'function') {
      return;
    }

    window.opener.postMessage({
      type: 'hsbc-presenter-state',
      pageId: document.body.getAttribute('data-page-id') || '',
      pageTitle: document.body.getAttribute('data-page-title') || document.title || '',
      pagePath: getCurrentPagePath(),
      activeTopicId: '',
      suggestedInput: ''
    }, '*');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', postPresenterDisplayState);
  } else {
    postPresenterDisplayState();
  }

  window.addEventListener('focus', postPresenterDisplayState);
})();
