// Popup script for Fish Timer extension settings

// Load saved settings
function loadSettings() {
    chrome.storage.sync.get({
        showClock: true,
        autoClear: false,
        fishAnimation: true
    }, function(items) {
        document.getElementById('showClock').checked = items.showClock;
        document.getElementById('autoClear').checked = items.autoClear;
        document.getElementById('fishAnimation').checked = items.fishAnimation;
    });
}

// Save settings
function saveSettings() {
    const settings = {
        showClock: document.getElementById('showClock').checked,
        autoClear: document.getElementById('autoClear').checked,
        fishAnimation: document.getElementById('fishAnimation').checked
    };
    
    chrome.storage.sync.set(settings, function() {
        console.log('Settings saved');
        
        // Notify sidepanel of settings update
        chrome.runtime.sendMessage({
            type: 'settings-updated',
            settings: settings
        });
    });
}

// Reset settings to default
function resetSettings() {
    document.getElementById('showClock').checked = true;
    document.getElementById('autoClear').checked = false;
    document.getElementById('fishAnimation').checked = true;
    
    saveSettings();
}

// Open side panel
function openSidePanel() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.sidePanel.open({
            windowId: tabs[0].windowId
        }).then(() => {
            window.close(); // Close popup after opening side panel
        }).catch((error) => {
            console.error('Error opening side panel:', error);
        });
    });
}

// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    
    // Add event listeners
    document.getElementById('showClock').addEventListener('change', saveSettings);
    document.getElementById('autoClear').addEventListener('change', saveSettings);
    document.getElementById('fishAnimation').addEventListener('change', saveSettings);
    
    document.getElementById('openSidePanel').addEventListener('click', openSidePanel);
    document.getElementById('resetSettings').addEventListener('click', resetSettings);
    
    console.log('Fish Timer popup initialized');
});