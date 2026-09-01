/**
 * TwilightJournal — Cosmic Diary
 * Data disimpan di localStorage + support export/import JSON
 */

const STORAGE_KEY = 'twilight_journal_entries';

// State
let entries = [];
let currentId = null;       // id yang sedang dibuka/diedit
let isEditing = false;

// DOM Elements
const entryList     = document.getElementById('entryList');
const emptyState    = document.getElementById('emptyState');
const editorView    = document.getElementById('editorView');
const viewMode      = document.getElementById('viewMode');
const searchInput   = document.getElementById('searchInput');
const filterMood    = document.getElementById('filterMood');

const btnNewEntry   = document.getElementById('btnNewEntry');
const btnSave       = document.getElementById('btnSave');
const btnCancel     = document.getElementById('btnCancel');
const btnDelete     = document.getElementById('btnDelete');
const btnEdit       = document.getElementById('btnEdit');
const btnBack       = document.getElementById('btnBack');
const btnExport     = document.getElementById('btnExport');
const btnImport     = document.getElementById('btnImport');
const importFile    = document.getElementById('importFile');

const entryTitle    = document.getElementById('entryTitle');
const entryDate     = document.getElementById('entryDate');
const entryMood     = document.getElementById('entryMood');
const entryContent  = document.getElementById('entryContent');

const viewTitle     = document.getElementById('viewTitle');
const viewDate      = document.getElementById('viewDate');
const viewMood      = document.getElementById('viewMood');
const viewContent   = document.getElementById('viewContent');

// Mood emoji map
const moodEmoji = {
  happy: '😊',
  calm: '😌',
  sad: '😢',
  excited: '🤩',
  thoughtful: '🤔',
  grateful: '🙏'
};

// ========== INIT ==========
function init() {
  loadEntries();
  renderList();
  bindEvents();

  // Set default date to today
  entryDate.value = new Date().toISOString().slice(0, 10);
}

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    entries = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Gagal load data:', e);
    entries = [];
  }

  // Sort by date descending (newest first)
  entries.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ========== RENDER ==========
function renderList() {
  const query = searchInput.value.trim().toLowerCase();
  const moodFilter = filterMood.value;

  const filtered = entries.filter(e => {
    const matchQuery =
      e.title.toLowerCase().includes(query) ||
      e.content.toLowerCase().includes(query);
    const matchMood = moodFilter === 'all' || e.mood === moodFilter;
    return matchQuery && matchMood;
  });

  entryList.innerHTML = '';

  if (filtered.length === 0) {
    entryList.innerHTML = `<p style="text-align:center;color:var(--muted);font-size:0.85rem;padding:1rem 0;">Tidak ada entri</p>`;
    return;
  }

  filtered.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'entry-card' + (entry.id === currentId ? ' active' : '');
    card.dataset.id = entry.id;

    const dateStr = formatDate(entry.date);
    card.innerHTML = `
      <h3>${escapeHtml(entry.title) || '(Tanpa judul)'}</h3>
      <div class="meta">
        <span>${dateStr}</span>
        <span class="mood">${moodEmoji[entry.mood] || ''}</span>
      </div>
    `;

    card.addEventListener('click', () => openView(entry.id));
    entryList.appendChild(card);
  });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ========== VIEW MODES ==========
function showEmpty() {
  emptyState.hidden = false;
  editorView.hidden = true;
  viewMode.hidden = true;
  currentId = null;
  isEditing = false;
  renderList();
}

function openEditor(id = null) {
  emptyState.hidden = true;
  editorView.hidden = false;
  viewMode.hidden = true;
  isEditing = true;

  if (id) {
    // Edit existing
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    currentId = id;
    entryTitle.value = entry.title;
    entryDate.value = entry.date;
    entryMood.value = entry.mood;
    entryContent.value = entry.content;
    btnDelete.hidden = false;
  } else {
    // New entry
    currentId = null;
    entryTitle.value = '';
    entryDate.value = new Date().toISOString().slice(0, 10);
    entryMood.value = 'calm';
    entryContent.value = '';
    btnDelete.hidden = true;
  }

  entryTitle.focus();
  renderList();
}

function openView(id) {
  const entry = entries.find(e => e.id === id);
  if (!entry) return;

  currentId = id;
  isEditing = false;

  emptyState.hidden = true;
  editorView.hidden = true;
  viewMode.hidden = false;

  viewTitle.textContent = entry.title || '(Tanpa judul)';
  viewDate.textContent = formatDate(entry.date);
  viewMood.textContent = `${moodEmoji[entry.mood] || ''} ${capitalize(entry.mood)}`;
  viewContent.textContent = entry.content;

  renderList();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========== ACTIONS ==========
function saveEntry() {
  const title = entryTitle.value.trim();
  const content = entryContent.value.trim();
  const date = entryDate.value;
  const mood = entryMood.value;

  if (!content && !title) {
    alert('Isi setidaknya judul atau konten.');
    return;
  }

  if (currentId) {
    // Update
    const idx = entries.findIndex(e => e.id === currentId);
    if (idx !== -1) {
      entries[idx] = {
        ...entries[idx],
        title,
        content,
        date,
        mood,
        updatedAt: new Date().toISOString()
      };
    }
  } else {
    // Create new
    const newEntry = {
      id: crypto.randomUUID(),
      title,
      content,
      date,
      mood,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    entries.unshift(newEntry);
    currentId = newEntry.id;
  }

  // Re-sort
  entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  saveEntries();
  openView(currentId);
}

function deleteEntry() {
  if (!currentId) return;
  if (!confirm('Yakin ingin menghapus entri ini?')) return;

  entries = entries.filter(e => e.id !== currentId);
  saveEntries();
  showEmpty();
}

// ========== EXPORT / IMPORT ==========
function exportJSON() {
  const data = {
    app: 'TwilightJournal',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    entries
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `twilight-journal-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      const imported = Array.isArray(data) ? data : (data.entries || []);

      if (!Array.isArray(imported)) {
        alert('Format JSON tidak valid.');
        return;
      }

      // Merge: keep existing + add new (by id)
      const existingIds = new Set(entries.map(e => e.id));
      let added = 0;

      imported.forEach(item => {
        if (!item.id) item.id = crypto.randomUUID();
        if (!existingIds.has(item.id)) {
          entries.push({
            id: item.id,
            title: item.title || '',
            content: item.content || '',
            date: item.date || new Date().toISOString().slice(0, 10),
            mood: item.mood || 'calm',
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString()
          });
          added++;
        }
      });

      entries.sort((a, b) => new Date(b.date) - new Date(a.date));
      saveEntries();
      renderList();
      alert(`Import berhasil! ${added} entri baru ditambahkan.`);
    } catch (err) {
      alert('Gagal membaca file JSON.');
      console.error(err);
    }
  };
  reader.readAsText(file);
}

// ========== EVENTS ==========
function bindEvents() {
  btnNewEntry.addEventListener('click', () => openEditor());
  btnSave.addEventListener('click', saveEntry);
  btnCancel.addEventListener('click', () => {
    if (currentId) openView(currentId);
    else showEmpty();
  });
  btnDelete.addEventListener('click', deleteEntry);
  btnEdit.addEventListener('click', () => openEditor(currentId));
  btnBack.addEventListener('click', showEmpty);

  searchInput.addEventListener('input', renderList);
  filterMood.addEventListener('change', renderList);

  btnExport.addEventListener('click', exportJSON);
  btnImport.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      importJSON(e.target.files[0]);
      e.target.value = '';
    }
  });

  // Keyboard shortcut: Ctrl+S to save
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's' && isEditing) {
      e.preventDefault();
      saveEntry();
    }
  });
}

// Start
init();
