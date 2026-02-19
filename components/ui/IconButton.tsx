
import React from 'react';

interface IconButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel: string;
}

const IconButton: React.FC<IconButtonProps> = ({ onClick, children, ariaLabel }) => {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="bg-slate-700 hover:bg-slate-600 text-amber-400 font-bold w-8 h-8 rounded-full transition-colors duration-200 flex items-center justify-center shadow-md border-2 border-slate-600 hover:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
    >
      {children}
    </button>
  );
};

export default IconButton;
