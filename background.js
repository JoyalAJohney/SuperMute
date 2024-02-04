
let googleMeetTabs = {}
let isSuperMuted = false;


// Listen for tab updates - Keep track of Google Meet
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        if (changeInfo.url.startsWith("https://meet.google.com/")) {
            googleMeetTabs[tabId] = changeInfo.url;
        } else {
            delete googleMeetTabs[tabId];
        }
    }
});


// Remove overlay - When Google Meet is closed
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    if (googleMeetTabs[tabId]) {
        delete googleMeetTabs[tabId];

        const isAnyMeetTabOpen = Object.values(googleMeetTabs).some(url => url.includes('meet.google.com'));
        if (!isAnyMeetTabOpen) {
            updateOverlay(false); 
        }
    }
});



// Respond to supermute state request or message request
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.query === "getSuperMuteState") {
        // From overlay script
        sendResponse({ isSuperMuted });
        return true; 
    } else if (request.from === "content") {
        // From content script
        const message = data.message;
        console.log(`Audio Muted: ${message.audioMuted}, Video Muted: ${message.videoMuted}`)
        
        isSuperMuted = message.audioMuted && message.videoMuted
        updateOverlay(isSuperMuted)
    }
});



// Update overlay across all tabs
function updateOverlay(isSuperMuted) {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            chrome.tabs.sendMessage(tab.id, { isSuperMuted });
        });
    });
}



// Inject overlay.js into all tabs on extension installation or update
chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                files: ['overlay.js']
            }).catch(err => console.log('Error injecting overlay script:', err));;
        });
    });
});


