// popup.js
document.addEventListener('DOMContentLoaded', function() {
    var reloadButton = document.getElementById('reloadButton');
    reloadButton.addEventListener('click', function() {
        chrome.tabs.query({}, function(tabs) {
            tabs.forEach(function(tab) {
                chrome.tabs.reload(tab.id);
            });
        });
    });
});
