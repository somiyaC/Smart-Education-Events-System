"""
Session model module for handling event sessions.
Based on the SessionSchema.
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone, timedelta
from bson import ObjectId

from .base_model import BaseModel


class SessionModel(BaseModel):
    """
    Model for session data operations.
    Handles all database interactions for event sessions.
    """
    collection_name = "sessions"
    
    @classmethod
    async def create_session(cls, event_id: str, title: str, start_time: datetime,
                          end_time: datetime, session_type: str,
                          description: Optional[str] = None, speaker_id: Optional[str] = None,
                          location: Optional[str] = None, capacity: int = 0,
                          materials: Optional[str] = None, attendees_ids: List[str] = None) -> str:
        """
        Create a new session for an event.
        
        Args:
            event_id: ID of the event this session belongs to
            title: Session title
            start_time: Start time of the session
            end_time: End time of the session
            session_type: Type of session (presentation, workshop, panel, networking, breakout)
            description: Optional description of the session
            speaker_id: Optional ID of the session speaker
            location: Optional location of the session
            capacity: Maximum number of attendees (0 means unlimited)
            materials: Optional materials for the session
            attendees_ids: Optional list of user IDs attending the session
            
        Returns:
            str: ID of the created session
        """
        if attendees_ids is None:
            attendees_ids = []
            
        session_data = {
            "event_id": event_id,
            "title": title,
            "start_time": start_time,
            "end_time": end_time,
            "session_type": session_type,
            "capacity": capacity,
            "attendees_ids": attendees_ids,
            "created_at": datetime.now(timezone.utc)
        }
        
        # Add optional fields if provided
        if description:
            session_data["description"] = description
            
        if speaker_id:
            session_data["speaker_id"] = speaker_id
            
        if location:
            session_data["location"] = location
            
        if materials:
            session_data["materials"] = materials
        
        session_id = await cls.insert_one(session_data)
        return str(session_id)
    
    @classmethod
    async def get_session_by_id(cls, session_id: str) -> Dict:
        """
        Get session details by ID.
        
        Args:
            session_id: Session ID
            
        Returns:
            Dict: Session document or None if not found
        """
        return await cls.find_one({"_id": ObjectId(session_id)})
    
    @classmethod
    async def update_session(cls, session_id: str, update_data: Dict) -> Optional[Dict]:
        """
        Update session information.
        
        Args:
            session_id: Session ID
            update_data: Dictionary containing fields to update
            
        Returns:
            Dict: Updated session document or None if not found
        """
        # Ensure we only update allowed fields
        allowed_fields = [
            "title", "description", "start_time", "end_time", "location",
            "session_type", "speaker_id", "capacity", "materials"
        ]
        filtered_update = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        return await cls.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": filtered_update}
        )
    
    @classmethod
    async def delete_session(cls, session_id: str) -> bool:
        """
        Delete a session.
        
        Args:
            session_id: Session ID
            
        Returns:
            bool: True if deleted, False otherwise
        """
        deleted_count = await cls.delete_one({"_id": ObjectId(session_id)})
        return deleted_count > 0
    
    @classmethod
    async def get_event_sessions(cls, event_id: str, session_type: Optional[str] = None) -> List[Dict]:
        """
        Get all sessions for a specific event.
        
        Args:
            event_id: Event ID
            session_type: Optional session type filter
            
        Returns:
            List[Dict]: List of session documents
        """
        query = {"event_id": event_id}
        
        if session_type:
            query["session_type"] = session_type
            
        return await cls.find_many(query, sort=[("start_time", 1)])
    
    @classmethod
    async def get_speaker_sessions(cls, speaker_id: str) -> List[Dict]:
        """
        Get all sessions for a specific speaker.
        
        Args:
            speaker_id: Speaker ID
            
        Returns:
            List[Dict]: List of session documents
        """
        return await cls.find_many({"speaker_id": speaker_id}, sort=[("start_time", 1)])
    
    @classmethod
    async def add_attendee(cls, session_id: str, user_id: str) -> Optional[Dict]:
        """
        Add an attendee to a session.
        
        Args:
            session_id: Session ID
            user_id: User ID to add
            
        Returns:
            Dict: Updated session document or None if not found or at capacity
        """
        session = await cls.get_session_by_id(session_id)
        if not session:
            return None
            
        # Check if session is at capacity (capacity of 0 means unlimited)
        if session.get("capacity", 0) > 0 and len(session.get("attendees_ids", [])) >= session["capacity"]:
            return None
            
        return await cls.update_one(
            {"_id": ObjectId(session_id)},
            {"$addToSet": {"attendees_ids": user_id}}
        )
    
    @classmethod
    async def remove_attendee(cls, session_id: str, user_id: str) -> Optional[Dict]:
        """
        Remove an attendee from a session.
        
        Args:
            session_id: Session ID
            user_id: User ID to remove
            
        Returns:
            Dict: Updated session document or None if not found
        """
        return await cls.update_one(
            {"_id": ObjectId(session_id)},
            {"$pull": {"attendees_ids": user_id}}
        )
    
    @classmethod
    async def get_session_attendees(cls, session_id: str) -> List[str]:
        """
        Get all attendees for a session.
        
        Args:
            session_id: Session ID
            
        Returns:
            List[str]: List of attendee user IDs
        """
        session = await cls.get_session_by_id(session_id)
        return session.get("attendees_ids", []) if session else []
    
    @classmethod
    async def get_user_sessions(cls, user_id: str, event_id: Optional[str] = None) -> List[Dict]:
        """
        Get all sessions a user is attending.
        
        Args:
            user_id: User ID
            event_id: Optional event ID filter
            
        Returns:
            List[Dict]: List of session documents
        """
        query = {"attendees_ids": user_id}
        
        if event_id:
            query["event_id"] = event_id
            
        return await cls.find_many(query, sort=[("start_time", 1)])
    
    @classmethod
    async def check_attendee(cls, session_id: str, user_id: str) -> bool:
        """
        Check if a user is an attendee of a session.
        
        Args:
            session_id: Session ID
            user_id: User ID to check
            
        Returns:
            bool: True if user is an attendee, False otherwise
        """
        attendees = await cls.get_session_attendees(session_id)
        return user_id in attendees
    
    @classmethod
    async def get_concurrent_sessions(cls, event_id: str, start_time: datetime, 
                                   end_time: datetime) -> List[Dict]:
        """
        Get all sessions that occur during a specific time period.
        
        Args:
            event_id: Event ID
            start_time: Start time to check
            end_time: End time to check
            
        Returns:
            List[Dict]: List of concurrent session documents
        """
        return await cls.find_many({
            "event_id": event_id,
            "$or": [
                # Session starts during the time period
                {"start_time": {"$gte": start_time, "$lt": end_time}},
                # Session ends during the time period
                {"end_time": {"$gt": start_time, "$lte": end_time}},
                # Session encompasses the entire time period
                {"$and": [
                    {"start_time": {"$lte": start_time}},
                    {"end_time": {"$gte": end_time}}
                ]}
            ]
        }, sort=[("start_time", 1)])
    
    @classmethod
    async def check_speaker_availability(cls, speaker_id: str, start_time: datetime, 
                                    end_time: datetime) -> Dict:
        """
        Check if a speaker is available during a specific time slot.
        
        Args:
            speaker_id: Speaker's user ID
            start_time: Start time to check
            end_time: End time to check
            
        Returns:
            Dict: Availability result with status and any conflicting sessions
        """
        # Find sessions where this speaker is already assigned during the given time
        conflicts = await cls.find_many({
            "speaker_id": speaker_id,
            "$or": [
                # Session starts during the time period
                {"start_time": {"$gte": start_time, "$lt": end_time}},
                # Session ends during the time period
                {"end_time": {"$gt": start_time, "$lte": end_time}},
                # Session encompasses the entire time period
                {"$and": [
                    {"start_time": {"$lte": start_time}},
                    {"end_time": {"$gte": end_time}}
                ]}
            ]
        })
        
        if not conflicts:
            return {"available": True, "conflicts": []}
        
        # Format conflict information
        conflict_info = []
        for session in conflicts:
            conflict_info.append({
                "session_id": str(session["_id"]),
                "title": session["title"],
                "start_time": session["start_time"],
                "end_time": session["end_time"],
                "event_id": session["event_id"]
            })
        
        return {
            "available": False,
            "conflicts": conflict_info
        }
    
    @classmethod
    async def get_user_personalized_agenda(cls, user_id: str, event_id: str) -> List[Dict]:
        """
        Get a personalized agenda for a user based on their registered sessions.
        
        Args:
            user_id: User ID
            event_id: Event ID
            
        Returns:
            List[Dict]: List of session documents in chronological order
        """
        # Get all sessions for the event
        sessions = await cls.get_user_sessions(user_id, event_id)
        
        # Sort by start time
        return sorted(sessions, key=lambda x: x["start_time"])
    
    @classmethod
    async def generate_event_reminders(cls, event_id: str, days_before: int = 1) -> List[Dict]:
        """
        Generate reminder data for an event.
        
        Args:
            event_id: Event ID
            days_before: Number of days before the event to send reminder
            
        Returns:
            List[Dict]: List of reminder data including user IDs and message content
        """
        event = await cls.get_event_by_id(event_id)
        if not event:
            return []
        
        # Get all participants who should receive notifications
        from .user_model import UserModel
        
        reminders = []
        for participant_id in event["participants"]:
            participant = await UserModel.get_user_by_id(participant_id)
            if participant and participant.get("receive_notifications", True):
                reminder_time = event["start_date"] - timedelta(days=days_before)
                
                reminders.append({
                    "user_id": participant_id,
                    "event_id": event_id,
                    "event_name": event["name"],
                    "reminder_time": reminder_time,
                    "message": f"Reminder: {event['name']} starts on {event['start_date'].strftime('%B %d, %Y at %I:%M %p')}",
                    "email": participant.get("email")
                })
        
        return reminders