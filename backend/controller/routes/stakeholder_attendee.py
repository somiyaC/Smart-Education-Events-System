from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel

# Import the UserModel class from your user_model.
# (Make sure that UserModel’s async methods are implemented as in your code.)
from models.user_model import UserModel

router = APIRouter(
    prefix="/users",
    tags=["Stakeholders and Attendees Management"]
)

# ----- Pydantic Schemas -----

class UserCreate(BaseModel):
    auth0_id: str
    email: str
    first_name: str
    last_name: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    facebook: Optional[str] = None
    interests: Optional[List[str]] = None
    receive_notifications: Optional[bool] = None
    role: Optional[str] = None  # Usually you wouldn't update role via this endpoint

# ----- Endpoints for Attendees -----

@router.get("/attendees", response_model=List[dict])
async def list_attendees():
    # Retrieve all users with role "attendee"
    attendees = await UserModel.find_users_by_role("attendee")
    return attendees

@router.get("/attendees/{user_id}", response_model=dict)
async def get_attendee(user_id: str):
    attendee = await UserModel.get_user_by_id(user_id)
    if not attendee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendee not found")
    return attendee

@router.post("/attendees", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_attendee(user: UserCreate):
    # Force role to "attendee" regardless of input
    created_id = await UserModel.create_user(
        auth0_id=user.auth0_id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role="attendee"
    )
    new_user = await UserModel.get_user_by_id(created_id)
    return new_user

@router.put("/attendees/{user_id}", response_model=dict)
async def update_attendee(user_id: str, user_update: UserUpdate):
    updated_user = await UserModel.update_user(user_id, user_update.dict(exclude_unset=True))
    if not updated_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendee not found")
    return updated_user

@router.delete("/attendees/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attendee(user_id: str):
    success = await UserModel.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendee not found")
    return

# ----- Endpoints for Stakeholders -----

@router.get("/stakeholders", response_model=List[dict])
async def list_stakeholders():
    stakeholders = await UserModel.find_users_by_role("stakeholder")
    return stakeholders

@router.get("/stakeholders/{user_id}", response_model=dict)
async def get_stakeholder(user_id: str):
    stakeholder = await UserModel.get_user_by_id(user_id)
    if not stakeholder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stakeholder not found")
    return stakeholder

@router.post("/stakeholders", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_stakeholder(user: UserCreate):
    # Force role to "stakeholder"
    created_id = await UserModel.create_user(
        auth0_id=user.auth0_id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role="stakeholder"
    )
    new_user = await UserModel.get_user_by_id(created_id)
    return new_user

@router.put("/stakeholders/{user_id}", response_model=dict)
async def update_stakeholder(user_id: str, user_update: UserUpdate):
    updated_user = await UserModel.update_user(user_id, user_update.dict(exclude_unset=True))
    if not updated_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stakeholder not found")
    return updated_user

@router.delete("/stakeholders/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_stakeholder(user_id: str):
    success = await UserModel.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stakeholder not found")
    return
