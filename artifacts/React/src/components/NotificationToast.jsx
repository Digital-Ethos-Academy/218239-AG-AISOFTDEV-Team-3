import React, { useEffect } from 'react';
import { MdCheckCircle, MdError, MdWarning, MdClose } from 'react-icons/md';

const NotificationToast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <MdCheckCircle size={20} />;
      case 'error': return <MdError size={20} />;
      case 'warning': return <MdWarning size={20} />;
      default: return null;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return { bg: '#10b981', text: 'white' };
      case 'error': return { bg: '#dc2626', text: 'white' };
      case 'warning': return { bg: '#f59e0b', text: 'white' };
      default: return { bg: '#6366f1', text: 'white' };
    }
  };

  const colors = getColor();

  return (
    <div 
      className="notification-toast" 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: colors.bg,
        color: colors.text,
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 10000,
        minWidth: '320px',
        animation: 'slideInFromRight 0.3s ease-out',
        backdropFilter: 'blur(10px)'
      }}
    >
      {getIcon()}
      <span style={{ flex: 1, fontWeight: '500' }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          opacity: 0.8,
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={e => e.target.style.opacity = '1'}
        onMouseLeave={e => e.target.style.opacity = '0.8'}
      >
        <MdClose size={16} />
      </button>
    </div>
  );
};

export default NotificationToast;
