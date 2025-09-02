from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from threading import Lock

app = FastAPI(title="In-Memory Products CRUD API")

# ---- In-Memory Data Store and Utilities ----

# Simulates auto-incrementing primary key for products
_products_auto_increment_id = 1
_products_lock = Lock()
_products_db = []  # List of dicts, each representing a product record

# Helper: find product index by id
def _find_product_index(product_id: int) -> Optional[int]:
    for idx, prod in enumerate(_products_db):
        if prod["id"] == product_id:
            return idx
    return None

# Helper: generate new product id safely
def _get_next_product_id():
    global _products_auto_increment_id
    with _products_lock:
        pid = _products_auto_increment_id
        _products_auto_increment_id += 1
        return pid

# ---- Pydantic Models ----

class ProductBase(BaseModel):
    sku: str = Field(..., example="SKU12345")
    name: str = Field(..., example="Widget")
    description: Optional[str] = Field(None, example="A useful widget")
    barcode: Optional[str] = Field(None, example="0123456789012")
    supplier_id: Optional[int] = Field(None, example=1)
    reorder_point: Optional[int] = Field(0, example=10, ge=0)
    reorder_quantity: Optional[int] = Field(0, example=50, ge=0)
    lead_time_days: Optional[int] = Field(0, example=7, ge=0)
    is_active: Optional[bool] = Field(True, example=True)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    barcode: Optional[str] = None
    supplier_id: Optional[int] = None
    reorder_point: Optional[int] = Field(None, ge=0)
    reorder_quantity: Optional[int] = Field(None, ge=0)
    lead_time_days: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None

class Product(ProductBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# ---- CRUD Endpoints ----

@app.post("/products/", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate):
    # Enforce unique sku and barcode
    for prod in _products_db:
        if prod["sku"] == product_in.sku:
            raise HTTPException(status_code=400, detail="SKU already exists")
        if product_in.barcode and prod.get("barcode") == product_in.barcode:
            raise HTTPException(status_code=400, detail="Barcode already exists")
    new_id = _get_next_product_id()
    now = datetime.utcnow()
    product_dict = product_in.dict()
    product_dict["id"] = new_id
    product_dict["created_at"] = now
    # Set defaults for fields not set
    if product_dict.get("is_active") is None:
        product_dict["is_active"] = True
    _products_db.append(product_dict)
    return Product(**product_dict)

@app.get("/products/", response_model=List[Product])
def list_products(skip: int = 0, limit: int = 100):
    """
    List all products, with optional pagination.
    """
    return [Product(**prod) for prod in _products_db[skip: skip+limit]]

@app.get("/products/{product_id}", response_model=Product)
def get_product(product_id: int):
    """
    Get a product by its ID.
    """
    idx = _find_product_index(product_id)
    if idx is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**_products_db[idx])

@app.put("/products/{product_id}", response_model=Product)
def update_product(product_id: int, product_in: ProductUpdate):
    """
    Update an existing product.
    """
    idx = _find_product_index(product_id)
    if idx is None:
        raise HTTPException(status_code=404, detail="Product not found")
    product = _products_db[idx]
    update_data = product_in.dict(exclude_unset=True)

    # If updating sku/barcode, check for uniqueness
    if "sku" in update_data:
        for prod in _products_db:
            if prod["id"] != product_id and prod["sku"] == update_data["sku"]:
                raise HTTPException(status_code=400, detail="SKU already exists")
    if "barcode" in update_data and update_data["barcode"] is not None:
        for prod in _products_db:
            if prod["id"] != product_id and prod.get("barcode") == update_data["barcode"]:
                raise HTTPException(status_code=400, detail="Barcode already exists")

    # Update the fields
    for key, value in update_data.items():
        product[key] = value
    _products_db[idx] = product
    return Product(**product)

@app.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int):
    """
    Delete a product by its ID.
    """
    idx = _find_product_index(product_id)
    if idx is None:
        raise HTTPException(status_code=404, detail="Product not found")
    del _products_db[idx]
    return

# ---- Example In-Memory User Store (for context, not used in endpoints) ----

# Example user data structure, matching the users schema
_users_db = [
    {
        "id": 1,
        "username": "worker1",
        "password_hash": "hashedpassword",
        "full_name": "Warehouse Worker",
        "email": "worker1@example.com",
        "role": "warehouse_worker",
        "is_active": 1,
        "created_at": datetime.utcnow()
    }
    # Add more users as needed
]

# ---- Main Entry Point ----

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main_in_memory:app", host="0.0.0.0", port=8000, reload=True)