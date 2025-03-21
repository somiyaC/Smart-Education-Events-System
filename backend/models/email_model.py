"""
Question model module for handling Q&A functionality.
Based on the QuestionSchema.
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone, timedelta
from bson import ObjectId

from .base_model import BaseModel

class EmailCampaignModel(BaseModel):
    """
    Model for email marketing campaigns.
    Handles email templates, sending, and tracking.
    """
    collection_name = "email_campaigns"
    
    @classmethod
    async def create_campaign(cls, event_id: str, name: str, subject: str, 
                           body_html: str, body_text: str, 
                           audience: Dict, sender_name: str, 
                           sender_email: str) -> str:
        """
        Create a new email campaign.
        
        Args:
            event_id: Event ID
            name: Campaign name (internal)
            subject: Email subject line
            body_html: HTML content of the email
            body_text: Plain text content of the email
            audience: Audience targeting criteria
            sender_name: Sender's name
            sender_email: Sender's email address
            
        Returns:
            str: ID of the created campaign
        """
        campaign_data = {
            "event_id": event_id,
            "name": name,
            "subject": subject,
            "body_html": body_html,
            "body_text": body_text,
            "audience": audience,
            "sender_name": sender_name,
            "sender_email": sender_email,
            "status": "draft",  # draft, scheduled, sent, cancelled
            "schedule_time": None,
            "sent_time": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "metrics": {
                "total_sent": 0,
                "opened": 0,
                "clicked": 0,
                "bounced": 0
            },
            "tracking": []  # Will store individual recipient tracking data
        }
        
        campaign_id = await cls.insert_one(campaign_data)
        return str(campaign_id)
    
    @classmethod
    async def schedule_campaign(cls, campaign_id: str, schedule_time: datetime) -> Optional[Dict]:
        """
        Schedule a campaign for sending.
        
        Args:
            campaign_id: Campaign ID
            schedule_time: Time to send the campaign
            
        Returns:
            Dict: Updated campaign document or None if not found
        """
        return await cls.update_one(
            {"_id": ObjectId(campaign_id), "status": "draft"},
            {
                "$set": {
                    "status": "scheduled",
                    "schedule_time": schedule_time,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
    
    @classmethod
    async def cancel_campaign(cls, campaign_id: str) -> Optional[Dict]:
        """
        Cancel a scheduled campaign.
        
        Args:
            campaign_id: Campaign ID
            
        Returns:
            Dict: Updated campaign document or None if not found
        """
        return await cls.update_one(
            {"_id": ObjectId(campaign_id), "status": "scheduled"},
            {
                "$set": {
                    "status": "cancelled",
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
    
    @classmethod
    async def record_send(cls, campaign_id: str, recipient_ids: List[str]) -> Optional[Dict]:
        """
        Record that a campaign has been sent.
        
        Args:
            campaign_id: Campaign ID
            recipient_ids: List of recipient user IDs
            
        Returns:
            Dict: Updated campaign document or None if not found
        """
        tracking_entries = []
        for user_id in recipient_ids:
            tracking_entries.append({
                "user_id": user_id,
                "sent_at": datetime.now(timezone.utc),
                "opened": False,
                "opened_at": None,
                "clicked": False,
                "clicked_at": None
            })
        
        return await cls.update_one(
            {"_id": ObjectId(campaign_id)},
            {
                "$set": {
                    "status": "sent",
                    "sent_time": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                    "metrics.total_sent": len(recipient_ids)
                },
                "$push": {"tracking": {"$each": tracking_entries}}
            }
        )
    
    @classmethod
    async def track_open(cls, campaign_id: str, user_id: str) -> Optional[Dict]:
        """
        Track an email open event.
        
        Args:
            campaign_id: Campaign ID
            user_id: User ID who opened the email
            
        Returns:
            Dict: Updated campaign document or None if not found
        """
        now = datetime.now(timezone.utc)
        
        # Find the campaign and check if this user already opened
        campaign = await cls.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return None
        
        for entry in campaign.get("tracking", []):
            if entry.get("user_id") == user_id and entry.get("opened", False):
                # Already tracked open for this user
                return campaign
        
        # Update opened count and tracking data for this user
        return await cls.update_one(
            {
                "_id": ObjectId(campaign_id),
                "tracking.user_id": user_id
            },
            {
                "$inc": {"metrics.opened": 1},
                "$set": {
                    "tracking.$.opened": True,
                    "tracking.$.opened_at": now,
                    "updated_at": now
                }
            }
        )
    
    @classmethod
    async def track_click(cls, campaign_id: str, user_id: str, link_url: str) -> Optional[Dict]:
        """
        Track an email link click event.
        
        Args:
            campaign_id: Campaign ID
            user_id: User ID who clicked the link
            link_url: URL that was clicked
            
        Returns:
            Dict: Updated campaign document or None if not found
        """
        now = datetime.now(timezone.utc)
        
        # Find the campaign and check if this user already clicked
        campaign = await cls.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return None
        
        for entry in campaign.get("tracking", []):
            if entry.get("user_id") == user_id and entry.get("clicked", False):
                # Already tracked click for this user
                return campaign
        
        # Update clicked count and tracking data for this user
        return await cls.update_one(
            {
                "_id": ObjectId(campaign_id),
                "tracking.user_id": user_id
            },
            {
                "$inc": {"metrics.clicked": 1},
                "$set": {
                    "tracking.$.clicked": True,
                    "tracking.$.clicked_at": now,
                    "updated_at": now
                },
                "$push": {
                    "tracking.$.clicks": {
                        "url": link_url,
                        "timestamp": now
                    }
                }
            }
        )
    
    @classmethod
    async def get_campaign_metrics(cls, campaign_id: str) -> Optional[Dict]:
        """
        Get detailed metrics for a campaign.
        
        Args:
            campaign_id: Campaign ID
            
        Returns:
            Dict: Campaign metrics or None if not found
        """
        campaign = await cls.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return None
        
        metrics = campaign.get("metrics", {})
        
        # Calculate rates
        total_sent = metrics.get("total_sent", 0)
        open_rate = (metrics.get("opened", 0) / total_sent * 100) if total_sent > 0 else 0
        click_rate = (metrics.get("clicked", 0) / total_sent * 100) if total_sent > 0 else 0
        bounce_rate = (metrics.get("bounced", 0) / total_sent * 100) if total_sent > 0 else 0
        
        return {
            "campaign_id": str(campaign["_id"]),
            "name": campaign.get("name"),
            "status": campaign.get("status"),
            "sent_time": campaign.get("sent_time"),
            "total_sent": total_sent,
            "opened": metrics.get("opened", 0),
            "clicked": metrics.get("clicked", 0),
            "bounced": metrics.get("bounced", 0),
            "open_rate": round(open_rate, 2),
            "click_rate": round(click_rate, 2),
            "bounce_rate": round(bounce_rate, 2),
            "click_to_open_rate": round((metrics.get("clicked", 0) / metrics.get("opened", 0) * 100), 2) 
                                 if metrics.get("opened", 0) > 0 else 0
        }