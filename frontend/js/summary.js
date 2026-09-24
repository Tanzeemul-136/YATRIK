document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  buildNav();
  logActivity('Trip summary viewed');
  
  const config = JSON.parse(localStorage.getItem('yatrik_current_trip') || '{}');
  if (!config.destination_id) { window.location.href = 'home.html'; return; }
  
  const aiPlan = JSON.parse(localStorage.getItem('yatrik_ai_plan') || 'null');
  const manualTransport = JSON.parse(localStorage.getItem('yatrik_selected_transport') || 'null');
  
  document.getElementById('sDest').textContent = config.destination_name;
  document.getElementById('sPax').textContent = config.num_travelers;
  document.getElementById('sDates').textContent = `${formatDate(config.start_date)} to ${formatDate(config.end_date)}`;
  document.getElementById('sDays').textContent = config.num_days;
  
  document.getElementById('modeIndicator').textContent = config.mode === 'ai' ? '🤖 AI GENERATED' : '🗺️ MANUAL PLAN';
  
  let bTransport = 0, bAcc = 0, bFood = 0, bSight = 0;
  
  if (config.mode === 'ai' && aiPlan) {
    if(aiPlan.is_fallback) {
      showToast("AI unavailable — generated using Yatrik's fallback planning engine.", 'error');
    }
    
    // Itinerary
    document.getElementById('itineraryBox').style.display = 'block';
    const itContainer = document.getElementById('sItinerary');
    if(aiPlan.itinerary) {
      aiPlan.itinerary.forEach(day => {
        const d = document.createElement('div');
        d.className = 'day-card';
        d.innerHTML = `<h4>Day ${day.day}: ${day.theme || 'Exploration'}</h4>
                       <p>${day.description || 'Explore the best of ' + config.destination_name}</p>`;
        itContainer.appendChild(d);
      });
    }
    
    // Recommendations
    if(aiPlan.recommendations && aiPlan.recommendations.length > 0) {
      document.getElementById('recommendationsBox').style.display = 'block';
      const rContainer = document.getElementById('sRecs');
      aiPlan.recommendations.forEach(r => {
        const li = document.createElement('li');
        li.textContent = r;
        rContainer.appendChild(li);
      });
    }
    
    bTransport = aiPlan.budget_breakdown?.transport || 5000;
    bAcc = aiPlan.budget_breakdown?.accommodation || (config.num_days * 2000);
    bFood = aiPlan.budget_breakdown?.food || (config.num_days * 1000);
    bSight = aiPlan.budget_breakdown?.activities || 1500;
    
  } else {
    // Manual mode
    if(manualTransport) {
      document.getElementById('transportBox').style.display = 'block';
      document.getElementById('sTransportDetails').innerHTML = `
        <strong>${manualTransport.provider}</strong> (${manualTransport.type}) <br>
        Departure: ${manualTransport.departure} | Duration: ${manualTransport.duration} <br>
        Cost: ${formatCurrency(manualTransport.price)}
      `;
      bTransport = manualTransport.price;
    }
    bAcc = config.num_days * (config.accommodation_pref==='Budget'?1000:config.accommodation_pref==='Standard'?2500:5000);
    bFood = config.num_days * (config.food_pref==='Any'?1000:1500);
    bSight = 2000;
  }
  
  // Render Budget
  const totalCost = bTransport + bAcc + bFood + bSight;
  const remaining = config.total_budget - totalCost;
  
  document.getElementById('budgetTable').innerHTML = `
    <tr><td>Transportation</td><td>${formatCurrency(bTransport)}</td></tr>
    <tr><td>Accommodation (Est)</td><td>${formatCurrency(bAcc)}</td></tr>
    <tr><td>Food & Dining (Est)</td><td>${formatCurrency(bFood)}</td></tr>
    <tr><td>Activities/Misc</td><td>${formatCurrency(bSight)}</td></tr>
    <tr class="total"><td>Total Estimated Cost</td><td>${formatCurrency(totalCost)}</td></tr>
    <tr><td style="color:${remaining>=0?'var(--success-color)':'var(--accent-red)'}">Budget Status (Limit: ${formatCurrency(config.total_budget)})</td>
        <td style="color:${remaining>=0?'var(--success-color)':'var(--accent-red)'}">${remaining>=0 ? 'Under budget by ' + formatCurrency(remaining) : 'Over budget by ' + formatCurrency(Math.abs(remaining))}</td></tr>
  `;
});

async function saveTrip() {
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = 'Saving...';
  
  const config = JSON.parse(localStorage.getItem('yatrik_current_trip') || '{}');
  const aiPlan = JSON.parse(localStorage.getItem('yatrik_ai_plan') || 'null');
  
  try {
    await apiCall('/trips', {
      method: 'POST',
      body: JSON.stringify({
        destination_id: config.destination_id,
        start_date: config.start_date,
        end_date: config.end_date,
        travelers: config.num_travelers,
        budget: config.total_budget,
        details: JSON.stringify(config),
        ai_plan: aiPlan ? JSON.stringify(aiPlan) : null
      })
    });
    showToast('Trip saved successfully!', 'success');
    btn.textContent = 'Saved!';
  } catch(e) {
    showToast('Failed to save trip: ' + e.message, 'error');
    btn.disabled = false;
    btn.textContent = '💾 SAVE TRIP';
  }
}
