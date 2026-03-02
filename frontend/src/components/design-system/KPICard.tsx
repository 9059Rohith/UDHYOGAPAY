import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from './Card';
import { clsx } from 'clsx';

export interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan';
  loading?: boolean;
  sparklineData?: number[];
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  loading = false,
  sparklineData
}) => {
  const colorStyles = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    cyan: 'bg-cyan-100 text-cyan-600'
  };

  const trendStyles = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  };

  const getTrendType = () => {
    if (!trend) return 'neutral';
    return trend.isPositive ? 'positive' : 'negative';
  };

  const getTrendIcon = () => {
    if (!trend) return Minus;
    if (trend.value === 0) return Minus;
    return trend.isPositive ? TrendingUp : TrendingDown;
  };

  const TrendIcon = getTrendIcon();

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          
          {trend && (
            <div
              className={clsx(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                trendStyles[getTrendType()]
              )}
            >
              <TrendIcon className="w-3 h-3" />
              <span>{Math.abs(trend.value)}%</span>
              {trend.label && <span className="text-gray-500 ml-1">{trend.label}</span>}
            </div>
          )}
        </div>
        
        <div className={clsx('w-12 h-12 rounded-lg flex items-center justify-center', colorStyles[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Sparkline placeholder */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4 h-12">
          <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={clsx(
                trend?.isPositive ? 'text-green-500' : 'text-red-500',
                'opacity-30'
              )}
              points={sparklineData
                .map((value, index) => {
                  const x = (index / (sparklineData.length - 1)) * 100;
                  const y = 40 - (value / Math.max(...sparklineData)) * 40;
                  return `${x},${y}`;
                })
                .join(' ')}
            />
          </svg>
        </div>
      )}
    </Card>
  );
};
