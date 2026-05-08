'use client';

import { APIProvider, Map, Marker, Polyline } from '@vis.gl/react-google-maps';
import { useMemo } from 'react';
import './MapView.css';

interface MapViewProps {
  activities: any[];
  dayNumber: number;
}

export default function MapView({ activities, dayNumber }: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const center = useMemo(() => {
    if (activities.length === 0) return { lat: 0, lng: 0 };
    const first = activities[0].location;
    return { lat: first.lat, lng: first.lng };
  }, [activities]);

  const routePath = useMemo(() => {
    return activities.map(a => ({ lat: a.location.lat, lng: a.location.lng }));
  }, [activities]);

  if (!apiKey) {
    return (
      <div className="map-placeholder">
        <div className="placeholder-content">
          <h3>Interactive Map</h3>
          <p>Google Maps API Key is missing. In a production app, your itinerary stops would be plotted here.</p>
          <div className="mock-map">
            {activities.map((a, i) => (
              <div key={i} className="mock-marker" style={{ 
                left: `${(i * 20) + 10}%`, 
                top: `${(i * 15) + 20}%` 
              }}>
                <span className="marker-pin">📍</span>
                <span className="marker-label">{a.activity}</span>
              </div>
            ))}
            <svg className="mock-polyline">
              <polyline 
                points={activities.map((_, i) => `${(i * 20) + 12}%,${(i * 15) + 25}%`).join(' ')} 
                fill="none" 
                stroke="var(--primary)" 
                strokeWidth="2" 
                strokeDasharray="5,5"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        style={{ width: '100%', height: '100%' }}
        defaultCenter={center}
        defaultZoom={13}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
        mapId={'bf51a910020fa25a'} // Optional Map ID for styling
      >
        {activities.map((activity, index) => (
          <Marker 
            key={activity.activity + index} 
            position={{ lat: activity.location.lat, lng: activity.location.lng }}
            label={(index + 1).toString()}
          />
        ))}
        <Polyline 
          path={routePath} 
          strokeColor="#3b82f6" 
          strokeOpacity={0.8} 
          strokeWeight={3} 
        />
      </Map>
    </APIProvider>
  );
}
