# Test Configuration and Setup

This directory contains comprehensive unit tests for the inventory management application.

## Test Structure

### Backend Tests
- **`test_backend.py`** - API endpoint tests using FastAPI TestClient
- **`test_utils.py`** - Utility function tests (validation, price formatting)
- **`test_database.py`** - Database operation tests with SQLite

### Frontend Tests
- **`test_frontend_table.test.js`** - PolishedTable component tests
- **`test_frontend_modal.test.js`** - EditProductModal component tests
- **`test_frontend_chat.test.js`** - ChatWidget component tests

## Running Tests

### Python/Backend Tests
```bash
# Install test dependencies
pip install pytest pytest-cov

# Run all Python tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html

# Run specific test file
pytest tests/test_backend.py -v

# Run specific test class
pytest tests/test_backend.py::TestProductEndpoints -v

# Run specific test method
pytest tests/test_backend.py::TestProductEndpoints::test_create_product_success -v
```

### JavaScript/Frontend Tests
```bash
# Install test dependencies
cd artifacts/React
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom

# Run all frontend tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test test_frontend_table.test.js

# Run in watch mode
npm test -- --watch
```

## Test Categories

### API Tests (`test_backend.py`)
- **Health Endpoint**: Service availability checks
- **Product CRUD**: Create, read, update, delete operations
- **AI Endpoints**: Autofill, chat, restock suggestions
- **Validation**: Input validation and error handling
- **Performance**: Concurrent operations and load testing

### Utility Tests (`test_utils.py`)
- **Data Validation**: Product data validation functions
- **Price Formatting**: Cents to dollars conversion
- **Error Handling**: Edge cases and invalid inputs
- **Data Sanitization**: Whitespace and special character handling

### Database Tests (`test_database.py`)
- **Connection**: Database connectivity and schema validation
- **CRUD Operations**: Raw SQL operations testing
- **Constraints**: Unique constraints and data integrity
- **Performance**: Batch operations and indexing
- **Queries**: Complex queries and aggregations

### Component Tests (Frontend)
- **PolishedTable**: Product listing, editing, deletion, sorting
- **EditProductModal**: Form validation, price conversion, modal behavior
- **ChatWidget**: AI chat functionality, message handling, API integration

## Test Data

### Sample Product Data
```json
{
  "sku": "TEST001",
  "name": "Test Product",
  "description": "A test product for unit testing",
  "category": "electronics",
  "price": 1999,
  "stock": 50
}
```

### Price Handling
- Backend stores prices in **cents** (integer)
- Frontend displays prices in **dollars** (decimal)
- Tests verify proper conversion between formats

## Mocking Strategy

### Backend Mocks
- Database connections use temporary SQLite files
- FastAPI TestClient for API testing
- No external service dependencies

### Frontend Mocks
- API calls mocked with `jest.fn()`
- Component dependencies mocked
- Loading states and error handling tested

## Coverage Targets

### Backend Coverage
- API endpoints: 100%
- Utility functions: 100%
- Database operations: 95%
- Error handling: 90%

### Frontend Coverage
- Component rendering: 100%
- User interactions: 95%
- API integration: 90%
- Edge cases: 85%

## Test Best Practices

### Naming Conventions
- Test files: `test_*.py` or `*.test.js`
- Test methods: `test_<action>_<expected_result>`
- Test classes: `Test<ComponentName>`

### Test Organization
```python
class TestProductEndpoints:
    def setup_method(self):
        # Test setup
        
    def test_create_product_success(self):
        # Happy path test
        
    def test_create_product_missing_fields(self):
        # Error case test
        
    def teardown_method(self):
        # Cleanup
```

### Assertions
- Use descriptive assertion messages
- Test both positive and negative cases
- Verify side effects (database changes, API calls)

## Continuous Integration

### GitHub Actions Integration
```yaml
name: Run Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.11
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest tests/ --cov=app
```

## Debugging Tests

### Common Issues
1. **Import Errors**: Ensure proper Python path setup
2. **Database Locks**: Use temporary databases for tests
3. **Async Issues**: Proper await/async handling in tests
4. **Mock Conflicts**: Clear mocks between tests

### Debug Commands
```bash
# Run single test with output
pytest tests/test_backend.py::test_name -v -s

# Run with debugger
pytest tests/test_backend.py::test_name --pdb

# Show test coverage gaps
pytest tests/ --cov=app --cov-report=term-missing
```

## Performance Testing

### Database Performance
- Batch insert operations
- Index effectiveness
- Query optimization
- Connection pooling

### API Performance
- Response time testing
- Concurrent request handling
- Memory usage validation
- Rate limiting tests

## Security Testing

### Input Validation
- SQL injection prevention
- XSS attack prevention
- Input sanitization
- Authentication testing

### Data Protection
- Sensitive data handling
- Error message security
- Access control validation
