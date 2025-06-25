import React from 'react';
import { XMarkIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'; // Added 3xl and 4xl
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl', // Added 3xl
    '4xl': 'max-w-4xl', // Added 4xl
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 backdrop-blur-sm flex justify-center items-start sm:items-center z-50 p-4 transition-opacity duration-300 ease-out overflow-y-auto"
      onClick={onClose} 
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={`bg-white dark:bg-darkSurface rounded-xl shadow-2xl w-full ${sizeClasses[size] || sizeClasses['md']} transform transition-all duration-300 ease-out animate-modal-pop my-8 sm:my-0`}
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-600">
          <h2 id="modal-title" className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-darkText">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;