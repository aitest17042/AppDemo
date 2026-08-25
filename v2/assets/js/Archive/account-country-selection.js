(function () {
  var countryData = [
    {
      code: 'SG',
      name: 'Singapore',
      submitted: ['KYC passport - Hong Kong'],
      additional: ['Singapore residential address', 'Proof of Singapore business activity']
    },
    {
      code: 'UK',
      name: 'United Kingdom',
      submitted: ['KYC passport - Hong Kong'],
      additional: ['UK residential address', 'UK tax residency details']
    },
    {
      code: 'UAE',
      name: 'United Arab Emirates',
      submitted: ['KYC passport - Hong Kong'],
      additional: ['UAE residential address', 'Emirates ID or visa copy']
    },
    {
      code: 'IN',
      name: 'India',
      submitted: ['KYC passport - Hong Kong'],
      additional: ['India residential address', 'Permanent Account Number (PAN)']
    },
    {
      code: 'MY',
      name: 'Malaysia',
      submitted: ['KYC passport - Hong Kong'],
      additional: ['Malaysia residential address', 'Malaysian tax identification number']
    }
  ];

  var countryList = document.getElementById('countryList');
  var statusTime = document.getElementById('statusTime');
  var headerActions = document.querySelector('.header-actions');
  var backButton = document.querySelector('.country-back-button');
  var appSetup = window.HSBCAppSetup || {};

  function isSessionSignedIn() {
    try {
      return window.sessionStorage.getItem('hsbc-v2-signed-in') === 'true';
    } catch (error) {
      return false;
    }
  }

  function setSessionSignedIn(isSignedIn) {
    try {
      if (isSignedIn) {
        window.sessionStorage.setItem('hsbc-v2-signed-in', 'true');
      } else {
        window.sessionStorage.removeItem('hsbc-v2-signed-in');
      }
    } catch (error) {
      return;
    }
  }

  function isUkAccountOpen() {
    try {
      return window.sessionStorage.getItem('hsbc-v2-uk-account-open') === 'true';
    } catch (error) {
      return false;
    }
  }

  function setUkAccountOpen(isOpen) {
    try {
      if (isOpen) {
        window.sessionStorage.setItem('hsbc-v2-uk-account-open', 'true');
      } else {
        window.sessionStorage.removeItem('hsbc-v2-uk-account-open');
      }
    } catch (error) {
      return;
    }
  }

  if (!countryList || !statusTime || !headerActions || !backButton) {
    return;
  }

  backButton.addEventListener('click', function () {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = '01_account-opening-start.html';
  });

  function renderSignedInState(isSignedIn) {
    headerActions.innerHTML = isSignedIn
      ? '<div class="header-user-menu"><button class="header-user header-user-trigger" type="button" data-country-auth="menu" aria-haspopup="menu" aria-expanded="false" aria-label="Signed-in user menu"><img class="header-user-avatar" src="./assets/media/icons/chiikawa_icon.png" alt="Signed-in user" /><span class="header-user-verified" aria-hidden="true">&#10003;</span></button><div class="header-user-dropdown" role="menu" hidden><button class="header-user-dropdown-item" type="button" data-country-auth="logout" role="menuitem">' + (appSetup.signOutLabel || 'Sign out') + '</button></div></div><button class="header-expand-trigger" type="button" data-country-auth="toggle-header-panel" aria-expanded="false" aria-label="Expand account menu">⌄</button><div class="header-expand-panel" hidden><div class="header-expand-option header-expand-country"><button class="header-expand-option-button" type="button">Country <span>HK</span></button><div class="header-country-menu">' + ['HK', 'SG', 'UK', 'UAE', 'IN', 'MY'].map(function (country) { var isOpen = country === 'HK' || (country === 'UK' && isUkAccountOpen()); return '<button class="header-country-option' + (isOpen ? ' is-current' : '') + '" type="button" data-country-code="' + country + '"><span>' + country + '</span><span class="header-country-switch" role="switch" aria-checked="' + (isOpen ? 'true' : 'false') + '"><span></span></span></button>'; }).join('') + '<div class="header-country-confirm" hidden><p>Using your existing passport, we can help you open a UK account directly.</p><div><button type="button" data-country-confirm="yes">Confirm</button><button type="button" data-country-confirm="no">Cancel</button></div></div></div></div><div class="header-expand-option header-expand-products"><button class="header-expand-option-button" type="button">Products <span>⌄</span></button><div class="header-products-menu"><button class="header-product-option" type="button" data-product-code="Borrow">Borrow</button><button class="header-product-option" type="button" data-product-code="Card">Card <span>⌄</span></button><div class="header-card-menu" hidden><button class="header-card-option" type="button" data-card-code="Credit card"><span>Credit card</span><span class="header-product-switch" role="switch" aria-checked="false"><span></span></span></button><button class="header-card-option" type="button" data-card-code="Debit card"><span>Debit card</span><span class="header-product-switch" role="switch" aria-checked="false"><span></span></span></button><div class="header-product-confirm" hidden><p></p><div><button type="button" data-product-confirm="yes">Confirm</button><button type="button" data-product-confirm="no">Cancel</button></div></div></div><button class="header-product-option" type="button" data-product-code="Investment">Investment</button><button class="header-product-option" type="button" data-product-code="Trade">Trade</button><button class="header-product-option" type="button" data-product-code="Other Products &amp; Solutions">Other Products &amp; Solutions</button></div></div></div>'
      : '<button class="login-button" type="button" data-country-auth="login">' + (appSetup.signInLabel || 'Sign in') + '</button>';
    setupHeaderExpandPanel();
  }

  function setupHeaderExpandPanel() {
    var panel = headerActions.querySelector('.header-expand-panel');
    var countryOption = headerActions.querySelector('.header-expand-country');
    var productsOption = headerActions.querySelector('.header-expand-products');
    var countryMenu = headerActions.querySelector('.header-country-menu');
    var productsMenu = headerActions.querySelector('.header-products-menu');
    var commonMenu;

    if (!panel || !countryOption || !productsOption || !countryMenu || !productsMenu || panel.querySelector('.header-common-submenu')) {
      return;
    }

    function syncActiveCountryLabel() {
      var label = headerActions.querySelector('.header-expand-country .header-expand-option-button span');
      var activeCountries = Array.prototype.slice.call(headerActions.querySelectorAll('.header-country-option.is-current'))
        .map(function (option) { return option.getAttribute('data-country-code'); });

      if (label) {
        label.textContent = activeCountries.join(', ');
      }
    }

    commonMenu = document.createElement('div');
    commonMenu.className = 'header-common-submenu';
    commonMenu.appendChild(countryMenu);
    productsOption.remove();
    var selectProductButton = document.createElement('button');
    selectProductButton.className = 'header-select-product';
    selectProductButton.type = 'button';
    selectProductButton.textContent = 'Select product';
    countryMenu.appendChild(selectProductButton);
    commonMenu.appendChild(productsMenu);
    panel.appendChild(commonMenu);

    productsMenu.querySelectorAll('.header-product-option').forEach(function (option) {
      if (!option.querySelector('span')) {
        option.insertAdjacentHTML('beforeend', '<span>⌄</span>');
      }
    });

    var defaultDebitCard = productsMenu.querySelector('[data-card-code="Debit card"]');
    if (defaultDebitCard) {
      defaultDebitCard.classList.add('is-current');
      defaultDebitCard.querySelector('.header-product-switch').setAttribute('aria-checked', 'true');
    }

    function moveSelectProductButton(countryCode) {
      var selectedOption = countryMenu.querySelector('[data-country-code="' + countryCode + '"]');
      if (selectedOption) {
        selectedOption.insertAdjacentElement('afterend', selectProductButton);
      }
    }

    moveSelectProductButton(countryMenu.querySelector('.header-country-option.is-current').getAttribute('data-country-code'));

    countryOption.addEventListener('mouseenter', function () {
      panel.classList.add('show-country-menu');
      panel.classList.remove('show-products-menu');
    });

    syncActiveCountryLabel();
  }

  headerActions.addEventListener('click', function (event) {
    var action = event.target.closest('[data-country-auth]');
    var countryOption = event.target.closest('.header-country-option');
    var countryConfirm = event.target.closest('[data-country-confirm]');
    var productOption = event.target.closest('.header-product-option');
    var cardOption = event.target.closest('.header-card-option');
    var productConfirm = event.target.closest('[data-product-confirm]');
    var selectProductButton = event.target.closest('.header-select-product');

    if (selectProductButton) {
      var expandPanel = headerActions.querySelector('.header-expand-panel');
      var activeCountry = expandPanel.getAttribute('data-selected-country') || 'HK';
      var selectedCountryOption = headerActions.querySelector('[data-country-code="' + activeCountry + '"]');
      if (selectedCountryOption && selectedCountryOption.classList.contains('is-current')) {
        expandPanel.classList.add('show-products-menu');
        expandPanel.classList.remove('show-country-products');
        headerActions.querySelector('.header-products-menu').setAttribute('data-country', activeCountry);
      }
      return;
    }

    if (productConfirm) {
      var productConfirmBox = headerActions.querySelector('.header-product-confirm');
      if (productConfirm.getAttribute('data-product-confirm') === 'yes') {
        var pendingProduct = productConfirmBox.getAttribute('data-pending-product') || '';
        productConfirmBox.hidden = true;
        window.setTimeout(function () {
          var selectedCard = headerActions.querySelector('[data-card-code="' + pendingProduct + '"]');
          if (selectedCard) {
            selectedCard.classList.add('is-current');
            selectedCard.querySelector('.header-product-switch').setAttribute('aria-checked', 'true');
          }
        }, 2000);
      } else if (productConfirmBox) {
        productConfirmBox.hidden = true;
      }
      return;
    }

    if (cardOption) {
      var cardCode = cardOption.getAttribute('data-card-code') || '';
      if (cardOption.classList.contains('is-current')) {
        return;
      }
      var productConfirmBox = headerActions.querySelector('.header-product-confirm');
      productConfirmBox.setAttribute('data-pending-product', cardCode);
      productConfirmBox.querySelector('p').textContent = 'Using your existing passport, we can help you open a ' + cardCode + ' directly.';
      cardOption.insertAdjacentElement('afterend', productConfirmBox);
      productConfirmBox.hidden = false;
      return;
    }

    if (productOption && productOption.getAttribute('data-product-code') === 'Card') {
      headerActions.querySelector('.header-card-menu').hidden = false;
      return;
    }

    if (countryConfirm) {
      var countryConfirmBox = headerActions.querySelector('.header-country-confirm');
      if (countryConfirm.getAttribute('data-country-confirm') === 'yes') {
        var pendingCountry = countryConfirmBox.getAttribute('data-pending-country') || '';
        countryConfirmBox.hidden = true;
        window.setTimeout(function () {
          if (pendingCountry === 'UK') {
            setUkAccountOpen(true);
          }
          var selectedCountry = headerActions.querySelector('[data-country-code="' + pendingCountry + '"]');
          if (selectedCountry) {
            selectedCountry.classList.add('is-current');
            selectedCountry.querySelector('.header-country-switch').setAttribute('aria-checked', 'true');
          }
          selectedCountry.insertAdjacentElement('afterend', headerActions.querySelector('.header-select-product'));
          headerActions.querySelector('.header-expand-panel').classList.add('show-country-products');
          var countryLabel = headerActions.querySelector('.header-expand-country .header-expand-option-button span');
          if (countryLabel) {
            countryLabel.textContent = Array.prototype.slice.call(headerActions.querySelectorAll('.header-country-option.is-current')).map(function (option) { return option.getAttribute('data-country-code'); }).join(', ');
          }
        }, 2000);
      }
      if (countryConfirmBox) {
        countryConfirmBox.hidden = true;
      }
      return;
    }

    if (countryOption) {
      var selectedCountryCode = countryOption.getAttribute('data-country-code') || '';
      var countryConfirmBox = headerActions.querySelector('.header-country-confirm');
      if (countryOption.classList.contains('is-current')) {
        countryOption.insertAdjacentElement('afterend', headerActions.querySelector('.header-select-product'));
        headerActions.querySelector('.header-expand-panel').setAttribute('data-selected-country', selectedCountryCode);
        headerActions.querySelector('.header-expand-panel').classList.remove('show-products-menu', 'show-country-products');
        return;
      }
      if (selectedCountryCode !== 'HK') {
        countryConfirmBox.setAttribute('data-pending-country', selectedCountryCode);
        countryConfirmBox.querySelector('p').textContent = 'Using your existing passport, we can help you open a ' + selectedCountryCode + ' account directly.';
        countryOption.insertAdjacentElement('afterend', countryConfirmBox);
        countryConfirmBox.hidden = false;
        return;
      }
      countryOption.classList.add('is-current');
      countryOption.querySelector('.header-country-switch').setAttribute('aria-checked', 'true');
      countryOption.insertAdjacentElement('afterend', headerActions.querySelector('.header-select-product'));
      headerActions.querySelector('.header-expand-panel').setAttribute('data-selected-country', selectedCountryCode);
      headerActions.querySelector('.header-expand-panel').classList.remove('show-products-menu', 'show-country-products');
      var countryLabel = headerActions.querySelector('.header-expand-country .header-expand-option-button span');
      if (countryLabel) {
        countryLabel.textContent = Array.prototype.slice.call(headerActions.querySelectorAll('.header-country-option.is-current')).map(function (option) { return option.getAttribute('data-country-code'); }).join(', ');
      }
      return;
    }

    if (!action) {
      return;
    }

    if (action.getAttribute('data-country-auth') === 'login') {
      setSessionSignedIn(true);
      renderSignedInState(true);
      return;
    }

    if (action.getAttribute('data-country-auth') === 'menu') {
      var dropdown = headerActions.querySelector('.header-user-dropdown');
      var trigger = headerActions.querySelector('[data-country-auth="menu"]');
      var isOpen = dropdown.hasAttribute('hidden');
      dropdown.toggleAttribute('hidden', !isOpen);
      trigger.setAttribute('aria-expanded', String(isOpen));
      return;
    }

    if (action.getAttribute('data-country-auth') === 'toggle-header-panel') {
      var panel = headerActions.querySelector('.header-expand-panel');
      var expandTrigger = headerActions.querySelector('.header-expand-trigger');
      var isPanelOpen = panel && panel.hidden;

      if (panel) {
        panel.hidden = !isPanelOpen;
        if (!isPanelOpen) {
          panel.classList.remove('show-products-menu', 'show-country-products');
        }
      }
      if (expandTrigger) {
        expandTrigger.setAttribute('aria-expanded', String(Boolean(isPanelOpen)));
      }
      return;
    }

    if (action.getAttribute('data-country-auth') === 'logout') {
      setSessionSignedIn(false);
      setUkAccountOpen(false);
      renderSignedInState(false);
    }
  });

  document.addEventListener('click', function (event) {
    if (headerActions.contains(event.target)) {
      return;
    }
    var panel = headerActions.querySelector('.header-expand-panel');
    var expandTrigger = headerActions.querySelector('.header-expand-trigger');
    if (panel && !panel.hidden) {
      panel.hidden = true;
      panel.classList.remove('show-products-menu', 'show-country-products');
      if (expandTrigger) {
        expandTrigger.setAttribute('aria-expanded', 'false');
      }
    }
  });

  function createDocumentList(title, documents, modifier) {
    return '<div class="country-documents-group ' + modifier + '">' +
      '<h4>' + title + '</h4>' +
      '<ul>' + documents.map(function (documentName) {
        return '<li>' + documentName + '</li>';
      }).join('') + '</ul>' +
      '</div>';
  }

  function renderCountry(country) {
    var item = document.createElement('article');
    item.className = 'country-item';
    item.innerHTML =
      '<div class="country-item-header">' +
        '<div class="country-name"><span class="country-code">' + country.code + '</span><strong>' + country.name + '</strong></div>' +
        '<button class="country-switch" type="button" role="switch" aria-checked="false" aria-label="Select ' + country.name + '">' +
          '<span class="country-switch-track"><span class="country-switch-thumb"></span></span>' +
        '</button>' +
      '</div>' +
      '<div class="country-details" hidden>' +
        createDocumentList('Documents submitted', country.submitted, 'country-documents-submitted') +
        createDocumentList('Additional documents required', country.additional, 'country-documents-additional') +
      '</div>';

    var switchButton = item.querySelector('.country-switch');
    switchButton.addEventListener('click', function () {
      var isSelected = item.classList.toggle('is-selected');
      switchButton.setAttribute('aria-checked', String(isSelected));
      item.querySelector('.country-details').hidden = !isSelected;
    });

    return item;
  }

  countryData.forEach(function (country) {
    countryList.appendChild(renderCountry(country));
  });

  renderSignedInState(isSessionSignedIn());

  function updateStatusTime() {
    var now = new Date();
    var hours = now.getHours() % 12 || 12;
    var minutes = String(now.getMinutes()).padStart(2, '0');
    statusTime.textContent = hours + ':' + minutes;
  }

  updateStatusTime();
  window.setInterval(updateStatusTime, 1000);
})();
