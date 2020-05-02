function onError(error) {
    console.error(`Error: ${error}`);
}

function listener(details) {
    if(navigator.userAgent.indexOf("Firefox") != -1 )
    {
        let filter = browser.webRequest.filterResponseData(details.requestId);

        let data = [];
        filter.ondata = event =>
        {
            data.push(event.data);
            filter.write(event.data);
        };

        filter.onstop = async event =>
        {
            let blob = new Blob(data, {type: 'application/json'});
            let bstr = await blob.text();
            let obj = undefined;
            try
            {
                obj = JSON.parse(bstr);
            } catch
            {

            }
            if (obj !== undefined)
            {
                browser.tabs.sendMessage(
                    details.tabId,
                    {
                        url: details.url,
                        data: obj
                    }
                ).catch(
                    onError
                )
            }
            filter.close();
        };
    }
}

if(navigator.userAgent.indexOf("Firefox") != -1 )
{
    browser.webRequest.onBeforeRequest.addListener(
        listener,
        {urls: ["<all_urls>"]},
        ["blocking"]
    );
}