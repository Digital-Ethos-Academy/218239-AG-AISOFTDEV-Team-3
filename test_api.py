#!/usr/bin/env python3
"""
Simple script to test the inventory API endpoints
"""
import requests
import json

API_BASE = "http://localhost:8000"

def test_health():
    """Test the health endpoint"""
    try:
        response = requests.get(f"{API_BASE}/health")
        print(f"✅ Health check: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_list_products():
    """Test listing products"""
    try:
        response = requests.get(f"{API_BASE}/products/")
        print(f"✅ List products: {response.status_code}")
        if response.status_code == 200:
            products = response.json()
            print(f"   Found {len(products)} products")
            if products:
                print(f"   First product: {products[0]['name']} - ${products[0]['price']}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ List products failed: {e}")
        return False

def test_create_product():
    """Test creating a new product"""
    try:
        test_product = {
            "sku": "TEST001",
            "name": "Test Product",
            "description": "A test product for API testing",
            "category": "Testing",
            "price": 19.99,
            "stock": 100
        }
        
        response = requests.post(f"{API_BASE}/products/", json=test_product)
        print(f"✅ Create product: {response.status_code}")
        if response.status_code == 201:
            product = response.json()
            print(f"   Created: {product['name']} (ID: {product['id']})")
            return product['id']
        return None
    except Exception as e:
        print(f"❌ Create product failed: {e}")
        return None

def test_update_product(product_id):
    """Test updating a product"""
    try:
        update_data = {
            "name": "Updated Test Product",
            "price": 29.99
        }
        
        response = requests.put(f"{API_BASE}/products/{product_id}", json=update_data)
        print(f"✅ Update product: {response.status_code}")
        if response.status_code == 200:
            product = response.json()
            print(f"   Updated: {product['name']} - ${product['price']}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Update product failed: {e}")
        return False

def test_delete_product(product_id):
    """Test deleting a product"""
    try:
        response = requests.delete(f"{API_BASE}/products/{product_id}")
        print(f"✅ Delete product: {response.status_code}")
        return response.status_code == 204
    except Exception as e:
        print(f"❌ Delete product failed: {e}")
        return False

def main():
    """Run all API tests"""
    print("🧪 Testing Inventory Management API")
    print("=" * 40)
    
    # Test health endpoint
    if not test_health():
        print("❌ Backend not running. Start the FastAPI server first.")
        return
    
    print()
    
    # Test listing products
    test_list_products()
    
    print()
    
    # Test CRUD operations
    product_id = test_create_product()
    if product_id:
        test_update_product(product_id)
        test_delete_product(product_id)
    
    print()
    print("🎉 API testing complete!")

if __name__ == "__main__":
    main()
