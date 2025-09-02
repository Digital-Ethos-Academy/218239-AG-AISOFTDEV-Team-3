import React, { useState } from 'react';
import { FiEdit3, FiTrash2, FiPackage, FiSearch, FiAlertTriangle, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { MdDevices, MdCheckroom, MdHome, MdMenuBook, MdSportsBasketball, MdCategory } from 'react-icons/md';
import { formatPrice, isLowStock, isOutOfStock, isAlertItem, getCategoryName } from '../utils';
import DeleteConfirmModal from './DeleteConfirmModal';

// Enhanced product icon component
const getProductIcon = (category) => {
  const iconClass = "w-5 h-5 flex-shrink-0";
  switch (category?.toLowerCase()) {
    case 'electronics':
      return <MdDevices className={`${iconClass} text-blue-600`} />;
    case 'clothing':
      return <MdCheckroom className={`${iconClass} text-purple-600`} />;
    case 'home':
      return <MdHome className={`${iconClass} text-green-600`} />;
    case 'books':
      return <MdMenuBook className={`${iconClass} text-orange-600`} />;
    case 'sports':
      return <MdSportsBasketball className={`${iconClass} text-red-600`} />;
    default:
      return <MdCategory className={`${iconClass} text-gray-600`} />;
  }
};

const getStockDisplay = (product) => {
  const stock = product.stock || 0;
  if (stock === 0) {
    return (
      <span style={{ 
        color: '#dc2626', 
        fontWeight: 600,
        fontSize: '11px',
        background: '#fee2e2',
        padding: '4px 8px',
        borderRadius: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap'
      }}>
        Out of Stock
      </span>
    );
  } else if (isLowStock(product)) {
    return (
      <span style={{ 
        color: '#d97706', 
        fontWeight: 600,
        fontSize: '11px',
        background: '#fef3c7',
        padding: '4px 8px',
        borderRadius: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap'
      }}>
        Low Stock ({stock})
      </span>
    );
  } else {
    return (
      <span style={{ 
        color: '#059669', 
        fontWeight: 600,
        fontSize: '11px',
        background: '#d1fae5',
        padding: '4px 8px',
        borderRadius: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap'
      }}>
        In Stock ({stock})
      </span>
    );
  }
};

const PolishedTable = ({ products, searchTerm, currentView, onEditProduct, onDeleteProduct, onRestockProduct }) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const filteredProducts = products.filter(product => {
    if (currentView === 'alerts') {
      return isAlertItem(product);
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        product.name?.toLowerCase().includes(searchLower) ||
        product.sku?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const handleDelete = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      onDeleteProduct(productToDelete.id);
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  if (filteredProducts.length === 0) {
    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '60px 40px',
        textAlign: 'center',
        margin: '24px 0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          width: '120px',
          height: '120px',
          background: 'linear-gradient(135deg, #ddd6fe 0%, #c7d2fe 100%)',
          borderRadius: '50%',
          margin: '0 auto 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {searchTerm ? (
            <FiSearch style={{ fontSize: '48px', color: '#6366f1' }} />
          ) : (
            <FiPackage style={{ fontSize: '48px', color: '#6366f1' }} />
          )}
        </div>
        <h3 style={{ 
          fontSize: '24px', 
          fontWeight: 600, 
          color: '#1e293b',
          marginBottom: '12px'
        }}>
          {searchTerm ? 'No products found' : currentView === 'alerts' ? 'No alerts' : 'No products yet'}
        </h3>
        <p style={{ 
          fontSize: '16px', 
          color: '#64748b',
          lineHeight: 1.6,
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          {searchTerm 
            ? `No products match "${searchTerm}". Try adjusting your search terms.`
            : currentView === 'alerts' 
              ? 'All products are well-stocked. Check back later for low stock alerts.'
              : 'Get started by adding your first product to the inventory.'
          }
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      margin: '24px 0'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ 
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderBottom: '2px solid #e2e8f0'
          }}>
            <tr>
              <th style={{ 
                padding: '20px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 600,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Product
              </th>
              <th style={{ 
                padding: '20px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 600,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Description
              </th>
              <th style={{ 
                padding: '20px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 600,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Category
              </th>
              <th style={{ 
                padding: '20px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 600,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Stock Status
              </th>
              <th style={{ 
                padding: '20px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 600,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Price
              </th>
              <th style={{ 
                padding: '20px 24px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 600,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody style={{ background: '#ffffff' }}>
            {filteredProducts.map((product) => (
              <tr key={product.id} style={{ 
                borderBottom: '1px solid #f1f5f9',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px'
                  }}>
                    <div style={{ 
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #ddd6fe 0%, #c7d2fe 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getProductIcon(product.category)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ 
                        fontWeight: 600, 
                        color: '#1e293b',
                        fontSize: '15px',
                        marginBottom: '4px',
                        lineHeight: 1.4
                      }}>
                        {product.name}
                      </div>
                      <div style={{ 
                        fontSize: '13px', 
                        color: '#64748b',
                        fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                        background: '#f8fafc',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}>
                        {product.sku}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#475569',
                    lineHeight: 1.5,
                    maxWidth: '280px'
                  }}>
                    {product.description || (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                        No description available
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{ 
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#6366f1',
                    background: 'linear-gradient(135deg, #f0f0ff 0%, #e0e7ff 100%)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    textTransform: 'capitalize',
                    whiteSpace: 'nowrap'
                  }}>
                    {getCategoryName(product.category)}
                  </span>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  {getStockDisplay(product)}
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{ 
                    fontWeight: 600, 
                    color: '#059669',
                    fontSize: '15px'
                  }}>
                    {formatPrice(product.price)}
                  </span>
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <button
                      onClick={() => onEditProduct(product)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        color: '#3b82f6'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#dbeafe';
                        e.target.style.color = '#1d4ed8';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#3b82f6';
                      }}
                      title="Edit product"
                    >
                      <FiEdit3 size={16} />
                    </button>
                    <button
                      onClick={() => onRestockProduct && onRestockProduct(product)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        color: '#059669'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#d1fae5';
                        e.target.style.color = '#047857';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#059669';
                      }}
                      title="Get restock suggestion"
                    >
                      <FiTrendingUp size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        color: '#ef4444'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#fecaca';
                        e.target.style.color = '#dc2626';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#ef4444';
                      }}
                      title="Delete product"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Simple Footer */}
      <div style={{ 
        padding: '16px 24px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderTop: '1px solid #e2e8f0',
        fontSize: '14px',
        color: '#64748b'
      }}>
        Showing <span style={{ fontWeight: 600, color: '#1e293b' }}>{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''}
        {searchTerm && ` matching "${searchTerm}"`}
        {products.length !== filteredProducts.length && (
          <span style={{ color: '#94a3b8' }}> of {products.length} total</span>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        productName={productToDelete?.name || ''}
      />
    </div>
  );
};

export default PolishedTable;
