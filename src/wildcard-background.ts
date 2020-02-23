// This is an extension "background script" which access certain Chrome APIs
// and makes them available to content scripts.
// For more info: https://stackoverflow.com/questions/14211771/accessing-chrome-history-from-javascript-in-an-extension-and-changing-the-page-b

'use strict';

// to add functionality only available in background scripts,
// add a message handler to this list

const getVisits = (request, sender, sendResponse) => {
  chrome.history.getVisits({ url: request.url }, (visits) => {
    sendResponse({visits: visits});
  })
}

const getReadingTime = (request, sender, sendResponse) => {
  const apiUrl= `https://klopets.com/readtime/?url=${request.url}&json`
  fetch(apiUrl).then(r => r.json()).then(result => {
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
  getReadingTime: getReadingTime
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    let handler = handlers[request.command]

    if (handler) {
      handler.call(this, request, sender, sendResponse)
    }

    return true;
  });
