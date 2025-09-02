import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { MdInventory, MdTrendingUp, MdEmail } from 'react-icons/md';

const RestockModal = ({ isOpen, onClose, product, api, showNotification }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestionData, setSuggestionData] = useState(null);

  const handleGetSuggestion = async () => {
    if (!product) return;
    
    setIsLoading(true);
    try {
      const response = await api.getRestockSuggestion({
        product_name: product.name,
        sku: product.sku,
        category: product.category || 'General',
        quantity: product.stock || 0
      });
      
      setSuggestionData(response);
      showNotification('Restock suggestion generated successfully!', 'success');
    } catch (error) {
      showNotification('Failed to get restock suggestion: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSuggestionData(null);
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Restock Suggestion</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        <div style={{ padding: '24px' }}>
          {/* Product Info */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '18px' }}>
              {product.name}
            </h3>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#64748b' }}>
              <span>SKU: {product.sku}</span>
              <span>Category: {product.category || 'General'}</span>
              <span style={{ 
                color: product.stock < 5 ? '#ef4444' : '#059669',
                fontWeight: '600'
              }}>
                Stock: {product.stock || 0} units
              </span>
            </div>
          </div>

          {/* Get Suggestion Button */}
          {!suggestionData && (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <button
                onClick={handleGetSuggestion}
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto',
                  boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <MdTrendingUp size={16} />
                    <span>Get AI Restock Suggestion</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Suggestion Results */}
          {suggestionData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Analyzer Summary */}
              <div style={{
                padding: '16px',
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  color: '#92400e',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  <MdInventory size={16} />
                  Stock Analysis
                </div>
                <p style={{ margin: 0, color: '#92400e', fontSize: '13px', lineHeight: '1.5' }}>
                  {suggestionData.analyzer_summary}
                </p>
              </div>

              {/* Restock Suggestion */}
              <div style={{
                padding: '16px',
                backgroundColor: '#dcfce7',
                border: '1px solid #16a34a',
                borderRadius: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  color: '#166534',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  <MdTrendingUp size={16} />
                  AI Recommendation
                </div>
                <p style={{ margin: 0, color: '#166534', fontSize: '13px', lineHeight: '1.5' }}>
                  {suggestionData.restock_suggestion}
                </p>
              </div>

              {/* Reorder Message */}
              <div style={{
                padding: '16px',
                backgroundColor: '#e0e7ff',
                border: '1px solid #6366f1',
                borderRadius: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  color: '#4338ca',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  <MdEmail size={16} />
                  Draft Reorder Message
                </div>
                <div style={{
                  background: 'white',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: '#374151',
                  whiteSpace: 'pre-line',
                  border: '1px solid #d1d5db'
                }}>
                  {suggestionData.reorder_message}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                marginTop: '8px'
              }}>
                <button
                  onClick={() => setSuggestionData(null)}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(suggestionData.reorder_message);
                    showNotification('Reorder message copied to clipboard!', 'success');
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Copy Message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestockModal;
