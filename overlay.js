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

    Object.assign(floatingContainer.style, {
        left: '70px', bottom: '50px', zIndex: '9999',
        color: 'white', padding: '15px', position: 'fixed',
        borderRadius: '2em', backgroundColor: 'teal',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        fontSize: '14px', textAlign: 'center', fontFamily: 'Arial',
        lineHeight: '1.2', fontWeight: 'bold'
    });

    const text = document.createTextNode("⚡ You are supermuted");
    floatingContainer.appendChild(text);
    document.body.appendChild(floatingContainer);
}



function updateContainer(isSuperMuted) {
    ensureContainerExists();
    floatingContainer.style.display = isSuperMuted ? 'flex' : 'none';
}



function ensureContainerExists() {
    if (!floatingContainer && window.self === window.top) {
        createFloatingContainer();
    }
}





