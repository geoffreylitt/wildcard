# Development environment setup

## Initial setup

To install Wildcard in a way that supports adding new site adapters,
or making other changes to the framework,
you'll need to set up the local development environment. Wildcard is built in Typescript and uses yarn and rollup for packages and bundling.

!> If you don't want to add new scrapers to Wildcard, you can follow the simpler [quick start](quickstart.md) instructions instead.

Clone the Github repo: `git clone git@github.com:geoffreylitt/wildcard.git`

Install dependencies :

* `yarn install` (or `npm install`)
* `yarn global add docsify`

Build the project: `yarn run dev`.  This will compile the Typescript project and create files in the `./dist` folder.

Now, follow [the quick start instructions](quickstart.md) to install the built project directory in your browser.

If you just want to use the extension, there's no more further steps.

If you want to add a site adapter or make other code changes,
keep reading:

## Making changes

When you want to make changes to the code, run: `yarn run dev`

This starts a watcher that compiles the project when any files change, and auto-updates the Chrome extension (see below for autoreload setup steps).

Compilation can take a few seconds. If a change isn't working, it might be that compilation didn't finish yet. (Improving compilation time is a todo)

To test if you're able to make changes, try adding a `console.log` statement to a site adapter file like `src/site_adapters/airbnb.ts` and see if it works.

### Extension auto-reloading

Reloading the extension manually on every code change can be quite annoying, so it's helpful to get it to autoreload on change. Chrome reloading is built in to this repo; follow these steps to activate it:

* Install the [Chrome Extension AutoReload](https://github.com/JeromeDane/chrome-extension-auto-reload) as an unpacked extension from source.
* From the `chrome://extensions` page, click Details -> Extension Options, and change the Reload Method to "Manage API".

Firefox reloading is possible through [this workflow](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/).

Sometimes these tools don't seem to work 100% reliably.
When in doubt, you can try manually reloading the extension
in the browser extension settings.

## Documentation

This documentation page is built with [Docsify](https://docsify.js.org/).

To edit docs, edit markdown files in `./docs`.

To view docs locally, run `yarn run docs`.

## To cut a release

* create a new folder named `wildcard-<version>`
* copy the current dist folder and manifest.json to the new folder
* zip the folder. Create a new release in the Github UI and upload the zip file.

(In the future we should automate this)
