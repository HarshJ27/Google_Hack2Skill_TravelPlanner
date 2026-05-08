import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  if (!apiKey) {
    // Return mock data if no API key is provided for the demo
    return NextResponse.json({
      forecast: [
        { date: "2026-05-10", temp: 22, condition: "Sunny", icon: "01d" },
        { date: "2026-05-11", temp: 19, condition: "Partly Cloudy", icon: "02d" },
        { date: "2026-05-12", temp: 18, condition: "Rain", icon: "10d" },
      ]
    });
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await res.json();
    
    // Process 3-hour data into daily summaries
    const dailyForecasts: any[] = [];
    const datesProcessed = new Set();

    data.list.forEach((item: any) => {
      const date = item.dt_txt.split(" ")[0];
      if (!datesProcessed.has(date) && dailyForecasts.length < 5) {
        datesProcessed.add(date);
        dailyForecasts.push({
          date,
          temp: Math.round(item.main.temp),
          condition: item.weather[0].main,
          icon: item.weather[0].icon,
        });
      }
    });

    return NextResponse.json({ forecast: dailyForecasts });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
