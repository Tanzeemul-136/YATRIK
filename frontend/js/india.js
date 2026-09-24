let allDestinations = [];

// Curated high-resolution photography for all 23 Indian destinations
const DESTINATION_IMAGES = {
  'Agra': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
  'Amritsar': 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=800&q=80',
  'Andaman & Nicobar': 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
  'Bengaluru': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
  'Chennai': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
  'Darjeeling': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
  'Delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
  'Goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
  'Hyderabad': 'https://images.unsplash.com/photo-1605007493699-ce65834f8a00?auto=format&fit=crop&w=800&q=80',
  'Jaipur': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
  'Kashmir': 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
  'Kerala': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
  'Kolkata': 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80',
  'Ladakh': 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
  'Lucknow': 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
  'Manali': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
  'Mumbai': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
  'Mysuru': 'https://images.unsplash.com/photo-1600100397608-f010f443b7ec?auto=format&fit=crop&w=800&q=80',
  'Ooty': 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
  'Rishikesh': 'https://images.unsplash.com/photo-1600100397608-f010f443b7ec?auto=format&fit=crop&w=800&q=80',
  'Shimla': 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=80',
  'Udaipur': 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80',
  'Varanasi': 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=800&q=80'
};

const DEFAULT_DEST_IMAGE = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80';

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  buildNav();
  logActivity('India destinations viewed');
  
  const grid = document.getElementById('destinationsGrid');
  showLoading(grid);
  
  try {
    const res = await apiCall('/destinations');
    allDestinations = res.data || [];
    populateStates();
    renderDestinations();
  } catch(e) {
    grid.innerHTML = `<p class="error-msg" style="display:block">Failed to load destinations: ${e.message}</p>`;
  }
  
  document.getElementById('searchInput').addEventListener('input', renderDestinations);
  document.getElementById('stateFilter').addEventListener('change', renderDestinations);
  document.getElementById('sortSelect').addEventListener('change', renderDestinations);
});

function populateStates() {
  const states = [...new Set(allDestinations.map(d => d.state))].filter(Boolean).sort();
  const select = document.getElementById('stateFilter');
  states.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    select.appendChild(opt);
  });
}

function renderDestinations() {
  const query = (document.getElementById('searchInput').value || '').toLowerCase();
  const state = document.getElementById('stateFilter').value;
  const sort = document.getElementById('sortSelect').value;
  
  let filtered = allDestinations.filter(d => {
    const matchQ = (d.name || '').toLowerCase().includes(query) || 
                   (d.state || '').toLowerCase().includes(query) || 
                   (d.description || '').toLowerCase().includes(query);
    const matchS = state ? d.state === state : true;
    return matchQ && matchS;
  });
  
  if (sort === 'alpha') filtered.sort((a,b) => a.name.localeCompare(b.name));
  else if (sort === 'budget') filtered.sort((a,b) => (a.daily_budget_estimate || 0) - (b.daily_budget_estimate || 0));
  else if (sort === 'days') filtered.sort((a,b) => (a.recommended_days || 0) - (b.recommended_days || 0));
  
  const grid = document.getElementById('destinationsGrid');
  grid.innerHTML = '';
  
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #94a3b8;">
        <h3>No destination nodes matched</h3>
        <p>Try searching another city or clearing your state filter.</p>
      </div>
    `;
    return;
  }
  
  filtered.forEach(d => {
    const card = document.createElement('div');
    card.className = 'card dest-card';
    
    // Automatically use clean route (/destination) or .html (/destination.html)
    const isHtmlRoute = window.location.pathname.endsWith('.html');
    const targetUrl = isHtmlRoute ? `destination.html?id=${d.id}` : `destination?id=${d.id}`;
    
    card.onclick = (e) => {
      e.preventDefault();
      window.location.href = targetUrl;
    };
    
    // Choose photo: priority to DB image_url, then curated map, then fallback
    const imgSrc = (d.image_url && d.image_url.startsWith('http')) 
      ? d.image_url 
      : (DESTINATION_IMAGES[d.name] || DEFAULT_DEST_IMAGE);
    
    card.innerHTML = `
      <img class="dest-thumb" 
           src="${imgSrc}" 
           alt="${d.name}" 
           loading="lazy" 
           onerror="this.onerror=null;this.src='${DEFAULT_DEST_IMAGE}';">
      <div class="dest-card-content">
        <h3>${d.name}</h3>
        <div class="dest-state">📍 ${d.state}</div>
        <p>${(d.description || '').substring(0, 110)}...</p>
        <div class="dest-meta">
          <span>⏱️ <strong>${d.recommended_days || 2} days</strong></span>
          <span>💰 <strong>${formatCurrency(d.daily_budget_estimate || 2000)}/day</strong></span>
          <span>🌤️ <strong>${d.best_time || 'Oct - Mar'}</strong></span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}