'use strict';

import { urlExact, urlContains, extractNumber } from "../utils";
import { createDomScrapingAdapter } from "./domScrapingBase"

// special "adapter" for Wildcard Marketpalce to install only
export const WildcardMarketplace = createDomScrapingAdapter({
  name: "Wildcard Marketplace",
  enabled: () => urlContains("localhost:3000/adapter.html?aid="),
  attributes: [],
  scrapePage: () => {

    // add onclick to install button
    const btn = document.getElementById("install");
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const aid = urlParams.get('aid');

    btn.onclick = function () {
      chrome.runtime.sendMessage({ command: 'installAdapter', aid: aid });
    };

    // Do not return data, don't want to show Wildcard Table
    return [];
  }
});

export default WildcardMarketplace;