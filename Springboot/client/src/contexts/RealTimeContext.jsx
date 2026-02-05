import React, { createContext, useContext, useState, useEffect } from 'react';

const RealTimeContext = createContext();

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

export const RealTimeProvider = ({ children }) => {
  const [pickupUpdates, setPickupUpdates] = useState([]);

  const updatePickupStatus = (pickupId, status, weight = null, collectorName = null) => {
    const update = {
      id: pickupId,
      status,
      weight,
      collectorName,
      timestamp: new Date().toISOString()
    };
    
    setPickupUpdates(prev => {
      const filtered = prev.filter(u => u.id !== pickupId);
      return [...filtered, update];
    });
  };

  const getPickupStatus = (pickupId) => {
    return pickupUpdates.find(update => update.id === pickupId);
  };

  const value = {
    updatePickupStatus,
    getPickupStatus,
    pickupUpdates
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};