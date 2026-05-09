╔══════════════════════════════════════════════════════════════════╗
║     JEXK PROJECTS + MONGODB ATLAS  —  SETUP PANDUAN             ║
╚══════════════════════════════════════════════════════════════════╝

📦 ISI FILE
-----------
• index.html    → Struktur halaman
• style.css     → Styling
• script.js     → JavaScript + MongoDB Atlas Data API


⚙️ SETUP MONGODB ATLAS (WAJIB)
-------------------------------
1. Buka https://cloud.mongodb.com → Sign Up / Login
2. Klik "Build a Cluster" (pilih M0 Free tier)
3. Pilih region (Singapore / Mumbai)
4. Klik "Create Cluster" → tunggu 1-3 menit

5. Buat Database User:
   • Klik "Database Access" di sidebar
   • "Add New Database User"
   • Username: admin
   • Password: buat password
   • Role: "Read and write to any database"
   • Klik "Add User"

6. Allow Network Access:
   • Klik "Network Access" di sidebar
   • "Add IP Address"
   • Klik "Allow Access from Anywhere" (0.0.0.0/0)
   • Klik "Confirm"

7. Enable Data API:
   • Klik "App Services" di sidebar
   • Klik "Data API"
   • "Enable the Data API"
   • Pilih cluster kamu → "Enable Data Access"
   • Catat "App ID" (contoh: data-abcde)
   • Klik "Create API Key" → copy key-nya

8. Buat Database & Collection:
   • Klik "Browse Collections"
   • "Add My Own Data"
   • Database name: portfolio
   • Collection name: projects
   • Klik "Create"

9. Isi Data Project Pertama:
   • Klik collection "projects"
   • "Insert Document"
   • Isi JSON:
     {
       "title": "Tools Downloader",
       "desc": "Platform download video dan audio",
       "image": "https://jexk-cdn.vercel.app/file/jexk-cdn/1778250178838-file_00000000838c7208964e1efb89ce8476.png",
       "link": "https://jexk-tools.vercel.app/",
       "tags": ["Next.js", "Node.js"]
     }
   • Klik "Insert"

10. Buat Collection untuk Admin:
    • Klik "Create Collection" → nama: settings
    • Insert document:
      {
        "key": "admin_credentials",
        "email": "jexkpinkman@gmail.com",
        "password": "password_kamu"
      }


✏️ EDIT script.js
-----------------
Cari 4 baris paling atas:

  const MONGO_APP_ID = 'data-abcde';
  const MONGO_API_KEY = 'YOUR_DATA_API_KEY';
  const MONGO_CLUSTER = 'Cluster0';

Ganti dengan:
• MONGO_APP_ID → dari step 7 (App ID)
• MONGO_API_KEY → dari step 7 (API Key)
• MONGO_CLUSTER → nama cluster kamu (biasanya Cluster0)

Ganti juga admin fallback (opsional):
  if (email === 'jexkpinkman@gmail.com' && password === 'admin123')


🚀 DEPLOY KE VERCEL
-------------------
1. Buka https://vercel.com → Login
2. "Add New..." → "Project"
3. Pilih "Upload"
4. Drag & drop 3 file: index.html, style.css, script.js
5. Klik "Deploy"


🔑 CARA LOGIN ADMIN
-------------------
1. Buka web kamu
2. Klik "Admin" di navbar
3. Login dengan email & password dari step 10
4. Tombol "+" pojok kanan bawah muncul
5. Klik "+" untuk tambah project baru
6. Hover card project → klik pen (edit) / trash (hapus)


⚠️ PERINGATAN KEAMANAN
-----------------------
• API Key MongoDB terlihat di script.js (frontend)
• Untuk portfolio pribadi ini cukup aman
• Jangan share API key ke publik
• Kalau mau lebih aman, gunakan backend/Next.js


❓ TROUBLESHOOTING
------------------
Q: Web kosong?
A: Cek console (F12). Pastikan MONGO_APP_ID dan MONGO_API_KEY benar.

Q: CORS error?
A: Di MongoDB Atlas → App Services → Data API → pastikan CORS di-enable.

Q: Gak bisa login?
A: Cek email & password di collection settings, atau ganti fallback di script.js.

Q: Gak bisa tambah/edit/hapus?
A: Cek API key punya permission "readWrite".
