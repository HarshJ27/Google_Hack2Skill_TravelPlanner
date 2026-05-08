'use client';

import { useState } from 'react';
import './OnboardingForm.css';

interface OnboardingData {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  groupSize: number;
  style: string;
}

interface OnboardingFormProps {
  onComplete: (data: OnboardingData) => void;
}

export default function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    destination: '',
    startDate: '',
    endDate: '',
    budget: 2000,
    groupSize: 1,
    style: 'adventure',
  });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'budget' || name === 'groupSize' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div className="onboarding-container glass animate-fade-in">
      <div className="onboarding-header">
        <h2>Plan Your Next Adventure</h2>
        <p className="step-indicator">Step {step} of 3</p>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="form-step animate-fade-in">
            <label>Where are you going?</label>
            <input
              type="text"
              name="destination"
              placeholder="e.g. Kyoto, Japan"
              value={formData.destination}
              onChange={handleChange}
              required
            />
            
            <div className="date-range">
              <div className="input-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <button type="button" className="btn-primary full-width" onClick={nextStep} disabled={!formData.destination || !formData.startDate || !formData.endDate}>
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="form-step animate-fade-in">
            <label>Budget (USD)</label>
            <div className="budget-slider">
              <input
                type="range"
                name="budget"
                min="500"
                max="10000"
                step="500"
                value={formData.budget}
                onChange={handleChange}
              />
              <span className="value-display">${formData.budget}</span>
            </div>

            <label>Group Size</label>
            <input
              type="number"
              name="groupSize"
              min="1"
              max="20"
              value={formData.groupSize}
              onChange={handleChange}
              required
            />

            <div className="button-group">
              <button type="button" className="btn-secondary" onClick={prevStep}>Back</button>
              <button type="button" className="btn-primary" onClick={nextStep}>Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-step animate-fade-in">
            <label>Travel Style</label>
            <div className="style-options">
              {['adventure', 'culture', 'relaxation', 'food'].map((style) => (
                <div 
                  key={style}
                  className={`style-option ${formData.style === style ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, style }))}
                >
                  <span className="capitalize">{style}</span>
                </div>
              ))}
            </div>

            <div className="button-group">
              <button type="button" className="btn-secondary" onClick={prevStep}>Back</button>
              <button type="submit" className="btn-primary">Generate Itinerary</button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
