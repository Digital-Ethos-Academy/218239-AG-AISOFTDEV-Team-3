import React, { useState, useEffect } from 'react';
import { FiX, FiPackage, FiDollarSign, FiEdit3, FiTag } from 'react-icons/fi';
import { MdDevices, MdCheckroom, MdHome, MdMenuBook, MdSportsBasketball, MdCategory } from 'react-icons/md';
import { getCategoryName } from '../utils';

const EditProductModal = ({ isOpen, onClose, onSubmit, product, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'electronics',
    stock: 0,
    price: ''  // Start with empty string to allow user to type freely
  });

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || 'electronics',
        stock: product.stock || 0,
        price: product.price ? (product.price / 100) : 0  // Convert cents to dollars for display
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    // Convert price from dollars to cents before submitting
    const priceValue = formData.price === '' ? 0 : parseFloat(formData.price);
    const submissionData = {
      ...formData,
      price: Math.round(priceValue * 100)  // Convert dollars to cents
    };
    
    await onSubmit(product.id, submissionData);
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePriceChange = (value) => {
    // Allow empty string or valid numbers
    if (value === '' || !isNaN(parseFloat(value))) {
      setFormData(prev => ({
        ...prev,
        price: value === '' ? '' : parseFloat(value)
      }));
    }
  };

  const getCategoryIcon = (category) => {
    const iconStyle = { fontSize: '20px' };
    switch (category?.toLowerCase()) {
      case 'electronics':
        return <MdDevices style={{ ...iconStyle, color: '#3b82f6' }} />;
      case 'clothing':
        return <MdCheckroom style={{ ...iconStyle, color: '#8b5cf6' }} />;
      case 'home':
        return <MdHome style={{ ...iconStyle, color: '#10b981' }} />;
      case 'books':
        return <MdMenuBook style={{ ...iconStyle, color: '#f59e0b' }} />;
      case 'sports':
        return <MdSportsBasketball style={{ ...iconStyle, color: '#ef4444' }} />;
      default:
        return <MdCategory style={{ ...iconStyle, color: '#6b7280' }} />;
    }
  };

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
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '520px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Enhanced Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px',
          color: 'white',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
            title="Close"
          >
            <FiX size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FiEdit3 size={28} />
            </div>
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                margin: 0,
                marginBottom: '4px'
              }}>
                Edit Product
              </h2>
              <p style={{
                fontSize: '14px',
                margin: 0,
                opacity: 0.9
              }}>
                Update product information and details
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div style={{ 
          padding: '32px',
          maxHeight: 'calc(90vh - 140px)',
          overflowY: 'auto'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Product Name */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px'
              }}>
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter product name"
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px'
              }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows="3"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter product description (optional)"
              />
            </div>

            {/* Category */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px'
              }}>
                Category
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  zIndex: 1
                }}>
                  {getCategoryIcon(formData.category)}
                </div>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '52px',
                    paddingRight: '16px',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="home">Home & Garden</option>
                  <option value="books">Books</option>
                  <option value="sports">Sports</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Stock and Price Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Stock */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Stock Quantity
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                    min="0"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      paddingRight: '60px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="0"
                  />
                  <div style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    units
                  </div>
                </div>
              </div>

              {/* Price */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Price (USD)
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280'
                  }}>
                    <FiDollarSign size={18} />
                  </div>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%',
                      paddingLeft: '48px',
                      paddingRight: '16px',
                      paddingTop: '14px',
                      paddingBottom: '14px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* SKU Display */}
            {product && (
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #ddd6fe 0%, #c7d2fe 100%)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FiTag size={18} style={{ color: '#6366f1' }} />
                    </div>
                    <div>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#374151',
                        margin: 0,
                        marginBottom: '2px'
                      }}>
                        Product SKU
                      </p>
                      <p style={{
                        fontSize: '16px',
                        color: '#6b7280',
                        fontFamily: 'monospace',
                        fontWeight: 500,
                        margin: 0
                      }}>
                        {product.sku}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    fontStyle: 'italic'
                  }}>
                    Cannot be modified
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '24px',
              borderTop: '1px solid #e5e7eb',
              marginTop: '8px'
            }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isSubmitting ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.borderColor = '#d1d5db';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = '#e5e7eb';
                  }
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.name.trim()}
                style={{
                  padding: '12px 24px',
                  background: (isSubmitting || !formData.name.trim()) 
                    ? '#d1d5db' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: (isSubmitting || !formData.name.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: (isSubmitting || !formData.name.trim()) 
                    ? 'none' 
                    : '0 4px 6px -1px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && formData.name.trim()) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 8px 12px -1px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting && formData.name.trim()) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(102, 126, 234, 0.3)';
                  }
                }}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
