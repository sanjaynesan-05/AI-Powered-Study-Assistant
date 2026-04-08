from datetime import datetime, timedelta
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.config import settings
from app.models.user import User

async def handle_google_user(session: AsyncSession, email: str, name: str, picture: str, google_id: str) -> User:
    # Check if user exists securely in PostgreSQL
    stmt = select(User).where(User.email == email)
    result = await session.execute(stmt)
    user = result.scalars().first()
    
    current_time = datetime.utcnow()
    
    if not user:
        print(f"DEBUG: PostgreSQL - Creating new user {email}")
        user = User(
            email=email,
            name=name,
            picture=picture,
            google_id=google_id,
            created_at=current_time,
            last_login=current_time
        )
        session.add(user)
    else:
        print(f"DEBUG: PostgreSQL - Updating existing user {email}")
        user.last_login = current_time
        user.google_id = google_id # Just in case
        
    await session.commit()
    await session.refresh(user)
    return user

def create_access_token(user_id: str, email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    to_encode = {
        "sub": str(user_id),
        "email": email,
        "exp": expire
    }
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    print("DEBUG: Generated JWT Token safely via jose")
    return encoded_jwt
