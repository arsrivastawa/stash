// background.ts

// 1. Log the ID so you can copy-paste it from the Console directly (Peace of Mind)
console.log("MY EXTENSION ID:", chrome.runtime.id);

chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    
    // Debugging: Prove the message arrived
    console.log("Message received from Origin:", sender.origin);

    // 2. Remove wildcards. Use exact origins.
    const trustedOrigins = [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:8080",
      "http://localhost:8080",
    ];

    // 3. Use 'sender.origin' (e.g., "http://localhost:8080") instead of 'sender.url'
    if (sender.origin && trustedOrigins.includes(sender.origin)) {
      
      if (request.type === "SYNC_SESSION") {
        const { session } = request;
        
        console.log("Saving session...");

        chrome.storage.local.set({ session, timestamp: Date.now() }, () => {
          console.log("Session Saved!");
          sendResponse({ success: true });
        });
        
        return true; // Keep channel open
      }
    } else {
        console.log("Blocked message from untrusted origin:", sender.origin);
    }
  }
);