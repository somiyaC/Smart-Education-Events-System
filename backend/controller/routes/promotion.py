from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

# Import your database dependency, event model, and email model
from controller.database import get_db
from models.event_model import EventModel
from models.email_model import EmailModel
from models.user_model import UserModel

router = APIRouter(prefix="/promotion", tags=["Event Promotion"])

# --------------------------------
# 1) Email Campaigns
# --------------------------------
class EmailCampaignCreate(BaseModel):
    subject: str
    body: str
    recipients: Optional[List[str]] = None
    event_id: Optional[str] = None

@router.post("/email-campaign", status_code=status.HTTP_201_CREATED)
async def create_email_campaign(
    campaign: EmailCampaignCreate,
    db=Depends(get_db)
):
    """
    Create and send an email campaign to a list of recipients or to all attendees of an event.
    """
    # If event_id is provided, fetch all attendee emails from that event
    user_ids = campaign.recipients
    for idx, user_id in enumerate(user_ids):
        user_data = await UserModel.get_user_by_id(user_id)
        user_ids[idx] = user_data['email']
    campaign.recipients = user_ids
    print(user_ids)
    print("--")
    print(campaign.recipients)


    # Remove duplicates
    recipient_list = list(set(campaign.recipients))

    # Send the email campaign (adjust to your EmailModel’s actual method signature)
    # For example:
    for recipient in recipient_list:
        await EmailModel.send_email(
            to=recipient,
            subject=campaign.subject,
            body=campaign.body,
            db=db
        )

    return {"status":True} 

# --------------------------------
# 2) Social Media Integration
# --------------------------------
class SocialShareRequest(BaseModel):
    event_id: str
    platform: str  # e.g. "twitter", "facebook", "linkedin"
    message: Optional[str] = None

@router.post("/social-share", status_code=status.HTTP_200_OK)
async def share_on_social_media(
    share_req: SocialShareRequest,
    db=Depends(get_db)
):
    """
    Generate or post a shareable link on social media for an event.
    In a real app, you'd integrate with the platform's API.
    """
    event = await EventModel.get_event_by_id(share_req.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Example: Return a dummy share link
    # In a real integration, you'd call the relevant social media API
    share_url = f"https://social.{share_req.platform}.com/share?text={share_req.message or ''}&event={share_req.event_id}"
    
    return {
        "detail": f"Generated share link for {share_req.platform}",
        "share_url": share_url
    }

# --------------------------------
# 3) Customizable Event Pages
# --------------------------------
class EventPageUpdate(BaseModel):
    event_id: str
    page_title: Optional[str] = None
    page_content: Optional[str] = None

@router.post("/event-page", status_code=status.HTTP_200_OK)
async def update_event_page(
    page_update: EventPageUpdate,
    db=Depends(get_db)
):
    """
    Update or create a customizable event page for promotion.
    """
    event = await EventModel.get_event_by_id(page_update.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    update_data = {}
    if page_update.page_title is not None:
        update_data["page_title"] = page_update.page_title
    if page_update.page_content is not None:
        update_data["page_content"] = page_update.page_content
    update_data["last_modified"] = datetime.utcnow()

    updated_event = await EventModel.update_one(
        {"_id": event["_id"]},
        {"$set": update_data}
    )
    if not updated_event:
        raise HTTPException(status_code=400, detail="Failed to update event page")

    return {"detail": "Event page updated successfully"}

@router.get("/event-page/{event_id}", status_code=status.HTTP_200_OK)
async def get_event_page(event_id: str, db=Depends(get_db)):
    """
    Retrieve the customizable event page details for display.
    """
    event = await EventModel.get_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Return only relevant page fields
    return {
        "event_id": str(event_id),
        "page_title": event.get("page_title", ""),
        "page_content": event.get("page_content", ""),
        "last_modified": event.get("last_modified")
    }
