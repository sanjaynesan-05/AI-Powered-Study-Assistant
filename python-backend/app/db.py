from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from app.config import settings

# Convert postgresql:// to postgresql+asyncpg://
db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Remove unsupported asyncpg parameters from URL string
if "?" in db_url:
    db_url = db_url.split("?")[0]

# Create asynchronous engine with native SSL
engine = create_async_engine(
    db_url, 
    echo=False,
    connect_args={"ssl": True}
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    """Dependency for getting async DB session"""
    async with AsyncSessionLocal() as session:
        yield session
