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

  if (!countryList || !statusTime) {
    return;
  }

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

  function updateStatusTime() {
    var now = new Date();
    var hours = now.getHours() % 12 || 12;
    var minutes = String(now.getMinutes()).padStart(2, '0');
    statusTime.textContent = hours + ':' + minutes;
  }

  updateStatusTime();
  window.setInterval(updateStatusTime, 1000);
})();
