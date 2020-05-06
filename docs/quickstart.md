# Quick start

These instructions are the simplest way to get the Wildcard extension
installed in your browser, in just a few minutes.

You'll be able to use Wildcard with any website that already has built-in support: Airbnb, Amazon, Hacker News, Instacart, Youtube, and more. See the [Examples Gallery](examples.md) for a full list of supported sites.

?> **Note to programmers:** If you know how to program in Javascript, you can write your own bits of scraper code to adapt Wildcard to new websites. If you're interested in doing that in the future, you should skip these steps and follow the slightly more complicated [Dev Install](devenv.md) instructions. (If you're not sure which way to go, you can always try this simple install first and then switch to the dev install later if needed.)

## 1. Download latest release

Download the latest Wildcard release as a zip file from the [releases page](https://github.com/geoffreylitt/wildcard/releases). Unzip it to a folder on your computer.

## 2. Install in your browser

**Chrome**: To install the directory as an unpacked Chrome extension:
    1. Open the Extension Management page by navigating to **chrome://extensions.**
    2. Enable Developer Mode by clicking the toggle switch next to Developer mode.
    3. Click the LOAD UNPACKED button and select the **manifest.json** directory.

**Edge**: To install the directory as an unpacked Edge extension:
    1. Click on the three dots at the top of your browser. 
    2. Next, choose **Extensions** from the context menu as shown below.
    3. When you are on the **Extensions** page, enable the **Developer mode** by enabling the toggle at the bottom left of the page.
    4. Choose the **Load Unpacked option**. This prompts you for a directory where you have your Extension assets. Open the wildcard directory and select the **manifest.json** extension. 
    5. After you install your Extension, you may update it by clicking on the Reload button under your Extension listing.

**Firefox**: To install the manifest.json file as a temporary Firefox extension.
    1. Open Firefox
    2. Enter “about:debugging” in the URL bar
    3. Click “This Firefox”
    4. Click “Load Temporary Add-on”
    5. Open the wildcard directory and select the **manifest.json** file.

Note: You may need to unblock trackers in your Firefox preferences because Wildcard stores data in your browser’s local storage for persistence of changes across page loads.

Wildcard is most useful when you enable it for all websites.
It'll only activate if there's actually a site adapter
available for that website.
If you want, you can also change the extension settings in your browser
to only activate it on certain sites, or when you click the icon.

## 3. Test it out!

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

