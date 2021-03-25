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

There are two ways you can install the extension.

### Install in your main browser

Follow [the quick start instructions](quickstart.md) to install the built project directory in your browser.

This is nice if you want to use Wildcard while you actually browse the web.

But, it's not great for development, because it's hard to reload the extension automatically when you make changes. For dev, there's a better way:

### Run through web-ext in development

You can run a special browser which will automatically reload the extension when you make changes. Run `yarn run chrome` to start this up.

To test if you're able to make changes, try adding a `console.log` statement to `src/wildcard.tsx` and see if it shows up in your browser.

In general while developing you want to run `yarn run dev` and `yarn run chrome` in separate terminal tabs.

## Documentation

This documentation page is built with [Docsify](https://docsify.js.org/).

To edit docs, edit markdown files in `./docs`.

To view docs locally, run `yarn run docs`.

## To cut a release

* create a new folder named `wildcard-<version>`
* copy the current dist folder and manifest.json to the new folder
* zip the folder. Create a new release in the Github UI and upload the zip file.

(In the future we should automate this)
