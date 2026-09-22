import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  padded = true,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-slate-900/70 border border-slate-800/80 rounded-2xl backdrop-blur-md transition-all duration-200 ${
        padded ? 'p-5 sm:p-6' : ''
      } ${
        hover
          ? 'hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5'
          : 'shadow-lg shadow-black/20'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
