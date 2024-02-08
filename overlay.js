let floatingContainer;


// Request supermuteState from background on load
requestSuperMuteState();



// Listen for state updates from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateOverlay") {
        updateContainerVisibility(message.visible);
        updateContainer(message.audioMuted, message.videoMuted);
    }
});



function requestSuperMuteState() {
    chrome.runtime.sendMessage({ from: "overlay", query: "getSuperMuteState"}, (response) => {
        if (response) {
            updateContainerVisibility(response.visible);
            updateContainer(response.audioMuted, response.videoMuted);
        }
    });
}

function updateContainerVisibility(visible) {
    if (!floatingContainer) createFloatingContainer();
    floatingContainer.style.display = visible ? 'flex' : 'none';
}


function createFloatingContainer() {

    floatingContainer = document.createElement('div');
    floatingContainer.className = 'super-mute-floating-container';
    document.body.appendChild(floatingContainer);

    // Set initial styles for the container
    Object.assign(floatingContainer.style, {
        width: '2.8vw',
        height: '2.8vw',
        backgroundColor: 'white',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        bottom: '3vw',
        left: '3vw',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'width 0.4s ease, border-radius 0.3s ease',
        zIndex: '10000',
    });

    // Create the icon span
    const icon = document.createElement('span');
    icon.className = 'super-mute-icon';
    icon.textContent = '⚡';
    icon.style.fontSize = '1.4vw';
    icon.style.color = 'transparent';
    icon.style.textShadow = '0 0 0 teal'
    icon.style.transition = 'opacity 0.2s ease';
    icon.style.zIndex = '2';
    floatingContainer.appendChild(icon);



    // Create a container for toggle icons (mic and video)
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'super-mute-toggle-icon';
    toggleContainer.style.position = 'absolute';
    toggleContainer.style.width = '100%';
    toggleContainer.style.height = '100%';
    toggleContainer.style.display = 'flex';
    toggleContainer.style.justifyContent = 'space-evenly';
    toggleContainer.style.alignItems = 'center';
    floatingContainer.appendChild(toggleContainer);


    const micDiv = document.createElement('div');
    micDiv.style.width = '100%';
    micDiv.style.height = '100%';
    micDiv.style.display = 'flex';
    micDiv.style.justifyContent = 'center';
    micDiv.style.alignItems = 'center';
    toggleContainer.appendChild(micDiv);

    const micToggle = document.createElement('img');
    micToggle.id = 'super-mute-micToggle';
    micToggle.className = 'super-mute-mic';
    micToggle.src = chrome.runtime.getURL('icons/microphone-solid.svg');
    micToggle.style.height = '1.1vw';
    micDiv.appendChild(micToggle);

    const seperation = document.createElement('img');
    seperation.style.width = '2px';
    seperation.style.height = '55%';
    seperation.style.backgroundColor = 'rgba(195, 198, 209, 0.5)';
    toggleContainer.appendChild(seperation)


    const videoDiv = document.createElement('div')
    videoDiv.style.width = '100%';
    videoDiv.style.height = '100%';
    videoDiv.style.display = 'flex';
    videoDiv.style.justifyContent = 'center';
    videoDiv.style.alignItems = 'center';
    toggleContainer.appendChild(videoDiv);

    const videoToggle = document.createElement('img');
    videoToggle.id = 'super-mute-videoToggle';
    videoToggle.className = 'super-mute-video';
    videoToggle.src = chrome.runtime.getURL('icons/video-solid.svg');
    videoToggle.style.height = '1.1vw';
    videoDiv.appendChild(videoToggle);


    // Initially hide the toggle container
    toggleContainer.style.visibility = 'hidden';


    micToggle.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "toggleMic" });
    });

    videoToggle.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "toggleVideo" });
    });


    // Event listener for hover effect
    floatingContainer.addEventListener('mouseenter', function() {
        floatingContainer.style.width = '6.3vw';
        floatingContainer.style.borderRadius = '50px';
        icon.style.visibility = 'hidden'; // Hide the ⚡ icon
        toggleContainer.style.visibility = 'visible'; // Show the mic and video icons
    });

    floatingContainer.addEventListener('mouseleave', function() {
        floatingContainer.style.width = '3vw';
        floatingContainer.style.borderRadius = '50%';
        icon.style.visibility = 'visible'; // Show the ⚡ icon
        toggleContainer.style.visibility = 'hidden'; // Hide the mic and video icons
    });


    // Initially hide the container
    floatingContainer.style.display = 'none';
}


function updateContainer(audioMuted, videoMuted) {
    ensureContainerExists();
    const micIcon = document.querySelector('.super-mute-mic');
    const videoIcon = document.querySelector('.super-mute-video');

    if (micIcon) {
        micIcon.src = audioMuted ? 
            chrome.runtime.getURL('icons/microphone-slash-solid.svg'): 
            chrome.runtime.getURL('icons/microphone-solid.svg')
    } 
    if (videoIcon) {
        videoIcon.src = videoMuted ? 
            chrome.runtime.getURL('icons/video-slash-solid.svg') :
            chrome.runtime.getURL('icons/video-solid.svg')
    } 
}



function ensureContainerExists() {
    if (!floatingContainer && window.self === window.top) {
        createFloatingContainer();
    }
}

