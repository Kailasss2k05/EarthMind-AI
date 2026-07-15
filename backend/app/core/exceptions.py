"""
Custom exception classes for EarthMind AI.

Hierarchy:
    EarthMindException          ← Base for all application exceptions
    ├── DatabaseException       ← PostgreSQL / SQLAlchemy errors
    ├── AgentException          ← LangGraph / agent orchestration errors
    └── ValidationException     ← Request / business-logic validation errors
"""


class EarthMindException(Exception):
    """Base exception for all EarthMind application errors."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class DatabaseException(EarthMindException):
    """Raised when a database operation fails (PostgreSQL / SQLAlchemy)."""

    def __init__(self, message: str = "A database error occurred."):
        super().__init__(message=message, status_code=503)


class AgentException(EarthMindException):
    """Raised when an agent or LangGraph workflow encounters an error."""

    def __init__(self, message: str = "An agent error occurred."):
        super().__init__(message=message, status_code=500)


class ValidationException(EarthMindException):
    """Raised when request data or business logic validation fails."""

    def __init__(self, message: str = "Validation failed."):
        super().__init__(message=message, status_code=400)
