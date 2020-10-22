// This is an extension "background script" which access certain Chrome APIs
// and makes them available to content scripts.
// For more info: https://stackoverflow.com/questions/14211771/accessing-chrome-history-from-javascript-in-an-extension-and-changing-the-page-b

'use strict';

window['state'] = {};

// to add functionality only available in background scripts,
// add a message handler to this list

let fetchWithTimeout: any = (url, options, timeout) => {
  return new Promise((resolve, reject) => {
    fetch(url, options).then(resolve, reject);

    if (timeout) {
      const e = new Error("Connection timed out");
      setTimeout(reject, timeout, e);
    }
  });
}

const getVisits = (request, sender, sendResponse) => {
  chrome.history.getVisits({ url: request.url }, (visits) => {
    sendResponse({ visits: visits });
  })
}

const getReadingTime = (request, sender, sendResponse) => {
  const apiUrl = `https://klopets.com/readtime/?url=${request.url}&json`
  fetchWithTimeout(apiUrl, {}, 5000)
    .then(r => r.json())
    .catch(err => sendResponse({ error: "couldn't fetch read time" }))
    .then(result => {
      console.log("result", result)
      if (result.seconds) {
        sendResponse({ seconds: result.seconds })
      } else {
        sendResponse({ error: "couldn't fetch read time" })
      }
    })
}

const handlers = {
  getVisits: getVisits,
  getReadingTime: getReadingTime,
  generateScraper: (request, sender, sendResponse) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length) {
          chrome.tabs.sendMessage(tabs[0].id, request, (response) => {
            if (response) {
              window['state'].endUserScraper = response;
              chrome.runtime.openOptionsPage();
            } else {
              sendResponse({ error: 'Error generating scraper config' });
            }
          });
        }
    });
  },
  installAdapter: (request, sender, sendResponse) => {
    // alert("Got install command, aid=" + request.aid);

    // chrome.tabs.create({
    //   active: true,
    //   url:  'ask.html?aid=' + request.aid
    // }, null);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length) {
        chrome.tabs.update(tabs[0].id, {url: 'ask.html?aid=' + request.aid});
      }
    });

  }
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    let handler = handlers[request.command]

    if (handler) {
      handler.call(this, request, sender, sendResponse)
    }

    return true;
  });

chrome.contextMenus.create({
  title: "Wildcard: Edit Adapter",
  contexts: ["page"],
  onclick: function () {

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length) {
        // send message to active tab
        chrome.tabs.sendMessage(tabs[0].id, { command: 'openCodeEditor' }, (response) => {
          if (response.error) {
            alert(response.error);
          }
        });
      }
    });
  }
});