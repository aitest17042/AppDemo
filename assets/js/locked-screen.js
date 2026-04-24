(function () {
  var lockStatusTime = document.getElementById('lockStatusTime');
  var lockTime = document.getElementById('lockTime');
  var lockDate = document.getElementById('lockDate');
  var notifications = Array.prototype.slice.call(document.querySelectorAll('.lock-notification'));

  if (!lockStatusTime || !lockTime || !lockDate || notifications.length === 0) {
    console.error('Lock screen failed to initialize.');
    return;
  }

  var weekdayLabels = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  var activeGesture = null;

  function pad2(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function getStatusTimeText() {
    var now = new Date();
    var hours = now.getHours() % 12;

    if (hours === 0) {
      hours = 12;
    }

    return hours + ':' + pad2(now.getMinutes());
  }

  function getLockTimeText() {
    var now = new Date();
    return pad2(now.getHours()) + ':' + pad2(now.getMinutes());
  }

  function getLockDateText() {
    var now = new Date();
    return weekdayLabels[now.getDay()] + ', ' + (now.getMonth() + 1) + '月' + now.getDate() + '日';
  }

  function updateTimeElements() {
    lockStatusTime.textContent = getStatusTimeText();
    lockTime.textContent = getLockTimeText();
    lockDate.textContent = getLockDateText();
  }

  function navigateToTarget(target) {
    window.location.href = target;
  }

  function resetNotification(notification, withTransition) {
    if (withTransition) {
      notification.classList.add('is-resetting');
    }

    notification.style.transform = 'translateX(0px)';
    notification.style.opacity = '1';

    if (withTransition) {
      window.setTimeout(function () {
        notification.classList.remove('is-resetting');
      }, 220);
    }
  }

  function applyDrag(notification, deltaX) {
    var constrained = Math.max(0, Math.min(deltaX, 180));
    var opacity = 1 - constrained / 260;
    notification.style.transform = 'translateX(' + constrained + 'px)';
    notification.style.opacity = String(Math.max(0.65, opacity));
  }

  function handlePointerDown(event) {
    var notification = event.currentTarget;

    activeGesture = {
      notification: notification,
      startX: event.clientX,
      pointerId: event.pointerId
    };

    notification.classList.remove('is-resetting');
    notification.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!activeGesture || activeGesture.pointerId !== event.pointerId) {
      return;
    }

    var deltaX = event.clientX - activeGesture.startX;
    applyDrag(activeGesture.notification, deltaX);
  }

  function handlePointerEnd(event) {
    if (!activeGesture || activeGesture.pointerId !== event.pointerId) {
      return;
    }

    var notification = activeGesture.notification;
    var deltaX = event.clientX - activeGesture.startX;
    var target = notification.getAttribute('data-target') || './account-opening.html';

    activeGesture = null;

    try {
      notification.releasePointerCapture(event.pointerId);
    } catch (error) {
      // Ignore invalid release attempts.
    }

    if (deltaX > 120) {
      notification.style.transform = 'translateX(220px)';
      notification.style.opacity = '0';
      window.setTimeout(function () {
        navigateToTarget(target);
      }, 160);
      return;
    }

    resetNotification(notification, true);
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigateToTarget(event.currentTarget.getAttribute('data-target') || './account-opening.html');
    }
  }

  notifications.forEach(function (notification) {
    notification.addEventListener('pointerdown', handlePointerDown);
    notification.addEventListener('pointermove', handlePointerMove);
    notification.addEventListener('pointerup', handlePointerEnd);
    notification.addEventListener('pointercancel', handlePointerEnd);
    notification.addEventListener('lostpointercapture', function () {
      if (!activeGesture || activeGesture.notification !== notification) {
        resetNotification(notification, true);
      }
    });
    notification.addEventListener('keydown', handleKeyDown);
  });

  updateTimeElements();
  window.setInterval(updateTimeElements, 1000);
})();