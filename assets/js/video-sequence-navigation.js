(function () {
  function init(options) {
    var config = options || {};
    var nextPath = config.nextPath || '';

    if (!nextPath) {
      return;
    }

    document.addEventListener('dblclick', function (event) {
      if (event.target && typeof event.target.closest === 'function' && event.target.closest('.video-player')) {
        return;
      }

      window.location.href = nextPath;
    });
  }

  window.HSBCVideoSequenceNavigation = {
    init: init
  };
}());