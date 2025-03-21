"""
Question model module for handling Q&A functionality.
Based on the QuestionSchema.
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone, timedelta
from bson import ObjectId

from .base_model import BaseModel

class QuestionModel(BaseModel):
    """
    Model for Q&A sessions.
    Handles all database interactions for questions during sessions.
    """
    collection_name = "questions"
    
    @classmethod
    async def add_question(cls, session_id: str, user_id: str, question_text: str, 
                        is_anonymous: bool = False) -> str:
        """
        Add a question during a Q&A session.
        
        Args:
            session_id: Session ID
            user_id: User ID asking the question
            question_text: The question text
            is_anonymous: Whether the question should be anonymous
            
        Returns:
            str: ID of the created question
        """
        now = datetime.now(timezone.utc)
        
        question_data = {
            "session_id": session_id,
            "user_id": user_id,
            "question_text": question_text,
            "is_anonymous": is_anonymous,
            "status": "pending",  # pending, answered, dismissed
            "votes": 0,
            "voters": [],
            "created_at": now,
            "answered_at": None,
            "answer_text": None
        }
        
        question_id = await cls.insert_one(question_data)
        return str(question_id)
    
    @classmethod
    async def upvote_question(cls, question_id: str, user_id: str) -> Optional[Dict]:
        """
        Upvote a question.
        
        Args:
            question_id: Question ID
            user_id: User ID upvoting the question
            
        Returns:
            Dict: Updated question document or None if not found
        """
        question = await cls.find_one({"_id": ObjectId(question_id)})
        if not question or user_id in question.get("voters", []):
            return None
            
        return await cls.update_one(
            {"_id": ObjectId(question_id)},
            {
                "$inc": {"votes": 1},
                "$addToSet": {"voters": user_id}
            }
        )
    
    @classmethod
    async def answer_question(cls, question_id: str, answer_text: str) -> Optional[Dict]:
        """
        Answer a question.
        
        Args:
            question_id: Question ID
            answer_text: The answer text
            
        Returns:
            Dict: Updated question document or None if not found
        """
        now = datetime.now(timezone.utc)
        
        return await cls.update_one(
            {"_id": ObjectId(question_id)},
            {
                "$set": {
                    "status": "answered",
                    "answer_text": answer_text,
                    "answered_at": now
                }
            }
        )
    
    @classmethod
    async def get_session_questions(cls, session_id: str, 
                                 status: Optional[str] = None) -> List[Dict]:
        """
        Get questions for a session.
        
        Args:
            session_id: Session ID
            status: Optional status filter (pending, answered, dismissed)
            
        Returns:
            List[Dict]: List of question documents sorted by votes
        """
        query = {"session_id": session_id}
        
        if status:
            query["status"] = status
            
        return await cls.find_many(query, sort=[("votes", -1), ("created_at", 1)])