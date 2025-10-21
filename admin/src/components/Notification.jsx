import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';

const Notification = ({ 
  type = 'success', 
  title, 
  message, 
  details, 
  onClose, 
  duration = 5000,
  show = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const config = {
    success: {
      icon: FiCheckCircle,
      bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
      iconColor: 'text-white',
      borderColor: 'border-green-400',
      shadowColor: 'shadow-green-500/25'
    },
    error: {
      icon: FiXCircle,
      bgColor: 'bg-gradient-to-r from-red-500 to-rose-600',
      iconColor: 'text-white',
      borderColor: 'border-red-400',
      shadowColor: 'shadow-red-500/25'
    },
    info: {
      icon: FiInfo,
      bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-600',
      iconColor: 'text-white',
      borderColor: 'border-blue-400',
      shadowColor: 'shadow-blue-500/25'
    },
    warning: {
      icon: FiAlertTriangle,
      bgColor: 'bg-gradient-to-r from-yellow-500 to-orange-600',
      iconColor: 'text-white',
      borderColor: 'border-yellow-400',
      shadowColor: 'shadow-yellow-500/25'
    }
  };

  const currentConfig = config[type];
  const IconComponent = currentConfig.icon;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div 
        className={`
          pointer-events-auto transform transition-all duration-300 ease-out
          ${isLeaving ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'}
        `}
      >
        <div className={`
          relative max-w-md w-full mx-auto
          ${currentConfig.bgColor}
          ${currentConfig.shadowColor}
          shadow-2xl rounded-2xl border-2 ${currentConfig.borderColor}
          backdrop-blur-sm
        `}>
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors z-10"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-6 pr-12">
            {/* Icon and Title */}
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <IconComponent className={`w-6 h-6 ${currentConfig.iconColor}`} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white mb-1">
                  {title}
                </h3>
                {message && (
                  <p className="text-white/90 text-sm leading-relaxed">
                    {message}
                  </p>
                )}
              </div>
            </div>

            {/* Details */}
            {details && (
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-white/80 text-sm leading-relaxed">
                  {details}
                </p>
              </div>
            )}

            {/* Progress Bar */}
            <div className="mt-4 bg-white/20 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-white/60 h-full rounded-full transition-all ease-linear"
                style={{
                  animation: `shrink ${duration}ms linear forwards`
                }}
              />
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-white/30 rounded-t-2xl" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 rounded-full blur-sm" />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white/10 rounded-full blur-sm" />
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Notification Manager Hook
export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
      show: true
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    return id;
  };

  const hideNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccess = (title, message, details) => {
    return showNotification({ type: 'success', title, message, details });
  };

  const showError = (title, message, details) => {
    return showNotification({ type: 'error', title, message, details });
  };

  const showInfo = (title, message, details) => {
    return showNotification({ type: 'info', title, message, details });
  };

  const showWarning = (title, message, details) => {
    return showNotification({ type: 'warning', title, message, details });
  };

  return {
    notifications,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
};

// Notification Container Component
export const NotificationContainer = ({ notifications, onHide }) => {
  return (
    <>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={() => onHide(notification.id)}
        />
      ))}
    </>
  );
};

export default Notification;
