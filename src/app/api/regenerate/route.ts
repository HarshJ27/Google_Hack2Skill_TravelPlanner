import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { itinerary, dayNumber, style } = await req.json();

    console.log("Using API Key starting with:", process.env.GEMINI_API_KEY?.substring(0, 4));
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
      You are an expert travel planner. Here is the current itinerary for a trip to ${itinerary.destination}:
      ${JSON.stringify(itinerary)}
      
      The user wants to REGENERATE only Day ${dayNumber}. 
      Keep the same destination, budget context, and ${style} style, but provide completely NEW and FRESH activities for this day.
      
      Return ONLY the JSON for this specific day in this format:
      {
        "day": ${dayNumber},
        "date": "Keep original date",
        "theme": "New theme",
        "activities": [
          {
            "time": "HH:MM",
            "activity": "Name",
            "description": "Short description",
            "location": { "lat": 0, "lng": 0 },
            "cost_per_person": 0
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const newDay = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    return NextResponse.json(newDay);
  } catch (error) {
    console.error("Regenerate Day Error:", error);
    return NextResponse.json({ error: "Failed to regenerate day" }, { status: 500 });
  }
}
