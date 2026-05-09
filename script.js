// ═══════════════════════════════════════════════════════════════
//  KONFIGURASI FIREBASE  —  GANTI 6 BARIS DI BAWAH INI
// ═══════════════════════════════════════════════════════════════
const firebaseConfig = {
  apiKey: "AIzaSy...",           // GANTI: dari Firebase Project Settings
  authDomain: "project-id.firebaseapp.com",  // GANTI
  projectId: "project-id",       // GANTI
  storageBucket: "project-id.appspot.com",   // GANTI
  messagingSenderId: "123456789", // GANTI
  appId: "1:123456789:web:abcdef" // GANTI
};

// ═══════════════════════════════════════════════════════════════
//  DEFAULT PROJECTS (FALLBACK)
// ═══════════════════════════════════════════════════════════════
const defaultProjects = [
  { id: "1", title: "Tools Downloader", desc: "Platform Tools Downloader All-In-One Untuk Mengunduh Video Dan Audio Dari Berbagai Sosial Media Dengan Cepat.", image: "https://jexk-cdn.vercel.app/file/jexk-cdn/1778250178838-file_00000000838c7208964e1efb89ce8476.png", link: "https://jexk-tools.vercel.app/", tags: ["Next.js", "Node.js"] },
  { id: "2", title: "Cloud Storage", desc: "Solusi Penyimpanan Cloud Pribadi Dengan Fitur Upload Drag-Drop, Folder Management, Dan Enkripsi File.", image: "https://jexk-cdn.vercel.app/file/jexk-cdn/1778250297227-file_00000000989072088561362a59c44dd2.png", link: "https://jexk-cdn.vercel.app/", tags: ["React", "Express"] },
  { id: "3", title: "HD Photo & Video Enhance", desc: "Web tool untuk meningkatkan kualitas foto dan video menjadi lebih HD menggunakan teknologi AI processing. Cocok untuk memperjelas gambar blur atau meningkatkan resolusi media.", image: "https://jexk-cdn.vercel.app/file/jexk-cdn/1778249951019-file_0000000002587208a5a076082bda2625.png", link: "https://jexk-enhance.vercel.app/", tags: ["AI", "Web Tool"] },
  { id: "4", title: "AI Background Remover", desc: "Web tool berbasis AI untuk menghapus background gambar secara otomatis. Upload foto lalu sistem akan memprosesnya dalam hitungan detik.", image: "https://jexk-cdn.vercel.app/file/jexk-cdn/1778261594321-file_0000000012b472088aba56071dca6add.png", link: "https://jexkremovebg.vercel.app/", tags: ["React", "Vite", "AI"] }
];

let db = null;
let auth = null;
let isAdmin = false;
let projects = [];
let editingId = null;
let unsubscribe = null;

// ═══════════════════════════════════════════════════════════════
//  INIT FIREBASE
// ═══════════════════════════════════════════════════════════════
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  auth = firebase.auth();
  console.log('[OK] Firebase initialized');
} catch (e) {
  console.error('[FAIL] Firebase init:', e);
}

// ═══════════════════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════════════════
function renderProjects() {
  const grid = document.getElementById('projectGrid');
  const empty = document.getElementById('emptyState');
  document.getElementById('loadingState').style.display = 'none';

  const statEl = document.getElementById('stat-projects');
  if (statEl) statEl.textContent = (projects.length || 0) + '+';

  if (!projects || projects.length === 0) {
    if (grid) grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  const html = projects.map(p => {
    const id = p.id;
    const tagsHtml = (p.tags || []).map(t => `<span class="tag mini">${escapeHtml(t)}</span>`).join('');
    const adminBtns = isAdmin ? `
      <div class="project-actions">
        <button class="action-btn" onclick="editProject('${id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
        <button class="action-btn" onclick="deleteProject('${id}')" title="Hapus"><i class="fa-solid fa-trash"></i></button>
      </div>` : '';

    return `
      <div class="project-card glass reveal" data-id="${id}">
        ${adminBtns}
        <div class="card-img">
          <img src="${p.image}" alt="${escapeHtml(p.title)}" onerror="this.src='https://via.placeholder.com/600x400/111/888?text=No+Image'">
          <div class="overlay">
            <a href="${p.link}" target="_blank" class="btn btn-primary btn-sm">View Live <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
          </div>
        </div>
        <div class="card-info">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <h3>${escapeHtml(p.title)}</h3>
            <a href="${p.link}" target="_blank" style="color:var(--muted);"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
          </div>
          <p class="desc" style="font-size:0.9rem;">${escapeHtml(p.desc)}</p>
          <div class="tags">${tagsHtml}</div>
        </div>
      </div>`;
  }).join('');

  if (grid) {
    grid.style.display = 'grid';
    grid.innerHTML = html;
  }
  setTimeout(() => document.querySelectorAll('.reveal').forEach(el => el.classList.add('active')), 50);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ═══════════════════════════════════════════════════════════════
//  LOAD DATA (REALTIME)
// ═══════════════════════════════════════════════════════════════
function fetchProjects() {
  document.getElementById('loadingState').style.display = 'block';
  document.getElementById('projectGrid').style.display = 'none';

  if (!db) {
    console.warn('[WARN] Firebase not available, using defaults');
    projects = [...defaultProjects];
    renderProjects();
    showToast('Mode offline: menampilkan data default', 'error');
    return;
  }

  // Realtime listener
  unsubscribe = db.collection('projects').orderBy('createdAt', 'desc').onSnapshot(
    (snapshot) => {
      projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (projects.length === 0) {
        console.log('[Firestore] Collection kosong, pakai default');
        projects = [...defaultProjects];
      }
      renderProjects();
    },
    (error) => {
      console.error('[Firestore Error]', error);
      projects = [...defaultProjects];
      renderProjects();
      showToast('Firebase error, pakai default', 'error');
    }
  );
}

// ═══════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════
function checkSession() {
  if (!auth) return;
  auth.onAuthStateChanged(user => {
    if (user) enableAdmin();
    else disableAdmin();
  });
}

function enableAdmin() {
  isAdmin = true;
  document.getElementById('fabAdd').classList.remove('hidden');
  document.getElementById('adminBtn').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'inline-flex';
  renderProjects();
}

function disableAdmin() {
  isAdmin = false;
  document.getElementById('fabAdd').classList.add('hidden');
  document.getElementById('adminBtn').style.display = 'inline-flex';
  document.getElementById('logoutBtn').style.display = 'none';
  renderProjects();
}

async function loginAdmin(e) {
  e.preventDefault();
  if (!auth) { showToast('Firebase tidak terhubung', 'error'); return; }
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPass').value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
    document.getElementById('loginError').classList.remove('show');
    closeLoginModal();
    showToast('Login berhasil!', 'success');
  } catch (error) {
    document.getElementById('loginError').classList.add('show');
  }
}

async function logoutAdmin() {
  if (auth) { try { await auth.signOut(); } catch(e){} }
  disableAdmin();
  showToast('Logged out', 'success');
}

// ═══════════════════════════════════════════════════════════════
//  CRUD
// ═══════════════════════════════════════════════════════════════
async function saveProject(e) {
  e.preventDefault();
  if (!db || !isAdmin) { showToast('Tidak punya akses', 'error'); return; }
  const title = document.getElementById('pTitle').value.trim();
  const desc = document.getElementById('pDesc').value.trim();
  const link = document.getElementById('pLink').value.trim();
  const image = document.getElementById('pImage').value.trim();
  const tags = document.getElementById('pTags').value.split(',').map(t => t.trim()).filter(t => t);

  try {
    if (editingId) {
      await db.collection('projects').doc(editingId).update({ title, desc, link, image, tags, updatedAt: new Date() });
      showToast('Project diperbarui!', 'success');
    } else {
      await db.collection('projects').add({ title, desc, link, image, tags, createdAt: new Date() });
      showToast('Project ditambahkan!', 'success');
    }
    closeProjectModal();
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

async function deleteProject(id) {
  if (!db || !isAdmin) { showToast('Tidak punya akses', 'error'); return; }
  if (!confirm('Yakin mau hapus project ini?')) return;
  try {
    await db.collection('projects').doc(id).delete();
    showToast('Project dihapus', 'success');
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

function editProject(id) {
  const p = projects.find(x => x.id === id);
  if (!p) return;
  editingId = id;
  document.getElementById('pTitle').value = p.title;
  document.getElementById('pDesc').value = p.desc;
  document.getElementById('pLink').value = p.link;
  document.getElementById('pImage').value = p.image;
  document.getElementById('pTags').value = (p.tags || []).join(', ');
  document.getElementById('modalTitle').textContent = 'Edit Project';
  openProjectModal();
}

// ═══════════════════════════════════════════════════════════════
//  MODALS
// ═══════════════════════════════════════════════════════════════
function openProjectModal() {
  document.getElementById('projectModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeProjectModal() {
  document.getElementById('projectModal').classList.remove('active');
  document.body.style.overflow = '';
  document.getElementById('projectForm').reset();
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Tambah Project';
}
function openLoginModal() {
  document.getElementById('loginModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLoginModal() {
  document.getElementById('loginModal').classList.remove('active');
  document.body.style.overflow = '';
  document.getElementById('loginForm').reset();
  document.getElementById('loginError').classList.remove('show');
}

function showToast(msg, type) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'toast ' + type + ' show';
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ═══════════════════════════════════════════════════════════════
//  EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('fabAdd')?.addEventListener('click', openProjectModal);
  document.getElementById('modalClose')?.addEventListener('click', closeProjectModal);
  document.getElementById('btnCancel')?.addEventListener('click', closeProjectModal);
  document.getElementById('projectModal')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeProjectModal(); });
  document.getElementById('projectForm')?.addEventListener('submit', saveProject);

  document.getElementById('adminBtn')?.addEventListener('click', openLoginModal);
  document.getElementById('logoutBtn')?.addEventListener('click', logoutAdmin);
  document.getElementById('loginClose')?.addEventListener('click', closeLoginModal);
  document.getElementById('loginCancel')?.addEventListener('click', closeLoginModal);
  document.getElementById('loginModal')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeLoginModal(); });
  document.getElementById('loginForm')?.addEventListener('submit', loginAdmin);

  const mobileMenu = document.getElementById('mobileMenu');
  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => mobileMenu?.classList.add('active'));
  document.getElementById('close-menu-btn')?.addEventListener('click', () => mobileMenu?.classList.remove('active'));
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => mobileMenu?.classList.remove('active'));
  });

  checkSession();
  fetchProjects();
});
