# Wildcard

Wildcard is a platform that empowers anyone to build browser extensions and modify websites to meet their own specific needs.

Wildcard shows a simplified view of the data in a web page as a familiar table view. People can directly manipulate the table to sort/filter content, add annotations, and even use spreadsheet-style formulas to pull in data from other websites.

For more details, see the [project site](https://www.geoffreylitt.com/wildcard/), or the [paper](https://www.geoffreylitt.com/wildcard/salon2020/) presented at the Convivial Computing Salon 2020.

To get an email when the project is ready for beta users, [sign up for the email newsletter](https://tinyletter.com/wildcard-extension)

## Install Wildcard

Be aware: Wildcard is still pre-release software.

The current master branch is stable, but missing a few important features
that have yet to be ported over from previous versions of the codebase: mainly filtering the table and formulas. We expect to add those features to master soon.

If you still want to install Wildcard, follow the [quick start instructions](https://geoffreylitt.github.io/wildcard/#/quickstart).

## Contribute to Wildcard

If you want to use Wildcard with a new website, you'll need to write a site adapter. More docs on this process are coming soon, but here's the super short version:

First, [set up a development environment](https://geoffreylitt.github.io/wildcard/#/devenv
).

Then:

1) Copy one of the existing site adapters in `src/site_adapters` as an example template.
2) Change the name of the adapter and modify it to work with your site.
3) Register the adapter in `src/site_adapters/index.ts`
4) See if you can get a table of data to show up

If you run into questions/issues, file a Github issue on this repo.
