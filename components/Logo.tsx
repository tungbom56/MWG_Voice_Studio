import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center mb-6">
      {/* Official MWG Logo */}
      <div className="mb-4">
        <img 
          src="https://cdn.haitrieu.com/wp-content/uploads/2021/11/Logo-The-Gioi-Di-Dong-MWG.png" 
          alt="MWG Logo" 
          className="h-24 object-contain drop-shadow-xl"
        />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wide text-center uppercase drop-shadow-md">
        MWG Voice Studio
      </h1>
      <div className="h-1 w-32 bg-mwg-gold mt-4 rounded-full"></div>
    </div>
  );
};