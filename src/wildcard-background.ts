// This is an extension "background script" which access certain Chrome APIs
// and makes them available to content scripts.
// For more info: https://stackoverflow.com/questions/14211771/accessing-chrome-history-from-javascript-in-an-extension-and-changing-the-page-b

'use strict';

const getVisits = (request, sender, sendResponse) => {
  chrome.history.getVisits({ url: request.url }, (visits) => {
    sendResponse({visits: visits});
  })
}

const handlers = {
  getVisits: getVisits,
  readingTime: () => {}
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    let handler = handlers[request.command]

    if (handler) {
      handler.call(this, request, sender, sendResponse)
    }

    return true;
  });
