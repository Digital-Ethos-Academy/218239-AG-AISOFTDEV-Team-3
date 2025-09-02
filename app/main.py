from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from threading import Lock
import logging
import os
import json
import sys
from pathlib import Path
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint,
    create_engine
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker, Session
from sqlalchemy.sql import func

# Add parent directory to path to import utils
sys.path.append(str(Path(__file__).parent.parent))
from utils import setup_llm_client, get_completion, clean_llm_output

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Inventory Management System API",
    description="A comprehensive inventory management system for warehouses",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Database Configuration ----
SQLALCHEMY_DATABASE_URL = "sqlite:///./inventory.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """FastAPI dependency that provides a SQLAlchemy session."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---- SQLAlchemy Models ----

class User(Base):
    """Represents a system user (warehouse worker, manager, etc.)."""
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    role = Column(String, nullable=False)
    is_active = Column(Integer, nullable=False, default=1, server_default="1")
    created_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())

    # Relationships
    stock_movements = relationship("StockMovement", back_populates="user")

class Warehouse(Base):
    """Represents a warehouse location."""
    __tablename__ = 'warehouses'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    address = Column(Text)
    phone = Column(String)
    is_active = Column(Integer, nullable=False, default=1, server_default="1")
    created_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())

    # Relationships
    inventory_levels = relationship("InventoryLevel", back_populates="warehouse")
    stock_movements = relationship("StockMovement", back_populates="warehouse")
    reorder_alerts = relationship("ReorderAlert", back_populates="warehouse")

class Supplier(Base):
    """Represents a product supplier."""
    __tablename__ = 'suppliers'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    contact_name = Column(String)
    phone = Column(String)
    email = Column(String)
    address = Column(Text)
    is_active = Column(Integer, nullable=False, default=1, server_default="1")
    created_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())

    # Relationships
    products = relationship("Product", back_populates="supplier")

class Product(Base):
    """Represents an inventory product."""
    __tablename__ = 'products'

    id = Column(Integer, primary_key=True, autoincrement=True)
    sku = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    barcode = Column(String, unique=True)
    category = Column(String)  # Added category field
    price = Column(Integer, default=0, server_default="0")  # Added price field (in cents)
    stock = Column(Integer, default=0, server_default="0")  # Added stock field
    supplier_id = Column(Integer, ForeignKey('suppliers.id'))
    reorder_point = Column(Integer, default=0, server_default="0")
    reorder_quantity = Column(Integer, default=0, server_default="0")
    lead_time_days = Column(Integer, default=0, server_default="0")
    is_active = Column(Integer, nullable=False, default=1, server_default="1")
    created_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())

    # Relationships
    supplier = relationship("Supplier", back_populates="products")
    inventory_levels = relationship("InventoryLevel", back_populates="product")
    stock_movements = relationship("StockMovement", back_populates="product")
    reorder_alerts = relationship("ReorderAlert", back_populates="product")

class InventoryLevel(Base):
    """Tracks the quantity of a product in a warehouse."""
    __tablename__ = 'inventory_levels'
    __table_args__ = (
        UniqueConstraint('product_id', 'warehouse_id', name='uix_product_warehouse'),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=False)
    quantity = Column(Integer, nullable=False, default=0, server_default="0")
    last_updated = Column(DateTime, nullable=False, server_default=func.current_timestamp())

    # Relationships
    product = relationship("Product", back_populates="inventory_levels")
    warehouse = relationship("Warehouse", back_populates="inventory_levels")

class StockMovement(Base):
    """Logs inbound/outbound/adjustment stock movements."""
    __tablename__ = 'stock_movements'

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'))
    movement_type = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    reason = Column(Text)
    reference_number = Column(String)
    created_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())

    # Relationships
    product = relationship("Product", back_populates="stock_movements")
    warehouse = relationship("Warehouse", back_populates="stock_movements")
    user = relationship("User", back_populates="stock_movements")

class ReorderAlert(Base):
    """Tracks reorder alerts for products in warehouses."""
    __tablename__ = 'reorder_alerts'

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=False)
    triggered_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())
    suggested_quantity = Column(Integer, nullable=False)
    is_resolved = Column(Integer, nullable=False, default=0, server_default="0")
    resolved_at = Column(DateTime)

    # Relationships
    product = relationship("Product", back_populates="reorder_alerts")
    warehouse = relationship("Warehouse", back_populates="reorder_alerts")

# ---- Pydantic Models ----

class UserRole:
    """Constants for user roles."""
    WAREHOUSE_WORKER = "Warehouse Worker"
    INVENTORY_MANAGER = "Inventory Manager"
    PROCUREMENT_OFFICER = "Procurement Officer"
    
    @classmethod
    def all_roles(cls):
        return [cls.WAREHOUSE_WORKER, cls.INVENTORY_MANAGER, cls.PROCUREMENT_OFFICER]

class MovementType:
    """Constants for stock movement types."""
    INBOUND = "INBOUND"
    OUTBOUND = "OUTBOUND"
    ADJUSTMENT = "ADJUSTMENT"
    TRANSFER = "TRANSFER"
    DAMAGED = "DAMAGED"

class ProductBase(BaseModel):
    """Base product model with common fields."""
    sku: str = Field(..., example="SKU12345", description="Stock Keeping Unit")
    name: str = Field(..., example="Widget", description="Product name")
    description: Optional[str] = Field(None, example="A useful widget")
    barcode: Optional[str] = Field(None, example="0123456789012")
    category: Optional[str] = Field(None, example="Electronics", description="Product category")
    price: Optional[float] = Field(0, example=99.99, ge=0, description="Product price in dollars")
    stock: Optional[int] = Field(0, example=50, ge=0, description="Current stock quantity")
    supplier_id: Optional[int] = Field(None, example=1)
    reorder_point: Optional[int] = Field(0, example=10, ge=0)
    reorder_quantity: Optional[int] = Field(0, example=50, ge=0)
    lead_time_days: Optional[int] = Field(0, example=7, ge=0)
    is_active: Optional[bool] = Field(True, example=True)

class ProductCreate(ProductBase):
    """Model for creating a new product."""
    pass

class ProductUpdate(BaseModel):
    """Model for updating an existing product."""
    sku: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    barcode: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    stock: Optional[int] = Field(None, ge=0)
    supplier_id: Optional[int] = None
    reorder_point: Optional[int] = Field(None, ge=0)
    reorder_quantity: Optional[int] = Field(None, ge=0)
    lead_time_days: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    """Model for product responses."""
    id: int
    created_at: datetime
    
    @classmethod
    def from_orm(cls, obj):
        # Convert price from cents to dollars
        obj_dict = {
            'id': obj.id,
            'sku': obj.sku,
            'name': obj.name,
            'description': obj.description,
            'barcode': obj.barcode,
            'category': obj.category,
            'price': (obj.price or 0) / 100.0,  # Convert cents to dollars
            'stock': obj.stock,
            'supplier_id': obj.supplier_id,
            'reorder_point': obj.reorder_point,
            'reorder_quantity': obj.reorder_quantity,
            'lead_time_days': obj.lead_time_days,
            'is_active': bool(obj.is_active),
            'created_at': obj.created_at
        }
        return cls(**obj_dict)

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    """Base user model."""
    username: str = Field(..., example="jdoe")
    full_name: str = Field(..., example="John Doe")
    email: EmailStr = Field(..., example="john.doe@company.com")
    role: str = Field(..., example="Warehouse Worker")
    is_active: bool = Field(True, example=True)

    @validator('role')
    def validate_role(cls, v):
        if v not in UserRole.all_roles():
            raise ValueError(f"Role must be one of: {', '.join(UserRole.all_roles())}")
        return v

class UserCreate(UserBase):
    """Model for creating a new user."""
    password: str = Field(..., min_length=8, example="securepassword123")

class UserUpdate(BaseModel):
    """Model for updating an existing user."""
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

    @validator('role')
    def validate_role(cls, v):
        if v and v not in UserRole.all_roles():
            raise ValueError(f"Role must be one of: {', '.join(UserRole.all_roles())}")
        return v

class UserResponse(UserBase):
    """Model for user responses."""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ---- AI Autofill Models ----

class AutofillRequest(BaseModel):
    """Model for autofill request."""
    description: str = Field(..., example="20oz stainless steel water bottle, blue, BPA-free, 50 in stock")

class AutofillResponse(BaseModel):
    """Model for autofill response."""
    product_name: str = Field(..., example="20oz Stainless Steel Water Bottle")
    category: str = Field(..., example="Drinkware")
    tags: List[str] = Field(..., example=["blue", "BPA-free", "stainless steel"])
    suggested_sku: str = Field(..., example="WAT-BLU-20OZ")
    quantity: Optional[int] = Field(None, example=50)

# ---- Restock Suggestion Models ----

class RestockSuggestionRequest(BaseModel):
    """Model for restock suggestion request."""
    product_name: str = Field(..., example="Blue Water Bottle")
    sku: str = Field(..., example="BOT-BLU-20")
    category: str = Field(..., example="Drinkware")
    quantity: int = Field(..., example=3)

class RestockSuggestionResponse(BaseModel):
    """Model for restock suggestion response."""
    analyzer_summary: str = Field(..., example="Product 'Blue Water Bottle' in category 'Drinkware' currently has 3 units. Sold 12 units last month.")
    restock_suggestion: str = Field(..., example="You should order 24 more units to cover the next 4 weeks.")
    reorder_message: str = Field(..., example="Please arrange reorder for Blue Water Bottle (SKU: BOT-BLU-20), Quantity: 24 units. Contact supplier: [Supplier Name] at [Contact Info].")

# ---- Inventory Question Models ----

class InventoryQuestionRequest(BaseModel):
    """Model for inventory question request."""
    question: str = Field(..., example="What products are out of stock?")

class InventoryQuestionResponse(BaseModel):
    """Model for inventory question response."""
    answer: str = Field(..., example="Here are the out-of-stock products: TranquilSet (Furniture) with SKU TS006 has 0 units in stock.")


# ---- Inventory Semantic Search Helper Functions ----

def format_product_for_embedding(product: Product) -> str:
    """Convert a product record into a readable sentence for embedding."""
    return (f"{product.name}, Category: {product.category or 'Unknown'}, "
           f"SKU: {product.sku}, Price: ${(product.price or 0) / 100:.2f}, "
           f"Quantity: {product.stock}, "
           f"Description: {product.description or 'No description'}")


# ---- API Endpoints ----


# ---- Product API Endpoints (Database-backed) ----

from fastapi.encoders import jsonable_encoder

@app.post("/products/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product (DB-backed)."""
    try:
        # Check for unique SKU and barcode
        existing = db.query(Product).filter(Product.sku == product_in.sku).first()
        if existing:
            raise HTTPException(status_code=400, detail="SKU already exists")
        if product_in.barcode:
            existing_barcode = db.query(Product).filter(Product.barcode == product_in.barcode).first()
            if existing_barcode:
                raise HTTPException(status_code=400, detail="Barcode already exists")

        db_product = Product(
            sku=product_in.sku,
            name=product_in.name,
            description=product_in.description,
            barcode=product_in.barcode,
            category=product_in.category,
            price=int((product_in.price or 0) * 100),  # Convert dollars to cents
            stock=product_in.stock or 0,
            supplier_id=product_in.supplier_id,
            reorder_point=product_in.reorder_point or 0,
            reorder_quantity=product_in.reorder_quantity or 0,
            lead_time_days=product_in.lead_time_days or 0,
            is_active=1 if product_in.is_active else 0
        )
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        logger.info(f"Created product with ID: {db_product.id}")
        return ProductResponse.from_orm(db_product)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating product: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/products/", response_model=List[ProductResponse])
async def list_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all products with optional pagination (DB-backed)."""
    try:
        products = db.query(Product).offset(skip).limit(limit).all()
        return [ProductResponse.from_orm(product) for product in products]
    except Exception as e:
        logger.error(f"Error listing products: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a product by its ID (DB-backed)."""
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return ProductResponse.from_orm(product)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting product {product_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, product_in: ProductUpdate, db: Session = Depends(get_db)):
    """Update an existing product (DB-backed)."""
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        update_data = product_in.dict(exclude_unset=True)

        # Check unique constraints
        if "sku" in update_data:
            existing = db.query(Product).filter(Product.sku == update_data["sku"], Product.id != product_id).first()
            if existing:
                raise HTTPException(status_code=400, detail="SKU already exists")
        if "barcode" in update_data and update_data["barcode"] is not None:
            existing_barcode = db.query(Product).filter(Product.barcode == update_data["barcode"], Product.id != product_id).first()
            if existing_barcode:
                raise HTTPException(status_code=400, detail="Barcode already exists")

        for key, value in update_data.items():
            if key == "is_active":
                setattr(product, key, 1 if value else 0)
            elif key == "price":
                setattr(product, key, int(value * 100) if value is not None else 0)  # Convert dollars to cents
            else:
                setattr(product, key, value)
        db.commit()
        db.refresh(product)
        logger.info(f"Updated product with ID: {product_id}")
        return ProductResponse.from_orm(product)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product {product_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product by its ID (DB-backed)."""
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        db.delete(product)
        db.commit()
        logger.info(f"Deleted product with ID: {product_id}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting product {product_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.post("/seed-data")
async def seed_data(db: Session = Depends(get_db)):
    """Seed the database with sample products for testing."""
    try:
        # Check if data already exists
        existing_count = db.query(Product).count()
        if existing_count > 0:
            return {"message": f"Database already has {existing_count} products"}
        
        sample_products = [
            {
                "sku": "PM001",
                "name": "PixelMate",
                "description": "High-resolution digital display device",
                "category": "Electronics",
                "price": 49900,  # $499 in cents
                "stock": 95
            },
            {
                "sku": "FL002", 
                "name": "FusionLink",
                "description": "Wireless connectivity adapter",
                "category": "Electronics",
                "price": 29900,  # $299 in cents
                "stock": 34
            },
            {
                "sku": "VL003",
                "name": "VelvetLux",
                "description": "Premium textile product",
                "category": "Apparel",
                "price": 9900,  # $99 in cents
                "stock": 60
            },
            {
                "sku": "US004",
                "name": "UrbanSync Knit",
                "description": "Modern urban style knitted apparel",
                "category": "Apparel", 
                "price": 12900,  # $129 in cents
                "stock": 150
            },
            {
                "sku": "HF005",
                "name": "HealthFlow",
                "description": "Personal wellness monitoring device",
                "category": "Wellness",
                "price": 19900,  # $199 in cents
                "stock": 8  # Low stock
            },
            {
                "sku": "TS006",
                "name": "TranquilSet",
                "description": "Comfortable furniture set for relaxation",
                "category": "Furniture",
                "price": 39900,  # $399 in cents
                "stock": 0  # Out of stock
            },
            {
                "sku": "CC007",
                "name": "ComfortCove",
                "description": "Ergonomic seating solution",
                "category": "Furniture",
                "price": 34900,  # $349 in cents
                "stock": 18
            }
        ]
        
        for product_data in sample_products:
            db_product = Product(**product_data)
            db.add(db_product)
        
        db.commit()
        logger.info(f"Seeded database with {len(sample_products)} sample products")
        return {"message": f"Successfully seeded {len(sample_products)} products"}
        
    except Exception as e:
        logger.error(f"Error seeding data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to seed data")

@app.post("/autofill", response_model=AutofillResponse)
async def autofill_product_info(request: AutofillRequest):
    """
    Use OpenAI GPT-4o to analyze a product description and extract structured information.
    
    This endpoint takes a natural language product description and returns:
    - product_name: Clean, formatted product name
    - category: Product category
    - tags: List of relevant tags/attributes
    - suggested_sku: Auto-generated SKU suggestion
    - quantity: Extracted quantity if mentioned in description
    """
    try:
        # Initialize LLM client using utils
        client, model_name, api_provider = setup_llm_client("gpt-4o")
        
        if not client:
            raise HTTPException(
                status_code=503, 
                detail="Autofill service unavailable: LLM client could not be initialized. Check your API keys in .env file."
            )
        
        # Construct the prompt for analysis
        system_prompt = f"""
You are an expert product data analyst. Given a product description, extract and format the following information as JSON:

1. product_name: A clean, properly formatted product name
2. category: Most appropriate product category from common e-commerce categories
3. tags: Array of relevant product attributes, features, or descriptors (lowercase)
4. suggested_sku: Generate a logical SKU using format: [CATEGORY-ABBREV]-[KEY-FEATURES]-[SIZE/MODEL] (uppercase, max 12 chars)
5. quantity: Extract any mentioned quantity/stock amount (number only, null if not mentioned)

Guidelines:
- Product name should be title case and professional
- Category should be a standard retail category (Electronics, Apparel, Home & Garden, Sports, Health & Beauty, etc.)
- Tags should include colors, materials, sizes, key features
- SKU should be concise but descriptive
- Only extract quantity if explicitly mentioned

Product description: {request.description}

Return ONLY valid JSON with these exact field names:
"""

        # Get completion using utils
        logger.info(f"Making LLM API call for description: {request.description[:50]}...")
        
        ai_response = get_completion(
            prompt=system_prompt,
            client=client,
            model_name=model_name,
            api_provider=api_provider,
            temperature=0.3
        )
        
        logger.info(f"LLM response: {ai_response}")
        
        # Clean the response to extract JSON
        cleaned_response = clean_llm_output(ai_response, 'json')
        
        try:
            parsed_data = json.loads(cleaned_response)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            logger.error(f"Raw response: {ai_response}")
            logger.error(f"Cleaned response: {cleaned_response}")
            raise HTTPException(status_code=500, detail="Failed to parse AI response")
        
        # Validate and construct response
        autofill_response = AutofillResponse(
            product_name=parsed_data.get("product_name", "Unknown Product"),
            category=parsed_data.get("category", "Other"),
            tags=parsed_data.get("tags", []),
            suggested_sku=parsed_data.get("suggested_sku", "GEN-001"),
            quantity=parsed_data.get("quantity")
        )
        
        logger.info(f"Successfully processed autofill request")
        return autofill_response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in autofill: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/restock_suggestion", response_model=RestockSuggestionResponse)
async def get_restock_suggestion(request: RestockSuggestionRequest):
    """
    Multi-agent system for restock suggestions.
    
    Agent 1 (Analyzer): Analyzes current stock and simulated sales history
    Agent 2 (Forecaster): Provides restock quantity recommendations  
    Agent 3 (Reorder Assistant): Generates draft reorder message
    """
    try:
        # Initialize LLM client using utils
        client, model_name, api_provider = setup_llm_client("gpt-4o")
        
        if not client:
            raise HTTPException(
                status_code=503, 
                detail="Restock suggestion service unavailable: LLM client could not be initialized. Check your API keys in .env file."
            )
        
        # Step 1: Agent 1 (Analyzer) - Analyze current stock and sales history
        logger.info(f"Agent 1 analyzing stock for: {request.product_name}")
        
        # Check if quantity is below threshold
        low_stock_threshold = 5
        is_low_stock = request.quantity < low_stock_threshold
        
        # Simulate sales history lookup (placeholder data)
        import random
        simulated_monthly_sales = random.randint(8, 25)  # Simulate 8-25 units sold per month
        
        # Agent 1 output
        analyzer_summary = (
            f"Product '{request.product_name}' in category '{request.category}' "
            f"currently has {request.quantity} units. "
            f"{'LOW STOCK ALERT: ' if is_low_stock else ''}"
            f"Sold {simulated_monthly_sales} units last month."
        )
        
        # Step 2: Agent 2 (Forecaster) - Use LLM to suggest restock quantity
        logger.info(f"Agent 2 forecasting restock needs...")
        
        forecasting_question = "How many units should we reorder to avoid running out in the next 4 weeks?"
        
        forecasting_response = get_completion(
            prompt=f"You are an inventory forecasting expert. Based on this data: {analyzer_summary}\n\nQuestion: {forecasting_question}\n\nProvide a BRIEF, direct recommendation in 1-2 sentences maximum. Format: 'Order X units. [Short reason].' Be concise and specific.",
            client=client,
            model_name=model_name,
            api_provider=api_provider,
            temperature=0.3
        )
        
        # Step 3: Agent 3 (Reorder Assistant) - Generate draft reorder message
        logger.info(f"Agent 3 generating reorder message...")
        
        reorder_prompt = f"""
You are a purchasing assistant. Generate a short, professional message requesting a reorder for the given product.

Product Details:
- Name: {request.product_name}
- SKU: {request.sku}
- Category: {request.category}
- Current Stock: {request.quantity}
- Forecasting Recommendation: {forecasting_response}

Generate a concise reorder request message that includes:
- Product name and SKU
- Suggested quantity to order
- Placeholder fields for supplier information
- Professional tone

Keep it brief and actionable.
"""
        
        reorder_message = get_completion(
            prompt=reorder_prompt,
            client=client,
            model_name=model_name,
            api_provider=api_provider,
            temperature=0.4
        )
        
        # Combine all agent outputs
        response = RestockSuggestionResponse(
            analyzer_summary=analyzer_summary,
            restock_suggestion=forecasting_response.strip(),
            reorder_message=reorder_message.strip()
        )
        
        logger.info(f"Successfully processed restock suggestion for {request.product_name}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in restock_suggestion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/ask_inventory", response_model=InventoryQuestionResponse)
async def ask_inventory_question(request: InventoryQuestionRequest, db: Session = Depends(get_db)):
    """
    Answer questions about inventory using keyword matching and LLM processing.
    
    This endpoint:
    1. Loads all products from the database
    2. Converts each product to readable text
    3. Uses keyword matching to find relevant products
    4. Uses LLM to generate a natural language answer
    """
    try:
        # Step 1: Connect to inventory.db and load all product records
        logger.info(f"Processing inventory question: {request.question}")
        products = db.query(Product).all()
        
        if not products:
            return InventoryQuestionResponse(
                answer="I don't have any product information available in the inventory database."
            )
        
        # Step 2: Convert each record into readable sentences
        product_texts = []
        for product in products:
            text = format_product_for_embedding(product)
            product_texts.append((product, text))
        
        logger.info(f"Formatted {len(product_texts)} products for analysis")
        
        # Step 3: Smart keyword-based filtering for relevant products
        question_lower = request.question.lower()
        relevant_products = []
        
        # Check for specific status/condition keywords first
        if "out of stock" in question_lower or "zero" in question_lower or "empty" in question_lower:
            relevant_products = [(product, text) for product, text in product_texts if product.stock == 0]
        elif "low inventory" in question_lower or "low stock" in question_lower:
            relevant_products = [(product, text) for product, text in product_texts if 0 < product.stock <= 10]
        elif "expensive" in question_lower or "highest price" in question_lower or "most expensive" in question_lower:
            sorted_products = sorted(product_texts, key=lambda x: x[0].price or 0, reverse=True)
            relevant_products = sorted_products[:3]
        elif "cheap" in question_lower or "lowest price" in question_lower or "least expensive" in question_lower:
            sorted_products = sorted(product_texts, key=lambda x: x[0].price or 0)
            relevant_products = sorted_products[:3]
        # Check for category keywords
        elif "electronics" in question_lower:
            relevant_products = [(product, text) for product, text in product_texts if product.category and "electronics" in product.category.lower()]
        elif "furniture" in question_lower:
            relevant_products = [(product, text) for product, text in product_texts if product.category and "furniture" in product.category.lower()]
        elif "apparel" in question_lower or "clothing" in question_lower:
            relevant_products = [(product, text) for product, text in product_texts if product.category and "apparel" in product.category.lower()]
        elif "wellness" in question_lower or "health" in question_lower:
            relevant_products = [(product, text) for product, text in product_texts if product.category and "wellness" in product.category.lower()]
        else:
            # Search for specific product names/terms in the question
            # Extract potential product search terms (ignore common words)
            import re
            common_words = {'do', 'we', 'have', 'any', 'is', 'are', 'there', 'what', 'which', 'how', 'many', 'much', 'the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'show', 'me', 'get', 'find', 'list', 'tell', 'give', 'available', 'products', 'items', 'stock', 'inventory'}
            
            # Add synonym mapping for common product types
            synonyms = {
                'laptop': ['macbook', 'notebook', 'computer', 'programming'],
                'laptops': ['macbook', 'macbooks', 'notebooks', 'computers'],
                'phone': ['smartphone', 'mobile', 'iphone', 'android'],
                'tablet': ['ipad'],
                'headphones': ['earphones', 'earbuds', 'headset'],
                'watch': ['smartwatch'],
                'computer': ['pc', 'desktop', 'laptop', 'macbook', 'programming'],
                'computers': ['pcs', 'desktops', 'laptops', 'macbooks']
            }
            
            # Extract words and also handle common variations
            question_words = re.findall(r'\b\w+\b', question_lower)
            search_terms = []
            
            for word in question_words:
                if len(word) > 2 and word not in common_words:
                    search_terms.append(word)
                    # Add singular/plural variations
                    if word.endswith('s') and len(word) > 3:
                        singular = word[:-1]
                        if singular not in search_terms:
                            search_terms.append(singular)
                    elif not word.endswith('s'):
                        plural = word + 's'
                        if plural not in search_terms:
                            search_terms.append(plural)
                    
                    # Add synonyms
                    if word in synonyms:
                        for synonym in synonyms[word]:
                            if synonym not in search_terms:
                                search_terms.append(synonym)
            
            # Score products based on how many search terms match
            product_scores = []
            for product, text in product_texts:
                score = 0
                text_lower = text.lower()
                name_lower = product.name.lower()
                sku_lower = product.sku.lower()
                category_lower = (product.category or '').lower()
                description_lower = (product.description or '').lower()
                
                for term in search_terms:
                    # Higher score for exact name matches
                    if term in name_lower:
                        score += 10
                    # Medium score for SKU matches
                    elif term in sku_lower:
                        score += 5
                    # Good score for description matches (increased from 3 to 6)
                    elif term in description_lower:
                        score += 6
                    # Lower score for category matches
                    elif term in category_lower:
                        score += 2
                    
                    # Special handling for partial matches in product names
                    # This helps with "macbook" matching "MacBook Pro 16-Inch"
                    name_words = name_lower.split()
                    for name_word in name_words:
                        if term in name_word or name_word in term:
                            score += 8
                    
                    # Also check description words for better matching
                    # This helps with "laptop" finding "programming" descriptions
                    if description_lower:
                        desc_words = description_lower.split()
                        for desc_word in desc_words:
                            if len(desc_word) > 3 and (term in desc_word or desc_word in term):
                                score += 4
                
                if score > 0:
                    product_scores.append((score, product, text))
            
            # Sort by score and take top matches
            if product_scores:
                product_scores.sort(key=lambda x: x[0], reverse=True)
                relevant_products = [(product, text) for score, product, text in product_scores[:5]]
            else:
                # If no matches found, return all products (general inventory question)
                relevant_products = product_texts[:5]
        
        # Step 4: If no specific matches, fall back to all products
        if not relevant_products:
            relevant_products = product_texts[:3]
        
        # Step 5: Limit to top 3 most relevant
        top_3_products = relevant_products[:3]
        
        logger.info(f"Found {len(top_3_products)} relevant products")
        
        # Step 6: Create context string from relevant products
        context_parts = []
        for product, text in top_3_products:
            context_parts.append(f"Product: {text}")
        
        context = "\n".join(context_parts)
        
        # Step 7: Generate answer using LLM
        try:
            client, model_name, api_provider = setup_llm_client("gpt-4o")
            
            if not client:
                raise HTTPException(
                    status_code=503, 
                    detail="AI service unavailable: Could not initialize LLM client. Check your API keys in .env file."
                )
            
            prompt = f"""
Based on the following inventory information, please answer the user's question in a helpful and natural way.

Inventory Context:
{context}

User Question: {request.question}

Please provide a clear, informative answer based on the inventory data provided. If the question asks about specific products, include relevant details like names, SKUs, quantities, categories, and prices. Be specific and helpful in your response.
"""
            
            answer = get_completion(
                prompt=prompt,
                client=client,
                model_name=model_name,
                api_provider=api_provider,
                temperature=0.3
            )
            
            if not answer:
                raise Exception("LLM returned empty response")
            
        except Exception as e:
            logger.error(f"Error generating answer: {e}")
            raise HTTPException(
                status_code=503, 
                detail="AI service unavailable: Could not generate answer. Check your OpenAI API key in .env file."
            )
        
        # Step 8: Return the answer in JSON response
        logger.info("Successfully processed inventory question")
        return InventoryQuestionResponse(answer=answer.strip())
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in ask_inventory: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# ---- Startup Events ----

@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {str(e)}")

# ---- Main Entry Point ----

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )