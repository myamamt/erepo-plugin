chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({"url": "list.html"});
});
