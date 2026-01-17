
import React, { useState, useEffect } from 'react';

const NetworkIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 transition-all duration-300 ${isOnline ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200 animate-pulse-slow'}`}>
      <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-sm font-bold uppercase tracking-wider">
        {isOnline ? '🟢 Online' : '🔴 Offline'}
      </span>
    </div>
  );
};

export default NetworkIndicator;
