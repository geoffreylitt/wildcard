# Wildcard

A prototype that maps website data to a table, enabling end users to modify and reprogram the site. For more details, see the [project site](https://www.geoffreylitt.com/wildcard/).

[Sign up for the email newsletter](https://forms.gle/mpn1Hn8Ln7dmPo6T8) to get an email when the project is ready for beta users.

## To use Wildcard

🚧 This project is an unstable prototype and not ready for real users yet. Install at your own risk and expect breaking changes. 🚧

Clone this repo locally: `git clone git@github.com:geoffreylitt/wildcard.git`

[Follow these instructions](https://developer.chrome.com/getstarted) to install the cloned directory as an unpacked chrome extension.

To test whether it's working: try an [Airbnb search](https://www.airbnb.com/s/Miami/homes?checkin=2019-11-14&checkout=2019-11-17&adults=1&children=0&infants=0&place_id=ChIJEcHIDqKw2YgRZU-t3XHylv8&refinement_paths%5B%5D=%2Fhomes&search_type=section_navigation); the table should appear at the bottom and you should be able to sort by price.

## To develop Wildcard

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
