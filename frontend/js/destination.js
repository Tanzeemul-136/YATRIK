let destinationId;
let destData = {};
let tabData = { places: [], food: [], restaurants: [], souvenirs: [] };
let activeTab = 'places';

// Whitelisted, open-access static assets with zero 403 hotlink blocks
const CDN_ASSETS = {
  // Places & Attractions
  'taj mahal': 'https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?auto=compress&cs=tinysrgb&w=800',
  'agra fort': 'https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg?auto=compress&cs=tinysrgb&w=800',
  'fatehpur sikri': 'https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg?auto=compress&cs=tinysrgb&w=800',
  'mehtab bagh': 'https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?auto=compress&cs=tinysrgb&w=800',
  'golden temple': 'https://images.pexels.com/photos/4134644/pexels-photo-4134644.jpeg?auto=compress&cs=tinysrgb&w=800',
  'jallianwala bagh': 'https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg?auto=compress&cs=tinysrgb&w=800',
  'wagah border': 'https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg?auto=compress&cs=tinysrgb&w=800',
  'hawa mahal': 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=800',
  'amber fort': 'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=800',
  'bara imambara': 'https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg?auto=compress&cs=tinysrgb&w=800',
  'chota imambara': 'https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg?auto=compress&cs=tinysrgb&w=800',
  'rumi darwaza': 'https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg?auto=compress&cs=tinysrgb&w=800',
  'india gate': 'https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg?auto=compress&cs=tinysrgb&w=800',
  'qutub minar': 'https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg?auto=compress&cs=tinysrgb&w=800',
  'red fort': 'https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg?auto=compress&cs=tinysrgb&w=800',
  'gateway of india': 'https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg?auto=compress&cs=tinysrgb&w=800',
  'dashashwamedh ghat': 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=800',

  // Foods
  'petha': 'https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=800',
  'bedmi puri': 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=800',
  'bhalla': 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=800',
  'mughlai paratha': 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800',
  'amritsari kulcha': 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=800',
  'tunday kababi': 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=800',
  'lucknowi biryani': 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800',
  'chole bhature': 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=800',
  'pav bhaji': 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=800',

  // Crafts & Souvenirs
  'phulkari dupatta': 'https://images.pexels.com/photos/6045233/pexels-photo-6045233.jpeg?auto=compress&cs=tinysrgb&w=800',
  'punjabi jutti': 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=800',
  'papad/warian': 'https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=800',
  'marble replica': 'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=800',
  'chikan embroidery': 'https://images.pexels.com/photos/6045233/pexels-photo-6045233.jpeg?auto=compress&cs=tinysrgb&w=800',
  'blue pottery': 'https://images.pexels.com/photos/2162938/pexels-photo-2162938.jpeg?auto=compress&cs=tinysrgb&w=800'
};

// Guaranteed self-contained SVG fallback that can NEVER fail or return 403
function createSvgDataUri(title, category) {
  const themes = {
    places: { bg: '#15803d', icon: '🏛️', tag: 'HERITAGE' },
    food: { bg: '#ea580c', icon: '🍽️', tag: 'CUISINE' },
    restaurants: { bg: '#047857', icon: '🍴', tag: 'DINING' },
    souvenirs: { bg: '#b45309', icon: '🎁', tag: 'CRAFT' }
  };
  const conf = themes[category] || themes.places;
  const safeTitle = (title || 'Yatrik').replace(/[<>&"]/g, '');
  
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <rect width="600" height="380" fill="${conf.bg}"/>
    <circle cx="300" cy="160" r="70" fill="rgba(255,255,255,0.15)"/>
    <text x="50%" y="170" dominant-baseline="middle" text-anchor="middle" font-size="64">${conf.icon}</text>
    <text x="50%" y="270" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="bold">${safeTitle}</text>
    <text x="50%" y="305" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.75)" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" letter-spacing="2">${conf.tag}</text>
  </svg>`;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
}

function resolveAssetUrl(item, category) {
  const name = (item.name || '').trim().toLowerCase();
  
  // 1. Direct match in whitelist
  if (CDN_ASSETS[name]) return CDN_ASSETS[name];

  // 2. Partial match
  for (const k in CDN_ASSETS) {
    if (name.includes(k) || k.includes(name)) return CDN_ASSETS[k];
  }

  // 3. Database URL if valid external URL (excluding known broken wikimedia direct URLs)
  if (item.image_url && item.image_url.startsWith('http') && !item.image_url.includes('wikipedia.org')) {
    return item.image_url;
  }

  // 4. Guaranteed Data-URI SVG
  return createSvgDataUri(item.name, category);
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  buildNav();
  
  const urlParams = new URLSearchParams(window.location.search);
  destinationId = urlParams.get('id');
  
  if (!destinationId) {
    const isHtml = window.location.pathname.endsWith('.html');
    window.location.href = isHtml ? 'india.html' : 'india';
    return;
  }
  
  showLoading('#loadingArea');
  try {
    const res = await apiCall(`/destinations/${destinationId}`);
    destData = res.data;
    renderDestination();
    
    const [attractionsRes, foodsRes, restaurantsRes, souvenirsRes] = await Promise.all([
      apiCall(`/destinations/${destinationId}/attractions`).catch(() => ({ data: [] })),
      apiCall(`/destinations/${destinationId}/foods`).catch(() => ({ data: [] })),
      apiCall(`/destinations/${destinationId}/restaurants`).catch(() => ({ data: [] })),
      apiCall(`/destinations/${destinationId}/souvenirs`).catch(() => ({ data: [] }))
    ]);
    
    tabData.places = attractionsRes.data || [];
    tabData.food = foodsRes.data || [];
    tabData.restaurants = restaurantsRes.data || [];
    tabData.souvenirs = souvenirsRes.data || [];
    
    document.getElementById('loadingArea').style.display = 'none';
    document.getElementById('contentArea').style.display = 'block';
    
    updateFilterDropdown();
    renderActiveTab();
    logActivity('Destination viewed', `Viewed ${destData.name}`);
  } catch (e) {
    document.getElementById('loadingArea').innerHTML = `<p class="error-msg" style="display:block">Error: ${e.message}</p>`;
  }
  
  document.getElementById('tabSearch').addEventListener('input', renderActiveTab);
  document.getElementById('tabFilter').addEventListener('change', renderActiveTab);
  document.getElementById('destFavBtn').addEventListener('click', toggleDestFav);
});

function renderDestination() {
  document.getElementById('destName').textContent = destData.name;
  document.getElementById('destState').textContent = `📍 ${destData.state}`;
  document.getElementById('destDesc').textContent = destData.description || '';
  document.getElementById('destBestTime').innerHTML = `<b>${destData.best_time || 'Oct - Mar'}</b>`;
  document.getElementById('destDays').innerHTML = `<b>${destData.recommended_days || 3} days</b>`;
  document.getElementById('destBudget').innerHTML = `<b>${formatCurrency(destData.daily_budget_estimate || 2500)}</b>`;

  const heroBanner = document.getElementById('destHeroBanner');
  if (heroBanner) {
    const bg = resolveAssetUrl({ name: destData.name }, 'places');
    heroBanner.style.background = `linear-gradient(180deg, rgba(21, 128, 61, 0.45) 0%, rgba(15, 23, 42, 0.88) 100%), url('${bg}') center/cover no-repeat`;
  }
}

function switchTab(tab) {
  const tabs = ['places', 'food', 'restaurants', 'souvenirs'];
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  
  const idx = tabs.indexOf(tab);
  if (idx >= 0) {
    const btn = document.querySelectorAll('.tab-btn')[idx];
    if (btn) btn.classList.add('active');
  }
  
  activeTab = tab;
  document.getElementById('tabSearch').value = '';
  document.getElementById('tabFilter').value = '';
  updateFilterDropdown();
  renderActiveTab();
}

function updateFilterDropdown() {
  const select = document.getElementById('tabFilter');
  select.innerHTML = '<option value="">All Categories</option>';
  
  let options = new Set();
  if (activeTab === 'places') {
    tabData.places.forEach(p => { if (p.category) options.add(p.category); });
  } else if (activeTab === 'food') {
    tabData.food.forEach(f => { if (f.dietary_type) options.add(f.dietary_type); });
  } else if (activeTab === 'restaurants') {
    tabData.restaurants.forEach(r => { if (r.price_range) options.add(r.price_range); });
  }
  
  [...options].sort().forEach(opt => {
    const el = document.createElement('option');
    el.value = opt;
    el.textContent = opt;
    select.appendChild(el);
  });
}

function renderActiveTab() {
  const query = (document.getElementById('tabSearch').value || '').toLowerCase();
  const filter = document.getElementById('tabFilter').value;
  
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  const tabIds = { places: 'placesTab', food: 'foodTab', restaurants: 'restaurantsTab', souvenirs: 'souvenirsTab' };
  const container = document.getElementById(tabIds[activeTab]);
  if (!container) return;
  container.style.display = 'grid';
  container.innerHTML = '';
  
  let items = tabData[activeTab] || [];
  
  const filtered = items.filter(item => {
    const nameMatch = (item.name || '').toLowerCase().includes(query) || 
                      (item.description || '').toLowerCase().includes(query);
    let filterMatch = true;
    if (filter) {
      if (activeTab === 'places') filterMatch = item.category === filter;
      if (activeTab === 'food') filterMatch = item.dietary_type === filter;
      if (activeTab === 'restaurants') filterMatch = item.price_range === filter;
    }
    return nameMatch && filterMatch;
  });
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; color: #64748b;">
        <p>No listings found matching your criteria.</p>
      </div>
    `;
    return;
  }
  
  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card item-card';
    
    const photoUrl = resolveAssetUrl(item, activeTab);
    const fallback = createSvgDataUri(item.name, activeTab);

    let cardBody = `
      <img class="item-card-media" 
           src="${photoUrl}" 
           alt="${item.name}" 
           loading="lazy" 
           referrerpolicy="no-referrer"
           onerror="this.onerror=null;this.src='${fallback}';">
      <div style="padding: 1.25rem; display:flex; flex-direction:column; flex-grow:1;">
    `;

    if (activeTab === 'places') {
      cardBody += `
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <h4 style="color:#0f172a; margin:0 0 0.35rem 0;">${item.name}</h4>
          <button class="fav-btn" style="background:#f1f5f9; border-radius:50%; width:34px; height:34px; border:none; cursor:pointer;" onclick="toggleFav(this, 'attraction', ${item.id})">🤍</button>
        </div>
        <div style="color:var(--brand-green); font-size:0.8rem; font-weight:700; text-transform:uppercase; margin-bottom:0.5rem;">${item.category || 'Historical Site'}</div>
        <p style="color:#475569; font-size:0.88rem; flex-grow:1;">${item.description || ''}</p>
        <div style="display:flex; justify-content:space-between; margin-top:1rem; padding-top:0.75rem; border-top:1px solid #f1f5f9; font-size:0.88rem;">
          <span style="color:#64748b;">⏱️ ${item.duration || '2-3 hrs'}</span>
          <span class="highlight-orange">${Number(item.entry_fee) > 0 ? formatCurrency(item.entry_fee) : 'Free Entry'}</span>
        </div>
      `;
    } else if (activeTab === 'food') {
      const isVeg = (item.dietary_type || '').toLowerCase().includes('veg') && !(item.dietary_type || '').toLowerCase().includes('non');
      cardBody += `
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <h4 style="color:#0f172a; margin:0 0 0.35rem 0;">${item.name}</h4>
          <button class="fav-btn" style="background:#f1f5f9; border-radius:50%; width:34px; height:34px; border:none; cursor:pointer;" onclick="toggleFav(this, 'food', ${item.id})">🤍</button>
        </div>
        <div style="margin-bottom:0.6rem;">
          <span class="badge ${isVeg ? 'success' : 'danger'}">${item.dietary_type || 'Regional Cuisine'}</span>
        </div>
        <p style="color:#475569; font-size:0.88rem; flex-grow:1;">${item.description || ''}</p>
        <div style="display:flex; justify-content:space-between; margin-top:1rem; padding-top:0.75rem; border-top:1px solid #f1f5f9; font-size:0.88rem;">
          <span style="color:#64748b;">📍 ${item.where_to_find || 'Local Bazaars'}</span>
          <span class="highlight-orange">${formatCurrency(item.price || 120)}</span>
        </div>
      `;
    } else if (activeTab === 'restaurants') {
      cardBody += `
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <h4 style="color:#0f172a; margin:0 0 0.35rem 0;">${item.name}</h4>
          <button class="fav-btn" style="background:#f1f5f9; border-radius:50%; width:34px; height:34px; border:none; cursor:pointer;" onclick="toggleFav(this, 'restaurant', ${item.id})">🤍</button>
        </div>
        <div style="color:var(--brand-green); font-size:0.8rem; font-weight:700; margin-bottom:0.5rem;">${item.cuisine || 'Authentic Regional'}</div>
        <p style="color:#475569; font-size:0.88rem; flex-grow:1;"><strong>Specialty:</strong> ${item.specialty || 'Signature Platter'}</p>
        <div style="display:flex; justify-content:space-between; margin-top:1rem; padding-top:0.75rem; border-top:1px solid #f1f5f9; font-size:0.88rem;">
          <span style="color:#64748b;">📍 ${item.location || 'City Center'}</span>
          <span class="highlight-orange">${item.price_range || '₹₹ (Moderate)'}</span>
        </div>
      `;
    } else if (activeTab === 'souvenirs') {
      cardBody += `
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <h4 style="color:#0f172a; margin:0 0 0.35rem 0;">${item.name}</h4>
          <button class="fav-btn" style="background:#f1f5f9; border-radius:50%; width:34px; height:34px; border:none; cursor:pointer;" onclick="toggleFav(this, 'souvenir', ${item.id})">🤍</button>
        </div>
        <div style="color:var(--brand-green); font-size:0.8rem; font-weight:700; text-transform:uppercase; margin-bottom:0.5rem;">Authentic Craftwork</div>
        <p style="color:#475569; font-size:0.88rem; flex-grow:1;">${item.description || ''}</p>
        <div style="display:flex; justify-content:space-between; margin-top:1rem; padding-top:0.75rem; border-top:1px solid #f1f5f9; font-size:0.88rem;">
          <span style="color:#64748b;">📍 ${item.purchase_location || 'Artisan Hubs'}</span>
          <span class="highlight-orange">${formatCurrency(item.price || 500)}</span>
        </div>
      `;
    }

    cardBody += `</div>`;
    card.innerHTML = cardBody;
    container.appendChild(card);
  });
}

function planTrip() {
  const isHtml = window.location.pathname.endsWith('.html');
  window.location.href = isHtml 
    ? `configure.html?destination=${destinationId}` 
    : `configure?destination=${destinationId}`;
}

async function toggleDestFav() {
  const btn = document.getElementById('destFavBtn');
  const isActive = btn.classList.contains('active');
  try {
    if (isActive) {
      await apiCall(`/favorites/${destinationId}`, { method: 'DELETE', body: JSON.stringify({ item_type: 'destination', item_id: parseInt(destinationId) }) });
      btn.classList.remove('active');
      btn.textContent = '🤍';
      showToast('Removed from favorites');
    } else {
      await apiCall('/favorites', { method: 'POST', body: JSON.stringify({ item_type: 'destination', item_id: parseInt(destinationId) }) });
      btn.classList.add('active');
      btn.textContent = '❤️';
      showToast('Saved to favorites!');
    }
  } catch(e) {
    showToast(e.message, 'error');
  }
}

async function toggleFav(btn, type, id) {
  const isActive = btn.classList.contains('active');
  try {
    if (isActive) {
      await apiCall(`/favorites/${id}`, { method: 'DELETE', body: JSON.stringify({ item_type: type, item_id: id }) });
      btn.classList.remove('active');
      btn.textContent = '🤍';
    } else {
      await apiCall('/favorites', { method: 'POST', body: JSON.stringify({ item_type: type, item_id: id }) });
      btn.classList.add('active');
      btn.textContent = '❤️';
    }
  } catch(e) {
    showToast(e.message, 'error');
  }
}