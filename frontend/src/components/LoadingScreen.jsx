import React from 'react';
import { Loader } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="bg-primary-600 rounded-2xl px-6 py-3 mb-6">
        <span className="text-white font-bold text-2xl">USM</span>
      </div>
      <Loader className="animate-spin text-primary-600" size={40} />
      <p className="mt-4 text-dark-600 font-medium">Loading...</p>
    </div>
  );
};

export default LoadingScreen;
