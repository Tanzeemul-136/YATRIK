let tripConfig;
let currentTransport = 'Flight';
let currentDiscovery = 'places';
let discoveryData = { places: [], food: [], restaurants: [], souvenirs: [] };
let transportData = { 'Flight': [], 'Train': [], 'Bus': [], 'Cab': [] };
let selectedTransport = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  buildNav();
  
  const rawConfig = localStorage.getItem('yatrik_current_trip');
  if (!rawConfig) {
    window.location.href = 'home.html';
    return;
  }
  tripConfig = JSON.parse(rawConfig);
  
  document.getElementById('tripDetails').textContent = 
    `To: ${tripConfig.destination_name} | ${formatDate(tripConfig.start_date)} - ${formatDate(tripConfig.end_date)} | ${tripConfig.num_travelers} Travelers | Budget: ${formatCurrency(tripConfig.total_budget)}`;
  
  logActivity('Travel page viewed', `Manual travel page for ${tripConfig.destination_name}`);
  
  try {
    // Load transport options
    try {
      const tsResponse = await apiCall(`/transport/${tripConfig.destination_id}`);
      const ts = tsResponse.data || [];
      ts.forEach(t => {
        if (transportData[t.transport_type]) {
          transportData[t.transport_type].push({
            id: t.id,
            provider: t.provider,
            departure: t.departure || 'N/A',
            arrival: t.arrival || 'N/A',
            duration: t.duration || 'N/A',
            type: t.class_type || t.vehicle_type || 'Standard',
            price: t.estimated_price || 0,
            status: t.status || 'Available'
          });
        }
      });
    } catch(e) {
      generateMockTransport();
    }
    
    // Ensure each category has data (add mock if empty)
    ['Flight', 'Train', 'Bus', 'Cab'].forEach(mode => {
      if (transportData[mode].length === 0) generateMockForMode(mode);
    });
    
    // Load discovery data in parallel
    const [attractionsRes, foodsRes, restaurantsRes, souvenirsRes] = await Promise.all([
      apiCall(`/destinations/${tripConfig.destination_id}/attractions`).catch(() => ({ data: [] })),
      apiCall(`/destinations/${tripConfig.destination_id}/foods`).catch(() => ({ data: [] })),
      apiCall(`/destinations/${tripConfig.destination_id}/restaurants`).catch(() => ({ data: [] })),
      apiCall(`/destinations/${tripConfig.destination_id}/souvenirs`).catch(() => ({ data: [] }))
    ]);
    
    discoveryData.places = attractionsRes.data || [];
    discoveryData.food = foodsRes.data || [];
    discoveryData.restaurants = restaurantsRes.data || [];
    discoveryData.souvenirs = souvenirsRes.data || [];
    
    // Auto-select transport tab if user had preference
    if (tripConfig.travel_mode && tripConfig.travel_mode !== 'Any') {
      currentTransport = tripConfig.travel_mode;
    }
    
    renderTransport();
    renderDiscovery();
  } catch (e) {
    showToast('Failed to load details: ' + e.message, 'error');
  }
});

function generateMockForMode(mode) {
  const providers = {
    'Flight': ['IndiGo', 'Air India', 'Akasa Air'],
    'Train': ['Vande Bharat', 'Rajdhani Express', 'Shatabdi Express'],
    'Bus': ['UPSRTC Volvo', 'IntrCity SmartBus', 'Zingbus'],
    'Cab': ['Uber Intercity', 'Ola Prime', 'Uber SUV']
  };
  const costs = { 'Flight': 4500, 'Train': 1200, 'Bus': 800, 'Cab': 7000 };
  const durations = { 'Flight': '1h 30m', 'Train': '6h', 'Bus': '8h', 'Cab': '5h' };
  
  (providers[mode] || []).forEach((p, i) => {
    transportData[mode].push({
      id: `${mode}-mock-${i}`,
      provider: p,
      departure: `${6 + i * 4}:00`,
      arrival: '...',
      duration: durations[mode],
      type: 'Standard',
      price: costs[mode] + (i * 500),
      status: 'Available (Demo)'
    });
  });
}

function generateMockTransport() {
  ['Flight', 'Train', 'Bus', 'Cab'].forEach(mode => generateMockForMode(mode));
}

function switchTransportTab(mode) {
  currentTransport = mode;
  document.querySelectorAll('#transportTabs .tab-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  renderTransport();
}

function renderTransport() {
  const area = document.getElementById('transportArea');
  const sortEl = document.getElementById('transportSort');
  const sort = sortEl ? sortEl.value : '';
  let items = [...transportData[currentTransport]];
  
  if (sort === 'cheapest') items.sort((a, b) => a.price - b.price);
  if (sort === 'fastest') items.sort((a, b) => {
    const parseDur = d => parseInt(d) || 999;
    return parseDur(a.duration) - parseDur(b.duration);
  });
  
  area.innerHTML = '';
  if (!items.length) { area.innerHTML = '<p>No options available for this route.</p>'; return; }
  
  items.forEach(item => {
    const row = document.createElement('div');
    const isSelected = selectedTransport && selectedTransport.id === item.id;
    row.className = `transport-row ${isSelected ? 'selected' : ''}`;
    row.innerHTML = `
      <div>
        <h4>${item.provider} <span class="badge secondary">${item.type}</span></h4>
        <div class="text-muted" style="font-size:0.9rem;">Dep: ${item.departure} | Arr: ${item.arrival} | Duration: ${item.duration}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:1.2rem; font-weight:bold; color:var(--accent-gold); margin-bottom:0.5rem;">${formatCurrency(item.price)}</div>
        <button onclick="selectTransport('${item.id}')" class="${isSelected ? 'primary' : ''}">${isSelected ? '✓ Selected' : 'Select'}</button>
      </div>
    `;
    area.appendChild(row);
  });
}

function selectTransport(id) {
  selectedTransport = transportData[currentTransport].find(t => String(t.id) === String(id));
  if (selectedTransport) {
    selectedTransport.transport_type = currentTransport;
    localStorage.setItem('yatrik_selected_transport', JSON.stringify(selectedTransport));
  }
  renderTransport();
  showToast('Transport selected!');
}

function switchDiscoveryTab(tab) {
  currentDiscovery = tab;
  document.querySelectorAll('#discoveryTabs .tab-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  renderDiscovery();
}

function renderDiscovery() {
  const area = document.getElementById('discoveryArea');
  area.innerHTML = '';
  
  let items = discoveryData[currentDiscovery] || [];
  if (!items.length) { area.innerHTML = '<p>No items found for this category.</p>'; return; }
  
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    
    let details = '';
    if (currentDiscovery === 'places') {
      details = `
        <h4>${item.name}</h4>
        <div class="item-meta"><span class="badge secondary">${item.category || ''}</span> ⏱️ ${item.duration || 'N/A'} | 💵 ${formatCurrency(item.entry_fee || 0)}</div>
        <p style="font-size:0.9rem; color:var(--text-muted);">${item.description || ''}</p>
      `;
    } else if (currentDiscovery === 'food') {
      const dietBadge = (item.dietary_type || '').toLowerCase().includes('non') ? 'danger' : 'success';
      details = `
        <h4>${item.name}</h4>
        <div class="item-meta"><span class="badge ${dietBadge}">${item.dietary_type || ''}</span> 💰 ${formatCurrency(item.price || 0)}</div>
        <p style="font-size:0.9rem; color:var(--text-muted);">${item.description || ''}</p>
      `;
    } else if (currentDiscovery === 'restaurants') {
      details = `
        <h4>${item.name}</h4>
        <div class="item-meta"><span class="badge secondary">${item.price_range || ''}</span> ${item.cuisine || ''}</div>
        <p style="font-size:0.9rem; color:var(--text-muted);">📍 ${item.location || ''} | ⭐ ${item.specialty || ''}</p>
      `;
    } else if (currentDiscovery === 'souvenirs') {
      details = `
        <h4>${item.name}</h4>
        <div class="item-meta">💰 ${formatCurrency(item.price || 0)}</div>
        <p style="font-size:0.9rem; color:var(--text-muted);">${item.description || ''}</p>
        ${item.purchase_location ? `<div class="text-muted" style="font-size:0.85rem">📍 ${item.purchase_location}</div>` : ''}
      `;
    }
    
    card.innerHTML = details;
    area.appendChild(card);
  });
}

function proceedToSummary() {
  if (!selectedTransport) {
    showToast('Please select a transport option first', 'error');
    return;
  }
  window.location.href = 'summary.html';
}
