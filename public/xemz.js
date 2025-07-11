// Ganti password admin di sini
const ADMIN_PASSWORD = "admin123";

// Elemen DOM
const loginBtn = document.getElementById('loginBtn');
const loginMsg = document.getElementById('loginMsg');
const adminLogin = document.getElementById('adminLogin');
const adminPanel = document.getElementById('adminPanel');
const logoutBtn = document.getElementById('logoutBtn');
const addUserBtn = document.getElementById('addUserBtn');
const msg = document.getElementById('msg');
const userList = document.getElementById('userList');

// Login
if (loginBtn) {
  loginBtn.onclick = () => {
    const pw = document.getElementById('adminPassword').value.trim();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin', 'true');
      showAdminPanel();
    } else {
      loginMsg.textContent = "❌ Password salah.";
      loginMsg.className = "text-red-300 text-sm mt-4";
      loginMsg.classList.remove('hidden');
    }
  };
}

// Logout
if (logoutBtn) {
  logoutBtn.onclick = () => {
    sessionStorage.removeItem('admin');
    showLogin();
  };
}

// Tampilkan panel/login
function showAdminPanel() {
  if (!adminLogin || !adminPanel) return;
  adminLogin.classList.add('hidden');
  adminPanel.classList.remove('hidden');
  loadUsers();
}

function showLogin() {
  if (!adminLogin || !adminPanel) return;
  adminLogin.classList.remove('hidden');
  adminPanel.classList.add('hidden');
}

// Load users
function loadUsers() {
  if (!userList) return;
  userList.innerHTML = "";
  const users = JSON.parse(localStorage.getItem('users')) || [];

  if (users.length === 0) {
    userList.innerHTML = "<li class='text-white/50'>Belum ada user.</li>";
    return;
  }

  users.forEach((u, index) => {
    const li = document.createElement("li");
    li.className = "flex justify-between items-center bg-white/10 px-4 py-2 rounded";

    const span = document.createElement("span");
    span.textContent = `• ${u.username}`;
    li.appendChild(span);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Hapus";
    delBtn.className = "text-red-400 hover:text-red-600 text-sm underline";
    delBtn.onclick = () => {
      if (confirm(`Hapus user '${u.username}'?`)) {
        users.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
        if (msg) {
          msg.textContent = `✅ User '${u.username}' dihapus.`;
          msg.className = "text-green-300 text-sm mt-4";
          msg.classList.remove('hidden');
        }
      }
    };

    li.appendChild(delBtn);
    userList.appendChild(li);
  });
}

// Tambah user
if (addUserBtn) {
  addUserBtn.onclick = () => {
    const u = document.getElementById('newUsername').value.trim();
    const p = document.getElementById('newPassword').value.trim();

    if (!u || !p) {
      msg.textContent = "❌ Harap isi username dan password.";
      msg.className = "text-red-300 text-sm mt-4";
      msg.classList.remove('hidden');
      return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(x => x.username === u)) {
      msg.textContent = "⚠️ Username sudah terdaftar.";
      msg.className = "text-yellow-300 text-sm mt-4";
      msg.classList.remove('hidden');
      return;
    }

    users.push({ username: u, password: p });
    localStorage.setItem('users', JSON.stringify(users));

    msg.textContent = `✅ User '${u}' berhasil ditambahkan.`;
    msg.className = "text-green-300 text-sm mt-4";
    msg.classList.remove('hidden');

    document.getElementById('newUsername').value = "";
    document.getElementById('newPassword').value = "";
    loadUsers();
  };
}

// Cek session saat load
window.onload = () => {
  if (sessionStorage.getItem('admin') === 'true') {
    showAdminPanel();
  } else {
    showLogin();
  }
};