import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm border border-gray-200
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;