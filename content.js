
console.log('Content script loaded on Google Meet');


function sendMessageToBackgroundWorker(message) {
    chrome.runtime.sendMessage({ from: "content", message })
}

function attachObserver(button) {
    let isAudioMuted = false;
    let isVideoMuted = false;

    const observer = new MutationObserver(() => {
        const audioButton = document.querySelector(buttonSelectors.audio);
        const videoButton = document.querySelector(buttonSelectors.video);

        if (audioButton) {
            isAudioMuted = audioButton.getAttribute('data-is-muted') === 'true';
        }

        if (videoButton) {
            isVideoMuted = videoButton.getAttribute('data-is-muted') === 'true';
        }

        sendMessageToBackgroundWorker({ audioMuted: isAudioMuted, videoMuted: isVideoMuted })
    });

    observer.observe(button, { attributes: true, subtree: true, childList: true });
}


const buttonSelectors = {
    audio: `div[aria-label*="microphone"][data-is-muted], button[aria-label*="microphone"][data-is-muted]`,
    video: `div[aria-label*="camera"][data-is-muted], button[aria-label*="camera"][data-is-muted]`
};


// Function to check nodes for audio or video buttons and attach obervers
function checkAndAttachObservers() {
    const audioButton = document.querySelector(buttonSelectors.audio)
    const videoButton = document.querySelector(buttonSelectors.video)

    if (audioButton && !audioButton.hasAttribute('supermute-observed')) {
        attachObserver(audioButton, 'audio')
        audioButton.setAttribute('supermute-observed', 'true');
    }

    if (videoButton && !videoButton.hasAttribute('supermute-observed')) {
        attachObserver(videoButton, 'video')
        videoButton.setAttribute('supermute-observed', 'true');
    }
}



function startDOMObserver() {
    const observer = new MutationObserver(() => {
        checkAndAttachObservers();
    });

    // Observe changes in the entire document
    observer.observe(document.body, { subtree: true, childList: true });
}

startDOMObserver();



// Toggle mute/unmute
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleMic") {
        const micButton = document.querySelector(buttonSelectors.audio);
        if (micButton) micButton.click();
    } else if (request.action === "toggleVideo") {
        const videoButton = document.querySelector(buttonSelectors.video);
        if (videoButton) videoButton.click();
    }
});

