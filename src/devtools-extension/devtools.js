chrome.devtools.network.onRequestFinished.addListener(
  (request) => {

    // if it's json, show the body
    if (request.response.status === 200 && request.response.content.mimeType === "application/json") {
      request.getContent((rawBody) => {
        let body = JSON.parse(rawBody)

        if (body.hasOwnProperty("explore_tabs") &&
            body["explore_tabs"][0].hasOwnProperty("sections")) {

          let listings = body["explore_tabs"][0]["sections"].flatMap(s => s.listings || [])

          if (listings.length > 0) {
            chrome.devtools.inspectedWindow.eval(
              `window.updateListings(${JSON.stringify(listings)})`
            )
          }
        }
      })
    }
  }
);

chrome.devtools.panels.create("My Panel",
    "MyPanelIcon.png",
    "panel.html",
    function(panel) { }
);