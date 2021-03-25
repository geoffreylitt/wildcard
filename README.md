# Wildcard

Wildcard is a platform that empowers anyone to build browser extensions and modify websites to meet their own specific needs.

Wildcard shows a simplified view of the data in a web page as a familiar table view. People can directly manipulate the table to sort/filter content, add annotations, and even use spreadsheet-style formulas to pull in data from other websites.

* [Documentation](https://geoffreylitt.github.io/wildcard)
* [Project homepage](https://www.geoffreylitt.com/wildcard/)
* [Research paper](https://www.geoffreylitt.com/wildcard/salon2020/) presented at the Convivial Computing Salon 2020

## Install Wildcard

Be aware: Wildcard is still pre-release software.

**The current master branch is stable, but missing a few important features
that have yet to be ported over from previous versions of the codebase: mainly filtering the table and formulas.**

To get an email when a full featured version is ready, [sign up for the email newsletter](https://tinyletter.com/wildcard-extension).

If you want to install Wildcard today, there are two options:

To use Wildcard with an existing library of supported websites, follow the [quick start instructions](https://geoffreylitt.github.io/wildcard/#/quickstart).

## Contribute

Follow the [dev env install instructions](https://geoffreylitt.github.io/wildcard/#/devenv).

To run the build watcher: `yarn run dev`

To run the extension in a new browser and auto-reload it when you update the code: `yarn run chrome` or `yarn run firefox`