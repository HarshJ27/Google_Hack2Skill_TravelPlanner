'use client';

import { useState } from 'react';
import OnboardingForm from '@/components/OnboardingForm';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [tripData, setTripData] = useState<any>(null);
  const [generatedItinerary, setGeneratedItinerary] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOnboardingComplete = async (data: any) => {
    setTripData(data);
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const itinerary = await response.json();
      if (itinerary.error) throw new Error(itinerary.error);
      
      setGeneratedItinerary(itinerary);
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate itinerary. Please try again.");
      setTripData(null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="main-layout">
      {!tripData && !isGenerating && (
        <div className="centered-content">
          <OnboardingForm onComplete={handleOnboardingComplete} />
        </div>
      )}

      {isGenerating && (
        <div className="centered-content animate-fade-in">
          <div className="loading-state">
            <div className="spinner"></div>
            <h3>Crafting your perfect itinerary...</h3>
            <p>Our AI is scouting the best spots for your {tripData?.style} trip to {tripData?.destination}.</p>
          </div>
        </div>
      )}

      {generatedItinerary && !isGenerating && (
        <Dashboard itinerary={generatedItinerary} tripData={tripData} />
      )}

    </main>
  );
}
