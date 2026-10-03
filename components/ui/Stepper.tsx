
import React from 'react';
import IconButton from './IconButton';

interface StepperProps {
  value: number;
  label: string;
  onChange: (delta: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'lg';
}

const MinusIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const PlusIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const Stepper: React.FC<StepperProps> = ({ value, label, onChange, readOnly = false, size = 'lg' }) => {
  return (
    <div className="flex items-center gap-3">
      {!readOnly && <IconButton onClick={() => onChange(-1)} ariaLabel={`Decrease ${label}`}><MinusIcon /></IconButton>}
      <span className={`font-orbitron text-white text-center ${size === 'lg' ? 'text-3xl w-12' : 'text-xl w-8'}`}>{value}</span>
      {!readOnly && <IconButton onClick={() => onChange(1)} ariaLabel={`Increase ${label}`}><PlusIcon /></IconButton>}
    </div>
  );
};

export default Stepper;
