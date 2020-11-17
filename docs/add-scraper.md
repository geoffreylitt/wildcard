# Adding a site adapter

!> These are very preliminary docs. If you get stuck or run into questions/issues, file a Github issue on this repo or [reach out over email](mailto:glitt@mit.edu).

## Steps

To use a new website in Wildcard you need to write a "site adapter",
which is a bit of Javascript that scrapes data from a web page.

First, install a [development environment](https://geoffreylitt.github.io/wildcard/#/devenv)
and run `yarn run dev` to get changes automatically compiling.

1. Copy one of the existing site adapters in `src/site_adapters` as an example template.
2. Change the name of the adapter to your new adapter name.
3. Register the new copied adapter in `src/site_adapters/index.ts`.
4. Make changes to the copied adapter to make it work for your site. See if you can get a table of data to show up. Using the dev tools DOM inspector and adding `console.log` statements to your adapter might help you get through the scraping logic.

Here's [an example commit](https://github.com/geoffreylitt/wildcard/commit/42fbb748a809aa84b7f6927a9aac02376f5bb926) of adding a site adapter. Your commit should look something like this one.

## Video tutorial

Here's a 30 minute video tutorial of how to make a site adapter, in detail:

<div style="position: relative; padding-bottom: 80%; height: 0;"><iframe src="https://www.loom.com/embed/9553bb65ab264febb8276fb63ffaebb0" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>
