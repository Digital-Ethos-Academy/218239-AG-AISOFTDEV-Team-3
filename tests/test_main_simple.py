import pytest
from fastapi.testclient import TestClient
from main_in_memory import app, _products_db, _products_auto_increment_id

@pytest.fixture(autouse=True)
def reset_products_db():
    global _products_db, _products_auto_increment_id
    _products_db.clear()
    _products_auto_increment_id = 1

client = TestClient(app)

def test_create_product():
    payload = {
        "sku": "SKU12345",
        "name": "Test Widget",
        "description": "A test widget",
        "barcode": "0123456789012",
        "supplier_id": 1,
        "reorder_point": 5,
        "reorder_quantity": 20,
        "lead_time_days": 3,
        "is_active": True
    }
    response = client.post("/products/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["sku"] == payload["sku"]
    assert data["name"] == payload["name"]
    assert data["description"] == payload["description"]
    assert data["barcode"] == payload["barcode"]
    assert data["supplier_id"] == payload["supplier_id"]
    assert data["reorder_point"] == payload["reorder_point"]
    assert data["reorder_quantity"] == payload["reorder_quantity"]
    assert data["lead_time_days"] == payload["lead_time_days"]
    assert data["is_active"] == payload["is_active"]
    assert "id" in data
    assert "created_at" in data

def test_list_products():
    # First, create two products for testing
    product1 = {
        "sku": "SKU001",
        "name": "Product One",
        "description": "Desc1",
        "barcode": "1111111111111",
        "supplier_id": 1,
        "reorder_point": 2,
        "reorder_quantity": 5,
        "lead_time_days": 1,
        "is_active": True
    }
    product2 = {
        "sku": "SKU002",
        "name": "Product Two",
        "description": "Desc2",
        "barcode": "2222222222222",
        "supplier_id": 2,
        "reorder_point": 3,
        "reorder_quantity": 6,
        "lead_time_days": 2,
        "is_active": False
    }
    client.post("/products/", json=product1)
    client.post("/products/", json=product2)

    response = client.get("/products/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    skus = [prod["sku"] for prod in data]
    assert product1["sku"] in skus
    assert product2["sku"] in skus