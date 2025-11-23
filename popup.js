const container = document.getElementById("highlightsContainer");

chrome.storage.local.get({ highlights: [] }, (data) => {
  container.innerHTML = data.highlights.length
    ? data.highlights
        .map(
          (h, index) => `
      <div class="highlight-item" style="border:1px solid #ddd; padding:8px; margin-bottom:5px;">
        <p>"${h.text}"</p>
        <small><a href="${h.url}" target="_blank">${h.url}</a></small><br>
        <small>${h.date}</small><br>
        <button class="deleteBtn" data-index="${index}">Delete</button>
      </div>
    `
        )
        .join("")
    : "<p>No highlights saved yet.</p>";

  // Attach delete event to all buttons
  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      deleteHighlight(parseInt(index));
    });
  });
});

function deleteHighlight(index) {
  chrome.storage.local.get({ highlights: [] }, (data) => {
    const updated = data.highlights.filter((_, i) => i !== index);
    chrome.storage.local.set({ highlights: updated }, () => {
      location.reload(); // Refresh popup
    });
  });
}

document.getElementById("clearBtn").addEventListener("click", () => {
  chrome.storage.local.clear(() => location.reload());
});


document.getElementById("summaryBtn").addEventListener("click", () => {
  chrome.storage.local.get({ highlights: [] }, (data) => {
    if (data.highlights.length === 0) {
      document.getElementById("summaryOutput").innerText = "No highlights to summarize.";
      return;
    }

    const text = data.highlights.map(h => h.text).join(". ");

    // Step 1: Split into sentences
    const sentences = text.split(/(?<=[.!?])\s+/);

    // Step 2: Define stop words (ignored words)
    const stopWords = ["is", "are", "am", "the", "this", "that", "and", "or", "was"];

    // Step 3: Count word frequencies
    const wordFreq = {};
    text.toLowerCase().split(/\W+/).forEach(word => {
      if (!stopWords.includes(word) && word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Step 4: Score each sentence
    const scoredSentences = sentences.map(sentence => {
      let score = 0;
      for (const word in wordFreq) {
        if (sentence.toLowerCase().includes(word)) {
          score += wordFreq[word];
        }
      }
      return { sentence, score };
    });

    // Step 5: Sort and pick top 3 sentences
    const bestSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.sentence)
      .join(" ");

    document.getElementById("summaryOutput").innerText =
      "Summary:\n" + bestSentences;
  });
});


