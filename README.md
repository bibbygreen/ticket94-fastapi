# Ticket94-FastAPI

A production-ready FastAPI template with built-in authentication, database integration, containerization, and infrastructure as code. This template provides a solid foundation for building scalable and maintainable API services with Python.

## Features

- **FastAPI Framework**: High-performance, easy-to-use web framework
- **SQLAlchemy ORM**: Database integration with migration support via Alembic
- **Authentication**: Built-in JWT authentication system
- **Docker Support**: Containerization for consistent development and deployment
scenarios
- **CI/CD Pipeline**: GitLab CI/CD configuration
- **Environment Management**: Structured environment variable management
- **Code Quality**: Pre-commit hooks for code quality enforcement

## Prerequisites

- Python 3.12+
- Poetry (Python dependency management)
- Docker and Docker Compose (for containerized development)
- Make (for running convenience commands)

## Project Structure

```
fastapi-template/
├── alembic/                  # Database migration scripts
├── ansible/                  # Ansible deployment configurations
├── env.example/              # Example environment variable files
├── scripts/                  # Utility scripts
├── src/                      # Application source code
│   ├── auth/                 # Authentication module
│   ├── database/             # Database module
│   ├── main.py               # Main entry point
│   └── models/               # Database models
└── tests/                    # Test suite
```

## Local Development Environment

### 1. Set Up Environment Variables

```bash
# Create env directory if it doesn't exist
mkdir -p env

# Copy environment files
cp env.example/.env.example env/.env
cp env.example/.env.db.example env/.env.db
cp env.example/.env.remote.example env/.env.remote
```

Edit the environment files with your configuration:
- `env/.env` - Local environment variables (API settings, logging, etc.)
- `env/.env.db` - Database configuration (connection string, credentials)
- `env/.env.remote` - Remote deployment settings (used for staging)

### 2. Set Up Python Environment

```bash
# Create and activate virtual environment
poetry shell

# Install dependencies
poetry install
```

### 3. Install Pre-commit Hooks

```bash
pre-commit install
```

### 4. Run the Application

```bash
make run
```

### 5. Access API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc


## Testing

Run the test suite with:

```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=src
```

## Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "description of changes"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

## Makefile Commands

The project includes several convenience commands in the Makefile:

```bash
# Run the application
make run

# Run tests
make test

# Run linting
make lint

# Generate a new migration
make generate_migration

# Apply database migrations
make migrate
```
