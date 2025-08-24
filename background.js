// Background script for Fish Timer - Swimming Fish Clock extension
// Handles sidePanel functionality

// Listen for extension icon clicks to open side panel
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Open the side panel for the current window
    await chrome.sidePanel.open({
      windowId: tab.windowId
    });
    console.log('Side panel opened for window:', tab.windowId);
  } catch (error) {
    console.error('Error opening side panel:', error);
  }
});

// Enable side panel for all tabs on installation
chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// Handle messages from sidepanel and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'sidepanel-ready') {
        console.log('Sidepanel is ready');
        sendResponse({ success: true });
    } else if (message.type === 'settings-updated') {
        // Forward settings update to all tabs with sidepanel
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, message).catch(() => {
                    // Ignore errors for tabs without content script
                });
            });
        });
        sendResponse({ success: true });
    }
    return true; // Keep message channel open for async response
});