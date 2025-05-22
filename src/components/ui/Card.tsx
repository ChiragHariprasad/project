import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', borderColor = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg ${borderColor} ${className}`}>
      {children}
    </div>
  );
};

export default Card;