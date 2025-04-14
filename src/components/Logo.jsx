import React from 'react';
import logo from '../assets/logo_vibly.png';

export default function Logo({ className = '', size = 'normal' }) {
  const sizeClasses = {
    small: 'h-6',
    normal: 'h-8',
    large: 'h-10'
  };

  return (
    <img
      src={logo}
      alt="Vibly"
      className={`${sizeClasses[size]} w-auto ${className}`}
    />
  );
} 