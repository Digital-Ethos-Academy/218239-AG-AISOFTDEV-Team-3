import pytest
import sqlite3
import tempfile
import os
from pathlib import Path

# Add app directory to Python path
import sys
sys.path.append(str(Path(__file__).parent.parent / "app"))

from app.main import get_db_connection, init_db

class TestDatabaseOperations:
    """Test database operations and connections"""
    
    def setup_method(self):
        """Set up a temporary database for each test"""
        self.temp_db = tempfile.NamedTemporaryFile(delete=False, suffix='.db')
        self.temp_db.close()
        self.db_path = self.temp_db.name
        
        # Initialize the test database
        init_db(self.db_path)
    
    def teardown_method(self):
        """Clean up the temporary database"""
        if os.path.exists(self.db_path):
            os.unlink(self.db_path)
    
    def test_database_connection(self):
        """Test that database connection can be established"""
        conn = sqlite3.connect(self.db_path)
        assert conn is not None
        
        # Test basic query
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        # Should have the products table
        table_names = [table[0] for table in tables]
        assert 'products' in table_names
        
        conn.close()
    
    def test_products_table_schema(self):
        """Test that products table has correct schema"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("PRAGMA table_info(products);")
        columns = cursor.fetchall()
        
        expected_columns = ['id', 'sku', 'name', 'description', 'category', 'price', 'stock', 'created_at']
        actual_columns = [col[1] for col in columns]
        
        for expected_col in expected_columns:
            assert expected_col in actual_columns
        
        conn.close()
    
    def test_insert_product(self):
        """Test inserting a product into the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        product_data = (
            'TEST001',
            'Test Product',
            'A test product',
            'electronics',
            1999,
            50
        )
        
        cursor.execute("""
            INSERT INTO products (sku, name, description, category, price, stock)
            VALUES (?, ?, ?, ?, ?, ?)
        """, product_data)
        
        conn.commit()
        
        # Verify insertion
        cursor.execute("SELECT * FROM products WHERE sku = ?", ('TEST001',))
        result = cursor.fetchone()
        
        assert result is not None
        assert result[1] == 'TEST001'  # sku
        assert result[2] == 'Test Product'  # name
        assert result[5] == 1999  # price
        assert result[6] == 50  # stock
        
        conn.close()
    
    def test_unique_sku_constraint(self):
        """Test that SKU uniqueness is enforced"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Insert first product
        cursor.execute("""
            INSERT INTO products (sku, name, description, category, price, stock)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ('UNIQUE001', 'Product 1', 'Description 1', 'electronics', 1000, 10))
        
        conn.commit()
        
        # Try to insert second product with same SKU
        with pytest.raises(sqlite3.IntegrityError):
            cursor.execute("""
                INSERT INTO products (sku, name, description, category, price, stock)
                VALUES (?, ?, ?, ?, ?, ?)
            """, ('UNIQUE001', 'Product 2', 'Description 2', 'books', 2000, 20))
            conn.commit()
        
        conn.close()
    
    def test_update_product(self):
        """Test updating a product in the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Insert product
        cursor.execute("""
            INSERT INTO products (sku, name, description, category, price, stock)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ('UPDATE001', 'Original Product', 'Original description', 'electronics', 1000, 10))
        
        conn.commit()
        
        # Get the product ID
        cursor.execute("SELECT id FROM products WHERE sku = ?", ('UPDATE001',))
        product_id = cursor.fetchone()[0]
        
        # Update the product
        cursor.execute("""
            UPDATE products 
            SET name = ?, price = ?, stock = ?
            WHERE id = ?
        """, ('Updated Product', 1500, 15, product_id))
        
        conn.commit()
        
        # Verify update
        cursor.execute("SELECT name, price, stock FROM products WHERE id = ?", (product_id,))
        result = cursor.fetchone()
        
        assert result[0] == 'Updated Product'
        assert result[1] == 1500
        assert result[2] == 15
        
        conn.close()
    
    def test_delete_product(self):
        """Test deleting a product from the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Insert product
        cursor.execute("""
            INSERT INTO products (sku, name, description, category, price, stock)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ('DELETE001', 'Product to Delete', 'Description', 'electronics', 1000, 10))
        
        conn.commit()
        
        # Get the product ID
        cursor.execute("SELECT id FROM products WHERE sku = ?", ('DELETE001',))
        product_id = cursor.fetchone()[0]
        
        # Delete the product
        cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
        conn.commit()
        
        # Verify deletion
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        result = cursor.fetchone()
        
        assert result is None
        
        conn.close()
    
    def test_select_all_products(self):
        """Test selecting all products from the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Insert multiple products
        products = [
            ('PROD001', 'Product 1', 'Description 1', 'electronics', 1000, 10),
            ('PROD002', 'Product 2', 'Description 2', 'books', 2000, 20),
            ('PROD003', 'Product 3', 'Description 3', 'clothing', 3000, 30)
        ]
        
        for product in products:
            cursor.execute("""
                INSERT INTO products (sku, name, description, category, price, stock)
                VALUES (?, ?, ?, ?, ?, ?)
            """, product)
        
        conn.commit()
        
        # Select all products
        cursor.execute("SELECT * FROM products ORDER BY sku")
        results = cursor.fetchall()
        
        assert len(results) == 3
        assert results[0][1] == 'PROD001'  # First product SKU
        assert results[1][1] == 'PROD002'  # Second product SKU
        assert results[2][1] == 'PROD003'  # Third product SKU
        
        conn.close()
    
    def test_filter_products_by_category(self):
        """Test filtering products by category"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Insert products with different categories
        products = [
            ('ELEC001', 'Electronics 1', 'Description', 'electronics', 1000, 10),
            ('ELEC002', 'Electronics 2', 'Description', 'electronics', 2000, 20),
            ('BOOK001', 'Book 1', 'Description', 'books', 1500, 15)
        ]
        
        for product in products:
            cursor.execute("""
                INSERT INTO products (sku, name, description, category, price, stock)
                VALUES (?, ?, ?, ?, ?, ?)
            """, product)
        
        conn.commit()
        
        # Filter by electronics category
        cursor.execute("SELECT * FROM products WHERE category = ?", ('electronics',))
        electronics = cursor.fetchall()
        
        assert len(electronics) == 2
        assert all(product[4] == 'electronics' for product in electronics)
        
        conn.close()
    
    def test_low_stock_query(self):
        """Test querying products with low stock"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Insert products with various stock levels
        products = [
            ('LOW001', 'Low Stock 1', 'Description', 'electronics', 1000, 5),
            ('LOW002', 'Low Stock 2', 'Description', 'books', 2000, 3),
            ('HIGH001', 'High Stock', 'Description', 'clothing', 3000, 50)
        ]
        
        for product in products:
            cursor.execute("""
                INSERT INTO products (sku, name, description, category, price, stock)
                VALUES (?, ?, ?, ?, ?, ?)
            """, product)
        
        conn.commit()
        
        # Query for low stock (less than 10)
        cursor.execute("SELECT * FROM products WHERE stock < ?", (10,))
        low_stock = cursor.fetchall()
        
        assert len(low_stock) == 2
        assert all(product[6] < 10 for product in low_stock)
        
        conn.close()
    
    def test_total_inventory_value(self):
        """Test calculating total inventory value"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Insert products
        products = [
            ('VAL001', 'Product 1', 'Description', 'electronics', 1000, 10),  # $100.00
            ('VAL002', 'Product 2', 'Description', 'books', 2000, 5),        # $100.00
            ('VAL003', 'Product 3', 'Description', 'clothing', 1500, 8)      # $120.00
        ]
        
        for product in products:
            cursor.execute("""
                INSERT INTO products (sku, name, description, category, price, stock)
                VALUES (?, ?, ?, ?, ?, ?)
            """, product)
        
        conn.commit()
        
        # Calculate total inventory value
        cursor.execute("SELECT SUM(price * stock) as total_value FROM products")
        total_value = cursor.fetchone()[0]
        
        expected_value = (1000 * 10) + (2000 * 5) + (1500 * 8)  # 32000 cents = $320.00
        assert total_value == expected_value
        
        conn.close()
    
    def test_created_at_timestamp(self):
        """Test that created_at timestamp is set correctly"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Insert product
        cursor.execute("""
            INSERT INTO products (sku, name, description, category, price, stock)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ('TIME001', 'Time Test Product', 'Description', 'electronics', 1000, 10))
        
        conn.commit()
        
        # Check created_at
        cursor.execute("SELECT created_at FROM products WHERE sku = ?", ('TIME001',))
        created_at = cursor.fetchone()[0]
        
        assert created_at is not None
        assert len(created_at) > 0  # Should have some timestamp value
        
        conn.close()

class TestDatabasePerformance:
    """Test database performance and optimization"""
    
    def setup_method(self):
        """Set up a temporary database for performance tests"""
        self.temp_db = tempfile.NamedTemporaryFile(delete=False, suffix='.db')
        self.temp_db.close()
        self.db_path = self.temp_db.name
        init_db(self.db_path)
    
    def teardown_method(self):
        """Clean up the temporary database"""
        if os.path.exists(self.db_path):
            os.unlink(self.db_path)
    
    def test_batch_insert_performance(self):
        """Test performance of batch inserts"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Prepare batch data
        batch_size = 100
        products = []
        for i in range(batch_size):
            products.append((
                f'BATCH{i:03d}',
                f'Batch Product {i}',
                f'Description {i}',
                'electronics',
                1000 + i,
                10 + i
            ))
        
        # Insert batch
        cursor.executemany("""
            INSERT INTO products (sku, name, description, category, price, stock)
            VALUES (?, ?, ?, ?, ?, ?)
        """, products)
        
        conn.commit()
        
        # Verify all inserted
        cursor.execute("SELECT COUNT(*) FROM products")
        count = cursor.fetchone()[0]
        
        assert count == batch_size
        
        conn.close()
    
    def test_index_performance(self):
        """Test that SKU queries are efficient (assuming index exists)"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Insert many products
        products = []
        for i in range(1000):
            products.append((
                f'IDX{i:04d}',
                f'Index Test Product {i}',
                'Description',
                'electronics',
                1000,
                10
            ))
        
        cursor.executemany("""
            INSERT INTO products (sku, name, description, category, price, stock)
            VALUES (?, ?, ?, ?, ?, ?)
        """, products)
        
        conn.commit()
        
        # Test SKU lookup performance
        cursor.execute("SELECT * FROM products WHERE sku = ?", ('IDX0500',))
        result = cursor.fetchone()
        
        assert result is not None
        assert result[1] == 'IDX0500'
        
        conn.close()

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
