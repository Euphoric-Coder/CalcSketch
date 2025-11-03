import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className="w-6 h-6 border-2 border-white/30 rounded-full"></div>
        <div className="absolute top-0 left-0 w-6 h-6 border-2 border-white border-r-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
};