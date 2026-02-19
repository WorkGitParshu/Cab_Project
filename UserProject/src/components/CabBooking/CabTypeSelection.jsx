import React, { useState, useEffect } from "react";
import "./CabTypeSelection.css";

/**
 * Cab Type Selection Component
 * Shows only available cab types
 * User selects cab type first, then only those cab types are shown from drivers
 * Displays estimated fare and vehicle details
 */
const CabTypeSelection = ({
  onCabTypeSelect,
  tripDistance = 0,
  estimatedFare = 0
}) => {
  const safeDistance = Number(tripDistance) || 0;

  const [selectedCabType, setSelectedCabType] = useState(null);

  const cabTypes = [
    {
      id: "economy",
      name: "Economy",
      icon: "🚗",
      description: "Most affordable option",
      capacity: "1-4 passengers",
      basePrice: 50,
      pricePerKm: 10,
      color: "#4CAF50",
    },
    {
      id: "comfort",
      name: "Comfort",
      icon: "🚙",
      description: "For a comfortable ride",
      capacity: "1-4 passengers",
      basePrice: 75,
      pricePerKm: 15,
      color: "#2196F3",
    },
    {
      id: "premium",
      name: "Premium",
      icon: "🚘",
      description: "Premium comfort & features",
      capacity: "1-4 passengers",
      basePrice: 100,
      pricePerKm: 20,
      color: "#FF9800",
    },
    {
      id: "suv",
      name: "SUV",
      icon: "🚐",
      description: "Spacious for groups",
      capacity: "1-6 passengers",
      basePrice: 120,
      pricePerKm: 25,
      color: "#9C27B0",
    },
  ];

  const calculateFare = (cabType) => {
    return cabType.basePrice + (safeDistance * cabType.pricePerKm);
  };

  const handleCabTypeSelect = (cabType) => {
    setSelectedCabType(cabType.id);
    onCabTypeSelect(cabType);
  };

  return (
    <div className="cab-type-selection-container">
      <div className="selection-header">
        <h3>🚗 Select Vehicle Type</h3>
        <p className="selection-subtitle">
          Available vehicles for your {safeDistance.toFixed(1)} km trip
        </p>
      </div>

      {/* Trip Summary */}
      <div className="trip-summary-card">
        <div className="summary-item">
          <span className="summary-icon">📏</span>
          <div>
            <div className="summary-label">Distance</div>
            <div className="summary-value">{safeDistance.toFixed(2)} km</div>
          </div>
        </div>
        <div className="summary-divider"></div>
        <div className="summary-item">
          <span className="summary-icon">⏱️</span>
          <div>
            <div className="summary-label">Est. Time</div>
            <div className="summary-value">{(safeDistance / 40 * 60).toFixed(0)} min</div>
          </div>
        </div>
      </div>

      {/* Cab Types Grid */}
      <div className="cab-types-grid">
        {cabTypes.map((cabType) => {
          const fare = calculateFare(cabType);
          const isSelected = selectedCabType === cabType.id;

          return (
            <div
              key={cabType.id}
              className={`cab-type-card ${isSelected ? "selected" : ""}`}
              onClick={() => handleCabTypeSelect(cabType)}
            >
              {isSelected && <div className="selected-badge">✓</div>}

              {/* Icon */}
              <div className="cab-icon" style={{ color: cabType.color }}>
                {cabType.icon}
              </div>

              {/* Type Name */}
              <div className="cab-name">{cabType.name}</div>

              {/* Description */}
              <div className="cab-description">{cabType.description}</div>

              {/* Capacity */}
              <div className="cab-capacity">
                <span className="capacity-icon">👥</span>
                {cabType.capacity}
              </div>

              {/* Price */}
              <div className="cab-price">
                <div className="price-label">Estimated Fare</div>
                <div className="price-value">₹{fare.toFixed(0)}</div>
              </div>

              {/* Details */}
              <div className="cab-details">
                <div className="detail-item">
                  <span>Base: ₹{cabType.basePrice}</span>
                </div>
                <div className="detail-item">
                  <span>₹{cabType.pricePerKm}/km</span>
                </div>
              </div>

              {/* Select Button */}
              <button
                className={`select-btn ${isSelected ? "selected-btn" : ""}`}
                onClick={() => handleCabTypeSelect(cabType)}
              >
                {isSelected ? "✓ Selected" : "Select"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Fare Breakdown (if selected) */}
      {selectedCabType && (
        <div className="fare-breakdown-card">
          <h4>💰 Fare Breakdown</h4>
          {cabTypes.map((cabType) => {
            if (cabType.id === selectedCabType) {
              const fare = calculateFare(cabType);
              return (
                <div key={cabType.id} className="breakdown-list">
                  <div className="breakdown-item">
                    <span>Base Fare</span>
                    <span>₹{cabType.basePrice}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Distance ({safeDistance.toFixed(2)} km)</span>
                    <span>₹{(safeDistance * cabType.pricePerKm).toFixed(0)}</span>
                  </div>
                  <div className="breakdown-item total">
                    <span>Total Estimated</span>
                    <span>₹{fare.toFixed(0)}</span>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}

      {/* Info Message */}
      <div className="info-message">
        <span className="info-icon">ℹ️</span>
        <span>
          Actual fare may vary based on traffic and route taken
        </span>
      </div>
    </div>
  );
};

export default CabTypeSelection;
