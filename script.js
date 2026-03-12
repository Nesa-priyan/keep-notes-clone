/* ═══════════════════════════════════════════════
   KEEP NOTES — script.js
   Features: Edit · Colors · Delete Confirm ·
             Better Search · Mobile Layout
   ═══════════════════════════════════════════════ */

/* ── State ── */
let notes        = JSON.parse(localStorage.getItem("notes")) || [];
let editingIndex = null;   // tracks which note is being edited
let deleteIndex  = null;   // tracks which note is pending delete
let selectedColor      = "default";  // color for NEW note
let editSelectedColor  = "default";  // color inside EDIT modal

/* ─────────────────────────────────────────────
   SAVE
───────────────────────────────────────────── */
function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

/* ─────────────────────────────────────────────
   ADD NOTE
───────────────────────────────────────────── */
function addNote() {
  let title   = document.getElementById("title").value.trim();
  let content = document.getElementById("content").value.trim();

  if (title == "" && content == "") return;

  /* Button feedback */
  const btn = document.querySelector('.add-note button:not(.color-dot)');
  btn.classList.add('adding');
  setTimeout(() => btn.classList.remove('adding'), 500);

  notes.push({
    title,
    content,
    pinned: false,
    color:  selectedColor,
    id:     Date.now(),
    date:   formatDate(new Date())
  });

  saveNotes();
  renderNotes();

  /* Reset inputs */
  document.getElementById("title").value   = "";
  document.getElementById("content").value = "";

  /* Reset color picker back to default */
  selectedColor = "default";
  setActiveColorDot("color-options", "default");
}

/* ─────────────────────────────────────────────
   DELETE NOTE  (shows confirmation modal)
───────────────────────────────────────────── */
function deleteNote(index) {
  deleteIndex = index;
  openDeleteModal();
}

/* Called by "Yes, Delete" button inside modal */
function confirmDelete() {
  if (deleteIndex === null) return;

  /* Animate card out first */
  const cards = document.querySelectorAll('.note');
  const target = cards[deleteIndex];
  if (target) {
    target.style.transition  = 'transform 0.28s ease, opacity 0.28s ease';
    target.style.transform   = 'scale(0.85) translateY(8px)';
    target.style.opacity     = '0';
    setTimeout(() => {
      notes.splice(deleteIndex, 1);
      deleteIndex = null;
      saveNotes();
      renderNotes();
    }, 260);
  } else {
    notes.splice(deleteIndex, 1);
    deleteIndex = null;
    saveNotes();
    renderNotes();
  }
  closeDeleteModal();
}

/* ─────────────────────────────────────────────
   TOGGLE PIN
───────────────────────────────────────────── */
function togglePin(index) {
  notes[index].pinned = !notes[index].pinned;
  saveNotes();
  renderNotes();
}

/* ─────────────────────────────────────────────
   FEATURE 1 — EDIT NOTE
───────────────────────────────────────────── */
function openEditModal(index) {
  editingIndex = index;
  const note   = notes[index];

  document.getElementById("edit-title").value   = note.title;
  document.getElementById("edit-content").value = note.content;

  /* Set color picker to note's current color */
  editSelectedColor = note.color || "default";
  setActiveColorDot("edit-color-options", editSelectedColor);

  openModal("edit-overlay");
  setTimeout(() => document.getElementById("edit-title").focus(), 180);
}

function saveEdit() {
  if (editingIndex === null) return;

  const title   = document.getElementById("edit-title").value.trim();
  const content = document.getElementById("edit-content").value.trim();

  if (title === "" && content === "") return;

  notes[editingIndex].title   = title;
  notes[editingIndex].content = content;
  notes[editingIndex].color   = editSelectedColor;
  notes[editingIndex].edited  = formatDate(new Date());

  saveNotes();
  renderNotes();
  closeEditModal();
}

function closeEditModal(e) {
  if (e && e.target !== document.getElementById("edit-overlay")) return;
  closeModal("edit-overlay");
  editingIndex = null;
}

/* ─────────────────────────────────────────────
   FEATURE 2 — NOTE COLORS
───────────────────────────────────────────── */

/* Wire up color dots in both panels */
function initColorPickers() {
  /* Add-note panel */
  document.querySelectorAll('#color-options .color-dot').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedColor = btn.dataset.color;
      setActiveColorDot("color-options", selectedColor);
    });
  });

  /* Edit modal panel */
  document.querySelectorAll('#edit-color-options .color-dot').forEach(btn => {
    btn.addEventListener('click', () => {
      editSelectedColor = btn.dataset.color;
      setActiveColorDot("edit-color-options", editSelectedColor);
    });
  });
}

function setActiveColorDot(containerId, color) {
  document.querySelectorAll(`#${containerId} .color-dot`).forEach(dot => {
    dot.classList.toggle('active', dot.dataset.color === color);
  });
}

/* ─────────────────────────────────────────────
   FEATURE 3 — DELETE CONFIRMATION MODAL
───────────────────────────────────────────── */
function openDeleteModal()  { openModal("delete-overlay"); }
function closeDeleteModal(e) {
  if (e && e.target !== document.getElementById("delete-overlay")) return;
  closeModal("delete-overlay");
  deleteIndex = null;
}

/* ─────────────────────────────────────────────
   MODAL HELPERS
───────────────────────────────────────────── */
function openModal(id) {
  const overlay = document.getElementById(id);
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  overlay.classList.remove("open");
  /* Restore scroll only if no other modal is open */
  const anyOpen = document.querySelector('.modal-overlay.open');
  if (!anyOpen) document.body.style.overflow = "";
}

/* ─────────────────────────────────────────────
   FEATURE 4 — BETTER SEARCH
───────────────────────────────────────────── */
const searchInput  = document.getElementById("search");
const searchClear  = document.getElementById("search-clear");
const searchCount  = document.getElementById("search-count");

searchInput.addEventListener("input", function () {
  const q = this.value.trim();

  /* Show / hide clear button */
  searchClear.classList.toggle("visible", q.length > 0);

  /* Show result counter */
  if (q.length > 0) {
    const matches = notes.filter(n =>
      n.title.toLowerCase().includes(q.toLowerCase()) ||
      n.content.toLowerCase().includes(q.toLowerCase())
    ).length;
    searchCount.textContent = matches + " found";
    searchCount.classList.add("visible");
  } else {
    searchCount.classList.remove("visible");
  }

  renderNotes(q);
});

function clearSearch() {
  searchInput.value = "";
  searchClear.classList.remove("visible");
  searchCount.classList.remove("visible");
  searchInput.focus();
  renderNotes("");
}

/* ─────────────────────────────────────────────
   RENDER NOTES
───────────────────────────────────────────── */
function renderNotes(filter = "") {
  let container = document.getElementById("notes-container");
  container.innerHTML = "";

  const q = filter.toLowerCase().trim();

  let list = notes.filter(n =>
    n.title.toLowerCase().includes(q) ||
    n.content.toLowerCase().includes(q)
  );

  /* Pinned first */
  list.sort((a, b) => b.pinned - a.pinned);

  /* Empty state */
  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✦</div>
        <p>${q
          ? `No notes match <strong style="color:var(--gold)">"${escHTML(q)}"</strong>`
          : "Your notes live here.<br>Start writing something wonderful."
        }</p>
      </div>`;
    return;
  }

  list.forEach((note, index) => {

    /* Real index in the original notes array (needed after sort) */
    const realIndex = notes.indexOf(note);

    const div = document.createElement("div");
    div.className = "note" + (note.pinned ? " pinned" : "");
    div.setAttribute("data-color", note.color || "default");
    div.style.animationDelay = (index * 0.05) + "s";

    /* Highlight matched search term */
    const titleHTML   = q ? highlight(escHTML(note.title),   q) : escHTML(note.title);
    const contentHTML = q ? highlight(escHTML(note.content), q) : escHTML(note.content);

    div.innerHTML = `
      <div class="note-accent-bar"></div>

      ${note.pinned ? `<span class="pin-badge">📌 Pinned</span>` : ""}

      <h3>${titleHTML}</h3>
      <p>${contentHTML}</p>

      <div class="note-footer">
        <span class="note-date">${note.edited ? "Edited " + note.edited : note.date || ""}</span>
        <div class="note-actions">

          <button class="btn-pin ${note.pinned ? "active" : ""}"
                  onclick="togglePin(${realIndex})"
                  title="${note.pinned ? "Unpin" : "Pin"}">
            ${note.pinned
              ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg> Unpin`
              : `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg> Pin`
            }
          </button>

          <button class="btn-edit"
                  onclick="openEditModal(${realIndex})"
                  title="Edit">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>

          <button class="btn-delete"
                  onclick="deleteNote(${realIndex})"
                  title="Delete">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
            Delete
          </button>

        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

/* Escape HTML to prevent XSS */
function escHTML(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* Wrap matched query in <mark class="highlight"> */
function highlight(html, query) {
  if (!query) return html;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex   = new RegExp(`(${escaped})`, "gi");
  return html.replace(regex, `<mark class="highlight">$1</mark>`);
}

/* Format date nicely */
function formatDate(d) {
  return d.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  });
}

/* ─────────────────────────────────────────────
   KEYBOARD SHORTCUTS
   Ctrl+Enter  → Add note
   Escape      → Close modal / clear inputs
───────────────────────────────────────────── */
document.addEventListener("keydown", function (e) {

  /* Escape — close whichever modal is open, or clear inputs */
  if (e.key === "Escape") {
    if (document.getElementById("edit-overlay").classList.contains("open")) {
      closeEditModal();
      return;
    }
    if (document.getElementById("delete-overlay").classList.contains("open")) {
      closeDeleteModal();
      return;
    }
    document.getElementById("title").value   = "";
    document.getElementById("content").value = "";
  }

  /* Ctrl+Enter — add note (when not inside a modal) */
  if (e.ctrlKey && e.key === "Enter") {
    const editOpen   = document.getElementById("edit-overlay").classList.contains("open");
    const deleteOpen = document.getElementById("delete-overlay").classList.contains("open");
    if (editOpen)   { saveEdit();  return; }
    if (!deleteOpen) addNote();
  }
});

/* Enter inside edit modal textarea → Ctrl+Enter to save */
document.getElementById("edit-content").addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.key === "Enter") saveEdit();
});

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
initColorPickers();
renderNotes();