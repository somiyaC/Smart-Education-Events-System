from fastapi import APIRouter, HTTPException
from ..database import users_collection
from ..schemas.user import UserSchema
from bson import ObjectId

router = APIRouter()

# ✅ Create User
@router.post("/users", response_model=UserSchema)
async def create_user(user: UserSchema):
    user_dict = user.dict()
    user_dict["_id"] = str(ObjectId())
    users_collection.insert_one(user_dict)
    return user_dict

# ✅ Get All Users
@router.get("/users", response_model=list[UserSchema])
async def get_users():
    users = list(users_collection.find({}))
    return [{**u, "id": str(u["_id"])} for u in users]
