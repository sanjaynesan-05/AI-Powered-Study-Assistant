from fastapi import APIRouter, HTTPException, status, Depends
from google.oauth2 import id_token
from google.auth.transport import requests
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import GoogleAuthRequest, TokenResponse, UserResponse
from app.services.auth_service import handle_google_user, create_access_token
from app.config import settings
from app.db import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/google", response_model=TokenResponse)
async def auth_google(request_data: GoogleAuthRequest, session: AsyncSession = Depends(get_db)):
    """
    Complete backend authentication system for Google OAuth utilizing PostgreSQL (NeonDB).
    """
    print(f"DEBUG: Received token starting with: {request_data.credential[:15]}...")
    try:
        # Get GOOGLE_CLIENT_ID from environment if specified, otherwise verify without audience constraint
        client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
        
        idinfo = id_token.verify_oauth2_token(
            request_data.credential, 
            requests.Request(),
            client_id
        )
        
        email = idinfo["email"]
        name = idinfo.get("name", "Google User")
        picture = idinfo.get("picture", "")
        google_id = idinfo["sub"]
        
        print(f"DEBUG: Decoded Google user - Name: {name}, Email: {email}, Sub: {google_id}")
        
        # Sync with Database Session
        print("DEBUG: Executing PostgreSQL operations...")
        user_record = await handle_google_user(session, email, name, picture, google_id)
        
        # Generate our own platform JWT
        access_token = create_access_token(user_record.id, email)
        
        # SQLAlchemy implicitly utilizes the .id dot notation
        user_response = UserResponse(
            email=email,
            name=name,
            picture=picture,
            google_id=google_id,
            created_at=user_record.created_at
        )
        
        print("DEBUG: Auth flow complete, returning JSON payload")
        return TokenResponse(
            access_token=access_token,
            user=user_response
        )
        
    except ValueError as e:
        print(f"ERROR: Invalid token ValueError - {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token"
        )
    except Exception as e:
        print(f"ERROR: Google Auth failed - {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred during Google authentication"
        )
