from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from controller.database import users_collection
from passlib.hash import bcrypt
import jwt
import os

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
    token = jwt.encode({"email": user.email, "role": db_user["role"]}, SECRET_KEY, algorithm="HS256")
    return {"token": token, "email":user.email, "role": db_user["role"], "user_id": str(db_user['_id'])}
