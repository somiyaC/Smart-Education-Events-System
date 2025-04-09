from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from controller.database import users_collection
from passlib.hash import bcrypt
from models.user_model import UserModel
import jwt
import os
from bson import ObjectId

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY")

#Signup Model
class SignupRequest(BaseModel):
    email: str
    password: str
    role: str  # Required only for signup

#Login Model
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

@router.post("/signup")
async def signup(user: SignupRequest):
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        print("email exists")
        return {"status": False}

    hashed_password = bcrypt.hash(user.password)
    print(hashed_password)
    _id = users_collection.insert_one({"email": user.email, "password": hashed_password, "role": user.role})
    return {"status": True, "first_name":"john doe","user_id":str(_id)}

@router.post("/login")
async def login(user: LoginRequest): 
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not bcrypt.verify(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    print(db_user)
    return {"token": "", "email":user.email, "role": db_user["role"], "user_id": str(db_user['_id'])}

@router.post("/user")
async def user(user_data: UserData):
    user = await UserModel.get_user_by_id(user_data.user_id)

    return {"user":user}

@router.post("/update_user")
async def update_user(user_data: UserUpdateData):
    email = user_data.email
    password = user_data.password
    user_id = user_data.user_id
    hashed_password = bcrypt.hash(password)
    update_data = {}
    if email != "":
        update_data['email'] = email
    if password != "":
        update_data['password'] = hashed_password

    user_id = await UserModel.update_user(user_id, update_data)
    return {"status":True}

@router.post("/update_password")
async def update_password(password_data: PasswordUpdateData):
    try:
        # Get the user from database
        user = users_collection.find_one({"_id": ObjectId(password_data.user_id)})
        if not user:
            return {"status": False, "message": "User not found"}
        
        # Verify current password
        if not bcrypt.verify(password_data.current_password, user["password"]):
            return {"status": False, "message": "Current password is incorrect"}
        
        # Hash the new password
        hashed_password = bcrypt.hash(password_data.new_password)
        
        # Update the password in database
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


#To get all speakers. This routes file imports usermodel properly hence this is placed here.
@router.get("/speakers")
async def get_speakers():
    try:
        speakers = await UserModel.get_all_speakers()
        return {"speakers": speakers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching speakers: {str(e)}")
