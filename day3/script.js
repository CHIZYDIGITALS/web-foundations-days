// Starting Data
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

// 1. searchNotes(word)
function searchNotes(word) {
  const searchTerm = word.toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(searchTerm));
}

// 2. longestNote()
function longestNote() {
  if (notes.length === 0) return null;
  return notes.reduce((longest, current) =>
    current.text.length > longest.text.length ? current : longest,
  );
}

// 3. countByCategory()
function countByCategory() {
  const counts = {};
  for (const note of notes) {
    counts[note.category] = (counts[note.category] || 0) + 1;
  }
  return counts;
}

// 4. getSummary()
function getSummary() {
  const total = notes.length;
  const counts = countByCategory();
  const label = total === 1 ? "note" : "notes";

  const categoriesText = Object.entries(counts)
    .map(([cat, num]) => `${num} ${cat}`)
    .join(", ");

  return `${total} ${label}: ${categoriesText}.`;
}

// 5. isDuplicate(text)
function isDuplicate(text) {
  const cleanText = text.trim().toLowerCase();
  return notes.some((note) => note.text.trim().toLowerCase() === cleanText);
}

// 6. addNote(text, category)
function addNote(text, category) {
  const trimmedText = text.trim();
  const validCategories = ["personal", "work", "study"];

  if (trimmedText.length < 1 || trimmedText.length > 200) {
    console.log(
      "Failed to add note: Length must be between 1 and 200 characters.",
    );
    return false;
  }

  if (!validCategories.includes(category)) {
    console.log(
      `Failed to add note: Category must be one of ${validCategories.join(", ")}.`,
    );
    return false;
  }

  if (isDuplicate(trimmedText)) {
    console.log("Failed to add note: Note already exists.");
    return false;
  }

  const newId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) + 1 : 1;
  notes.push({ id: newId, text: trimmedText, category });
  console.log("Note added successfully.");
  return true;
}

// ==========================================
// TESTING ALL FUNCTIONS (CONSOLE LOGS)
// ==========================================

console.log("--- 1. searchNotes ---");
console.log(searchNotes("report")); // Expected: [{ id: 3, text: "Email the project report to Grace", category: "work" }]
console.log(searchNotes("zebra")); // Expected: []

console.log("\n--- 2. longestNote ---");
console.log(longestNote()); // Expected: { id: 3, text: "Email the project report to Grace", category: "work" }
// Edge case test for empty array
const savedNotes = [...notes];
notes = [];
console.log(longestNote()); // Expected: null
notes = savedNotes; // Restore data

console.log("\n--- 3. countByCategory ---");
console.log(countByCategory()); // Expected: { personal: 2, study: 2, work: 1 }

console.log("\n--- 4. getSummary ---");
console.log(getSummary()); // Expected: "5 notes: 2 personal, 2 study, 1 work."

console.log("\n--- 5. isDuplicate ---");
console.log(isDuplicate("  buy milk and bread  ")); // Expected: true
console.log(isDuplicate("Buy fresh fruit")); // Expected: false

console.log("\n--- 6. addNote ---");
console.log(addNote("Schedule team sync", "work")); // Expected logs success, returns: true
console.log(addNote("Call mum", "personal")); // Expected logs failure (duplicate), returns: false
console.log(addNote("", "study")); // Expected logs failure (length limit), returns: false
console.log(addNote("Read documentation", "randomCategory")); // Expected logs failure (invalid category), returns: false
