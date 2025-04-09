from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from controller.database import users_collection
from passlib.hash import bcrypt
from models.user_model import UserModel
from bson import ObjectId
from datetime import datetime
from typing import Literal, Optional

router = APIRouter()

class SignupRequest(BaseModel):
    email: str
    password: str
    role: str  # Required only for signup

class LoginRequest(BaseModel):
    email: str
    password: str

class UserData(BaseModel):
    user_id: str

class UserUpdateData(BaseModel):
    email: str
    password: str
    user_id: str

class PasswordUpdateData(BaseModel):
    current_password: str
    new_password: str
    user_id: str

class AdminCreateUser(BaseModel):
    email: EmailStr
    password: str
    role: Literal["attendee", "organizer", "speaker", "admin"]
    first_name: str
    last_name: str

@router.post("/signup")
async def signup(user: SignupRequest):
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        return {"status": False, "message": "Email already exists"}

    hashed_password = bcrypt.hash(user.password)
    _id = users_collection.insert_one({
        "email": user.email,
        "password": hashed_password,
        "role": user.role,
        "created_at": datetime.utcnow()
    })
    return {"status": True, "first_name": "john doe", "user_id": str(_id.inserted_id)}

@router.post("/login")
async def login(user: LoginRequest): 
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not bcrypt.verify(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "token": "",  # Token handling can be added later
        "email": user.email,
        "role": db_user["role"],
        "user_id": str(db_user['_id'])
    }

@router.post("/user")
async def user(user_data: UserData):
    user = await UserModel.get_user_by_id(user_data.user_id)
    return {"user": user}

@router.post("/update_user")
async def update_user(user_data: UserUpdateData):
    hashed_password = bcrypt.hash(user_data.password)
    update_data = {}

    if user_data.email:
        update_data['email'] = user_data.email
    if user_data.password:
        update_data['password'] = hashed_password

    await UserModel.update_user(user_data.user_id, update_data)
    return {"status": True}

@router.post("/update_password")
async def update_password(password_data: PasswordUpdateData):
    try:
        user = users_collection.find_one({"_id": ObjectId(password_data.user_id)})
        if not user:
            return {"status": False, "message": "User not found"}
        
        if not bcrypt.verify(password_data.current_password, user["password"]):
            return {"status": False, "message": "Current password is incorrect"}
        
        hashed_password = bcrypt.hash(password_data.new_password)
        result = users_collection.update_one(
            {"_id": ObjectId(password_data.user_id)},
            {"$set": {"password": hashed_password}}
        )

        if result.modified_count == 0:
            return {"status": False, "message": "Failed to update password"}
        
        return {"status": True, "message": "Password updated successfully"}
    
    except Exception as e:
        print(f"Error updating password: {str(e)}")
        return {"status": False, "message": "An error occurred while updating password"}

@router.post("/admin/create_user")
async def admin_create_user(new_user: AdminCreateUser, admin_data: UserData):
    # Check permission
    is_admin = await UserModel.check_permission(admin_data.user_id, "admin")
    if not is_admin:
        raise HTTPException(status_code=403, detail="Only admins can create new users.")

    existing = users_collection.find_one({"email": new_user.email})
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    hashed_password = bcrypt.hash(new_user.password)

    user_doc = {
        "email": new_user.email,
        "password": hashed_password,
        "role": new_user.role,
        "first_name": new_user.first_name,
        "last_name": new_user.last_name,
        "created_at": datetime.utcnow(),
    }

    result = users_collection.insert_one(user_doc)
    return {"status": True, "user_id": str(result.inserted_id)}
