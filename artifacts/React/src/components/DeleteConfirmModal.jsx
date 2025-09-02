import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, productName }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        maxWidth: '400px',
        width: '100%',
        padding: '24px',
        position: 'relative'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            color: '#6b7280'
          }}
        >
          <FiX size={20} />
        </button>

        {/* Warning icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          backgroundColor: '#fef2f2',
          borderRadius: '50%',
          margin: '0 auto 16px'
        }}>
          <FiAlertTriangle size={24} style={{ color: '#dc2626' }} />
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#111827',
          textAlign: 'center',
          marginBottom: '8px'
        }}>
          Delete Product
        </h3>

        {/* Message */}
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: '24px',
          lineHeight: 1.5
        }}>
          Are you sure you want to delete "<strong>{productName}</strong>"? This action cannot be undone.
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexDirection: 'row-reverse'
        }}>
          <button
            onClick={onConfirm}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flex: 1
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#dc2626';
            }}
          >
            Delete
          </button>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flex: 1
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f9fafb';
              e.target.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = '#d1d5db';
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
