/**
 * TwilightJournal — Cosmic Diary (Enhanced)
 * Features: entries, prompts, stats, benefits, daily goal, background music
 */

const STORAGE_KEY = 'twilight_journal_entries';
const GOAL_KEY = 'twilight_journal_goal';
const MUSIC_KEY = 'twilight_journal_music';

// ========== MUSIC TRACKS ==========
// Letakkan file MP3 di folder audio/
// track1.mp3, track2.mp3, track3.mp3
const TRACKS = [
  { src: 'audio/track1.mp3', label: 'Lagu 1 — Default' },
  { src: 'audio/track2.mp3', label: 'Lagu 2' },
  { src: 'audio/track3.mp3', label: 'Lagu 3' }
];

// ========== PROMPTS ==========
const PROMPTS = [
  "Apa tiga hal yang membuatmu bersyukur hari ini?",
  "Ceritakan satu momen kecil yang membuatmu tersenyum hari ini.",
  "Apa yang sedang kamu khawatirkan? Tulis semuanya tanpa sensor.",
  "Jika hari ini adalah sebuah bab dalam buku hidupmu, judulnya apa?",
  "Siapa orang yang ingin kamu ucapkan terima kasih, dan mengapa?",
  "Apa pelajaran terbesar yang kamu pelajari minggu ini?",
  "Bagaimana perasaan tubuhmu saat ini? Deskripsikan tanpa menghakimi.",
  "Apa yang ingin kamu lepaskan agar merasa lebih ringan?",
  "Bayangkan dirimu 5 tahun ke depan. Apa yang ingin dia katakan padamu?",
  "Tulis surat singkat untuk dirimu di masa lalu.",
  "Apa yang membuatmu merasa paling hidup belakangan ini?",
  "Jika kamu bisa mengubah satu kebiasaan, apa yang akan kamu pilih dan mengapa?",
  "Ceritakan tentang tempat yang membuatmu merasa damai.",
  "Apa ketakutan yang diam-diam mengendalikan keputusanmu?",
  "Tuliskan satu hal yang berhasil kamu lakukan meski sulit.",
  "Bagaimana cuaca di dalam hatimu hari ini?",
  "Apa yang ingin kamu rayakan, sekecil apapun?",
  "Jika emosi bisa berbicara, apa yang sedang mereka katakan?",
  "Apa yang kamu butuhkan saat ini, tapi belum kamu berikan pada diri sendiri?",
  "Tulis tentang sesuatu yang dulu kamu benci, tapi sekarang kamu hargai."
];

const QUOTES = [
  { text: "Journaling is like whispering to one’s self and listening at the same time.", author: "Mina Murray" },
  { text: "Fill your paper with the breathings of your heart.", author: "William Wordsworth" },
  { text: "Writing is medicine. It is an appropriate antidote to injury.", author: "Julia Cameron" },
  { text: "The best time to begin keeping a journal is whenever you decide to.", author: "Hannah Hinchman" },
  { text: "In the journal I do not just express myself more openly than I could to any person; I create myself.", author: "Susan Sontag" },
  { text: "Preserve your memories, keep them well, what you forget you can never retell.", author: "Louisa May Alcott" }
];

// State
let entries = [];
let currentId = null;
let isEditing = false;
let currentPrompt = '';
let dailyGoalTarget = 1;

// DOM
const entryList = document.getElementById('entryList');
const emptyState = document.getElementById('emptyState');
const editorView = document.getElementById('editorView');
const viewMode = document.getElementById('viewMode');
const searchInput = document.getElementById('searchInput');
const filterMood = document.getElementById('filterMood');

const btnNewEntry = document.getElementById('btnNewEntry');
const btnSave = document.getElementById('btnSave');
const btnCancel = document.getElementById('btnCancel');
const btnDelete = document.getElementById('btnDelete');
const btnEdit = document.getElementById('btnEdit');
const btnBack = document.getElementById('btnBack');
const btnExport = document.getElementById('btnExport');
const btnImport = document.getElementById('btnImport');
const importFile = document.getElementById('importFile');

const entryTitle = document.getElementById('entryTitle');
const entryDate = document.getElementById('entryDate');
const entryMood = document.getElementById('entryMood');
const entryContent = document.getElementById('entryContent');

const viewTitle = document.getElementById('viewTitle');
const viewDate = document.getElementById('viewDate');
const viewMood = document.getElementById('viewMood');
const viewContent = document.getElementById('viewContent');

const bgMusic = document.getElementById('bgMusic');
const musicSelect = document.getElementById('musicSelect');

const moodEmoji = {
  happy: '😊', calm: '😌', sad: '😢',
  excited: '🤩', thoughtful: '🤔', grateful: '🙏'
};

// ========== INIT ==========
function init() {
  loadEntries();
  loadGoal();
  setupMusic();
  renderList();
  updateWelcomeStats();
  updateDailyGoalUI();
  setRandomQuote();
  bindEvents();
  entryDate.value = new Date().toISOString().slice(0, 10);
}

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    entries = raw ? JSON.parse(raw) : [];
  } catch (e) {
    entries = [];
  }
  entries.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function loadGoal() {
  const g = localStorage.getItem(GOAL_KEY);
  dailyGoalTarget = g ? parseInt(g, 10) : 1;
  if (isNaN(dailyGoalTarget) || dailyGoalTarget < 1) dailyGoalTarget = 1;
  const input = document.getElementById('goalTargetInput');
  if (input) input.value = dailyGoalTarget;
}

// ========== MUSIC ==========
function setupMusic() {
  // Populate select labels
  TRACKS.forEach((t, i) => {
    if (musicSelect.options[i]) musicSelect.options[i].text = t.label;
  });

  const saved = localStorage.getItem(MUSIC_KEY);
  const idx = saved !== null ? parseInt(saved, 10) : 0;
  const safeIdx = (idx >= 0 && idx < TRACKS.length) ? idx : 0;
  musicSelect.value = String(safeIdx);
  loadTrack(safeIdx);

  // Autoplay attempt (browsers may block until user interaction)
  const tryPlay = () => {
    bgMusic.play().catch(() => {
      // Autoplay blocked — play on first user click
      const unlock = () => {
        bgMusic.play().catch(() => {});
        document.removeEventListener('click', unlock);
        document.removeEventListener('keydown', unlock);
      };
      document.addEventListener('click', unlock, { once: true });
      document.addEventListener('keydown', unlock, { once: true });
    });
  };
  // Small delay so audio element is ready
  setTimeout(tryPlay, 400);
}

function loadTrack(index) {
  const track = TRACKS[index];
  if (!track) return;
  const wasPlaying = !bgMusic.paused;
  bgMusic.src = track.src;
  bgMusic.load();
  if (wasPlaying || index === parseInt(musicSelect.value, 10)) {
    bgMusic.play().catch(() => {});
  }
  localStorage.setItem(MUSIC_KEY, String(index));
}

// ========== RENDER LIST ==========
function renderList() {
  const query = searchInput.value.trim().toLowerCase();
  const moodFilter = filterMood.value;

  const filtered = entries.filter(e => {
    const matchQuery = e.title.toLowerCase().includes(query) || e.content.toLowerCase().includes(query);
    const matchMood = moodFilter === 'all' || e.mood === moodFilter;
    return matchQuery && matchMood;
  });

  entryList.innerHTML = '';
  if (filtered.length === 0) {
    entryList.innerHTML = `<p style="text-align:center;color:var(--muted);font-size:0.82rem;padding:0.8rem 0;">Tidak ada entri</p>`;
    return;
  }

  filtered.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'entry-card' + (entry.id === currentId ? ' active' : '');
    card.dataset.id = entry.id;
    card.innerHTML = `
      <h3>${escapeHtml(entry.title) || '(Tanpa judul)'}</h3>
      <div class="meta">
        <span>${formatDate(entry.date)}</span>
        <span class="mood">${moodEmoji[entry.mood] || ''}</span>
      </div>
    `;
    card.addEventListener('click', () => openView(entry.id));
    entryList.appendChild(card);
  });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========== VIEW MODES ==========
function showEmpty() {
  emptyState.hidden = false;
  editorView.hidden = true;
  viewMode.hidden = true;
  currentId = null;
  isEditing = false;
  renderList();
  updateWelcomeStats();
  updateDailyGoalUI();
}

function openEditor(id = null) {
  emptyState.hidden = true;
  editorView.hidden = false;
  viewMode.hidden = true;
  isEditing = true;

  if (id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    currentId = id;
    entryTitle.value = entry.title;
    entryDate.value = entry.date;
    entryMood.value = entry.mood;
    entryContent.value = entry.content;
    btnDelete.hidden = false;
  } else {
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
    const idx = entries.findIndex(e => e.id === currentId);
    if (idx !== -1) {
      entries[idx] = { ...entries[idx], title, content, date, mood, updatedAt: new Date().toISOString() };
    }
  } else {
    const newEntry = {
      id: crypto.randomUUID(),
      title, content, date, mood,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    entries.unshift(newEntry);
    currentId = newEntry.id;
  }

  entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  saveEntries();
  document.getElementById('promptBar').hidden = true;
  openView(currentId);
  updateDailyGoalUI();
  updateWelcomeStats();
}

function deleteEntry() {
  if (!currentId) return;
  if (!confirm('Yakin ingin menghapus entri ini?')) return;
  entries = entries.filter(e => e.id !== currentId);
  saveEntries();
  showEmpty();
}

// ========== DAILY GOAL & STATS ==========
function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function countTodayEntries() {
  const today = getTodayStr();
  return entries.filter(e => e.date === today).length;
}

function updateDailyGoalUI() {
  const count = countTodayEntries();
  const target = dailyGoalTarget;
  const pct = Math.min(100, Math.round((count / target) * 100));
  document.getElementById('goalProgressText').textContent = `${count}/${target}`;
  document.getElementById('goalProgressBar').style.width = pct + '%';
  const status = document.getElementById('goalStatus');
  if (count >= target) {
    status.textContent = '✓ Target tercapai! Hebat!';
    status.classList.add('done');
  } else {
    status.textContent = count === 0 ? 'Belum menulis hari ini' : `Masih kurang ${target - count} entri`;
    status.classList.remove('done');
  }
}

function calcStreak() {
  if (entries.length === 0) return 0;
  const dates = [...new Set(entries.map(e => e.date))].sort().reverse();
  let streak = 0;
  let expected = getTodayStr();

  for (const d of dates) {
    if (d === expected) {
      streak++;
      // previous day
      const prev = new Date(expected);
      prev.setDate(prev.getDate() - 1);
      expected = prev.toISOString().slice(0, 10);
    } else if (d < expected) {
      break;
    }
  }
  return streak;
}

function getDominantMood() {
  if (entries.length === 0) return '—';
  const counts = {};
  entries.forEach(e => { counts[e.mood] = (counts[e.mood] || 0) + 1; });
  let max = 0, mood = '—';
  for (const [m, c] of Object.entries(counts)) {
    if (c > max) { max = c; mood = m; }
  }
  return `${moodEmoji[mood] || ''} ${capitalize(mood)}`;
}

function updateWelcomeStats() {
  document.getElementById('streakDisplay').textContent = calcStreak() + ' hari';
  document.getElementById('totalDisplay').textContent = entries.length;
  document.getElementById('moodDisplay').textContent = getDominantMood();
}

function setRandomQuote() {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  const el = document.getElementById('dailyQuote');
  el.innerHTML = `<p>“${q.text}”</p><span>— ${q.author}</span>`;
}

function renderStatsModal() {
  const total = entries.length;
  const streak = calcStreak();
  const todayCount = countTodayEntries();
  const thisWeek = entries.filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card"><div class="stat-value">${total}</div><div class="stat-label">Total Entri</div></div>
    <div class="stat-card"><div class="stat-value">${streak}</div><div class="stat-label">Streak (hari)</div></div>
    <div class="stat-card"><div class="stat-value">${todayCount}</div><div class="stat-label">Hari Ini</div></div>
    <div class="stat-card"><div class="stat-value">${thisWeek}</div><div class="stat-label">7 Hari Terakhir</div></div>
  `;

  // Mood chart
  const moodCounts = {};
  Object.keys(moodEmoji).forEach(m => moodCounts[m] = 0);
  entries.forEach(e => { if (moodCounts[e.mood] !== undefined) moodCounts[e.mood]++; });
  const maxMood = Math.max(1, ...Object.values(moodCounts));

  let chartHtml = '';
  for (const [m, c] of Object.entries(moodCounts)) {
    const pct = Math.round((c / maxMood) * 100);
    chartHtml += `
      <div class="mood-bar-row">
        <span class="mood-bar-label">${moodEmoji[m]} ${capitalize(m)}</span>
        <div class="mood-bar-track"><div class="mood-bar-fill" style="width:${pct}%"></div></div>
        <span class="mood-bar-count">${c}</span>
      </div>`;
  }
  document.getElementById('moodChart').innerHTML = chartHtml;

  // Insight
  let insight = '';
  if (total === 0) {
    insight = 'Mulai tulis entri pertamamu untuk melihat statistik dan insight di sini.';
  } else if (streak >= 7) {
    insight = `Luar biasa! Kamu sudah menulis ${streak} hari berturut-turut. Konsistensi ini sangat bagus untuk kesehatan mental.`;
  } else if (todayCount >= dailyGoalTarget) {
    insight = 'Target hari ini sudah tercapai. Pertahankan kebiasaan baik ini!';
  } else {
    insight = `Kamu punya ${total} entri. Coba tulis sedikit lagi hari ini untuk membangun streak.`;
  }
  document.getElementById('statsInsight').textContent = insight;
}

// ========== PROMPTS ==========
function getRandomPrompt() {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

function showPromptModal() {
  currentPrompt = getRandomPrompt();
  document.getElementById('promptText').textContent = currentPrompt;
  document.getElementById('promptModal').hidden = false;
}

function usePrompt() {
  document.getElementById('promptModal').hidden = true;
  openEditor();
  document.getElementById('promptBar').hidden = false;
  document.getElementById('activePromptText').textContent = currentPrompt;
  // Optional: prefill content with prompt as guidance
  if (!entryContent.value) {
    entryContent.placeholder = currentPrompt + '\n\nTulis responsmu di sini...';
  }
}

// ========== EXPORT / IMPORT ==========
function exportJSON() {
  const data = { app: 'TwilightJournal', version: '1.1', exportedAt: new Date().toISOString(), entries };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `twilight-journal-${getTodayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      const imported = Array.isArray(data) ? data : (data.entries || []);
      if (!Array.isArray(imported)) { alert('Format JSON tidak valid.'); return; }

      const existingIds = new Set(entries.map(e => e.id));
      let added = 0;
      imported.forEach(item => {
        if (!item.id) item.id = crypto.randomUUID();
        if (!existingIds.has(item.id)) {
          entries.push({
            id: item.id,
            title: item.title || '',
            content: item.content || '',
            date: item.date || getTodayStr(),
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
      updateWelcomeStats();
      updateDailyGoalUI();
      alert(`Import berhasil! ${added} entri baru ditambahkan.`);
    } catch (err) {
      alert('Gagal membaca file JSON.');
    }
  };
  reader.readAsText(file);
}

// ========== EVENTS ==========
function bindEvents() {
  btnNewEntry.addEventListener('click', () => openEditor());
  btnSave.addEventListener('click', saveEntry);
  btnCancel.addEventListener('click', () => { if (currentId) openView(currentId); else showEmpty(); });
  btnDelete.addEventListener('click', deleteEntry);
  btnEdit.addEventListener('click', () => openEditor(currentId));
  btnBack.addEventListener('click', showEmpty);

  searchInput.addEventListener('input', renderList);
  filterMood.addEventListener('change', renderList);

  btnExport.addEventListener('click', exportJSON);
  btnImport.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', (e) => {
    if (e.target.files[0]) { importJSON(e.target.files[0]); e.target.value = ''; }
  });

  // Tools
  document.getElementById('btnPrompt').addEventListener('click', showPromptModal);
  document.getElementById('btnStartPrompt').addEventListener('click', showPromptModal);
  document.getElementById('btnStats').addEventListener('click', () => {
    renderStatsModal();
    document.getElementById('statsModal').hidden = false;
  });
  document.getElementById('btnBenefits').addEventListener('click', () => {
    document.getElementById('benefitsModal').hidden = false;
  });

  document.getElementById('btnShufflePrompt').addEventListener('click', () => {
    currentPrompt = getRandomPrompt();
    document.getElementById('promptText').textContent = currentPrompt;
  });
  document.getElementById('btnUsePrompt').addEventListener('click', usePrompt);
  document.getElementById('btnClearPrompt').addEventListener('click', () => {
    document.getElementById('promptBar').hidden = true;
    entryContent.placeholder = 'Tulis isi hatimu di sini...';
  });

  document.getElementById('btnSaveGoal').addEventListener('click', () => {
    const val = parseInt(document.getElementById('goalTargetInput').value, 10);
    if (val >= 1 && val <= 10) {
      dailyGoalTarget = val;
      localStorage.setItem(GOAL_KEY, String(val));
      updateDailyGoalUI();
      alert('Target harian disimpan!');
    }
  });

  // Music select
  musicSelect.addEventListener('change', () => {
    const idx = parseInt(musicSelect.value, 10);
    loadTrack(idx);
    bgMusic.play().catch(() => {});
  });

  // Modal close
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById(btn.dataset.close).hidden = true;
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.hidden = true;
    });
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's' && isEditing) {
      e.preventDefault();
      saveEntry();
    }
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(m => m.hidden = true);
    }
  });
}

init();
