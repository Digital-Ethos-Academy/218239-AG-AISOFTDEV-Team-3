# Inventory Management System

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3+-lightgrey.svg)](https://www.sqlite.org/)

A comprehensive inventory management system designed to help businesses efficiently track and manage stock across multiple locations. This system provides real-time inventory tracking, automated alerts, comprehensive reporting capabilities, and advanced AI-powered features including intelligent product autofill that extracts structured data from natural language descriptions.

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [User Guide](#-user-guide)
- [Development](#-development)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Project Overview

The Inventory Management System (IMS) is a full-stack web application that addresses common inventory management challenges faced by businesses. It provides:

- **Real-time stock tracking** across multiple warehouse locations
- **Automated reorder alerts** to prevent stockouts
- **Comprehensive reporting** for data-driven decision making
- **User role management** for different types of warehouse personnel
- **Mobile-responsive interface** for warehouse operations

### Target Users

- **Warehouse Workers**: Scan items, process shipments, perform cycle counts
- **Inventory Managers**: Monitor stock levels, generate reports, set reorder points
- **Procurement Officers**: Manage supplier relationships, handle reorder alerts

## ✨ Features

### Core Functionality
- ✅ Real-time inventory tracking
- ✅ Product management (CRUD operations)
- ✅ **AI-powered product autofill** using GPT-4o
- ✅ **AI-powered restock dashboard** with multi-agent recommendations
- ✅ **Chat-based inventory management** with natural language interface
- ✅ Barcode scanning support
- ✅ Stock level monitoring
- ✅ Low stock and out-of-stock alerts
- ✅ Category-based product organization
- ✅ Price management
- ✅ Search and filtering capabilities
- ✅ Dynamic product suggestions and recommendations

### Advanced Features
- 🤖 **Multi-Agent AI System**: Three specialized AI agents for inventory analysis
  - **Inventory Analyzer**: Analyzes current stock levels and trends
  - **Demand Forecaster**: Predicts future demand patterns
  - **Reorder Assistant**: Provides intelligent restock recommendations
- 📊 **AI-Powered Restock Dashboard**: Weekly intelligent restock suggestions
- 💬 **Natural Language Inventory Chat**: Ask questions about inventory in plain English
- 📊 Comprehensive reporting and analytics
- 🔔 Automated reorder alerts
- 👥 Multi-user role management
- 🏢 Multi-warehouse support
- 📱 Mobile-responsive design
- 🔒 Secure authentication and authorization

## 🛠 Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and Object-Relational Mapping (ORM)
- **SQLite**: Lightweight database for development
- **Pydantic**: Data validation using Python type annotations
- **Uvicorn**: ASGI server implementation
- **OpenAI API**: GPT-4o integration for AI-powered features
- **Multi-Agent AI System**: Specialized AI agents for intelligent inventory management

### Frontend
- **React**: JavaScript library for building user interfaces
- **Vite**: Next-generation frontend tooling
- **CSS3**: Modern styling with responsive design
- **React Icons**: Beautiful icon library
- **AI-Powered Components**: Restock dashboard and chat interface

### Development Tools
- **Python 3.11+**: Programming language
- **Node.js**: JavaScript runtime for frontend development
- **Git**: Version control system

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
1. **Python 3.11 or higher**
   - Download from [python.org](https://www.python.org/downloads/)
   - Verify installation: `python --version`

2. **Node.js 18 or higher**
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` and `npm --version`

3. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

### Optional but Recommended
- **VS Code**: Code editor with excellent Python and JavaScript support
- **Postman**: For API testing
- **SQLite Browser**: For database inspection

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/lauraspas/218239-AG-AISOFTDEV-Team-3.git
cd 218239-AG-AISOFTDEV-Team-3
```

### Step 2: Backend Setup

#### 2.1 Create Python Virtual Environment

**On Windows:**
```bash
python -m venv labenv
labenv\Scripts\activate
```

**On macOS/Linux:**
```bash
python3 -m venv labenv
source labenv/bin/activate
```

#### 2.2 Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### 2.3 Configure Environment Variables

Create a `.env` file in the root directory with your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

**Note**: The autofill feature and AI-powered restock recommendations require an OpenAI API key. If not provided, these AI features will return an error but other features will work normally.

#### 2.4 Initialize Database

The database will be automatically created when you first run the application. The system uses SQLite for simplicity and includes automatic table creation.

### Step 3: Frontend Setup

#### 3.1 Navigate to React Directory

```bash
cd artifacts/React
```

#### 3.2 Install Node.js Dependencies

```bash
npm install
```

#### 3.3 Return to Project Root

```bash
cd ../..
```

## 🏃‍♂️ Running the Application

### Option 1: Using Batch Files (Windows)

The project includes convenient batch files for easy startup:

#### Start Backend Server
```bash
start-backend.bat
```

#### Start Frontend Development Server
```bash
start-frontend.bat
```

### Option 2: Manual Startup

#### Start Backend Server
```bash
# Activate virtual environment (if not already active)
labenv\Scripts\activate

# Start FastAPI server (Option A - Direct)
cd app
python main.py

# OR Start with uvicorn directly (Option B - Uvicorn)
# uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at: `http://localhost:8000`

#### Start Frontend Development Server
```bash
# In a new terminal window
cd artifacts/React
npm run dev
```

The frontend will be available at: `http://localhost:3000` or `http://localhost:5173`

### Step 4: Access the Application

1. Open your web browser
2. Navigate to the frontend URL (usually `http://localhost:3000`)
3. You should see the Inventory Management System interface

## 📚 API Documentation

### Interactive API Documentation

Once the backend is running, you can access the interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key API Endpoints

#### Products
- `GET /products/` - Retrieve all products
- `POST /products/` - Create a new product
- `GET /products/{id}` - Get a specific product
- `PUT /products/{id}` - Update a product
- `DELETE /products/{id}` - Delete a product

#### AI-Powered Features
- `POST /autofill` - Analyze product description and extract structured data using GPT-4o
- `POST /chat` - Natural language inventory management interface
- `GET /restock-suggestions` - Get AI-powered weekly restock recommendations from multi-agent system

#### Health Check
- `GET /health` - Check API health status

#### Data Seeding
- `POST /seed-data` - Initialize database with sample data

### Sample API Requests

#### Create a Product
```json
POST /products/
{
  "sku": "ABC123",
  "name": "Wireless Headphones",
  "description": "High-quality wireless headphones",
  "category": "Electronics",
  "price": 99.99,
  "stock": 50,
  "reorder_point": 10,
  "reorder_quantity": 25
}
```

#### Autofill Product Information
```json
POST /autofill
{
  "description": "20oz stainless steel water bottle, blue, BPA-free, 50 in stock"
}
```

**Response:**
```json
{
  "product_name": "20oz Stainless Steel Water Bottle",
  "category": "Drinkware",
  "tags": ["blue", "BPA-free", "stainless steel"],
  "suggested_sku": "WAT-BLU-20OZ",
  "quantity": 50
}
```

#### Chat with Inventory
```json
POST /chat
{
  "message": "How many laptops do we have in stock?"
}
```

**Response:**
```json
{
  "response": "Currently, you have 15 laptops in stock across all warehouses. 8 are in the Central Warehouse and 7 are in the North Distribution Center.",
  "timestamp": "2025-08-01T14:30:00Z"
}
```

#### Get Restock Suggestions
```json
GET /restock-suggestions
```

**Response:**
```json
{
  "suggestions": [
    {
      "product_name": "Wireless Headphones",
      "current_stock": 5,
      "reorder_point": 10,
      "suggested_quantity": 25,
      "priority": "High",
      "reasoning": "Below reorder point, high demand trend",
      "estimated_cost": 625.00
    }
  ],
  "summary": {
    "total_items": 8,
    "high_priority": 3,
    "medium_priority": 3,
    "low_priority": 2,
    "total_estimated_cost": 15420.00
  }
}
```

## 📁 Project Structure

```
218239-AG-AISOFTDEV-Team-3/
├── app/                           # Backend application
│   ├── main.py                    # FastAPI application entry point
│   ├── chat_ui.py                 # Chat interface utility
│   ├── main_in_memory.py          # In-memory version for testing
│   └── validation_models/         # Pydantic models
│       └── prd_model.py
├── artifacts/                     # Project documentation and frontend
│   ├── React/                     # React frontend application
│   │   ├── src/
│   │   │   ├── components/        # React components
│   │   │   │   ├── AddProductModal.jsx
│   │   │   │   ├── ChatWidget.jsx
│   │   │   │   ├── EditProductModal.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── NotificationToast.jsx
│   │   │   │   ├── PolishedTable.jsx
│   │   │   │   ├── RestockDashboard.jsx
│   │   │   │   ├── RestockModal.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── services/          # API services
│   │   │   │   └── api.js
│   │   │   ├── assets/            # Images and static files
│   │   │   │   └── ShelfSense Logo.png
│   │   │   ├── App.jsx            # Main React component
│   │   │   ├── App.css            # Application styles
│   │   │   ├── constants.js       # Configuration constants
│   │   │   └── utils.js           # Frontend utilities
│   │   ├── package.json           # Frontend dependencies
│   │   └── vite.config.js         # Vite configuration
│   ├── day1_prd.md               # Product Requirements Document
│   ├── schema.sql                # Database schema
│   ├── seed_data.sql             # Sample data
│   └── component_diagram.puml    # System architecture
├── templates/                     # Documentation templates
├── tests/                         # Test files
│   └── test_main_simple.py
├── Capstone.ipynb               # Project development phases notebook
├── requirements.txt              # Python dependencies
├── start-backend.bat            # Windows batch file for backend
├── start-frontend.bat           # Windows batch file for frontend
├── start-backend.sh             # Unix shell script for backend
├── start-frontend.sh            # Unix shell script for frontend
├── utils.py                     # Utility functions
├── test_api.py                  # API testing script
├── .gitignore                   # Git ignore patterns
├── LICENSE                      # Project license
└── README.md                    # This file
```

## 👥 User Guide

### Getting Started

1. **First Time Setup**: After starting the application, you can seed the database with sample data by making a POST request to `/seed-data` endpoint.

2. **Adding Products**: Click the "Add Product" button to create new inventory items. Fill in the required fields:
   - SKU (Stock Keeping Unit)
   - Product Name
   - Category
   - Price
   - Initial Stock Quantity
   - **Pro Tip**: Use the AI autofill feature by describing your product in natural language (e.g., "20oz blue stainless steel water bottle, BPA-free, 50 in stock") and let the system automatically extract structured data including product name, category, suggested SKU, and quantity.

3. **Managing Inventory**: 
   - View all products in the main inventory table
   - Use the search bar to find specific items
   - Edit products by clicking the edit icon
   - Delete products using the delete icon

4. **Monitoring Alerts**: The system automatically identifies:
   - Low stock items (highlighted in orange)
   - Out of stock items
   - Items requiring reorder

5. **AI-Powered Restock Dashboard**: Access intelligent weekly restock recommendations:
   - Click "Restock Dashboard" in the navigation
   - View AI-generated suggestions with priority levels
   - See detailed reasoning for each recommendation
   - Monitor total estimated costs

6. **Chat Interface**: Ask questions about your inventory in natural language:
   - Use the chat feature to query stock levels
   - Get instant responses about product availability
   - Ask about trends and recommendations

### Key Features Walkthrough

#### Dashboard
- Real-time view of all inventory items
- Color-coded stock status indicators
- Quick access to add new products

#### Product Management
- Complete CRUD operations for products
- Category-based organization
- Price and stock level tracking
- AI-powered product autofill for faster data entry

#### AI-Powered Restock Dashboard
- Weekly intelligent restock recommendations
- Multi-agent AI analysis system
- Priority-based suggestion ranking
- Cost estimation and budget planning

#### Natural Language Chat Interface
- Ask questions about inventory in plain English
- Real-time responses about stock levels
- Intelligent query processing and analysis

#### Search and Filtering
- Real-time search across product names and SKUs
- Category-based filtering
- Stock level filtering

## 🔧 Development

### Setting Up Development Environment

1. **Install Development Dependencies**:
   ```bash
   pip install -r requirements.txt
   cd artifacts/React
   npm install
   ```

2. **Environment Variables**: Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=sqlite:///./inventory.db
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ```

3. **Database Migrations**: The application uses SQLAlchemy with automatic table creation. Tables are created on first run.

### Code Structure

#### Backend Architecture
- **main.py**: FastAPI application with route definitions
- **Database Models**: SQLAlchemy ORM models for data persistence
- **Pydantic Models**: Request/response validation schemas
- **API Routes**: RESTful endpoints for all operations

#### Frontend Architecture
- **App.jsx**: Main React component with state management
- **Component-based**: Modular components for different UI sections
- **CSS Modules**: Styled components with responsive design

### Adding New Features

1. **Backend Changes**:
   - Add new database models in `main.py`
   - Create Pydantic schemas for validation
   - Implement API endpoints
   - Update database tables

2. **Frontend Changes**:
   - Add new React components
   - Update state management
   - Implement API calls
   - Style new components

## 🧪 Testing

### Running Backend Tests

```bash
# Activate virtual environment
labenv\Scripts\activate

# Run tests
python -m pytest tests/
```

### Running API Tests

```bash
python test_api.py
```

### Manual Testing

1. **API Testing**: Use the Swagger UI at `http://localhost:8000/docs`
2. **Frontend Testing**: Test all features through the web interface
3. **Integration Testing**: Verify backend-frontend communication

## 🔍 Troubleshooting

### Common Issues

#### Backend Issues

**Issue**: `ModuleNotFoundError` when starting the backend
**Solution**: Ensure virtual environment is activated and dependencies are installed:
```bash
labenv\Scripts\activate
pip install -r requirements.txt
```

**Issue**: Database connection errors
**Solution**: Check if the database file has proper permissions and the app directory exists.

**Issue**: Port 8000 already in use
**Solution**: Either stop the conflicting process or change the port in `main.py`:
```python
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)  # Changed from 8000
```

#### Frontend Issues

**Issue**: `npm install` fails
**Solution**: 
1. Delete `node_modules` folder and `package-lock.json`
2. Run `npm install` again
3. Ensure Node.js version is 18+

**Issue**: Frontend can't connect to backend
**Solution**: 
1. Verify backend is running on `http://localhost:8000`
2. Check CORS settings in `main.py`
3. Ensure API_BASE_URL in `App.jsx` matches backend URL

**Issue**: Styling issues or components not rendering
**Solution**: 
1. Check browser console for JavaScript errors
2. Verify CSS files are loading correctly
3. Ensure all required dependencies are installed

#### Database Issues

**Issue**: Database file locked or permission denied
**Solution**: 
1. Close any SQLite browser connections
2. Restart the application
3. Check file permissions on the database file

#### OpenAI API Issues

**Issue**: Autofill feature returns "service unavailable"
**Solution**: 
1. Ensure you have an OpenAI API key
2. Add it to your `.env` file: `OPENAI_API_KEY=your_key_here`
3. Restart the backend server

**Issue**: Restock dashboard shows "Error loading suggestions"
**Solution**: 
1. Verify OpenAI API key is properly configured
2. Check that you have sufficient API credits
3. Ensure products exist in the database
4. Restart the backend server

**Issue**: Chat interface not responding
**Solution**: 
1. Confirm OpenAI API key is valid and active
2. Check browser console for JavaScript errors
3. Verify backend is running and accessible
4. Test API endpoints directly via Swagger UI

**Issue**: OpenAI API authentication failed
**Solution**: 
1. Verify your API key is correct and active
2. Check your OpenAI account has available credits
3. Ensure the API key has the necessary permissions

**Issue**: OpenAI rate limit exceeded
**Solution**: 
1. Wait for the rate limit to reset
2. Consider upgrading your OpenAI plan for higher limits
3. Implement request queuing if needed

### Getting Help

1. **Check the logs**: Backend logs will show detailed error messages
2. **Browser Developer Tools**: Check console for frontend errors
3. **API Documentation**: Use Swagger UI to test API endpoints
4. **Database Inspection**: Use SQLite browser to examine database contents

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-feature`
3. **Make your changes**
4. **Run tests**: Ensure all tests pass
5. **Commit your changes**: `git commit -m "Add new feature"`
6. **Push to the branch**: `git push origin feature/new-feature`
7. **Submit a pull request**

### Code Standards

- **Python**: Follow PEP 8 style guidelines
- **JavaScript**: Use ES6+ features and consistent formatting
- **Documentation**: Update README and inline comments for new features
- **Testing**: Add tests for new functionality

### Commit Message Format

```
type(scope): description

- feat: new feature
- fix: bug fix
- docs: documentation changes
- style: formatting changes
- refactor: code restructuring
- test: adding tests
```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions, issues, or support:

1. **Check the documentation** above
2. **Search existing issues** in the GitHub repository
3. **Create a new issue** with detailed information about your problem
4. **Include**: 
   - Operating system
   - Python and Node.js versions
   - Error messages and logs
   - Steps to reproduce the issue

---

**Happy Coding!** 🚀

Built with ❤️ for efficient inventory management.