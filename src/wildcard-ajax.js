console.log("Testing");

//var isFirefox = typeof InstallTrigger !== 'undefined';

function logURL(requestDetails) {
    console.log("Loading: " + requestDetails.url);
}

//console.log(isFirefox);
if(true)
{
    browser.webRequest.onBeforeRequest.addListener(
        logURL,
        {urls: ["<all_urls>"]}
    );
}

