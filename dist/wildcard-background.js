(function () {
  'use strict';

  const global = window;

  // This is an extension "background script" which access certain Chrome APIs
  // to add functionality only available in background scripts,
  // add a message handler to this list
  var fetchWithTimeout = function (url, options, timeout) {
      return new Promise(function (resolve, reject) {
          fetch(url, options).then(resolve, reject);
          if (timeout) {
              var e = new Error("Connection timed out");
              setTimeout(reject, timeout, e);
          }
      });
  };
  var getVisits = function (request, sender, sendResponse) {
      chrome.history.getVisits({ url: request.url }, function (visits) {
          sendResponse({ visits: visits });
      });
  };
  var getReadingTime = function (request, sender, sendResponse) {
      var apiUrl = "https://klopets.com/readtime/?url=" + request.url + "&json";
      fetchWithTimeout(apiUrl, {}, 5000)
          .then(function (r) { return r.json(); })["catch"](function (err) { return sendResponse({ error: "couldn't fetch read time" }); })
          .then(function (result) {
          console.log("result", result);
          if (result.seconds) {
              sendResponse({ seconds: result.seconds });
          }
          else {
              sendResponse({ error: "couldn't fetch read time" });
          }
      });
  };
  var handlers = {
      getVisits: getVisits,
      getReadingTime: getReadingTime
  };
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      var handler = handlers[request.command];
      if (handler) {
          handler.call(this, request, sender, sendResponse);
      }
      return true;
  });

}());
