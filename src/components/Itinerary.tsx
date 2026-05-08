'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import './Itinerary.css';

interface ItineraryProps {
  days: any[];
  activeDay: number;
  weather: any[];
  onDayClick: (day: number) => void;
  onRegenerateDay: (day: number) => void;
  onReorder: (dayNumber: number, newActivities: any[]) => void;
}

export default function Itinerary({ 
  days, 
  activeDay, 
  weather, 
  onDayClick, 
  onRegenerateDay,
  onReorder 
}: ItineraryProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(activeDay);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const dayIndex = days.findIndex(d => d.day === activeDay);
    const day = days[dayIndex];
    const items = Array.from(day.activities);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onReorder(activeDay, items);
  };

  const toggleDay = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
    onDayClick(day);
  };

  return (
    <div className="itinerary-scroll-area">
      {days.map((day) => {
        const dayWeather = weather.find(w => w.date === day.date);
        const isExpanded = expandedDay === day.day;

        return (
          <div key={day.day} className={`day-card ${isExpanded ? 'expanded' : ''}`}>
            <div className="day-header" onClick={() => toggleDay(day.day)}>
              <div className="day-info">
                <span className="day-number">Day {day.day}</span>
                <span className="day-date">{day.date}</span>
              </div>
              
              {dayWeather && (
                <div className="day-weather" title={dayWeather.condition}>
                  <img src={`https://openweathermap.org/img/wn/${dayWeather.icon}.png`} alt={dayWeather.condition} />
                  <span>{dayWeather.temp}°C</span>
                  {dayWeather.condition === 'Rain' && <span className="weather-warning">⚠️ Rain expected</span>}
                </div>
              )}
            </div>

            {isExpanded && (
              <div className="day-content">
                <p className="day-theme">{day.theme}</p>
                
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId={`day-${day.day}`}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="activities-list">
                        {day.activities.map((activity: any, index: number) => (
                          <Draggable key={activity.time + activity.activity} draggableId={activity.time + activity.activity} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="activity-item glass"
                              >
                                <div className="activity-time">{activity.time}</div>
                                <div className="activity-details">
                                  <h4>{activity.activity}</h4>
                                  <p>{activity.description}</p>
                                  {activity.cost_per_person > 0 && (
                                    <span className="activity-cost">${activity.cost_per_person}</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                <button className="btn-regenerate" onClick={() => onRegenerateDay(day.day)}>
                  Regenerate Day
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
