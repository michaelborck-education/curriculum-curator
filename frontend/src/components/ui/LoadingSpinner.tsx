import { Loader2 } from 'lucide-react';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export const LoadingSpinner = ({
  size = 'md',
  className = '',
}: LoadingSpinnerProps) => {
  return (
    <Loader2
      className={`animate-spin text-blue-600 ${sizeClasses[size]} ${className}`}
      aria-label='Loading'
    />
  );
};

export interface LoadingStateProps {
  message?: string;
  size?: SpinnerSize;
  className?: string;
}

export const LoadingState = ({
  message = 'Loading...',
  size = 'lg',
  className = '',
}: LoadingStateProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center h-64 gap-3 ${className}`}
      role='status'
      aria-live='polite'
    >
      <LoadingSpinner size={size} />
      {message && <p className='text-gray-500 text-sm'>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
