const axios = require('axios'); // Optional if fetch is used, but we'll use native fetch here

const generateAIPlan = async (tripData, destinationData) => {
  const { destination, start_date, end_date, travelers, budget, style } = tripData;
  const { attractions, foods, restaurants, souvenirs } = destinationData;

  const prompt = `
You are an expert travel planner. Create a day-by-day itinerary for a trip.
Trip Details:
- Destination: ${destination}
- Dates: ${start_date} to ${end_date}
- Travelers: ${travelers}
- Total Budget: ${budget}
- Style: ${style || 'Balanced'}

Available Attractions: ${JSON.stringify(attractions)}
Available Foods: ${JSON.stringify(foods)}
Available Restaurants: ${JSON.stringify(restaurants)}
Available Souvenirs: ${JSON.stringify(souvenirs)}

Instructions:
1. Create a detailed day-by-day itinerary.
2. Ensure you stay within the budget.
3. Recommend local transport options.
4. Provide a budget breakdown.
5. If the budget is insufficient for this trip, explicitly flag it with a warning.
Respond strictly with a structured text plan containing the itinerary and budget breakdown.
`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 seconds timeout

    const url = process.env.OLLAMA_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'llama3';

    const response = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: prompt
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama responded with status: ${response.status}`);
    }

    const text = await response.text();
    // Parse streaming JSON lines
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    let fullResponse = '';
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.response) {
          fullResponse += parsed.response;
        }
      } catch (e) {
        // ignore parse error for individual line
      }
    }

    return fullResponse;
  } catch (error) {
    console.error('generateAIPlan error:', error);
    if (error.name === 'AbortError') {
      throw new Error('AI Generation timed out after 120 seconds');
    }
    if (error.cause && error.cause.code === 'ECONNREFUSED') {
      throw new Error('Connection refused to AI service');
    }
    throw error;
  }
};

module.exports = { generateAIPlan };
