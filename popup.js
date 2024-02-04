document.getElementById('toggleMute').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // tabs[0] -> current active tab
        chrome.tabs.sendMessage(tabs[0].id, {action: "toggleMute"});
    });
});
