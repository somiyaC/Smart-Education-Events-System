"""
Email model module for handling email functionality.
Based on the Email Schema.
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone, timedelta
from bson import ObjectId

from .base_model import BaseModel

class EmailCampaignModel(BaseModel):
    collection_name = "email_campaigns"
    
    @classmethod
    async def create_campaign(cls, event_id: str, name: str, subject: str, 
                              body_html: str, body_text: str, audience: Dict, 
                              sender_name: str, sender_email: str) -> str:
        campaign_data = {
            "event_id": event_id,
            "name": name,
            "subject": subject,
            "body_html": body_html,
            "body_text": body_text,
            "audience": audience,
            "sender_name": sender_name,
            "sender_email": sender_email,
            "status": "draft",
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
            "tracking": []
        }
        campaign_id = await cls.insert_one(campaign_data)
        return str(campaign_id)
    
    @classmethod
    async def schedule_campaign(cls, campaign_id: str, schedule_time: datetime) -> Optional[Dict]:
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
        now = datetime.now(timezone.utc)
        campaign = await cls.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return None
        
        for entry in campaign.get("tracking", []):
            if entry.get("user_id") == user_id and entry.get("opened", False):
                return campaign
        
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
        now = datetime.now(timezone.utc)
        campaign = await cls.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return None
        
        for entry in campaign.get("tracking", []):
            if entry.get("user_id") == user_id and entry.get("clicked", False):
                return campaign
        
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
        campaign = await cls.find_one({"_id": ObjectId(campaign_id)})
        if not campaign:
            return None
        
        metrics = campaign.get("metrics", {})
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
            "click_to_open_rate": round(
                (metrics.get("clicked", 0) / metrics.get("opened", 0) * 100),
                2
            ) if metrics.get("opened", 0) > 0 else 0
        }

class EmailModel(BaseModel):
    collection_name = "email_logs"

    @classmethod
    async def send_email(cls, to: str, subject: str, body: str, db):
        log_data = {
            "to": to,
            "subject": subject,
            "body": body,
            "sent_at": datetime.now(timezone.utc)
        }
        await cls.insert_one(log_data)
