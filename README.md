# Wildcard

Wildcard is a platform that empowers anyone to build browser extensions and modify websites to meet their own specific needs.

Wildcard shows a simplified view of the data in a web page as a familiar table view. People can directly manipulate the table to sort/filter content, add annotations, and even use spreadsheet-style formulas to pull in data from other websites.

For more details, see the [project site](https://www.geoffreylitt.com/wildcard/), or the [paper](https://www.geoffreylitt.com/wildcard/salon2020/) presented at the Convivial Computing Salon 2020.

[Sign up for the email newsletter](https://forms.gle/mpn1Hn8Ln7dmPo6T8) to get an email when the project is ready for beta users.

## Install Wildcard

Note: this project is in alpha status. Install at your own risk and don't be surprised by bugs and breaking changes. 🚧

First, download the latest release from the [releases page](https://github.com/geoffreylitt/wildcard/releases).

Then, unzip the directory and install it in your browser:

**Chrome**: [Follow these instructions](https://developer.chrome.com/extensions/getstarted#manifest) to install the directory as an unpacked Chrome extension.

**Edge**: [Follow these instructions](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/getting-started/part1-simple-extension#run-your-extension-locally-in-your-browser-while-developing-it-side-loading) to install the directory as an unpacked Edge extension.

**Firefox**: [Follow these instructions](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/) to install the manifest.json file as a temporary Firefox extension.
Note: You may need to unblock trackers in your Firefox preferences because Wildcard stores data in your browser’s local storage for persistence of changes across page loads.

To test whether it's working: try an [Airbnb search](https://www.airbnb.com/s/Miami/homes?checkin=2019-11-14&checkout=2019-11-17&adults=1&children=0&infants=0&place_id=ChIJEcHIDqKw2YgRZU-t3XHylv8&refinement_paths%5B%5D=%2Fhomes&search_type=section_navigation); the table should appear at the bottom and you should be able to sort by price. (You may need to refresh the page once to get the table to appear)

## Contribute to Wildcard

If you want to make changes to Wildcard, here are instructions for setting up Wildcard's development environment locally.

Wildcard is built in Typescript and uses yarn and rollup for packages and bundling.

[View code documentation on Github](https://geoffreylitt.github.io/wildcard/)

### Initial setup

Install dependencies:

* install [yarn](https://legacy.yarnpkg.com/en/docs/install/#mac-stable) and [rollup](https://rollupjs.org/guide/en/)
* `yarn install`
* `yarn global add concurrently`

Follow these steps to get code changes to automatically update the extension:

* Install the [Chrome Extension AutoReload](https://github.com/JeromeDane/chrome-extension-auto-reload) as an unpacked extension from source.
* From the `chrome://extensions` page, click Details -> Extension Options, and change the Reload Method to "Manage API".

### Dev workflow

Every time you develop, follow these steps.

* `yarn run dev` to start a watcher that compiles the project and updates the Chrome extension
* Compilation can take a few seconds. If a change isn't working, it might be that compilation didn't finish yet. (Improving compilation time is a todo; I think it's mostly time spent compiling Handsontable)

To test if you're able to make changes, try adding a `console.log` statement to a site adapter file like `src/site_adapters/airbnb.ts` and see if it works.

### Documentation

Documentation for the Wildcard Core is built with [Typedoc](http://typedoc.org/).
It has helpful information for e.g. building site adapters.

* [View docs online](https://geoffreylitt.github.io/wildcard/) (hosted on Github pages from the docs directory here)
* To regenerate docs from the code, run `yarn docs`.
* To view docs locally, open `docs/index.html`.

### File layout

`src/core.ts` contains the core framework.

Site adapters are in `src/site_adapters`. Cell editors are in `src/cell_editors`.

`src/wildcard.ts` is the final file that pulls everything together and
injects Wildcard into the page.

### To cut a release

* create a new folder named `wildcard-<version>`
* copy the current dist folder and manifest.json to the new folder
* zip the folder. Create a new release in the Github UI and upload the zip file.

(In the future we should automate this)


