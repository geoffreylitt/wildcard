# Quick start

These instructions are the simplest way to get the Wildcard extension
installed in your browser, in just a few minutes.

You'll be able to use Wildcard with any website that already has built-in support: Airbnb, Amazon, Hacker News, Instacart, Youtube, and more. See the [Examples Gallery](examples.md) for a full list of supported sites.

?> **Note to programmers:** If you know how to program in Javascript, you can write your own bits of scraper code to adapt Wildcard to new websites. If you're interested in doing that in the future, you should skip these steps and follow the slightly more complicated [Dev Install](devenv.md) instructions. (If you're not sure which way to go, you can always try this simple install first and then switch to the dev install later if needed.)

## Download latest release

Download the latest Wildcard release as a zip file from the [releases page](https://github.com/geoffreylitt/wildcard/releases). Unzip it to a folder on your computer.

## Install in your browser

**Chrome**: [Follow these instructions](https://developer.chrome.com/extensions/getstarted#manifest) to install the directory as an unpacked Chrome extension.

**Edge**: [Follow these instructions](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/getting-started/part1-simple-extension#run-your-extension-locally-in-your-browser-while-developing-it-side-loading) to install the directory as an unpacked Edge extension.

**Firefox**: [Follow these instructions](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/) to install the manifest.json file as a temporary Firefox extension.
Note: You may need to unblock trackers in your Firefox preferences because Wildcard stores data in your browser’s local storage for persistence of changes across page loads.

Wildcard is most useful when you enable it for all websites.
It'll only activate if there's actually a site adapter
available for that website.
If you want, you can also change the extension settings in your browser
to only activate it on certain sites, or when you click the icon.

## Test it out!

Navigate to [Hacker News](https://news.ycombinator.com/).

You should see a button in the bottom right corner
prompting you to "Open Wildcard Table". When you click it, you should see a table showing the data in Hacker News.

Give it a spin:

* Try sorting the page by one of the columns. When you refresh, it'll still be sorted.
* Right click a column header and click "insert new column" to add a new column. Type in some text, and the corresponding article will be annotated in the page.

!> If something doesn't work, it's probably a bug in the beta --
please [file a Github issue](https://github.com/geoffreylitt/wildcard/issues) or [email me](mailto:glitt@mit.edu).

## Explore

To get inspiration for what to do with Wildcard,
check out some of the other supported sites and use cases
in the [Example gallery](examples.md).

