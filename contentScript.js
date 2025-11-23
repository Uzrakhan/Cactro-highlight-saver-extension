let selectedText = "";

document.addEventListener("mouseup", (e) => {
    const text = window.getSelection().toString().trim();
    if (text.length > 0) {
        selectedText = text;
        showSavePopup(e.pageX, e.pageY);
    }
});

function showSavePopup(x, y) {
  removeExistingPopup();

  const popup = document.createElement("div");
  popup.id = "highlightSaverPopup";
  popup.innerHTML = `<button id="saveHighlightBtn" style="pointer-events:auto; cursor:pointer;">Save Highlight?</button>`;
  
  Object.assign(popup.style, {
    position: "absolute",
    top: `${y}px`,
    left: `${x}px`,
    background: "white",
    padding: "8px",
    border: "1px solid gray",
    borderRadius: "6px",
    zIndex: "9999999",
    pointerEvents: "auto"
  });

  document.body.appendChild(popup);

  // Key change: adding mousedown instead of click
  document.getElementById("saveHighlightBtn").addEventListener("mousedown", (e) => {
    e.stopPropagation();
    console.log("Button clicked");
    saveHighlight();
  });
}



function saveHighlight() {
    if (!selectedText) return;

    chrome.storage.local.get({ highlights: [] }, (result) => {
        const newHighlight = {
            text: selectedText,
            url: window.location.href,
            date: new Date().toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            })
        };

        const updatedHighlights = [...result.highlights, newHighlight];

        chrome.storage.local.set({ highlights: updatedHighlights }, () => {
            showConfirmationMessage();
            removeExistingPopup();
        });
    });
}

function showConfirmationMessage() {
    const msg = document.createElement("div");
    msg.innerText = "✔ Highlight Saved!";
    msg.style.position = "fixed";
    msg.style.bottom = "20px";
    msg.style.right = "20px";
    msg.style.background = "#4CAF50";
    msg.style.color = "white";
    msg.style.padding = "10px 15px";
    msg.style.borderRadius = "6px";
    msg.style.zIndex = "9999";
    msg.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    document.body.appendChild(msg);

    setTimeout(() => msg.remove(), 2000);
}

function removeExistingPopup() {
    const existing = document.getElementById("highlightSaverPopup");
    if (existing) existing.remove();
}
