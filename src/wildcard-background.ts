// This is an extension "background script" which access certain Chrome APIs
// and makes them available to content scripts.
// For more info: https://stackoverflow.com/questions/14211771/accessing-chrome-history-from-javascript-in-an-extension-and-changing-the-page-b

'use strict';

chrome.runtime.onMessage.addListener(
  function(request, _sender, sendResponse) {
    if (request.command === "getVisits") {
      console.log("received request", request)
      chrome.history.getVisits({ url: request.url }, (visits) => {
        console.log("responding", visits)
        sendResponse({visits: visits});
      })
    }

    return true;
  });
