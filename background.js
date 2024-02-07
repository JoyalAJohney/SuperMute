

let googleMeetTabs = {} // Tracks the state of each Google Meet tab
let isAnyAudioMuted = false
let isAnyVideoMuted = false


// Update the global mute state and broadcast it to all tabs
function updateGlobalMuteState() {
    isAnyAudioMuted = Object.values(googleMeetTabs).some(tab => tab.audioMuted);
    isAnyVideoMuted = Object.values(googleMeetTabs).some(tab => tab.videoMuted);

    console.log('isAnyAudioMuted: ', isAnyAudioMuted)
    console.log('isAnyVideoMuted: ', isAnyVideoMuted)
    console.log('googleMeetTabs: ', googleMeetTabs)

    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            chrome.tabs.sendMessage(tab.id, { 
                action: "updateOverlay", 
                audioMuted: isAnyAudioMuted, 
                videoMuted: isAnyVideoMuted,
                visible: Object.keys(googleMeetTabs).length > 0 // Overlay is visible if any Google Meet tab is open
            });
        });
    });
}


// Listen for tab updates to track Google Meet sessions
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && tab.url.startsWith("https://meet.google.com/")) {
        // Mark the tab as a Google Meet session
        googleMeetTabs[tabId] = { audioMuted: false, videoMuted: false };
    } else if (googleMeetTabs[tabId]) {
        // Tab was a Google Meet session but has navigated away
        delete googleMeetTabs[tabId]
    }
    updateGlobalMuteState();
});



// Respond to (State request) from other tabs or (Update State) from Google Meet
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    if (request.from === "overlay") {
        if (request.query === "getSuperMuteState") {
            sendResponse({ 
                action: "updateOverlay", 
                audioMuted: isAnyAudioMuted, 
                videoMuted: isAnyVideoMuted,
                visible: Object.keys(googleMeetTabs).length > 0 
            })
            return true;
        } 
    } 
    
    if (request.from === "content" && sender.tab && googleMeetTabs[sender.tab.id]) {
        // State update from a Google Meet tab
        console.log('request from Meet session: ', request)
        const { audioMuted, videoMuted } = request.message;
        googleMeetTabs[sender.tab.id] = { audioMuted, videoMuted };
        console.log(`Audio Muted: ${audioMuted}, Video Muted: ${videoMuted}`);
        
        updateGlobalMuteState(); // Reflect this change in all tabs
    }
});



// Handle Google Meet tab closures
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    if (googleMeetTabs[tabId]) {
        delete googleMeetTabs[tabId]; // Remove the closed Google Meet tab from tracking
        updateGlobalMuteState(); // Reflect this change in all tabs
    }
});



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


// Listens for Mic/Video toggle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleMic" || request.action === "toggleVideo") {
        console.log('Toggle received: ', request.action)
        chrome.tabs.query({ url: "*://meet.google.com/*" }, (tabs) => {
            tabs.forEach((tab) => {
                chrome.tabs.sendMessage(tab.id, request);
            });
        });
    }
});