// API service functions
import { API_BASE_URL } from '../constants';

export const api = {
  async getProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/products/`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },
  
  async createProduct(product) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error('Failed to create product');
      return await response.json();
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  
  async updateProduct(id, product) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error('Failed to update product');
      return await response.json();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },
  
  async deleteProduct(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
      });
      
      // Handle successful delete responses (200-299 range or specifically 204)
      if (response.ok || response.status === 204) {
        return true;
      }
      
      // Handle error responses
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Failed to delete product: ${response.status} ${response.statusText} - ${errorText}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },
  
  async autofillProduct(description) {
    try {
      const response = await fetch(`${API_BASE_URL}/autofill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      if (!response.ok) throw new Error('Failed to autofill product data');
      return await response.json();
    } catch (error) {
      console.error('Error autofilling product:', error);
      throw error;
    }
  },
  
  async getRestockSuggestion(productData) {
    try {
      const response = await fetch(`${API_BASE_URL}/restock_suggestion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Failed to get restock suggestion');
      return await response.json();
    } catch (error) {
      console.error('Error getting restock suggestion:', error);
      throw error;
    }
  },
  
  async askInventory(question) {
    try {
      const response = await fetch(`${API_BASE_URL}/ask_inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      if (!response.ok) throw new Error('Failed to get inventory answer');
      return await response.json();
    } catch (error) {
      console.error('Error asking inventory question:', error);
      throw error;
    }
  }
};
