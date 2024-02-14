let floatingContainer;


// Request supermuteState from background on load
requestSuperMuteState();



// Listen for state updates from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateOverlay") {
        updateContainerVisibility(message.visible);
        updateContainer(message.audioMuted, message.videoMuted);
    }

    if (message.action === "updatePosition") {
        const { left, top } = message.position;
        if (floatingContainer) {
            floatingContainer.style.left = left;
            floatingContainer.style.top = top;
        }
    }
});



function requestSuperMuteState() {
    chrome.runtime.sendMessage({ from: "overlay", query: "getSuperMuteState"}, (response) => {
        if (response) {
            updateContainerVisibility(response.visible);
            updateContainer(response.audioMuted, response.videoMuted);

            chrome.storage.local.get(['Supermute_floatingContainerPos'], (result) => {
                if (result.Supermute_floatingContainerPos) {
                    const { left, top } = result.Supermute_floatingContainerPos;
                    floatingContainer.style.left = left;
                    floatingContainer.style.top = top;
                }
            });
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


    const dragDiv = document.createElement('div');
    dragDiv.style.width = '30%';
    dragDiv.style.height = '100%';
    dragDiv.style.display = 'flex';
    dragDiv.style.justifyContent = 'end';
    dragDiv.style.alignItems = 'center';
    toggleContainer.appendChild(dragDiv);  
    
    const gripIcon = document.createElement('img');
    gripIcon.id = 'super-mute-gripIcon';
    gripIcon.className = 'super-mute-grip';
    gripIcon.src = chrome.runtime.getURL('icons/grip-lines.svg');
    gripIcon.style.height = '0.8vw';
    dragDiv.appendChild(gripIcon);


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

    const seperationOne = document.createElement('img');
    seperationOne.style.width = '2px';
    seperationOne.style.height = '55%';
    seperationOne.style.backgroundColor = 'rgba(195, 198, 209, 0.5)';
    toggleContainer.appendChild(seperationOne)


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

    const seperationTwo = document.createElement('img');
    seperationTwo.style.width = '2px';
    seperationTwo.style.height = '55%';
    seperationTwo.style.backgroundColor = 'rgba(195, 198, 209, 0.5)';
    toggleContainer.appendChild(seperationTwo)

    const endCallDiv = document.createElement('div')
    endCallDiv.style.width = '100%';
    endCallDiv.style.height = '100%';
    endCallDiv.style.display = 'flex';
    endCallDiv.style.justifyContent = 'center';
    endCallDiv.style.alignItems = 'center';
    toggleContainer.appendChild(endCallDiv);

    const endCallToggle = document.createElement('img');
    endCallToggle.id = 'super-mute-endCallToggle';
    endCallToggle.className = 'super-mute-endCall';
    endCallToggle.src = chrome.runtime.getURL('icons/hang-up.png');
    endCallToggle.style.height = '1.6vw';
    endCallDiv.appendChild(endCallToggle);

    const seperationThree = document.createElement('img');
    seperationThree.style.width = '4px';
    seperationThree.style.height = '100%';
    toggleContainer.appendChild(seperationThree)


    // Initially hide the toggle container
    toggleContainer.style.visibility = 'hidden';


    micToggle.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "toggleMic" });
    });

    videoToggle.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "toggleVideo" });
    });

    endCallToggle.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "closeAllGoogleMeetTabs" });
    });


    // Event listener for hover effect
    floatingContainer.addEventListener('mouseenter', function() {
        floatingContainer.style.width = '9.5vw';
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

    enableDragging(floatingContainer)
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


function enableDragging(element) {
    let isDragging = false;
    let initialX, initialY;

    element.addEventListener('mousedown', (e) => {
        isDragging = true
        initialX = e.clientX - element.getBoundingClientRect().left;
        initialY = e.clientY - element.getBoundingClientRect().top;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (isDragging) {
            let newX = e.clientX - initialX;
            let newY = e.clientY - initialY;

            element.style.left = `${newX}px`;
            element.style.top = `${newY}px`;
        }
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        // Store the new position in chrome.storage
        const newPos = { left: element.style.left, top: element.style.top };
            chrome.storage.local.set({ 'Supermute_floatingContainerPos': newPos }, () => {
            console.log('Position updated');
        });

        // Broadcast the new position to all tabs
        chrome.runtime.sendMessage({ action: "updatePosition", position: newPos });
    }
}

