# SME Assistant Demo

This project contains two standalone HTML demos.

- `v1/` is the original presenter demo and includes the complete presentation sequence. It uses only `v1/assets` and `v1` pages.
- `v2/` is the independent English account-opening demo. It uses only `v2/assets` and its numbered pages.

## Author

- Author: aitest24678
- Repository: https://github.com/aitest24678/AppDemo

## Rights Notice

Copyright (c) 2026 aitest17042. All rights reserved.

This repository is published for demonstration and review purposes. No permission is granted to copy, redistribute, modify, rehost, or present this work as your own without prior written permission from the author.

## Disclaimer

This repository is an independent functionality demo created for demonstration and review purposes only. It is not an official product, publication, endorsement, or representation of HSBC or any other referenced brand.

Any third-party names, trademarks, logos, visual references, or other brand assets that may appear in this repository remain the property of their respective owners.

Any third-party images, illustrations, characters, audio, video, or other media, if present, are included solely for interface demonstration context and remain subject to the rights of their respective owners.

## Run Locally

Open `v1/__presenter-console.html` directly in a browser if you want the original standalone presenter control panel.

Open the relevant files under `v1/` to view the original presentation pages.

For the English account-opening demo, open `v2/01_account-country-selection.html` first, then use `v2/02_account-opening-start.html` and `v2/03_account-opening-complete.html`. Open `v2/04_presenter-console.html` to control that sequence.

The v1 flow scripts live under `v1/assets/js/`. The v2 account-opening flow data lives under `v2/assets/js/account-opening-*-en.js`; its country document data is in `v2/assets/js/account-country-selection.js`.

The v2 shared page configuration is in `v2/assets/js/app-setup.js`. It owns the shared brand, header labels, sign-in labels and composer placeholder used by each v2 display page.

No build step, package manager, or local server is required.
