from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError

from alembic import command
from alembic.config import Config
from src.config import settings

if settings.DEBUG_MODE:
    engine = create_engine(settings.DATABASE_URL, echo=True)
else:
    engine = create_engine(settings.DATABASE_URL, pool_size=100, max_overflow=50, pool_recycle=300)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

try:
    # 嘗試執行一個簡單的查詢來檢查連接
    with engine.connect() as connection:
        result = connection.execute("SELECT 1")
        print("Database connection successful!")
except OperationalError as e:
    print(f"Error: Unable to connect to the database. {e}")


def get_db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def run_migrations():
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")