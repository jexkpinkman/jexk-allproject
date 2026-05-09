// ═══════════════════════════════════════════════════════════════
//  KONFIGURASI MONGODB ATLAS DATA API
//  GANTI 3 BARIS DI BAWAH INI DENGAN DATA KAMU
// ═══════════════════════════════════════════════════════════════
const MONGO_APP_ID = 'data-abcde';              // GANTI: dari Atlas → App Services → App ID
const MONGO_API_KEY = 'YOUR_DATA_API_KEY';       // GANTI: dari Atlas → App Services → Data API → Create API Key
const MONGO_CLUSTER = 'Cluster0';                // GANTI: nama cluster kamu (default: Cluster0)
const MONGO_DB = 'portfolio';                    // Nama database
const MONGO_COLLECTION = 'projects';             // Nama collection

const API_BASE = `https://data.mongodb-api.com/app/${MONGO_APP_ID}/endpoint/data/v1/action`;

const defaultProjects = [
  { _id: "1", title: "Tools Downloader", desc: "Platform Tools Downloader All-In-One Untuk Mengunduh Video Dan Audio Dari Berbagai Sosial Media Dengan Cepat.", image: "https://jexk-cdn.vercel.app/file/jexk-cdn/1778250178838-file_00000000838c7208964e1efb89ce8476.png", link: "https://jexk-tools.vercel.app/", tags: ["Next.js", "Node.js"] },
  { _id: "2", title: "Cloud Storage", desc: "Solusi Penyimpanan Cloud Pribadi Dengan Fitur Upload Drag-Drop, Folder Management, Dan Enkripsi File.", image: "https://jexk-cdn.vercel.app/file/jexk-cdn/1778250297227-file_00000000989072088561362a59c44dd2.png", link: "https://jexk-cdn.vercel.app/", tags: ["React", "Express"] },
  { _id: "3", title: "HD Photo & Video Enhance", desc: "Web tool untuk meningkatkan kualitas foto dan video menjadi lebih HD menggunakan teknologi AI processing. Cocok untuk memperjelas gambar blur atau meningkatkan resolusi media.", image: "https://jexk-cdn.vercel.app/file/jexk-cdn/1778249951019-file_0000000002587208a5a076082bda2625.png", link: "https://jexk-enhance.vercel.app/", tags: ["AI", "Web Tool"] },
  { _id: "4", title: "AI Background Remover", desc: "Web tool berbasis AI untuk menghapus background gambar secara otomatis. Upload foto lalu sistem akan memprosesnya dalam hitungan detik.", image: "https://jexk-cdn.vercel.app/file/jexk-cdn/1778261594321-file_0000000012b472088aba56071dca6add.png", link: "https://jexkremovebg.vercel.app/", tags: ["React", "Vite", "AI"] }
];

let isAdmin = false;
let projects = [];
let editingId = null;

// ═══════════════════════════════════════════════════════════════
//  MONGODB API HELPER
// ═══════════════════════════════════════════════════════════════
async function mongoRequest(action, body) {
  const res = await fetch(`${API_BASE}/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': MONGO_API_KEY
    },
    body: JSON.stringify({
      dataSource: MONGO_CLUSTER,
      database: MONGO_DB,
      collection: MONGO_COLLECTION,
      ...body
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return res.json();
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
    const id = p._id || p.id;
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
//  LOAD DATA
// ═══════════════════════════════════════════════════════════════
async function fetchProjects() {
  document.getElementById('loadingState').style.display = 'block';
  document.getElementById('projectGrid').style.display = 'none';
  document.getElementById('emptyState').style.display = 'none';

  try {
    const data = await mongoRequest('find', { filter: {}, sort: { _id: 1 } });
    projects = data.documents || [];
    if (projects.length === 0) {
      console.log('[MongoDB] Collection kosong, pakai default');
      projects = [...defaultProjects];
    }
    renderProjects();
  } catch (e) {
    console.error('[MongoDB Error]', e);
    projects = [...defaultProjects];
    renderProjects();
    showToast('MongoDB error, pakai data default', 'error');
  }
}

// ═══════════════════════════════════════════════════════════════
//  AUTH (SIMPLE)
// ═══════════════════════════════════════════════════════════════
async function checkSession() {
  const session = localStorage.getItem('jexk_admin');
  if (session === 'true') enableAdmin();
  else disableAdmin();
}

function enableAdmin() {
  isAdmin = true;
  localStorage.setItem('jexk_admin', 'true');
  document.getElementById('fabAdd').classList.remove('hidden');
  document.getElementById('adminBtn').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'inline-flex';
  renderProjects();
}

function disableAdmin() {
  isAdmin = false;
  localStorage.removeItem('jexk_admin');
  document.getElementById('fabAdd').classList.add('hidden');
  document.getElementById('adminBtn').style.display = 'inline-flex';
  document.getElementById('logoutBtn').style.display = 'none';
  renderProjects();
}

async function loginAdmin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPass').value;

  try {
    const data = await mongoRequest('find', {
      filter: { key: 'admin_credentials' }
    });
    const creds = data.documents?.[0];
    if (creds && creds.email === email && creds.password === password) {
      document.getElementById('loginError').classList.remove('show');
      closeLoginModal();
      enableAdmin();
      showToast('Login berhasil!', 'success');
    } else {
      document.getElementById('loginError').classList.add('show');
    }
  } catch (e) {
    // Fallback: hardcoded admin (ganti di bawah ini)
    if (email === 'jexkpinkman@gmail.com' && password === 'admin123') {
      document.getElementById('loginError').classList.remove('show');
      closeLoginModal();
      enableAdmin();
      showToast('Login berhasil!', 'success');
    } else {
      document.getElementById('loginError').classList.add('show');
    }
  }
}

function logoutAdmin() {
  disableAdmin();
  showToast('Logged out', 'success');
}

// ═══════════════════════════════════════════════════════════════
//  CRUD
// ═══════════════════════════════════════════════════════════════
async function saveProject(e) {
  e.preventDefault();
  const title = document.getElementById('pTitle').value.trim();
  const desc = document.getElementById('pDesc').value.trim();
  const link = document.getElementById('pLink').value.trim();
  const image = document.getElementById('pImage').value.trim();
  const tags = document.getElementById('pTags').value.split(',').map(t => t.trim()).filter(t => t);

  try {
    if (editingId) {
      await mongoRequest('updateOne', {
        filter: { _id: { $oid: editingId } },
        update: { $set: { title, desc, link, image, tags } }
      });
      showToast('Project diperbarui!', 'success');
    } else {
      await mongoRequest('insertOne', {
        document: { title, desc, link, image, tags, createdAt: new Date().toISOString() }
      });
      showToast('Project ditambahkan!', 'success');
    }
    closeProjectModal();
    await fetchProjects();
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

async function deleteProject(id) {
  if (!confirm('Yakin mau hapus project ini?')) return;
  try {
    await mongoRequest('deleteOne', {
      filter: { _id: { $oid: id } }
    });
    showToast('Project dihapus', 'success');
    await fetchProjects();
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

function editProject(id) {
  const p = projects.find(x => (x._id || x.id) === id);
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
