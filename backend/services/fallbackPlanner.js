const generateFallbackPlan = (tripData, destinationData) => {
  const destination = tripData.destination || tripData.destination_name;
  const start_date = tripData.start_date;
  const end_date = tripData.end_date;
  const travelers = tripData.travelers || tripData.num_travelers || 1;
  const budget = Number(tripData.budget || tripData.total_budget || 10000);
  const food_pref = tripData.food_pref || tripData.food_preference;
  const trip_style = tripData.trip_style || 'Balanced';
  const { attractions = [], foods = [], restaurants = [] } = destinationData;

  const start = new Date(start_date);
  const end = new Date(end_date);
  const diffTime = Math.abs(end - start);
  const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1);
  
  const perDayBudget = Math.round(budget / days);
  
  // Basic budget allocation
  const budgetBreakdown = {
    transport: Math.round(budget * 0.30),
    accommodation: Math.round(budget * 0.30),
    food: Math.round(budget * 0.25),
    attractions: Math.round(budget * 0.10),
    local_transport: Math.round(budget * 0.05),
    shopping: 0,
    miscellaneous: 0,
    total_estimated: budget,
    remaining_budget: 0
  };

  const isVegetarian = food_pref && food_pref.toLowerCase() === 'vegetarian';
  const availableFoods = isVegetarian 
    ? foods.filter(f => f.dietary_type && f.dietary_type.toLowerCase() === 'vegetarian')
    : foods;

  const itinerary = [];
  
  for (let i = 1; i <= days; i++) {
    const dayAttractions = attractions.slice((i - 1) * 2, i * 2);
    const dayFoods = availableFoods.slice((i - 1) * 2, i * 2);
    const dayRestaurant = restaurants.length > 0 ? restaurants[(i - 1) % restaurants.length] : null;
    
    itinerary.push({
      day: i,
      morning: {
        activity: 'Sightseeing',
        place: dayAttractions[0] ? dayAttractions[0].name : 'Local exploration',
        cost: dayAttractions[0] && dayAttractions[0].entry_fee ? Number(dayAttractions[0].entry_fee) : 0
      },
      afternoon: {
        activity: 'Lunch & Relax',
        place: dayRestaurant ? dayRestaurant.name : 'Local eatery',
        cost: Math.round(perDayBudget * 0.1)
      },
      evening: {
        activity: 'Sightseeing/Leisure',
        place: dayAttractions[1] ? dayAttractions[1].name : 'City Center Walk',
        cost: dayAttractions[1] && dayAttractions[1].entry_fee ? Number(dayAttractions[1].entry_fee) : 0
      },
      food_recommendations: dayFoods.map(f => f.name),
      estimated_daily_cost: perDayBudget
    });
  }

  const result = {
    trip_overview: {
      destination,
      duration: `${days} days`,
      travelers,
      total_budget: budget
    },
    transport_recommendation: {
      mode: tripData.preferred_transport || 'Flight/Train',
      estimated_cost: budgetBreakdown.transport,
      reason: 'Calculated from baseline transportation budget distribution'
    },
    daily_itinerary: itinerary,
    budget_breakdown: budgetBreakdown
  };

  if (perDayBudget < 800) {
    result.budget_warning = 'The selected budget may not be sufficient for the requested trip. Consider cheaper transport, budget accommodation, and local street food.';
  }

  return result;
};

module.exports = { generateFallbackPlan };