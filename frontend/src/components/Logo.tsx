import React from 'react';

import kmentorLogo from '../assets/kmentor-logo.jpg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const imgSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex items-center space-x-2">
      <img
        src={kmentorLogo}
        alt="ZENLEARN Logo"
        className={`${imgSizes[size]} object-cover`}
        style={{ display: 'block' }}
      />
      <span className={`${sizeClasses[size]} font-bold text-blue-600`}>
        ZENLEARN
      </span>
    </div>
  );
};