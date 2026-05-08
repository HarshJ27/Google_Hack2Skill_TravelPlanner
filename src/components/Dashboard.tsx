'use client';

import { useState, useEffect } from 'react';
import MapView from './MapView';
import Itinerary from './Itinerary';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Share2, FileDown } from 'lucide-react';
import './Dashboard.css';

interface DashboardProps {
  itinerary: any;
  tripData: any;
}

export default function Dashboard({ itinerary: initialItinerary, tripData }: DashboardProps) {
  const [itinerary, setItinerary] = useState(initialItinerary);
  const [weather, setWeather] = useState<any[]>([]);
  const [activeDay, setActiveDay] = useState(1);

  useEffect(() => {
    // Fetch weather for the destination
    const fetchWeather = async () => {
      // Use coordinates from the first activity if available
      const lat = itinerary.days[0]?.activities[0]?.location?.lat;
      const lng = itinerary.days[0]?.activities[0]?.location?.lng;
      
      if (lat && lng) {
        const res = await fetch(`/api/weather?lat=${lat}&lon=${lng}`);
        const data = await res.json();
        setWeather(data.forecast || []);
      }
    };
    
    fetchWeather();
  }, [itinerary]);

  const handleRegenerateDay = async (dayNumber: number) => {
    // TODO: Implement regenerate day API call
    console.log("Regenerating day", dayNumber);
  };

  const handleReorderActivities = (dayNumber: number, newActivities: any[]) => {
    const updatedDays = itinerary.days.map((day: any) => 
      day.day === dayNumber ? { ...day, activities: newActivities } : day
    );
    setItinerary({ ...itinerary, days: updatedDays });
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('itinerary-to-export');
    if (!element) return;
    
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${itinerary.destination}-itinerary.pdf`);
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    alert("Trip link copied to clipboard!");
  };

  return (
    <div className="dashboard-grid">
      <div className="sidebar-itinerary glass" id="itinerary-to-export">
        <div className="sidebar-header">
          <div className="header-top">
            <h2>{itinerary.destination}</h2>
            <div className="action-buttons">
              <button className="icon-btn" onClick={handleShare} title="Share Trip"><Share2 size={18} /></button>
              <button className="icon-btn" onClick={handleExportPDF} title="Export PDF"><FileDown size={18} /></button>
            </div>
          </div>
          <p className="trip-summary">{itinerary.summary}</p>
          
          <div className="budget-tracker">
            <div className="tracker-label">
              <span>Budget Usage</span>
              <span>${itinerary.estimated_total_cost} / ${tripData.budget}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${Math.min((itinerary.estimated_total_cost / tripData.budget) * 100, 100)}%`,
                  backgroundColor: itinerary.estimated_total_cost > tripData.budget ? 'var(--error)' : 'var(--success)'
                }}
              ></div>
            </div>
          </div>
        </div>

        <Itinerary 
          days={itinerary.days} 
          activeDay={activeDay}
          weather={weather}
          onDayClick={setActiveDay}
          onRegenerateDay={handleRegenerateDay}
          onReorder={handleReorderActivities}
        />
      </div>

      <div className="map-container">
        <MapView 
          activities={itinerary.days.find((d: any) => d.day === activeDay)?.activities || []} 
          dayNumber={activeDay}
        />
      </div>
    </div>
  );
}
