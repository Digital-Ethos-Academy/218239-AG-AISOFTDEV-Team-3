import './App.css';
import { useState, useEffect } from 'react';

// Import components one by one to isolate issues
import LoadingSpinner from './components/LoadingSpinner';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import PolishedTable from './components/PolishedTable';
import AddProductModal from './components/AddProductModal';
import EditProductModal from './components/EditProductModal';
import RestockModal from './components/RestockModal';
import RestockDashboard from './components/RestockDashboard';
import OptimizedRestockDashboard from './components/OptimizedRestockDashboard';
import ChatWidget from './components/ChatWidget';
import NotificationToast from './components/NotificationToast';

// Service and utility imports
import { api } from './services/api';
import { isAlertItem } from './utils';
import { API_BASE_URL } from './constants';

function App() {
  // Full state management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [restockProduct, setRestockProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentView, setCurrentView] = useState('inventory');
  
  // Calculate alert count
  const alertCount = products.filter(product => isAlertItem(product)).length;

  // Notification functions
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
  };
  
  const hideNotification = () => setNotification(null);

  // View management
  const handleViewChange = (viewKey) => {
    setCurrentView(viewKey);
    setSearchTerm('');
  };

  // API interaction functions
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products. Make sure the backend server is running on ' + API_BASE_URL);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData) => {
    setIsSubmitting(true);
    try {
      const newProduct = await api.createProduct(productData);
      setShowAddModal(false);
      await loadProducts();
      showNotification(`Successfully added "${newProduct.name}"`, 'success');
    } catch (err) {
      showNotification('Failed to create product: ' + err.message, 'error');
      console.error('Error creating product:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (id, updates) => {
    setIsSubmitting(true);
    try {
      await api.updateProduct(id, updates);
      await loadProducts();
      showNotification('Product updated successfully!', 'success');
      setShowEditModal(false);
      setEditingProduct(null);
    } catch (err) {
      showNotification('Failed to update product: ' + err.message, 'error');
      console.error('Error updating product:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleStartRestock = (product) => {
    setRestockProduct(product);
    setShowRestockModal(true);
  };

  const handleDeleteProduct = async (id) => {
    try {
      console.log('Attempting to delete product with ID:', id);
      await api.deleteProduct(id);
      await loadProducts();
      showNotification('Product deleted successfully!', 'success');
    } catch (err) {
      console.error('Delete product error:', err);
      showNotification('Failed to delete product: ' + err.message, 'error');
    }
  };

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="app-bg">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh', 
          fontSize: '18px', 
          color: '#666', 
          flexDirection: 'column', 
          gap: '16px' 
        }}>
          <LoadingSpinner />
          Loading products...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="app-bg">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh', 
          fontSize: '18px', 
          color: '#666', 
          textAlign: 'center', 
          padding: '20px' 
        }}>
          <div style={{ marginBottom: '20px' }}>❌ {error}</div>
          <button onClick={loadProducts} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Main app render
  return (
    <div className="app-bg">
      {notification && (
        <NotificationToast 
          message={notification.message} 
          type={notification.type} 
          onClose={hideNotification} 
        />
      )}
      
      <Sidebar 
        currentView={currentView} 
        onViewChange={handleViewChange} 
        alertCount={alertCount} 
      />
      
      <main className="main-content">
        {/* App Header - Hidden on restock dashboard */}
        {currentView !== 'restock-dashboard' && (
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderBottom: '1px solid #e2e8f0',
            padding: '24px 32px',
            marginBottom: '32px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#1e293b',
                  margin: 0,
                  letterSpacing: '-0.025em'
                }}>
                  Inventory Management
                </h1>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: '4px 0 0 0',
                  fontWeight: 400
                }}>
                  Manage your inventory efficiently
                </p>
              </div>
              
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 8px -1px rgba(99, 102, 241, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 6px -1px rgba(99, 102, 241, 0.3)';
                }}
              >
                + Add Product
              </button>
            </div>
          </div>
        )}

        {/* Conditional Content Rendering */}
        {currentView === 'restock-dashboard' ? (
          <OptimizedRestockDashboard 
            products={products}
            api={api}
            showNotification={showNotification}
          />
        ) : (
          <>
            <SearchBar 
              searchTerm={searchTerm} 
              onSearchChange={setSearchTerm} 
            />
            
            <PolishedTable 
              products={products} 
              searchTerm={searchTerm} 
              currentView={currentView}
              onEditProduct={handleStartEdit}
              onDeleteProduct={handleDeleteProduct}
              onRestockProduct={handleStartRestock}
            />
          </>
        )}
      </main>
      
      <AddProductModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSubmit={handleAddProduct} 
        isSubmitting={isSubmitting} 
        showNotification={showNotification}
        api={api}
      />

      <EditProductModal 
        isOpen={showEditModal} 
        onClose={() => {
          setShowEditModal(false);
          setEditingProduct(null);
        }} 
        onSubmit={handleEditProduct} 
        product={editingProduct}
        isSubmitting={isSubmitting}
      />

      <RestockModal 
        isOpen={showRestockModal} 
        onClose={() => {
          setShowRestockModal(false);
          setRestockProduct(null);
        }} 
        product={restockProduct}
        api={api}
        showNotification={showNotification}
      />
      
      <ChatWidget api={api} />
    </div>
  );
}

export default App;
