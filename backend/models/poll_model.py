"""
Poll model module for handling polling functionality.
Based on the PollSchema.
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import uuid
from dateutil import parser  # pip install python-dateutil

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
        # Store the creation time and ends_at as UTC-aware datetimes
        now_utc = datetime.now(timezone.utc)
        ends_at_utc = now_utc + timedelta(seconds=duration)

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
            "created_at": now_utc,
            "ends_at": ends_at_utc
        }

        if session_id:
            poll_data["session_id"] = session_id

        # Generate a unique poll_id (UUID)
        poll_data["poll_id"] = str(uuid.uuid4())

        poll_id = await cls.insert_one(poll_data)
        return str(poll_id)

    @classmethod
    async def get_poll_by_id(cls, poll_id: str) -> Dict:
        """
        Retrieve a poll document by its ID.
        Args:
            poll_id: The poll's ID as a 24-character hex string.
        Returns:
            Dict: The poll document, or None if not found.
        """
        return await cls.find_one({"_id": ObjectId(poll_id)})

    @classmethod
    async def get_event_polls(cls, event_id: str, status: Optional[str] = None, 
                              session_id: Optional[str] = None) -> List[Dict]:
        query = {"event_id": event_id}
        if status:
            query["status"] = status
        if session_id:
            query["session_id"] = session_id

        polls = await cls.find_many(query, sort=[("created_at", -1)])
        now_utc = datetime.now(timezone.utc)

        for poll in polls:
            poll_ends_at = poll.get("ends_at")

            # Ensure poll_ends_at is aware
            if isinstance(poll_ends_at, str):
                poll_ends_at = parser.parse(poll_ends_at)
            if poll_ends_at and poll_ends_at.tzinfo is None:
                poll_ends_at = poll_ends_at.replace(tzinfo=timezone.utc)

            # Compare times if poll is active
            if poll["status"] == "active" and poll_ends_at and poll_ends_at < now_utc:
                poll["status"] = "closed"
                await cls.update_one(
                    {"_id": ObjectId(poll["_id"])},
                    {"$set": {"status": "closed"}}
                )

        return polls

    @classmethod
    async def vote_on_poll(cls, poll_id: str, user_id: str, option_indices: List[int]) -> Optional[Dict]:
        poll = await cls.get_poll_by_id(poll_id)
        if not poll:
            return None

        if poll["status"] != "active":
            return None

        poll_ends_at = poll.get("ends_at")
        # Ensure poll_ends_at is aware
        if isinstance(poll_ends_at, str):
            poll_ends_at = parser.parse(poll_ends_at)
        if poll_ends_at and poll_ends_at.tzinfo is None:
            poll_ends_at = poll_ends_at.replace(tzinfo=timezone.utc)

        # If poll has ended, mark it closed and return
        if poll_ends_at and poll_ends_at < datetime.now(timezone.utc):
            await cls.update_one(
                {"_id": ObjectId(poll_id)},
                {"$set": {"status": "closed"}}
            )
            return None

        if user_id in poll.get("voters", []):
            return None

        # Validate option indices
        if not option_indices or any(idx < 0 or idx >= len(poll["options"]) for idx in option_indices):
            return None

        # If not multiple choice, only accept the first option
        if not poll["is_multiple_choice"] and len(option_indices) > 1:
            option_indices = [option_indices[0]]

        # Increment votes for each chosen option
        for idx in option_indices:
            await cls.update_one(
                {"_id": ObjectId(poll_id)},
                {"$inc": {f"options.{idx}.votes": 1}}
            )

        # Add the user to the list of voters
        await cls.update_one(
            {"_id": ObjectId(poll_id)},
            {"$addToSet": {"voters": user_id}}
        )

        return await cls.get_poll_by_id(poll_id)

    @classmethod
    async def close_poll(cls, poll_id: str) -> Optional[Dict]:
        return await cls.update_one(
            {"_id": ObjectId(poll_id)},
            {"$set": {"status": "closed"}}
        )

    @classmethod
    async def extend_poll(cls, poll_id: str, additional_seconds: int) -> Optional[Dict]:
        poll = await cls.get_poll_by_id(poll_id)
        if not poll or poll["status"] != "active":
            return None

        poll_ends_at = poll.get("ends_at")
        # Ensure poll_ends_at is aware
        if isinstance(poll_ends_at, str):
            poll_ends_at = parser.parse(poll_ends_at)
        if poll_ends_at and poll_ends_at.tzinfo is None:
            poll_ends_at = poll_ends_at.replace(tzinfo=timezone.utc)

        # Extend the poll end time to be at least now, plus additional_seconds
        now_utc = datetime.now(timezone.utc)
        new_end_time = max(poll_ends_at or now_utc, now_utc) + timedelta(seconds=additional_seconds)

        return await cls.update_one(
            {"_id": ObjectId(poll_id)},
            {"$set": {"ends_at": new_end_time}}
        )

    @classmethod
    async def get_poll_results(cls, poll_id: str) -> Optional[Dict]:
        poll = await cls.get_poll_by_id(poll_id)
        if not poll:
            return None

        total_votes = 0
        for option in poll["options"]:
            total_votes += option["votes"]

        total_voters = len(poll.get("voters", []))
        options_with_percentage = []
        for option in poll["options"]:
            # Safely compute percentage
            votes = option["votes"]
            percentage = (votes / total_votes * 100) if total_votes > 0 else 0
            options_with_percentage.append({
                "text": option.get("text") or option.get("option"),  # adapt to your schema
                "votes": votes,
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
        deleted_count = await cls.delete_one({"_id": ObjectId(poll_id)})
        return deleted_count > 0
