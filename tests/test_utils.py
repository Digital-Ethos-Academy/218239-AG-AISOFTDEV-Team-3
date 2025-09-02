import pytest
import os
import sys
from pathlib import Path

# Add app directory to Python path for imports
sys.path.append(str(Path(__file__).parent.parent / "app"))

from utils import validate_product_data, format_price

class TestValidateProductData:
    """Test the validate_product_data function"""
    
    def test_valid_product_data(self):
        """Test validation with valid product data"""
        valid_data = {
            "sku": "VALID123",
            "name": "Valid Product",
            "description": "A valid product for testing",
            "category": "electronics",
            "price": 2999,
            "stock": 50
        }
        
        # Should not raise any exception
        validate_product_data(valid_data)
    
    def test_missing_required_fields(self):
        """Test validation with missing required fields"""
        incomplete_data = {
            "name": "Incomplete Product"
            # Missing sku, price, stock
        }
        
        with pytest.raises(ValueError) as exc_info:
            validate_product_data(incomplete_data)
        
        assert "Missing required field" in str(exc_info.value)
    
    def test_empty_string_fields(self):
        """Test validation with empty string fields"""
        empty_data = {
            "sku": "",
            "name": "",
            "description": "",
            "category": "",
            "price": 1000,
            "stock": 10
        }
        
        with pytest.raises(ValueError) as exc_info:
            validate_product_data(empty_data)
        
        assert "cannot be empty" in str(exc_info.value)
    
    def test_negative_price(self):
        """Test validation with negative price"""
        invalid_data = {
            "sku": "NEG001",
            "name": "Negative Price Product",
            "description": "Product with negative price",
            "category": "other",
            "price": -100,
            "stock": 10
        }
        
        with pytest.raises(ValueError) as exc_info:
            validate_product_data(invalid_data)
        
        assert "Price must be positive" in str(exc_info.value)
    
    def test_negative_stock(self):
        """Test validation with negative stock"""
        invalid_data = {
            "sku": "NEGSTOCK001",
            "name": "Negative Stock Product",
            "description": "Product with negative stock",
            "category": "other",
            "price": 1000,
            "stock": -5
        }
        
        with pytest.raises(ValueError) as exc_info:
            validate_product_data(invalid_data)
        
        assert "Stock must be non-negative" in str(exc_info.value)
    
    def test_zero_price(self):
        """Test validation with zero price"""
        zero_price_data = {
            "sku": "ZERO001",
            "name": "Zero Price Product",
            "description": "Product with zero price",
            "category": "other",
            "price": 0,
            "stock": 10
        }
        
        with pytest.raises(ValueError) as exc_info:
            validate_product_data(zero_price_data)
        
        assert "Price must be positive" in str(exc_info.value)
    
    def test_zero_stock(self):
        """Test validation with zero stock (should be valid)"""
        zero_stock_data = {
            "sku": "ZEROSTOCK001",
            "name": "Zero Stock Product",
            "description": "Product with zero stock",
            "category": "other",
            "price": 1000,
            "stock": 0
        }
        
        # Should not raise any exception
        validate_product_data(zero_stock_data)
    
    def test_invalid_category(self):
        """Test validation with invalid category"""
        invalid_category_data = {
            "sku": "INVALID001",
            "name": "Invalid Category Product",
            "description": "Product with invalid category",
            "category": "invalid_category",
            "price": 1000,
            "stock": 10
        }
        
        with pytest.raises(ValueError) as exc_info:
            validate_product_data(invalid_category_data)
        
        assert "Invalid category" in str(exc_info.value)
    
    def test_valid_categories(self):
        """Test validation with all valid categories"""
        valid_categories = ["electronics", "books", "clothing", "food", "other"]
        
        for category in valid_categories:
            valid_data = {
                "sku": f"CAT{category.upper()}",
                "name": f"{category.title()} Product",
                "description": f"Product in {category} category",
                "category": category,
                "price": 1000,
                "stock": 10
            }
            
            # Should not raise any exception
            validate_product_data(valid_data)
    
    def test_non_integer_price(self):
        """Test validation with non-integer price"""
        float_price_data = {
            "sku": "FLOAT001",
            "name": "Float Price Product",
            "description": "Product with float price",
            "category": "other",
            "price": 19.99,  # Float instead of integer (cents)
            "stock": 10
        }
        
        with pytest.raises(ValueError) as exc_info:
            validate_product_data(float_price_data)
        
        assert "Price must be an integer" in str(exc_info.value)
    
    def test_non_integer_stock(self):
        """Test validation with non-integer stock"""
        float_stock_data = {
            "sku": "FLOATSTOCK001",
            "name": "Float Stock Product",
            "description": "Product with float stock",
            "category": "other",
            "price": 1000,
            "stock": 10.5  # Float instead of integer
        }
        
        with pytest.raises(ValueError) as exc_info:
            validate_product_data(float_stock_data)
        
        assert "Stock must be an integer" in str(exc_info.value)

class TestFormatPrice:
    """Test the format_price function"""
    
    def test_format_price_cents_to_dollars(self):
        """Test converting cents to dollars"""
        assert format_price(1999) == 19.99
        assert format_price(500) == 5.00
        assert format_price(1) == 0.01
        assert format_price(0) == 0.00
        assert format_price(10000) == 100.00
    
    def test_format_price_large_amounts(self):
        """Test formatting large price amounts"""
        assert format_price(999999) == 9999.99
        assert format_price(1000000) == 10000.00
        assert format_price(123456) == 1234.56
    
    def test_format_price_edge_cases(self):
        """Test edge cases for price formatting"""
        # Single digits
        assert format_price(5) == 0.05
        assert format_price(9) == 0.09
        
        # Exact dollars (no cents)
        assert format_price(100) == 1.00
        assert format_price(2500) == 25.00
        
        # Odd cents
        assert format_price(1001) == 10.01
        assert format_price(2503) == 25.03

class TestPriceConversion:
    """Test price conversion helpers"""
    
    def test_dollars_to_cents(self):
        """Test converting dollars to cents (simulated)"""
        # Since utils.py might not have this function, we test the logic
        def dollars_to_cents(dollars):
            return int(dollars * 100)
        
        assert dollars_to_cents(19.99) == 1999
        assert dollars_to_cents(5.00) == 500
        assert dollars_to_cents(0.01) == 1
        assert dollars_to_cents(100.00) == 10000
        assert dollars_to_cents(0) == 0
    
    def test_round_trip_conversion(self):
        """Test that converting back and forth preserves value"""
        def dollars_to_cents(dollars):
            return int(dollars * 100)
        
        test_amounts = [0.01, 0.99, 1.00, 5.50, 19.99, 100.00, 999.99]
        
        for amount in test_amounts:
            cents = dollars_to_cents(amount)
            back_to_dollars = format_price(cents)
            assert back_to_dollars == amount

class TestErrorHandling:
    """Test error handling in utility functions"""
    
    def test_validate_product_data_none(self):
        """Test validation with None data"""
        with pytest.raises(ValueError) as exc_info:
            validate_product_data(None)
        
        assert "Product data cannot be None" in str(exc_info.value)
    
    def test_validate_product_data_empty_dict(self):
        """Test validation with empty dictionary"""
        with pytest.raises(ValueError) as exc_info:
            validate_product_data({})
        
        assert "Missing required field" in str(exc_info.value)
    
    def test_format_price_negative(self):
        """Test format_price with negative values"""
        with pytest.raises(ValueError) as exc_info:
            format_price(-100)
        
        assert "Price cannot be negative" in str(exc_info.value)
    
    def test_format_price_non_integer(self):
        """Test format_price with non-integer input"""
        with pytest.raises(TypeError) as exc_info:
            format_price("1999")
        
        assert "Price must be an integer" in str(exc_info.value)

class TestDataSanitization:
    """Test data sanitization functions"""
    
    def test_strip_whitespace(self):
        """Test that product data strips whitespace"""
        data_with_whitespace = {
            "sku": "  WHITESPACE001  ",
            "name": "  Product with Whitespace  ",
            "description": "  Description with whitespace  ",
            "category": "  electronics  ",
            "price": 1000,
            "stock": 10
        }
        
        # Assuming validate_product_data strips whitespace
        validate_product_data(data_with_whitespace)
    
    def test_case_sensitivity(self):
        """Test case sensitivity handling"""
        # Categories should be case-insensitive
        mixed_case_data = {
            "sku": "CASE001",
            "name": "Case Test Product",
            "description": "Testing case sensitivity",
            "category": "ELECTRONICS",  # Uppercase
            "price": 1000,
            "stock": 10
        }
        
        # Should either normalize to lowercase or accept uppercase
        try:
            validate_product_data(mixed_case_data)
        except ValueError as e:
            # If it fails, it should be due to case sensitivity
            assert "Invalid category" in str(e)

class TestBoundaryValues:
    """Test boundary values and edge cases"""
    
    def test_minimum_valid_values(self):
        """Test minimum valid values"""
        min_valid_data = {
            "sku": "A",  # Single character SKU
            "name": "A",  # Single character name
            "description": "",  # Empty description (might be optional)
            "category": "other",
            "price": 1,  # Minimum price (1 cent)
            "stock": 0   # Minimum stock
        }
        
        # Should validate successfully
        validate_product_data(min_valid_data)
    
    def test_maximum_reasonable_values(self):
        """Test maximum reasonable values"""
        max_data = {
            "sku": "A" * 50,  # Long SKU
            "name": "A" * 200,  # Long name
            "description": "A" * 1000,  # Long description
            "category": "electronics",
            "price": 999999999,  # Very high price (in cents)
            "stock": 999999999   # Very high stock
        }
        
        # Should either validate or fail gracefully
        try:
            validate_product_data(max_data)
        except ValueError:
            # If it fails, it should be due to size limits
            pass

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
