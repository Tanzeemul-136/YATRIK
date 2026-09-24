document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  buildNav();
  logActivity('Profile viewed');
  
  const user = getUser();
  if (user) {
    document.getElementById('pAvatar').textContent = (user.display_name || user.name || '?')[0].toUpperCase();
    document.getElementById('pName').textContent = user.display_name || user.name;
    document.getElementById('pEmail').textContent = user.email;
    document.getElementById('pId').textContent = user.user_id || user.id;
    document.getElementById('pDate').textContent = formatDate(user.created_at || new Date());
  }
  
  loadTrips();
});

function switchProfileTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => {
    c.style.display = 'none';
  });
  
  event.target.classList.add('active');
  const tabEl = document.getElementById(tab + 'Tab');
  if (tabEl) tabEl.style.display = 'block';
  
  if (tab === 'logs') loadLogs();
  if (tab === 'trips') loadTrips();
  if (tab === 'favorites') loadFavorites();
}

async function loadTrips() {
  const container = document.getElementById('tripsTab');
  if (!container) return;
  try {
    const res = await apiCall('/trips');
    const trips = res.data || [];
    container.innerHTML = '';
    if (!trips.length) {
      container.innerHTML = '<p>No saved trips found. Plan a trip to get started!</p>';
      return;
    }
    
    trips.forEach(t => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${t.destination_name || 'Trip #' + t.id}</h3>
        <p>📅 ${formatDate(t.start_date)} - ${formatDate(t.end_date)}</p>
        <p>👥 ${t.travelers} travelers | 💰 Budget: ${formatCurrency(t.budget)}</p>
        <p class="text-muted" style="margin-top:1rem; font-size:0.85rem">Saved: ${formatDate(t.created_at)}</p>
      `;
      container.appendChild(card);
    });
  } catch (e) {
    container.innerHTML = `<p class="error-msg" style="display:block">Error loading trips: ${e.message}</p>`;
  }
}

async function loadFavorites() {
  const container = document.getElementById('favoritesTab');
  if (!container) return;
  try {
    const res = await apiCall('/favorites');
    const favorites = res.data || [];
    container.innerHTML = '';
    if (!favorites.length) {
      container.innerHTML = '<p>No favorites yet. Explore destinations to add favorites!</p>';
      return;
    }
    
    favorites.forEach(f => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <span class="badge secondary">${f.item_type}</span>
        <h4>${f.item_name || 'Item #' + f.item_id}</h4>
        <p class="text-muted">Added: ${formatDate(f.created_at)}</p>
      `;
      container.appendChild(card);
    });
  } catch (e) {
    container.innerHTML = `<p class="error-msg" style="display:block">Error loading favorites: ${e.message}</p>`;
  }
}

async function loadLogs() {
  const tbody = document.getElementById('logsTbody');
  if (!tbody) return;
  try {
    const res = await apiCall('/logs');
    const logs = res.data || [];
    tbody.innerHTML = '';
    if (!logs.length) {
      tbody.innerHTML = '<tr><td colspan="3">No activity logs found.</td></tr>';
      return;
    }
    
    logs.forEach(l => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(l.created_at).toLocaleString()}</td>
        <td><strong>${l.action}</strong></td>
        <td>${l.details || ''}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="3" class="error-msg">Error loading logs: ${e.message}</td></tr>`;
  }
}
