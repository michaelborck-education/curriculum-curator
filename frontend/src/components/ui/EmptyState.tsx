import { LucideIcon, Lightbulb } from 'lucide-react';
import { Button } from './Button';

export interface ContextualTip {
  title: string;
  description: string;
}

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  tips?: ContextualTip[];
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
  tips,
  secondaryActionLabel,
  onSecondaryAction,
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

      {/* Action buttons */}
      <div className='flex justify-center gap-3 mb-6'>
        {actionLabel && onAction && (
          <Button onClick={onAction} variant='primary'>
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button onClick={onSecondaryAction} variant='secondary'>
            {secondaryActionLabel}
          </Button>
        )}
      </div>

      {/* Contextual Tips */}
      {tips && tips.length > 0 && (
        <div className='mt-8 max-w-lg mx-auto'>
          <div className='bg-purple-50 rounded-lg p-4 text-left'>
            <div className='flex items-center gap-2 mb-3'>
              <Lightbulb className='w-4 h-4 text-purple-600' />
              <span className='text-sm font-medium text-purple-900'>
                Getting Started Tips
              </span>
            </div>
            <ul className='space-y-2'>
              {tips.map((tip, idx) => (
                <li key={idx} className='flex items-start gap-2'>
                  <span className='text-purple-600 font-medium text-sm mt-0.5'>
                    {idx + 1}.
                  </span>
                  <div>
                    <span className='text-sm font-medium text-gray-900'>
                      {tip.title}
                    </span>
                    <p className='text-xs text-gray-600'>{tip.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
