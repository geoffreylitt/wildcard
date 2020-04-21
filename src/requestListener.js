browser.runtime.onMessage.addListener(request => {
    console.log("Message from the background script:");
    console.log(request);
});