const API_BASE = 'http://localhost:5000/api';

function getAuthToken() { return localStorage.getItem('yatrik_token'); }
function getUser() { return JSON.parse(localStorage.getItem('yatrik_user') || 'null'); }
function setAuth(user, token) { localStorage.setItem('yatrik_token', token); localStorage.setItem('yatrik_user', JSON.stringify(user)); }
function clearAuth() { localStorage.removeItem('yatrik_token'); localStorage.removeItem('yatrik_user'); }
function isAuthenticated() { return !!getAuthToken(); }
function requireAuth() { if (!isAuthenticated()) { window.location.href = 'index.html'; return false; } return true; }

async function apiCall(endpoint, options = {}) {
  const token = getAuthToken();
  const config = {
    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    ...options
  };
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    let data;
    try { data = await res.json(); } catch(e) { data = {}; }
    if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
    return data;
  } catch (err) {
    if (err.message.includes('Failed to fetch')) throw new Error('Server unavailable. Please check your connection.');
    throw err;
  }
}

function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  if(type === 'error') toast.style.borderLeftColor = 'var(--accent-red)';
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3000);
}

function showLoading(container) {
  if (typeof container === 'string') container = document.querySelector(container);
  if (container) container.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';
}

function hideLoading(container) {
  if (typeof container === 'string') container = document.querySelector(container);
  if (container) {
    const spin = container.querySelector('.spinner-container');
    if (spin) spin.remove();
  }
}

function formatCurrency(amount) { return '₹' + Number(amount).toLocaleString('en-IN'); }
function formatDate(date) { return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
function calculateDays(start, end) { return Math.ceil((new Date(end) - new Date(start)) / (1000*60*60*24)) + 1; }

function buildNav() {
  const user = getUser();
  const nav = document.createElement('nav');
  nav.innerHTML = `
    <div class="brand"><a href="home.html">YATRIK</a></div>
    <div class="nav-links">
      <a href="home.html">Home</a>
      <a href="about.html">About</a>
    </div>
    <div class="profile-menu">
      ${user ? `
        <button class="profile-btn" onclick="document.getElementById('p-drop').classList.toggle('show')">
          👤 ${user.display_name || user.name || 'Profile'} ▼
        </button>
        <div id="p-drop" class="profile-dropdown">
          <a href="profile.html">My Profile</a>
          <a href="javascript:void(0)" onclick="logout()">Logout</a>
        </div>
      ` : `<a href="index.html">Login</a>`}
    </div>
  `;
  document.body.insertBefore(nav, document.body.firstChild);
  
  // click outside to close dropdown
  document.addEventListener('click', (e) => {
    const drop = document.getElementById('p-drop');
    if (drop && !e.target.closest('.profile-menu')) {
      drop.classList.remove('show');
    }
  });
}

function logout() {
  clearAuth();
  window.location.href = 'index.html';
}

async function logActivity(action, details = '') {
  if(!isAuthenticated()) return;
  try { await apiCall('/logs', { method: 'POST', body: JSON.stringify({ action, details }) }); } catch(e) { console.warn('Log failed:', e); }
}
