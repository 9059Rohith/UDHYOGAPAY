// UI component: renders and manages the Avatar feature block.
import React from 'react';
import { User as UserIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md', className }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div
      className={cn(
        'rounded-full overflow-hidden bg-gray-200 flex items-center justify-center',
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt || 'Avatar'} className="w-full h-full object-cover" />
      ) : (
        <UserIcon className="w-1/2 h-1/2 text-gray-400" />
      )}
    </div>
  );
};
