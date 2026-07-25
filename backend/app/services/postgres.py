from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config.settings import settings


# SQLAlchemy Engine
# L-3: Pool configuration added to prevent connection exhaustion under load.
# pool_size:    steady-state connections kept open (default was 5)
# max_overflow: extra connections allowed above pool_size (default was 10)
# pool_timeout: seconds to wait for a connection before raising (default 30)
# pool_recycle: recycle connections older than this many seconds to prevent
#               "server has gone away" errors from stale idle connections
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=1800,
)


# Session Factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    """
    FastAPI dependency that provides a database session.
    """

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()