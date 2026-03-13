// UI component: renders and manages the Skeleton feature block.
import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`animate-shimmer bg-gray-200 rounded ${className}`} />;
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-card space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
};
