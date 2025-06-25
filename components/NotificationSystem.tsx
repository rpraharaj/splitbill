// components/NotificationSystem.tsx
import React, { useEffect } from 'react';
import { Notification } from '../types';
import { CheckCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon as CloseIcon } from './icons';

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}
const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification, onRemove]);

  let bgColor = 'bg-blue-500 dark:bg-blue-600';
  let icon = <InformationCircleIcon className="w-5 h-5" />;
  if (notification.type === 'success') {
    bgColor = 'bg-green-500 dark:bg-green-600';
    icon = <CheckCircleIcon className="w-5 h-5" />;
  } else if (notification.type === 'error') {
    bgColor = 'bg-red-500 dark:bg-red-600';
    icon = <ExclamationTriangleIcon className="w-5 h-5" />;
  }

  return (
    <div className={`animate-toast-in flex items-start justify-between w-full max-w-sm p-4 text-white ${bgColor} rounded-lg shadow-lg mb-3`} role="alert">
      <div className="flex items-center">
        {icon}
        <p className="ml-3 text-sm font-medium">{notification.message}</p>
      </div>
      <button onClick={() => onRemove(notification.id)} className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg inline-flex h-8 w-8 hover:bg-white/20 focus:ring-2 focus:ring-white/30" aria-label="Dismiss notification">
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

interface NotificationContainerProps {
  notifications: Notification[];
  onRemoveNotification: (id: string) => void;
}
export const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onRemoveNotification }) => {
  if (notifications.length === 0) return null;
  return (
    <div className="fixed top-5 right-5 z-[100] space-y-3">
      {notifications.map(notif => (
        <NotificationItem key={notif.id} notification={notif} onRemove={onRemoveNotification} />
      ))}
    </div>
  );
};
