let isFirefox = navigator.userAgent.indexOf("Firefox") != -1;

function onError(error) {
    console.error(`Error: ${error}`);
}


function listener(details) {
    let filter = browser.webRequest.filterResponseData(details.requestId);

    let data = [];
    filter.ondata = event =>
    {
        data.push(event.data);
        filter.write(event.data);
    };

    let handleEvent = async event =>
    {
        let blob = new Blob(data, {type: 'application/json'});
        let bstr = await blob.text();
        let obj = undefined;
        try
        {
            obj = JSON.parse(bstr);
        } catch
        {
            return;
        }
        browser.tabs.sendMessage(
            details.tabId,
            {
                url: details.url,
                data: obj
            }
        ).catch(onError)
    };

    filter.onstop = async event =>
        handleEvent(event).finally(() => filter.close());
}

if (isFirefox)
{
    browser.webRequest.onBeforeRequest.addListener(
        listener,
        {urls: ["<all_urls>"], types: ["main_frame"]},
        ["blocking"]
    );
}
