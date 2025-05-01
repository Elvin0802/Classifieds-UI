import React from 'react';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaTimes } from 'react-icons/fa';
import { cn } from './utils';

const AlertContext = React.createContext({});

const Alert = React.forwardRef(({ 
  children,
  className,
  variant = 'info', 
  ...props 
}, ref) => {
  // Varyant tipine göre stiller
  const variantStyles = {
    info: 'bg-info/10 border-info text-info',
    success: 'bg-success/10 border-success text-success',
    warning: 'bg-warning/10 border-warning text-warning',
    destructive: 'bg-danger/10 border-danger text-danger',
    default: 'bg-primary/10 border-primary text-primary',
  };

  const variantStyle = variantStyles[variant] || variantStyles.default;

  return (
    <AlertContext.Provider value={{ variant }}>
      <div
        ref={ref}
        role="alert"
        className={cn(
          "flex items-start p-4 rounded-lg border-l-4",
          variantStyle,
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AlertContext.Provider>
  );
});

Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, children, ...props }, ref) => {
  const { variant } = React.useContext(AlertContext);
  const textColorMap = {
    info: 'text-info',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-danger',
    default: 'text-primary',
  };

  return (
    <h4
      ref={ref}
      className={cn(
        "font-medium text-sm",
        textColorMap[variant] || textColorMap.default,
        className
      )}
      {...props}
    >
      {children}
    </h4>
  );
});

AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm mt-1 text-gray-600", className)}
    {...props}
  >
    {children}
  </div>
));

AlertDescription.displayName = "AlertDescription";

const AlertIcon = React.forwardRef(({ type, className, ...props }, ref) => {
  const { variant } = React.useContext(AlertContext);
  const typeOrVariant = type || variant;
  
  const iconMap = {
    info: FaInfoCircle,
    success: FaCheckCircle,
    warning: FaExclamationTriangle,
    destructive: FaTimesCircle,
    default: FaInfoCircle,
  };

  const Icon = iconMap[typeOrVariant] || iconMap.default;
  
  const textColorMap = {
    info: 'text-info',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-danger',
    default: 'text-primary',
  };

  return (
    <div ref={ref} className={cn("flex-shrink-0 mr-3", textColorMap[typeOrVariant] || textColorMap.default, className)} {...props}>
      <Icon size={20} />
    </div>
  );
});

AlertIcon.displayName = "AlertIcon";

export { Alert, AlertTitle, AlertDescription, AlertIcon }; 