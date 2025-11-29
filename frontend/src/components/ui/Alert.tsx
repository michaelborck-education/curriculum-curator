import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

export interface AlertProps {
  variant: AlertVariant;
  children: React.ReactNode;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const variantConfig = {
  error: {
    icon: AlertCircle,
    containerClass: 'bg-red-50 border-red-200 text-red-800',
    iconClass: 'text-red-600',
    titleClass: 'text-red-900',
  },
  success: {
    icon: CheckCircle,
    containerClass: 'bg-green-50 border-green-200 text-green-800',
    iconClass: 'text-green-600',
    titleClass: 'text-green-900',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconClass: 'text-yellow-600',
    titleClass: 'text-yellow-900',
  },
  info: {
    icon: Info,
    containerClass: 'bg-blue-50 border-blue-200 text-blue-800',
    iconClass: 'text-blue-600',
    titleClass: 'text-blue-900',
  },
};

export const Alert = ({
  variant,
  children,
  title,
  dismissible = false,
  onDismiss,
  className = '',
}: AlertProps) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={`p-3 border rounded-lg flex items-start gap-3 ${config.containerClass} ${className}`}
      role='alert'
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconClass}`} />
      <div className='flex-1 min-w-0'>
        {title && (
          <p className={`font-medium mb-1 ${config.titleClass}`}>{title}</p>
        )}
        <div className='text-sm'>{children}</div>
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className='p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors'
          aria-label='Dismiss alert'
        >
          <X className='w-4 h-4' />
        </button>
      )}
    </div>
  );
};

export default Alert;
