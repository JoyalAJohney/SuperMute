let floatingContainer;


// Request supermuteState from background on load
requestSuperMuteState();



// Listen for supermute state updates from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.isSuperMuted !== undefined) {
        console.log('Super mute value: ', message.isSuperMuted)
        updateContainer(message.isSuperMuted)
    }
});




function requestSuperMuteState() {
    chrome.runtime.sendMessage({query: "getSuperMuteState"}, response => {
        if (response && response.isSuperMuted !== undefined) {
            updateContainer(response.isSuperMuted);
        }
    });
}



// SuperMuted container
function createFloatingContainer() {

    floatingContainer = document.createElement('div');
    floatingContainer.className = 'floating-container';
    document.body.appendChild(floatingContainer);

    // Set initial styles for the container
    Object.assign(floatingContainer.style, {
        width: '50px',
        height: '50px',
        backgroundColor: 'teal',
        borderRadius: '50%',
        display: 'flex',
        opacity: '0',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        bottom: '50px',
        left: '50px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'width 0.4s ease, border-radius 0.3s ease, opacity 0.3s ease',
        zIndex: '1000' // Ensure it's above other content
    });

    // Create the icon span
    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.textContent = '⚡';
    icon.style.fontSize = '24px';
    icon.style.opacity = '1';
    icon.style.transition = 'opacity 0.2s ease';
    icon.style.zIndex = '1';
    floatingContainer.appendChild(icon);

    // Event listener for hover effect
    floatingContainer.addEventListener('mouseenter', function() {
        floatingContainer.style.width = '200px';
        floatingContainer.style.borderRadius = '50px';
        icon.style.opacity = '0';
    });

    floatingContainer.addEventListener('mouseleave', function() {
        floatingContainer.style.width = '50px';
        floatingContainer.style.borderRadius = '50%';
        icon.style.opacity = '1';
    });


    // Create the text element on hover
    const text = document.createElement('div');
    text.textContent = '⚡ You are supermuted';
    text.style.position = 'absolute';
    text.style.whiteSpace = 'nowrap';
    text.style.color = 'white';
    text.style.fontSize = '14px';
    text.style.opacity = '0';
    text.style.transition = 'opacity 0.4s ease';
    text.style.pointerEvents = 'none';
    text.style.display = 'flex';
    text.style.alignItems = 'center';
    text.style.justifyContent = 'center';
    text.style.height = '100%';
    text.style.width = '100%';
    floatingContainer.appendChild(text);

    // Show/hide text on hover
    floatingContainer.addEventListener('mouseenter', function() {
        text.style.opacity = '1';
    });

    floatingContainer.addEventListener('mouseleave', function() {
        text.style.opacity = '0';
    });
}


function updateContainer(isSuperMuted) {
    ensureContainerExists();
    if (isSuperMuted) {
        floatingContainer.style.opacity = '1'; 
        floatingContainer.style.pointerEvents = 'auto'; 
    } else {
        floatingContainer.style.opacity = '0'; 
        floatingContainer.style.pointerEvents = 'none'; 
    }
}



function ensureContainerExists() {
    if (!floatingContainer && window.self === window.top) {
        createFloatingContainer();
    }
}





