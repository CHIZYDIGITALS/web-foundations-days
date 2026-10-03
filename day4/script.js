// Select DOM Elements
const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

// Function to update character & word counters and apply warning classes
function updateCounts() {
  const text = noteText.value;
  const length = text.length;

  // 1. Update Character Counter Text
  charCount.textContent = `${length} / 200 characters`;

  // 2. Manage Warning & Over Classes
  charCount.classList.remove("warning", "over");
  if (length > 200) {
    charCount.classList.add("over");
  } else if (length > 180) {
    charCount.classList.add("warning");
  }

  // 3. Update Word Counter Text
  const trimmedText = text.trim();
  const words = trimmedText ? trimmedText.split(/\s+/).length : 0;
  wordCount.textContent = `${words} words`;
}

// Function to clear textarea, counters, and localStorage draft
function clearAll() {
  noteText.value = "";
  localStorage.removeItem("day4_note_draft");
  updateCounts();
}

// Function to toggle dark mode theme and save preference
function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");

  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
  localStorage.setItem("day4_theme", isDark ? "dark" : "light");
}

// Event Listeners
noteText.addEventListener("input", () => {
  updateCounts();
  localStorage.setItem("day4_note_draft", noteText.value);
});

clearBtn.addEventListener("click", clearAll);

noteText.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearAll();
  }
});

themeToggle.addEventListener("click", toggleTheme);

// Initialize state on page load
window.addEventListener("DOMContentLoaded", () => {
  // Restore draft
  const savedDraft = localStorage.getItem("day4_note_draft");
  if (savedDraft) {
    noteText.value = savedDraft;
  }

  // Restore theme preference
  const savedTheme = localStorage.getItem("day4_theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light mode";
  } else {
    document.body.classList.remove("dark");
    themeToggle.textContent = "Dark mode";
  }

  // Initial counter calculation
  updateCounts();
});
