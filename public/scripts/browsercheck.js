// browser-check.js

// Add CSS styles to the document head
const styles = `
    /* Styles for the browser compatibility overlay */
    .browser-check-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }
    
    /* Styles for the browser compatibility notice */
    .browser-check-notice {
        background: #f3f1ea;
        padding: 2em;
        border-radius: 8px;
        border: 2px solid black;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        max-width: 500px;
        width: 90%;
        position: relative;
    }
    
    /* Styles for the title of the browser compatibility notice */
    .browser-check-title {
        color: #dd5757;
        margin: 0 0 1em 0;
        font-size: 1.5em;
        font-weight: bold;
    }
    
    /* Styles for the content of the browser compatibility notice */
    .browser-check-content {
        margin-bottom: 1.5em;
        line-height: 1.5;
    }
    
    /* Styles for the list of supported browsers */
    .browser-check-list {
        margin: 1em 0;
        padding-left: 2em;
    }
    
    /* Styles for the continue button */
    .browser-check-button {
        background: #ac8968;
        color: #f3f1ea;
        border: none;
        padding: 0.75em 1.5em;
        border: 2px solid black;
        border-radius: 17px;
        cursor: pointer;
        font-size: 1em;
        transition: background 0.2s;
    }
    
    /* Styles for the hover effect on the continue button */
    .browser-check-button:hover {
        background: rgba(164, 217, 167, 0.7);
        border: 2px solid #213f22;
        color: #213f22;
    }
`;

// Create and inject stylesheet
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Function to check browser compatibility
function checkBrowserCompatibility() {
    // Get user agent string
    const ua = navigator.userAgent.toLowerCase();

    // Check if mobile device
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(ua);

    // Detect browser
    const isChrome = /chrome/.test(ua) && !/edg/.test(ua);
    const isEdge = /edg/.test(ua);
    const isOpera = /opr/.test(ua) || /opera/.test(ua);

    // Define supported browsers
    const supportedDesktop = (isChrome || isEdge || isOpera) && !isMobile;

    // Show warning if browser is not supported
    if (!supportedDesktop) {
        showNotice();
    }
}

// Function to display the browser compatibility notice
function showNotice() {
    // Create overlay element
    const overlay = document.createElement("div");
    overlay.className = "browser-check-overlay";

    // Create notice element
    const notice = document.createElement("div");
    notice.className = "browser-check-notice";

    // Set content for the notice
    const content = `
        <h2 class="browser-check-title">⚠️ Some features may not be available in this browser</h2>
        <div class="browser-check-content">
            <p>This website works best on a <span style='text-decoration:underline;'>desktop</span>, with the following browsers:</p>
            
            <ul class="browser-check-list">
                <li>Google Chrome</li>
                <li>Microsoft Edge</li>
                <li>Opera</li>
            </ul>
            
            <p>Please switch to one of these supported browsers on desktop, for the best experience with all available features.</p>
        </div>
        <button class="browser-check-button">Continue Anyway</button>
    `;

    notice.innerHTML = content;

    // Add click handler to close button
    notice
        .querySelector(".browser-check-button")
        .addEventListener("click", () => {
            overlay.remove();
        });

    // Add notice to page
    overlay.appendChild(notice);
    document.body.appendChild(overlay);
}

// Run check when page loads
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkBrowserCompatibility);
} else {
    checkBrowserCompatibility();
}
