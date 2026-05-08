import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { destination, startDate, endDate, budget, groupSize, style } = await req.json();

    console.log("Using API Key starting with:", process.env.GEMINI_API_KEY?.substring(0, 4));
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
      Plan a ${style} trip to ${destination} from ${startDate} to ${endDate} for ${groupSize} people with a total budget of $${budget}.
      
      Return the itinerary in JSON format exactly as follows:
      {
        "destination": "${destination}",
        "summary": "A brief 2-sentence summary of the trip",
        "estimated_total_cost": 0,
        "days": [
          {
            "day": 1,
            "date": "YYYY-MM-DD",
            "theme": "Morning exploration of...",
            "activities": [
              {
                "time": "HH:MM",
                "activity": "Name of activity",
                "description": "Short description",
                "location": { "lat": 0, "lng": 0 },
                "cost_per_person": 0
              }
            ]
          }
        ]
      }
      
      Include realistic coordinates for Google Maps pins.
      Ensure the total cost per person is within the budget constraints.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response (Gemini sometimes wraps it in ```json)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const itinerary = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate itinerary" }, { status: 500 });
  }
}
