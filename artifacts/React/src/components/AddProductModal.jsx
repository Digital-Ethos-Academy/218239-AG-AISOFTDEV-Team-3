import React, { useState } from 'react';
import { CATEGORIES } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import { MdAutoAwesome } from 'react-icons/md';

const AddProductModal = ({ isOpen, onClose, onSubmit, isSubmitting, showNotification, api }) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    price: '',
    stock: ''
  });
  const [isAutofilling, setIsAutofilling] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.sku || !formData.name) {
      alert('SKU and Name are required fields');
      return;
    }
    const priceInDollars = formData.price ? parseFloat(formData.price) : 0;
    const priceInCents = Math.round(priceInDollars * 100);
    const stock = formData.stock ? parseInt(formData.stock) : 0;
    onSubmit({ ...formData, price: priceInCents, stock });
  };

  const handleAutofill = async () => {
    if (!formData.description.trim()) {
      showNotification('Please enter a product description first to use auto-fill.', 'warning');
      return;
    }
    setIsAutofilling(true);
    try {
      const autofillData = await api.autofillProduct(formData.description);
      setFormData(prev => ({
        ...prev,
        name: autofillData.product_name || prev.name,
        sku: autofillData.suggested_sku || prev.sku,
        category: autofillData.category || prev.category,
        stock: autofillData.quantity?.toString() || prev.stock
      }));
      showNotification('Product details auto-filled successfully!', 'success');
    } catch (error) {
      showNotification('Auto-fill failed: ' + error.message, 'error');
    } finally {
      setIsAutofilling(false);
    }
  };

  const resetForm = () => {
    setFormData({ sku: '', name: '', description: '', category: '', price: '', stock: '' });
    setIsAutofilling(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add New Product</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="sku">SKU *</label>
            <input id="sku" name="sku" type="text" className="form-input" value={formData.sku} onChange={handleChange} placeholder="e.g., ABC123" required disabled={isSubmitting || isAutofilling} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Product Name *</label>
            <input id="name" name="name" type="text" className="form-input" value={formData.name} onChange={handleChange} placeholder="e.g., Wireless Headphones" required disabled={isSubmitting || isAutofilling} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="category">Category</label>
            <select id="category" name="category" className="form-input" value={formData.category} onChange={handleChange} disabled={isSubmitting || isAutofilling}>
              <option value="">Select a category</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="price">Price ($)</label>
            <input id="price" name="price" type="number" step="0.01" min="0" className="form-input" value={formData.price} onChange={handleChange} placeholder="e.g., 29.99" disabled={isSubmitting || isAutofilling} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="stock">Initial Stock</label>
            <input id="stock" name="stock" type="number" min="0" className="form-input" value={formData.stock} onChange={handleChange} placeholder="0" disabled={isSubmitting || isAutofilling} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <div style={{ position: 'relative' }}>
              <textarea id="description" name="description" className="form-input form-textarea" value={formData.description} onChange={handleChange} placeholder="Enter a detailed product description for AI auto-fill..." disabled={isSubmitting || isAutofilling} style={{ paddingRight: '120px' }} />
              <button type="button" onClick={handleAutofill} disabled={isSubmitting || isAutofilling || !formData.description.trim()} style={{ position: 'absolute', right: '8px', top: '8px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '500', cursor: formData.description.trim() && !isAutofilling && !isSubmitting ? 'pointer' : 'not-allowed', opacity: formData.description.trim() && !isAutofilling && !isSubmitting ? 1 : 0.6, display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s ease' }} title="Use AI to auto-fill product details from description">
                {isAutofilling ? (<><LoadingSpinner /><span>Auto-filling...</span></>) : (<><MdAutoAwesome size={14} /><span>Auto-fill</span></>)}
              </button>
            </div>
            {formData.description.trim() && (
              <div style={{ fontSize: '12px', color: '#6366f1', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MdAutoAwesome size={12} />
                Click "Auto-fill" to extract product details using AI
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={isSubmitting || isAutofilling}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || isAutofilling}>{isSubmitting ? (<><LoadingSpinner /> Creating...</>) : ('Create Product')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
