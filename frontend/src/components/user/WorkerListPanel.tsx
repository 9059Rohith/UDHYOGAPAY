// UI component: renders and manages the WorkerListPanel feature block.
import React from 'react';
import { Star, MapPin } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import type { Worker } from '../../types';

interface WorkerListPanelProps {
  workers: Worker[];
  isLoading?: boolean;
  emptyMessage?: string;
  onWorkerSelect?: (worker: Worker) => void;
}

export const WorkerListPanel: React.FC<WorkerListPanelProps> = ({
  workers,
  isLoading,
  emptyMessage = 'No workers found',
  onWorkerSelect,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (workers.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className="space-y-3 p-4">
      {workers.map((worker) => (
        <Card
          key={worker._id}
          hover
          padding="sm"
          onClick={() => onWorkerSelect?.(worker)}
        >
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold text-lg">
                {worker.profession.charAt(0)}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {worker.profession}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center text-secondary-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 text-sm font-medium">
                        {worker.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">
                      {worker.totalReviews} reviews
                    </span>
                  </div>
                </div>
                
                <Badge variant={worker.availability ? 'success' : 'error'}>
                  {worker.availability ? 'Available' : 'Busy'}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mt-2">
                {formatCurrency(worker.hourlyRate)}/hr
              </p>
              
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                Experience: {worker.experience} years
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
