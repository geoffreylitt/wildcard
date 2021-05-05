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

const forwardToContentScripts = (request, sender, sendResponse) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs.length) {
      chrome.tabs.sendMessage(tabs[0].id, request);
    }
  });
}

const handlers = {
  getVisits: getVisits,
  getReadingTime: getReadingTime,
  deleteAdapter: forwardToContentScripts,
  saveAdapter: forwardToContentScripts,
  resetAdapter: forwardToContentScripts,
  editAdapter: forwardToContentScripts
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
  title: "Joker",
  id: "joker",
  type: "normal",
  contexts: ["page"],
  onclick: function () {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length) {
        // send message to active tab
        chrome.tabs.sendMessage(tabs[0].id, { command: "createAdapter" }, (response) => {
          if (response.error) {
            alert(response.error);
          }
        });
      }
    });
  }
});

// chrome.contextMenus.create({
//   title: "Wildcard",
//   id: "wildcard",
//   type: "normal",
//   contexts: ["page"]
// }, () => {
//   chrome.contextMenus.create({
//     title: "Create Adapter",
//     contexts: ["page"],
//     parentId: "wildcard",
//     onclick: function () {
//       chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         if (tabs && tabs.length) {
//           // send message to active tab
//           chrome.tabs.sendMessage(tabs[0].id, { command: "createAdapter" }, (response) => {
//             if (response.error) {
//               alert(response.error);
//             }
//           });
//         }
//       });
//     }
//   });
  // chrome.contextMenus.create({
  //   title: "Edit Adapter",
  //   contexts: ["page"],
  //   parentId: "wildcard",
  //   onclick: function () {
  //     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //       if (tabs && tabs.length) {
  //         // send message to active tab
  //         chrome.tabs.sendMessage(tabs[0].id, { command: "openCodeEditor" }, (response) => {
  //           if (response.error) {
  //             alert(response.error);
  //           }
  //         });
  //       }
  //     });
  //   }
  // });
  // chrome.contextMenus.create({
  //   title: "Open Options Page",
  //   contexts: ["page"],
  //   parentId: "wildcard",
  //   onclick: function () {
  //     chrome.runtime.openOptionsPage();
  //   }
  // });
//});