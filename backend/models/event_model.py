"""
Event model module for handling event data.
Based on the EventSchema.
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from bson import ObjectId

from .base_model import BaseModel


class EventModel(BaseModel):
    """
    Model for event data operations.
    Handles all database interactions for events.
    """
    collection_name = "events"
    
    @classmethod
    async def create_event(cls, name: str, description: Optional[str], event_type: str,
                        start_date: datetime, end_date: datetime, is_virtual: bool,
                        virtual_meeting_url: str, organizer_id: str, venue_id: str,
                        capacity: int, participants: List[str] = None) -> str:
        """
        Create a new event.
        
        Args:
            name: Event name
            description: Event description
            event_type: Type of event
            start_date: Start date and time
            end_date: End date and time
            is_virtual: Whether this is a virtual event
            virtual_meeting_url: URL for virtual meeting
            organizer_id: ID of the event organizer
            venue_id: ID of the venue
            capacity: Maximum number of participants
            participants: List of user IDs participating in the event
            
        Returns:
            str: ID of the created event
        """
        if participants is None:
            participants = []
            
        event_data = {
            "name": name,
            "description": description,
            "event_type": event_type,
            "start_date": start_date,
            "end_date": end_date,
            "is_virtual": is_virtual,
            "virtual_meeting_url": virtual_meeting_url,
            "organizer_id": organizer_id,
            "venue_id": venue_id,
            "capacity": capacity,
            "participants": participants,
            "created_at": datetime.now(timezone.utc)
        }
        
        event_id = await cls.insert_one(event_data)
        return str(event_id)
    
    @classmethod
    async def get_event_by_id(cls, event_id: str) -> Dict:
        """
        Get event details by ID.
        
        Args:
            event_id: Event ID
            
        Returns:
            Dict: Event document or None if not found
        """
        return await cls.find_one({"_id": ObjectId(event_id)})
    
    @classmethod
    async def update_event(cls, event_id: str, update_data: Dict) -> Optional[Dict]:
        """
        Update event information.
        
        Args:
            event_id: Event ID
            update_data: Dictionary containing fields to update
            
        Returns:
            Dict: Updated event document or None if not found
        """
        # Ensure we only update allowed fields
        allowed_fields = [
            "name", "description", "event_type", "start_date", "end_date",
            "is_virtual", "virtual_meeting_url", "venue_id", "capacity"
        ]
        filtered_update = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        return await cls.update_one(
            {"_id": ObjectId(event_id)},
            {"$set": filtered_update}
        )
    
    @classmethod
    async def delete_event(cls, event_id: str) -> bool:
        """
        Delete an event.
        
        Args:
            event_id: Event ID
            
        Returns:
            bool: True if deleted, False otherwise
        """
        deleted_count = await cls.delete_one({"_id": ObjectId(event_id)})
        return deleted_count > 0
    
    @classmethod
    async def get_events_by_organizer(cls, organizer_id: str) -> List[Dict]:
        """
        Get all events organized by a specific user.
        
        Args:
            organizer_id: User ID of the organizer
            
        Returns:
            List[Dict]: List of event documents
        """
        return await cls.find_many({"organizer_id": organizer_id})
    
    @classmethod
    async def get_upcoming_events(cls, limit: int = 10, skip: int = 0) -> List[Dict]:
        """
        Get upcoming events.
        
        Args:
            limit: Maximum number of events to return
            skip: Number of events to skip (for pagination)
            
        Returns:
            List[Dict]: List of upcoming event documents
        """
        now = datetime.now(timezone.utc)
        return await cls.find_many(
            {"start_date": {"$gt": now}},
            limit=limit,
            skip=skip,
            sort=[("start_date", 1)]
        )
    
    @classmethod
    async def search_events(cls, query: str, event_type: Optional[str] = None,
                         is_virtual: Optional[bool] = None, limit: int = 10,
                         skip: int = 0) -> List[Dict]:
        """
        Search for events.
        
        Args:
            query: Search query
            event_type: Optional event type filter
            is_virtual: Optional virtual event filter
            limit: Maximum number of events to return
            skip: Number of events to skip (for pagination)
            
        Returns:
            List[Dict]: List of matching event documents
        """
        search_criteria = {
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}}
            ]
        }
        
        if event_type:
            search_criteria["event_type"] = event_type
            
        if is_virtual is not None:
            search_criteria["is_virtual"] = is_virtual
            
        return await cls.find_many(
            search_criteria,
            limit=limit,
            skip=skip,
            sort=[("start_date", 1)]
        )
    
    @classmethod
    async def add_participant(cls, event_id: str, user_id: str) -> Optional[Dict]:
        """
        Add a participant to an event.
        
        Args:
            event_id: Event ID
            user_id: User ID to add
            
        Returns:
            Dict: Updated event document or None if not found or at capacity
        """
        event = await cls.get_event_by_id(event_id)
        if not event:
            return None
            
        # Check if event is at capacity
        if len(event.get("participants", [])) >= event.get("capacity", 0) and event.get("capacity", 0) > 0:
            return None
            
        return await cls.update_one(
            {"_id": ObjectId(event_id)},
            {"$addToSet": {"participants": user_id}}
        )
    
    @classmethod
    async def remove_participant(cls, event_id: str, user_id: str) -> Optional[Dict]:
        """
        Remove a participant from an event.
        
        Args:
            event_id: Event ID
            user_id: User ID to remove
            
        Returns:
            Dict: Updated event document or None if not found
        """
        return await cls.update_one(
            {"_id": ObjectId(event_id)},
            {"$pull": {"participants": user_id}}
        )
    
    @classmethod
    async def get_event_participants(cls, event_id: str) -> List[str]:
        """
        Get all participants for an event.
        
        Args:
            event_id: Event ID
            
        Returns:
            List[str]: List of participant user IDs
        """
        event = await cls.get_event_by_id(event_id)
        return event.get("participants", []) if event else []
    
    @classmethod
    async def check_participant(cls, event_id: str, user_id: str) -> bool:
        """
        Check if a user is a participant in an event.
        
        Args:
            event_id: Event ID
            user_id: User ID to check
            
        Returns:
            bool: True if user is a participant, False otherwise
        """
        participants = await cls.get_event_participants(event_id)
        return user_id in participants
    
    @classmethod
    async def get_event_types(cls) -> List[str]:
        """
        Get a list of supported event types.
        
        Returns:
            List[str]: List of supported event types
        """
        return ["conference", "seminar", "workshop", "webinar"]
    
    @classmethod
    async def generate_calendar_event(cls, event_id: str, calendar_type: str = "google") -> Dict:
        """
        Generate calendar event data for third-party calendar services.
        
        Args:
            event_id: Event ID
            calendar_type: Type of calendar service ("google" or "outlook")
            
        Returns:
            Dict: Calendar event data in the appropriate format
        """
        event = await cls.get_event_by_id(event_id)
        if not event:
            return None
            
        # Common fields for all calendar types
        calendar_data = {
            "summary": event["name"],
            "description": event["description"],
            "start": {
                "dateTime": event["start_date"].isoformat(),
                "timeZone": "UTC"
            },
            "end": {
                "dateTime": event["end_date"].isoformat(),
                "timeZone": "UTC"
            },
            "location": "" # Will need to get venue details
        }
        
        # Get venue information if available
        if "venue_id" in event and event["venue_id"]:
            from .venue_model import VenueModel
            venue = await VenueModel.get_venue_by_id(event["venue_id"])
            if venue:
                location_parts = [venue["name"], venue["address"], venue["city"]]
                if "state" in venue and venue["state"]:
                    location_parts.append(venue["state"])
                location_parts.append(venue["country"])
                calendar_data["location"] = ", ".join(location_parts)
        
        # Add virtual meeting URL if virtual event
        if event.get("is_virtual", False) and "virtual_meeting_url" in event:
            calendar_data["description"] += f"\n\nVirtual Meeting URL: {event['virtual_meeting_url']}"
            
        # Format data according to calendar type
        if calendar_type == "outlook":
            # Convert to Outlook format if needed
            pass
            
        return calendar_data
    
    @classmethod
    async def get_event_stakeholders(cls, event_id: str) -> List[Dict]:
        """
        Get all stakeholders for an event.
        
        Args:
            event_id: Event ID
            
        Returns:
            List[Dict]: List of stakeholder user documents
        """
        event = await cls.get_event_by_id(event_id)
        if not event:
            return []
        
        # Get user information for all participants with "stakeholder" role
        from .user_model import UserModel
        
        stakeholders = []
        for participant_id in event["participants"]:
            user = await UserModel.get_user_by_id(participant_id)
            if user and user.get("role") == "stakeholder":
                stakeholders.append(user)
        
        return stakeholders