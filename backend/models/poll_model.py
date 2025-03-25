"""
Poll model module for handling polling functionality.
Based on the PollSchema.
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone, timedelta
from bson import ObjectId

from .base_model import BaseModel


class PollModel(BaseModel):
    """
    Model for poll data operations.
    Handles all database interactions for polls and polling options.
    """
    collection_name = "polls"
    
    @classmethod
    async def create_poll(cls, event_id: str, created_by: str, question: str, 
                       options: List[Dict], is_multiple_choice: bool = False,
                       duration: int = 60, session_id: Optional[str] = None) -> str:
        """
        Create a new poll.
        
        Args:
            event_id: ID of the event this poll belongs to
            created_by: ID of the user creating the poll
            question: Poll question
            options: List of poll options (each with "text" field)
            is_multiple_choice: Whether users can select multiple options
            duration: Duration of the poll in seconds
            session_id: Optional session ID if poll is for a specific session
            
        Returns:
            str: ID of the created poll
        """
        now = datetime.now(timezone.utc)
        
        # Initialize vote counts for each option
        for option in options:
            if "votes" not in option:
                option["votes"] = 0
        
        poll_data = {
            "event_id": event_id,
            "created_by": created_by,
            "question": question,
            "options": options,
            "is_multiple_choice": is_multiple_choice,
            "duration": duration,
            "status": "active",
            "voters": [],
            "created_at": now,
            "ends_at": now + timedelta(seconds=duration)
        }
        
        if session_id:
            poll_data["session_id"] = session_id
        
        poll_id = await cls.insert_one(poll_data)
        return str(poll_id)
    
    @classmethod
    async def get_poll_by_id(cls, poll_id: str) -> Dict:
        """
        Get poll details by ID and update status if needed.
        
        Args:
            poll_id: Poll ID
            
        Returns:
            Dict: Poll document or None if not found
        """
        poll = await cls.find_one({"_id": ObjectId(poll_id)})
        
        # Auto-update status if the poll has expired
        if poll and poll["status"] == "active" and poll["ends_at"] < datetime.now(timezone.utc):
            poll["status"] = "closed"
            await cls.update_one(
                {"_id": ObjectId(poll_id)},
                {"$set": {"status": "closed"}}
            )
            
        return poll
    
    @classmethod
    async def get_event_polls(cls, event_id: str, status: Optional[str] = None, 
                           session_id: Optional[str] = None) -> List[Dict]:
        """
        Get all polls for a specific event.
        
        Args:
            event_id: Event ID
            status: Optional status filter ("active" or "closed")
            session_id: Optional session ID filter
            
        Returns:
            List[Dict]: List of poll documents
        """
        query = {"event_id": event_id}
        
        if status:
            query["status"] = status
            
        if session_id:
            query["session_id"] = session_id
            
        polls = await cls.find_many(query, sort=[("created_at", -1)])
        
        # Auto-update status for any expired polls
        now = datetime.now(timezone.utc)
        for poll in polls:
            if poll["status"] == "active" and poll["ends_at"] < now:
                poll["status"] = "closed"
                await cls.update_one(
                    {"_id": ObjectId(poll["_id"])},
                    {"$set": {"status": "closed"}}
                )
                
        return polls
    
    @classmethod
    async def vote_on_poll(cls, poll_id: str, user_id: str, option_indices: List[int]) -> Optional[Dict]:
        """
        Cast vote(s) on a poll.
        
        Args:
            poll_id: Poll ID
            user_id: ID of the user voting
            option_indices: Indices of options being voted for
            
        Returns:
            Dict: Updated poll document or None if not found, closed, or already voted
        """
        poll = await cls.get_poll_by_id(poll_id)
        if not poll:
            return None
            
        # Check if poll is active
        if poll["status"] != "active":
            return None
            
        # Check if poll has expired
        if poll["ends_at"] < datetime.now(timezone.utc):
            await cls.update_one(
                {"_id": ObjectId(poll_id)},
                {"$set": {"status": "closed"}}
            )
            return None
            
        # Check if user has already voted
        if user_id in poll.get("voters", []):
            return None
            
        # Validate option indices
        if not option_indices or any(idx < 0 or idx >= len(poll["options"]) for idx in option_indices):
            return None
            
        # For single-choice polls, only take the first selected option
        if not poll["is_multiple_choice"] and len(option_indices) > 1:
            option_indices = [option_indices[0]]
            
        # Update vote counts and add user to voters
        for idx in option_indices:
            await cls.update_one(
                {"_id": ObjectId(poll_id)},
                {"$inc": {f"options.{idx}.votes": 1}}
            )
            
        await cls.update_one(
            {"_id": ObjectId(poll_id)},
            {"$addToSet": {"voters": user_id}}
        )
        
        return await cls.get_poll_by_id(poll_id)
    
    @classmethod
    async def close_poll(cls, poll_id: str) -> Optional[Dict]:
        """
        Manually close a poll.
        
        Args:
            poll_id: Poll ID
            
        Returns:
            Dict: Updated poll document or None if not found
        """
        return await cls.update_one(
            {"_id": ObjectId(poll_id)},
            {"$set": {"status": "closed"}}
        )
    
    @classmethod
    async def extend_poll(cls, poll_id: str, additional_seconds: int) -> Optional[Dict]:
        """
        Extend the duration of an active poll.
        
        Args:
            poll_id: Poll ID
            additional_seconds: Additional seconds to extend the poll
            
        Returns:
            Dict: Updated poll document or None if not found or closed
        """
        poll = await cls.get_poll_by_id(poll_id)
        if not poll or poll["status"] != "active":
            return None
            
        # Calculate new end time
        new_end_time = max(
            poll["ends_at"],
            datetime.now(timezone.utc)
        ) + timedelta(seconds=additional_seconds)
        
        return await cls.update_one(
            {"_id": ObjectId(poll_id)},
            {"$set": {"ends_at": new_end_time}}
        )
    
    @classmethod
    async def get_poll_results(cls, poll_id: str) -> Optional[Dict]:
        """
        Get detailed results for a poll.
        
        Args:
            poll_id: Poll ID
            
        Returns:
            Dict: Poll results summary or None if not found
        """
        poll = await cls.get_poll_by_id(poll_id)
        if not poll:
            return None
            
        total_votes = sum(option["votes"] for option in poll["options"])
        total_voters = len(poll.get("voters", []))
        
        options_with_percentage = []
        for option in poll["options"]:
            percentage = (option["votes"] / total_votes * 100) if total_votes > 0 else 0
            options_with_percentage.append({
                "text": option["text"],
                "votes": option["votes"],
                "percentage": round(percentage, 1)
            })
            
        return {
            "poll_id": poll_id,
            "question": poll["question"],
            "options": options_with_percentage,
            "total_votes": total_votes,
            "total_voters": total_voters,
            "status": poll["status"],
            "created_at": poll["created_at"],
            "ends_at": poll["ends_at"]
        }
    
    @classmethod
    async def delete_poll(cls, poll_id: str) -> bool:
        """
        Delete a poll.
        
        Args:
            poll_id: Poll ID
            
        Returns:
            bool: True if deleted, False otherwise
        """
        deleted_count = await cls.delete_one({"_id": ObjectId(poll_id)})
        return deleted_count > 0