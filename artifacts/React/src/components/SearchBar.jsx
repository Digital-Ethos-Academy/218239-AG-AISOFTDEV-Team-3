import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = ({ searchTerm, onSearchChange }) => {
  const handleClear = () => {
    onSearchChange('');
  };

  return (
    <div style={{
      marginBottom: '24px',
      padding: '0 24px'
    }}>
      <div style={{ position: 'relative', maxWidth: '600px' }}>
        <div style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none'
        }}>
          <FiSearch style={{ fontSize: '18px', color: '#9ca3af' }} />
        </div>
        
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products..."
          style={{
            width: '100%',
            paddingLeft: '48px',
            paddingRight: searchTerm ? '48px' : '16px',
            paddingTop: '12px',
            paddingBottom: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '16px',
            outline: 'none',
            transition: 'all 0.2s ease',
            background: '#ffffff'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#d1d5db';
            e.target.style.boxShadow = 'none';
          }}
        />
        
        {searchTerm && (
          <button
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
            }}
          >
            <FiX style={{ fontSize: '18px', color: '#6b7280' }} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
