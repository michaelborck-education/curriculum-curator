import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) => {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {Icon && (
        <div className='flex justify-center mb-4'>
          <Icon className='w-12 h-12 text-gray-400' />
        </div>
      )}
      <h3 className='text-lg font-medium text-gray-900 mb-2'>{title}</h3>
      {description && (
        <p className='text-gray-600 mb-6 max-w-md mx-auto'>{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant='primary'>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
