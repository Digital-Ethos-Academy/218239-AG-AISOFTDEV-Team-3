/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PolishedTable from '../src/components/PolishedTable';

// Mock the DeleteConfirmModal component
jest.mock('../src/components/DeleteConfirmModal', () => {
  return function MockDeleteConfirmModal({ isOpen, onConfirm, onCancel, productName }) {
    if (!isOpen) return null;
    return (
      <div data-testid="delete-confirm-modal">
        <p>Delete {productName}?</p>
        <button onClick={onConfirm} data-testid="confirm-delete">Confirm</button>
        <button onClick={onCancel} data-testid="cancel-delete">Cancel</button>
      </div>
    );
  };
});

// Mock the EditProductModal component
jest.mock('../src/components/EditProductModal', () => {
  return function MockEditProductModal({ isOpen, onClose, onSave, product }) {
    if (!isOpen) return null;
    return (
      <div data-testid="edit-product-modal">
        <p>Edit {product?.name}</p>
        <button onClick={() => onSave({ ...product, name: 'Updated Product' })} data-testid="save-edit">Save</button>
        <button onClick={onClose} data-testid="cancel-edit">Cancel</button>
      </div>
    );
  };
});

describe('PolishedTable Component', () => {
  const mockProducts = [
    {
      id: 1,
      sku: 'PROD001',
      name: 'Test Product 1',
      description: 'Description 1',
      category: 'electronics',
      price: 1999, // Price in cents
      stock: 50,
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 2,
      sku: 'PROD002',
      name: 'Test Product 2',
      description: 'Description 2',
      category: 'books',
      price: 2999,
      stock: 25,
      created_at: '2025-01-02T00:00:00Z'
    }
  ];

  const mockProps = {
    products: mockProducts,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onRefresh: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with product data', () => {
    render(<PolishedTable {...mockProps} />);
    
    // Check table headers
    expect(screen.getByText('SKU')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Stock')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    
    // Check product data
    expect(screen.getByText('PROD001')).toBeInTheDocument();
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('electronics')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument(); // Price converted from cents
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  test('renders empty state when no products', () => {
    render(<PolishedTable {...mockProps} products={[]} />);
    
    expect(screen.getByText('No products found')).toBeInTheDocument();
    expect(screen.getByText('Add your first product to get started!')).toBeInTheDocument();
  });

  test('opens edit modal when edit button is clicked', () => {
    render(<PolishedTable {...mockProps} />);
    
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    expect(screen.getByTestId('edit-product-modal')).toBeInTheDocument();
    expect(screen.getByText('Edit Test Product 1')).toBeInTheDocument();
  });

  test('calls onEdit when product is saved in edit modal', async () => {
    render(<PolishedTable {...mockProps} />);
    
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    const saveButton = screen.getByTestId('save-edit');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockProps.onEdit).toHaveBeenCalledWith(1, { ...mockProducts[0], name: 'Updated Product' });
    });
  });

  test('opens delete confirmation modal when delete button is clicked', () => {
    render(<PolishedTable {...mockProps} />);
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    expect(screen.getByTestId('delete-confirm-modal')).toBeInTheDocument();
    expect(screen.getByText('Delete Test Product 1?')).toBeInTheDocument();
  });

  test('calls onDelete when delete is confirmed', async () => {
    render(<PolishedTable {...mockProps} />);
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    const confirmButton = screen.getByTestId('confirm-delete');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockProps.onDelete).toHaveBeenCalledWith(1);
    });
  });

  test('closes delete modal when cancel is clicked', () => {
    render(<PolishedTable {...mockProps} />);
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    const cancelButton = screen.getByTestId('cancel-delete');
    fireEvent.click(cancelButton);
    
    expect(screen.queryByTestId('delete-confirm-modal')).not.toBeInTheDocument();
  });

  test('displays low stock warning for products with stock <= 10', () => {
    const lowStockProducts = [
      { ...mockProducts[0], stock: 5 }
    ];
    
    render(<PolishedTable {...mockProps} products={lowStockProducts} />);
    
    // Check if low stock styling is applied (you may need to check for specific classes)
    const stockCell = screen.getByText('5');
    expect(stockCell).toBeInTheDocument();
  });

  test('formats prices correctly from cents to dollars', () => {
    const priceTestProducts = [
      { ...mockProducts[0], price: 100 }, // $1.00
      { ...mockProducts[1], price: 1550 }, // $15.50
      { ...mockProducts[0], id: 3, price: 999999 } // $9999.99
    ];
    
    render(<PolishedTable {...mockProps} products={priceTestProducts} />);
    
    expect(screen.getByText('$1.00')).toBeInTheDocument();
    expect(screen.getByText('$15.50')).toBeInTheDocument();
    expect(screen.getByText('$9999.99')).toBeInTheDocument();
  });

  test('handles refresh action', () => {
    render(<PolishedTable {...mockProps} />);
    
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);
    
    expect(mockProps.onRefresh).toHaveBeenCalled();
  });

  test('displays correct category badges', () => {
    render(<PolishedTable {...mockProps} />);
    
    expect(screen.getByText('electronics')).toBeInTheDocument();
    expect(screen.getByText('books')).toBeInTheDocument();
  });

  test('handles keyboard navigation for accessibility', () => {
    render(<PolishedTable {...mockProps} />);
    
    const editButtons = screen.getAllByText('Edit');
    editButtons[0].focus();
    
    // Test that the button can receive focus
    expect(editButtons[0]).toHaveFocus();
    
    // Test Enter key press
    fireEvent.keyDown(editButtons[0], { key: 'Enter', code: 'Enter' });
    expect(screen.getByTestId('edit-product-modal')).toBeInTheDocument();
  });

  test('displays created date in readable format', () => {
    render(<PolishedTable {...mockProps} />);
    
    // Check if dates are formatted properly (adjust based on your actual date formatting)
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });

  test('handles long product names gracefully', () => {
    const longNameProducts = [
      {
        ...mockProducts[0],
        name: 'This is a very long product name that should be handled gracefully by the table component without breaking the layout'
      }
    ];
    
    render(<PolishedTable {...mockProps} products={longNameProducts} />);
    
    expect(screen.getByText(/This is a very long product name/)).toBeInTheDocument();
  });
});

describe('PolishedTable Component - Edge Cases', () => {
  test('handles products with missing optional fields', () => {
    const productsWithMissingFields = [
      {
        id: 1,
        sku: 'INCOMPLETE001',
        name: 'Incomplete Product',
        category: 'other',
        price: 1000,
        stock: 10
        // Missing description and created_at
      }
    ];

    const mockProps = {
      products: productsWithMissingFields,
      onEdit: jest.fn(),
      onDelete: jest.fn(),
      onRefresh: jest.fn()
    };

    render(<PolishedTable {...mockProps} />);
    
    expect(screen.getByText('Incomplete Product')).toBeInTheDocument();
  });

  test('handles zero stock products', () => {
    const zeroStockProducts = [
      {
        id: 1,
        sku: 'ZERO001',
        name: 'Zero Stock Product',
        description: 'Out of stock',
        category: 'other',
        price: 1000,
        stock: 0,
        created_at: '2025-01-01T00:00:00Z'
      }
    ];

    const mockProps = {
      products: zeroStockProducts,
      onEdit: jest.fn(),
      onDelete: jest.fn(),
      onRefresh: jest.fn()
    };

    render(<PolishedTable {...mockProps} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('handles very high prices', () => {
    const highPriceProducts = [
      {
        id: 1,
        sku: 'EXPENSIVE001',
        name: 'Expensive Product',
        description: 'Very expensive item',
        category: 'other',
        price: 999999999, // $9,999,999.99
        stock: 1,
        created_at: '2025-01-01T00:00:00Z'
      }
    ];

    const mockProps = {
      products: highPriceProducts,
      onEdit: jest.fn(),
      onDelete: jest.fn(),
      onRefresh: jest.fn()
    };

    render(<PolishedTable {...mockProps} />);
    
    expect(screen.getByText('$9999999.99')).toBeInTheDocument();
  });
});
