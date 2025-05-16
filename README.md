# ING CSV Helper

## Overview

**ING CSV Helper** is a lightweight Chrome extension that injects an **Export CSV** button directly into the ING Germany online banking transaction page. With a single click, it automatically does the following steps:

1. Select the last 12 months
2. Apply the filter  
3. Open the export modal  
4. Choose **CSV (Excel)** format  
5. Start the download  

No more manual navigation—just instant CSV export of your recent transactions.

## Installation

To build and load the extension locally, you only need Node.js and npm:

```bash
# Clone the repository
git clone https://github.com/lennartmoeller/ing-csv-helper.git
cd ing-csv-helper

# Install dependencies
npm install

# Build the extension
npm run build
```

## Quick Start

1. After building (see **Installation**), open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (toggle in the top right).
3. Click **Load unpacked** and select the **project’s root folder**.
4. The **ING CSV Helper** should now appear in your extensions list.
5. Go to your ING transaction page and click the **Export CSV** button in the bottom-right corner.
