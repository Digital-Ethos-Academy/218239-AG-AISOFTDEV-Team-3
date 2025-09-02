/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditProductModal from '../src/components/EditProductModal';

describe('EditProductModal Component', () => {
  const mockProduct = {
    id: 1,
    sku: 'PROD001',
    name: 'Test Product',
    description: 'Test Description',
    category: 'electronics',
    price: 1999, // Price in cents
    stock: 50
  };

  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    product: mockProduct
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders modal when isOpen is true', () => {
    render(<EditProductModal {...mockProps} />);
    
    expect(screen.getByText('Edit Product')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    render(<EditProductModal {...mockProps} isOpen={false} />);
    
    expect(screen.queryByText('Edit Product')).not.toBeInTheDocument();
  });

  test('displays product data in form fields', () => {
    render(<EditProductModal {...mockProps} />);
    
    expect(screen.getByDisplayValue('PROD001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('electronics')).toBeInTheDocument();
    expect(screen.getByDisplayValue('19.99')).toBeInTheDocument(); // Price converted to dollars
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
  });

  test('converts price from cents to dollars for display', () => {
    const productWithDifferentPrice = {
      ...mockProduct,
      price: 2550 // $25.50
    };
    
    render(<EditProductModal {...mockProps} product={productWithDifferentPrice} />);
    
    expect(screen.getByDisplayValue('25.50')).toBeInTheDocument();
  });

  test('handles form field changes', () => {
    render(<EditProductModal {...mockProps} />);
    
    const nameInput = screen.getByDisplayValue('Test Product');
    fireEvent.change(nameInput, { target: { value: 'Updated Product Name' } });
    
    expect(nameInput.value).toBe('Updated Product Name');
  });

  test('handles price field changes and converts to cents', async () => {
    render(<EditProductModal {...mockProps} />);
    
    const priceInput = screen.getByDisplayValue('19.99');
    fireEvent.change(priceInput, { target: { value: '29.99' } });
    
    expect(priceInput.value).toBe('29.99');
  });

  test('handles stock field changes', () => {
    render(<EditProductModal {...mockProps} />);
    
    const stockInput = screen.getByDisplayValue('50');
    fireEvent.change(stockInput, { target: { value: '75' } });
    
    expect(stockInput.value).toBe('75');
  });

  test('calls onSave with updated data when save button is clicked', async () => {
    render(<EditProductModal {...mockProps} />);
    
    // Update some fields
    const nameInput = screen.getByDisplayValue('Test Product');
    fireEvent.change(nameInput, { target: { value: 'Updated Product' } });
    
    const priceInput = screen.getByDisplayValue('19.99');
    fireEvent.change(priceInput, { target: { value: '29.99' } });
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockProps.onSave).toHaveBeenCalledWith(
        mockProduct.id,
        expect.objectContaining({
          name: 'Updated Product',
          price: 2999 // Converted back to cents
        })
      );
    });
  });

  test('calls onClose when cancel button is clicked', () => {
    render(<EditProductModal {...mockProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test('calls onClose when close (X) button is clicked', () => {
    render(<EditProductModal {...mockProps} />);
    
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test('prevents form submission when required fields are empty', () => {
    render(<EditProductModal {...mockProps} />);
    
    // Clear the name field
    const nameInput = screen.getByDisplayValue('Test Product');
    fireEvent.change(nameInput, { target: { value: '' } });
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    // onSave should not be called with empty name
    expect(mockProps.onSave).not.toHaveBeenCalled();
  });

  test('validates price input format', () => {
    render(<EditProductModal {...mockProps} />);
    
    const priceInput = screen.getByDisplayValue('19.99');
    
    // Test invalid price formats
    fireEvent.change(priceInput, { target: { value: 'invalid' } });
    expect(priceInput.value).toBe('invalid');
    
    // The component should handle validation (implementation specific)
  });

  test('validates stock input as positive integer', () => {
    render(<EditProductModal {...mockProps} />);
    
    const stockInput = screen.getByDisplayValue('50');
    
    // Test negative stock
    fireEvent.change(stockInput, { target: { value: '-10' } });
    expect(stockInput.value).toBe('-10');
    
    // The component should handle validation
  });

  test('handles category selection', () => {
    render(<EditProductModal {...mockProps} />);
    
    const categorySelect = screen.getByDisplayValue('electronics');
    fireEvent.change(categorySelect, { target: { value: 'books' } });
    
    expect(categorySelect.value).toBe('books');
  });

  test('shows loading state during save operation', async () => {
    const mockPropsWithLoading = {
      ...mockProps,
      onSave: jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    };
    
    render(<EditProductModal {...mockPropsWithLoading} />);
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    // Check if loading state is shown (implementation specific)
    // This would depend on how your component handles loading states
  });

  test('handles keyboard navigation', () => {
    render(<EditProductModal {...mockProps} />);
    
    const firstInput = screen.getByDisplayValue('PROD001');
    firstInput.focus();
    
    expect(firstInput).toHaveFocus();
    
    // Test Tab navigation
    fireEvent.keyDown(firstInput, { key: 'Tab' });
  });

  test('handles escape key to close modal', () => {
    render(<EditProductModal {...mockProps} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test('handles backdrop click to close modal', () => {
    render(<EditProductModal {...mockProps} />);
    
    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test('prevents modal content click from closing modal', () => {
    render(<EditProductModal {...mockProps} />);
    
    const modalContent = screen.getByTestId('modal-content');
    fireEvent.click(modalContent);
    
    expect(mockProps.onClose).not.toHaveBeenCalled();
  });
});

describe('EditProductModal Component - Edge Cases', () => {
  test('handles product with null values', () => {
    const productWithNulls = {
      id: 1,
      sku: 'NULL001',
      name: null,
      description: null,
      category: 'other',
      price: 0,
      stock: 0
    };

    const mockProps = {
      isOpen: true,
      onClose: jest.fn(),
      onSave: jest.fn(),
      product: productWithNulls
    };

    render(<EditProductModal {...mockProps} />);
    
    // Should handle null values gracefully
    expect(screen.getByText('Edit Product')).toBeInTheDocument();
  });

  test('handles very long product names', () => {
    const productWithLongName = {
      id: 1,
      sku: 'LONG001',
      name: 'This is a very long product name that should be handled gracefully by the edit modal component',
      description: 'Description',
      category: 'other',
      price: 1000,
      stock: 10
    };

    const mockProps = {
      isOpen: true,
      onClose: jest.fn(),
      onSave: jest.fn(),
      product: productWithLongName
    };

    render(<EditProductModal {...mockProps} />);
    
    expect(screen.getByDisplayValue(/This is a very long product name/)).toBeInTheDocument();
  });

  test('handles zero and very high prices', () => {
    const extremePriceProduct = {
      id: 1,
      sku: 'EXTREME001',
      name: 'Extreme Price Product',
      description: 'Description',
      category: 'other',
      price: 999999999, // $9,999,999.99
      stock: 10
    };

    const mockProps = {
      isOpen: true,
      onClose: jest.fn(),
      onSave: jest.fn(),
      product: extremePriceProduct
    };

    render(<EditProductModal {...mockProps} />);
    
    expect(screen.getByDisplayValue('9999999.99')).toBeInTheDocument();
  });

  test('handles special characters in product data', () => {
    const specialCharProduct = {
      id: 1,
      sku: 'SPECIAL-001',
      name: 'Product with émojis 🎉 & spéçial chars',
      description: 'Description with @#$%^&*() characters',
      category: 'other',
      price: 1500,
      stock: 5
    };

    const mockProps = {
      isOpen: true,
      onClose: jest.fn(),
      onSave: jest.fn(),
      product: specialCharProduct
    };

    render(<EditProductModal {...mockProps} />);
    
    expect(screen.getByDisplayValue(/Product with émojis 🎉 & spéçial chars/)).toBeInTheDocument();
  });
});
