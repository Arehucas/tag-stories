import React from 'react';

interface EmptyStateProps {
  image: string;
  title: string;
  description: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ image, title, description, ctaText, onCtaClick }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 w-full max-w-lg mx-auto animate-fade-in-out">
    <img src={image} alt="Empty state" className="w-40 h-40 mb-6 object-contain" style={{maxWidth: 200}} />
    <h2 className="text-2xl font-bold text-white mb-2 text-center">{title}</h2>
    <p className="text-base text-blue-100 text-center mb-6 max-w-md">{description}</p>
    {ctaText && onCtaClick && (
      <button
        className="px-6 py-3 rounded-full border border-blue-700 text-blue-100 bg-gradient-to-r from-blue-900 to-blue-800 hover:bg-blue-800/80 transition text-base font-medium shadow-lg"
        onClick={onCtaClick}
      >
        {ctaText}
      </button>
    )}
  </div>
);

export default EmptyState; 