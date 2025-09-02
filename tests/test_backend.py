import pytest
import requests
from fastapi.testclient import TestClient
import sys
import os
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

from app.main import app

client = TestClient(app)

class TestHealthEndpoint:
    """Test the health check endpoint"""
    
    def test_health_check(self):
        """Test that health endpoint returns 200 and correct response"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"

class TestProductEndpoints:
    """Test product CRUD operations"""
    
    def setup_method(self):
        """Set up test data before each test"""
        self.test_product = {
            "sku": "TEST123",
            "name": "Test Product",
            "description": "A test product for unit testing",
            "category": "electronics",
            "price": 2999,  # Price in cents
            "stock": 50
        }
    
    def test_create_product_success(self):
        """Test successful product creation"""
        response = client.post("/products/", json=self.test_product)
        assert response.status_code == 201
        
        data = response.json()
        assert data["name"] == self.test_product["name"]
        assert data["sku"] == self.test_product["sku"]
        assert data["price"] == self.test_product["price"]
        assert data["stock"] == self.test_product["stock"]
        assert "id" in data
        assert "created_at" in data
        
        # Clean up
        client.delete(f"/products/{data['id']}")
    
    def test_create_product_missing_required_fields(self):
        """Test product creation with missing required fields"""
        incomplete_product = {
            "name": "Incomplete Product"
            # Missing sku, price, stock
        }
        response = client.post("/products/", json=incomplete_product)
        assert response.status_code == 422  # Validation error
    
    def test_create_product_invalid_price(self):
        """Test product creation with invalid price"""
        invalid_product = self.test_product.copy()
        invalid_product["price"] = -100  # Negative price
        
        response = client.post("/products/", json=invalid_product)
        assert response.status_code == 422
    
    def test_create_product_invalid_stock(self):
        """Test product creation with invalid stock"""
        invalid_product = self.test_product.copy()
        invalid_product["stock"] = -10  # Negative stock
        
        response = client.post("/products/", json=invalid_product)
        assert response.status_code == 422
    
    def test_get_all_products(self):
        """Test retrieving all products"""
        response = client.get("/products/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_product_by_id_success(self):
        """Test retrieving a specific product by ID"""
        # First create a product
        create_response = client.post("/products/", json=self.test_product)
        created_product = create_response.json()
        product_id = created_product["id"]
        
        # Then retrieve it
        response = client.get(f"/products/{product_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == product_id
        assert data["name"] == self.test_product["name"]
        
        # Clean up
        client.delete(f"/products/{product_id}")
    
    def test_get_product_by_id_not_found(self):
        """Test retrieving a non-existent product"""
        response = client.get("/products/99999")
        assert response.status_code == 404
    
    def test_update_product_success(self):
        """Test successful product update"""
        # Create a product first
        create_response = client.post("/products/", json=self.test_product)
        created_product = create_response.json()
        product_id = created_product["id"]
        
        # Update the product
        update_data = {
            "name": "Updated Test Product",
            "price": 3999,
            "stock": 75
        }
        
        response = client.put(f"/products/{product_id}", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["price"] == update_data["price"]
        assert data["stock"] == update_data["stock"]
        
        # Clean up
        client.delete(f"/products/{product_id}")
    
    def test_update_product_not_found(self):
        """Test updating a non-existent product"""
        update_data = {"name": "Non-existent Product"}
        response = client.put("/products/99999", json=update_data)
        assert response.status_code == 404
    
    def test_delete_product_success(self):
        """Test successful product deletion"""
        # Create a product first
        create_response = client.post("/products/", json=self.test_product)
        created_product = create_response.json()
        product_id = created_product["id"]
        
        # Delete the product
        response = client.delete(f"/products/{product_id}")
        assert response.status_code == 204
        
        # Verify it's deleted
        get_response = client.get(f"/products/{product_id}")
        assert get_response.status_code == 404
    
    def test_delete_product_not_found(self):
        """Test deleting a non-existent product"""
        response = client.delete("/products/99999")
        assert response.status_code == 404

class TestAIEndpoints:
    """Test AI-powered features"""
    
    def test_autofill_endpoint(self):
        """Test the autofill endpoint"""
        autofill_data = {
            "description": "Wireless Bluetooth headphones"
        }
        
        response = client.post("/autofill", json=autofill_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "name" in data
        assert "category" in data
        assert "price" in data
        assert isinstance(data["price"], int)  # Should be in cents
    
    def test_autofill_missing_description(self):
        """Test autofill with missing description"""
        response = client.post("/autofill", json={})
        assert response.status_code == 422
    
    def test_chat_endpoint(self):
        """Test the chat endpoint"""
        chat_data = {
            "question": "How many electronics products do we have?"
        }
        
        response = client.post("/chat", json=chat_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "response" in data
        assert isinstance(data["response"], str)
        assert len(data["response"]) > 0
    
    def test_chat_missing_question(self):
        """Test chat with missing question"""
        response = client.post("/chat", json={})
        assert response.status_code == 422
    
    def test_restock_suggestion_endpoint(self):
        """Test the restock suggestion endpoint"""
        # First create a low-stock product
        low_stock_product = {
            "sku": "LOWSTOCK001",
            "name": "Low Stock Product",
            "description": "A product with low stock",
            "category": "electronics",
            "price": 1999,
            "stock": 5  # Low stock
        }
        
        create_response = client.post("/products/", json=low_stock_product)
        created_product = create_response.json()
        product_id = created_product["id"]
        
        # Test restock suggestion
        response = client.get(f"/restock-suggestion/{product_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert "suggestion" in data
        assert isinstance(data["suggestion"], str)
        
        # Clean up
        client.delete(f"/products/{product_id}")
    
    def test_restock_suggestion_not_found(self):
        """Test restock suggestion for non-existent product"""
        response = client.get("/restock-suggestion/99999")
        assert response.status_code == 404

class TestValidation:
    """Test input validation and edge cases"""
    
    def test_product_sku_uniqueness(self):
        """Test that SKU must be unique"""
        product1 = {
            "sku": "UNIQUE123",
            "name": "Product 1",
            "description": "First product",
            "category": "electronics",
            "price": 1000,
            "stock": 10
        }
        
        product2 = {
            "sku": "UNIQUE123",  # Same SKU
            "name": "Product 2",
            "description": "Second product",
            "category": "books",
            "price": 2000,
            "stock": 20
        }
        
        # Create first product
        response1 = client.post("/products/", json=product1)
        assert response1.status_code == 201
        product1_id = response1.json()["id"]
        
        # Try to create second product with same SKU
        response2 = client.post("/products/", json=product2)
        assert response2.status_code == 400  # Should fail due to duplicate SKU
        
        # Clean up
        client.delete(f"/products/{product1_id}")
    
    def test_long_product_name(self):
        """Test handling of very long product names"""
        long_name = "A" * 1000  # Very long name
        product = {
            "sku": "LONGNAME001",
            "name": long_name,
            "description": "Product with long name",
            "category": "other",
            "price": 1000,
            "stock": 10
        }
        
        response = client.post("/products/", json=product)
        # Should either accept it or return validation error
        assert response.status_code in [201, 422]
    
    def test_special_characters_in_product_data(self):
        """Test handling of special characters"""
        special_product = {
            "sku": "SPECIAL-001",
            "name": "Product with émojis 🎉 & spéçial chars",
            "description": "Product with special characters: @#$%^&*()",
            "category": "other",
            "price": 1500,
            "stock": 5
        }
        
        response = client.post("/products/", json=special_product)
        if response.status_code == 201:
            product_id = response.json()["id"]
            # Clean up
            client.delete(f"/products/{product_id}")
        
        assert response.status_code in [201, 422]

class TestPerformance:
    """Test performance and edge cases"""
    
    def test_large_product_list(self):
        """Test retrieving products when there are many"""
        response = client.get("/products/")
        assert response.status_code == 200
        
        # Should complete in reasonable time even with many products
        data = response.json()
        assert isinstance(data, list)
    
    def test_concurrent_product_creation(self):
        """Test creating multiple products rapidly"""
        products = []
        for i in range(10):
            product = {
                "sku": f"CONCURRENT{i:03d}",
                "name": f"Concurrent Product {i}",
                "description": f"Product for concurrency test {i}",
                "category": "other",
                "price": 1000 + i,
                "stock": 10 + i
            }
            response = client.post("/products/", json=product)
            if response.status_code == 201:
                products.append(response.json()["id"])
        
        # Clean up
        for product_id in products:
            client.delete(f"/products/{product_id}")
        
        assert len(products) > 0  # At least some should succeed

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
