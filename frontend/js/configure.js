let destinationId;
let destName = '';

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  buildNav();
  
  const urlParams = new URLSearchParams(window.location.search);
  destinationId = urlParams.get('destination');
  
  if (!destinationId) {
    window.location.href = 'india.html';
    return;
  }
  
  try {
    const res = await apiCall(`/destinations/${destinationId}`);
    destName = res.data.name;
    document.getElementById('destNameDisplay').textContent = destName;
    document.getElementById('destInput').value = destName;
  } catch(e) {
    showToast('Failed to load destination', 'error');
  }
  
  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  const startEl = document.getElementById('startDate');
  const endEl = document.getElementById('endDate');
  startEl.min = today;
  
  startEl.addEventListener('change', () => {
    endEl.min = startEl.value;
    updateDays();
  });
  endEl.addEventListener('change', updateDays);
});

function updateDays() {
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;
  if (start && end) {
    const days = calculateDays(start, end);
    document.getElementById('numDays').value = days > 0 ? days : 0;
  }
}

async function submitForm(mode) {
  const err = document.getElementById('formError');
  err.style.display = 'none';
  
  const form = document.getElementById('configForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;
  if (new Date(end) < new Date(start)) {
    err.textContent = "End date cannot be before start date.";
    err.style.display = 'block';
    return;
  }
  
  const config = {
    destination_id: destinationId,
    destination_name: destName,
    start_location: document.getElementById('startLoc').value,
    start_date: start,
    end_date: end,
    num_days: parseInt(document.getElementById('numDays').value),
    num_travelers: parseInt(document.getElementById('numTravelers').value),
    total_budget: parseFloat(document.getElementById('totalBudget').value),
    travel_mode: document.getElementById('travelMode').value,
    accommodation_pref: document.getElementById('accPref').value,
    food_pref: document.getElementById('foodPref').value,
    trip_style: document.getElementById('tripStyle').value,
    mode: mode
  };
  
  localStorage.setItem('yatrik_current_trip', JSON.stringify(config));
  logActivity('Trip configured', `Configured ${mode} trip to ${destName}`);
  
  if (mode === 'manual') {
    window.location.href = `travel.html?destination=${destinationId}`;
  } else {
    // AI Mode - call API and go to summary
    showLoading('main');
    try {
      const res = await apiCall('/ai/plan', {
        method: 'POST',
        body: JSON.stringify(config)
      });
      localStorage.setItem('yatrik_ai_plan', JSON.stringify(res.data || res));
      window.location.href = 'summary.html';
    } catch(e) {
      hideLoading('main');
      showToast('AI Planning failed: ' + e.message + '. Try Manual mode.', 'error');
    }
  }
}
