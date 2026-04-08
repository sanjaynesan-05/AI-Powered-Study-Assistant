from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any
from bson import ObjectId

from app.auth.models import UserCreate, UserLogin, GoogleLogin, UserUpdate, UserResponse
from app.auth.dependencies import get_password_hash, verify_password, create_access_token, get_current_user
from app.memory.mongodb_store import memory_store
from datetime import timedelta
from app.config import settings

try:
    from google.oauth2 import id_token
    from google.auth.transport import requests
except ImportError:
    id_token = None

router = APIRouter(prefix="/users", tags=["users"])

def get_user_collection():
    return memory_store.db.users

@router.post("", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    users_collection = get_user_collection()
    
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user_dict = user_data.model_dump(exclude={"password"})
    user_dict["hashed_password"] = get_password_hash(user_data.password)
    user_dict["role"] = "user"
    user_dict["auth_provider"] = "local"
    
    result = await users_collection.insert_one(user_dict)
    
    user_id = str(result.inserted_id)
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "_id": user_id,
        "name": user_dict["name"],
        "email": user_dict["email"],
        "role": user_dict["role"],
        "token": access_token
    }

@router.post("/login", response_model=UserResponse)
async def login_user(credentials: UserLogin):
    users_collection = get_user_collection()
    
    user = await users_collection.find_one({"email": credentials.email})
    if not user or "hashed_password" not in user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    user_id = str(user["_id"])
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "_id": user_id,
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", "user"),
        "profilePicture": user.get("profilePicture"),
        "interests": user.get("interests", []),
        "skills": user.get("skills", []),
        "token": access_token
    }

@router.post("/google-login", response_model=UserResponse)
async def google_login(data: GoogleLogin):
    """
    Authenticate a user via Google OAuth ID token.
    1. Verifies the token with Google
    2. Checks if the user exists in MongoDB
    3. Creates a new user if not found
    4. Returns a JWT for the study assistant platform
    """
    if not id_token:
        print("CRITICAL: google-auth library missing in backend environment")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Google Auth is not supported (google-auth library missing)"
        )

    try:
        # 1. Verify the Google token
        print(f"DEBUG: Attempting to verify Google token for origin check")
        # Ensure your VITE_GOOGLE_CLIENT_ID matches the one in Google Cloud Console
        idinfo = id_token.verify_oauth2_token(
            data.credential, 
            requests.Request(), 
            settings.GOOGLE_AI_API_KEY # Some setups use Client ID here, but id_token defaults safely
        )
        
        # 2. Extract verified user info
        email = idinfo["email"]
        name = idinfo.get("name", "Google User")
        picture = idinfo.get("picture", "")
        print(f"DEBUG: Google token verified for user: {email}")
        
        # 3. Synchronize with MongoDB
        users_collection = get_user_collection()
        user = await users_collection.find_one({"email": email})
        
        if not user:
            print(f"DEBUG: Creating new Google-sourced user record for {email}")
            user_dict = {
                "email": email,
                "name": name,
                "role": "user",
                "auth_provider": "google",
                "profilePicture": picture,
                "interests": [],
                "skills": [],
                "created_at": datetime.utcnow()
            }
            result = await users_collection.insert_one(user_dict)
            user_id = str(result.inserted_id)
            user = await users_collection.find_one({"_id": result.inserted_id})
        else:
            user_id = str(user["_id"])
            print(f"DEBUG: Found existing user {user_id} for email {email}")
            
        # 4. Generate Platform JWT
        access_token = create_access_token(data={"sub": user_id})
        
        return {
            "_id": user_id,
            "name": user.get("name", name),
            "email": user.get("email", email),
            "role": user.get("role", "user"),
            "profilePicture": user.get("profilePicture", picture),
            "interests": user.get("interests", []),
            "skills": user.get("skills", []),
            "token": access_token
        }
        
    except ValueError as e:
        print(f"ERROR: Google token verification failed value error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail=f"Invalid Google token: {str(e)}"
        )
    except Exception as e:
        print(f"ERROR: Unexpected error during Google login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="An internal error occurred during Google authentication"
        )

@router.get("/profile", response_model=UserResponse)
async def get_profile(user_id: str = Depends(get_current_user)):
    users_collection = get_user_collection()
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "_id": user_id,
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", "user"),
        "profilePicture": user.get("profilePicture"),
        "interests": user.get("interests", []),
        "skills": user.get("skills", []),
        "token": access_token
    }

@router.put("/profile", response_model=UserResponse)
async def update_profile(update_data: UserUpdate, user_id: str = Depends(get_current_user)):
    users_collection = get_user_collection()
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if "password" in update_dict:
        update_dict["hashed_password"] = get_password_hash(update_dict.pop("password"))
        
    if not update_dict:
        raise HTTPException(status_code=400, detail="No valid fields to update")
        
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_dict}
    )
    
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "_id": user_id,
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", "user"),
        "profilePicture": user.get("profilePicture"),
        "interests": user.get("interests", []),
        "skills": user.get("skills", []),
        "token": access_token
    }
