"""
Feedback model module for handling event and session feedback.
Based on the FeedbackSchema.
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from bson import ObjectId

from .base_model import BaseModel


class FeedbackModel(BaseModel):
    """
    Model for feedback data operations.
    Handles all database interactions for event and session feedback.
    """
    collection_name = "feedback"
    
    @classmethod
    async def create_feedback(cls, user_id: str, event_id: str, rating: int,
                           comment: Optional[str] = None, session_id: Optional[str] = None,
                           content_quality: Optional[int] = None, 
                           speaker_quality: Optional[int] = None,
                           venue_quality: Optional[int] = None, 
                           organization_quality: Optional[int] = None,
                           would_recommend: bool = False, 
                           improvement_suggestions: Optional[str] = None,
                           is_anonymous: bool = False) -> str:
        """
        Create a new feedback entry.
        
        Args:
            user_id: ID of the user providing feedback
            event_id: ID of the event
            rating: Overall rating (1-5)
            comment: Optional comment
            session_id: Optional session ID if feedback is for a specific session
            content_quality: Optional content quality rating (1-5)
            speaker_quality: Optional speaker quality rating (1-5)
            venue_quality: Optional venue quality rating (1-5)
            organization_quality: Optional organization quality rating (1-5)
            would_recommend: Whether the user would recommend the event
            improvement_suggestions: Optional improvement suggestions
            is_anonymous: Whether the feedback should be anonymous
            
        Returns:
            str: ID of the created feedback
        """
        feedback_data = {
            "user_id": user_id,
            "event_id": event_id,
            "rating": rating,
            "comment": comment,
            "would_recommend": would_recommend,
            "is_anonymous": is_anonymous,
            "created_at": datetime.now(timezone.utc)
        }
        
        # Add optional fields if provided
        if session_id:
            feedback_data["session_id"] = session_id
            
        if content_quality is not None:
            feedback_data["content_quality"] = content_quality
            
        if speaker_quality is not None:
            feedback_data["speaker_quality"] = speaker_quality
            
        if venue_quality is not None:
            feedback_data["venue_quality"] = venue_quality
            
        if organization_quality is not None:
            feedback_data["organization_quality"] = organization_quality
            
        if improvement_suggestions:
            feedback_data["improvement_suggestions"] = improvement_suggestions
        
        feedback_id = await cls.insert_one(feedback_data)
        return str(feedback_id)
    
    @classmethod
    async def get_feedback_by_id(cls, feedback_id: str) -> Dict:
        """
        Get feedback details by ID.
        
        Args:
            feedback_id: Feedback ID
            
        Returns:
            Dict: Feedback document or None if not found
        """
        return await cls.find_one({"_id": ObjectId(feedback_id)})
    
    @classmethod
    async def get_event_feedback(cls, event_id: str, include_anonymous: bool = True) -> List[Dict]:
        """
        Get all feedback for a specific event.
        
        Args:
            event_id: Event ID
            include_anonymous: Whether to include anonymous feedback
            
        Returns:
            List[Dict]: List of feedback documents
        """
        query = {"event_id": event_id}
        
        # If not including anonymous feedback, filter it out
        if not include_anonymous:
            query["is_anonymous"] = False
            
        return await cls.find_many(query, sort=[("created_at", -1)])
    
    @classmethod
    async def get_session_feedback(cls, session_id: str, include_anonymous: bool = True) -> List[Dict]:
        """
        Get all feedback for a specific session.
        
        Args:
            session_id: Session ID
            include_anonymous: Whether to include anonymous feedback
            
        Returns:
            List[Dict]: List of feedback documents
        """
        query = {"session_id": session_id}
        
        # If not including anonymous feedback, filter it out
        if not include_anonymous:
            query["is_anonymous"] = False
            
        return await cls.find_many(query, sort=[("created_at", -1)])
    
    @classmethod
    async def get_user_feedback(cls, user_id: str) -> List[Dict]:
        """
        Get all feedback submitted by a user.
        
        Args:
            user_id: User ID
            
        Returns:
            List[Dict]: List of feedback documents
        """
        return await cls.find_many({"user_id": user_id}, sort=[("created_at", -1)])
    
    @classmethod
    async def update_feedback(cls, feedback_id: str, update_data: Dict) -> Optional[Dict]:
        """
        Update a feedback entry.
        
        Args:
            feedback_id: Feedback ID
            update_data: Dictionary containing fields to update
            
        Returns:
            Dict: Updated feedback document or None if not found
        """
        # Ensure we only update allowed fields
        allowed_fields = [
            "rating", "comment", "content_quality", "speaker_quality",
            "venue_quality", "organization_quality", "would_recommend",
            "improvement_suggestions", "is_anonymous"
        ]
        filtered_update = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        return await cls.update_one(
            {"_id": ObjectId(feedback_id)},
            {"$set": filtered_update}
        )
    
    @classmethod
    async def delete_feedback(cls, feedback_id: str) -> bool:
        """
        Delete a feedback entry.
        
        Args:
            feedback_id: Feedback ID
            
        Returns:
            bool: True if deleted, False otherwise
        """
        deleted_count = await cls.delete_one({"_id": ObjectId(feedback_id)})
        return deleted_count > 0
    
    @classmethod
    async def get_event_feedback_summary(cls, event_id: str) -> Dict:
        """
        Get a summary of feedback for an event.
        
        Args:
            event_id: Event ID
            
        Returns:
            Dict: Feedback summary statistics
        """
        pipeline = [
            {"$match": {"event_id": event_id}},
            {"$group": {
                "_id": None,
                "avg_rating": {"$avg": "$rating"},
                "count": {"$sum": 1},
                "avg_content_quality": {"$avg": "$content_quality"},
                "avg_speaker_quality": {"$avg": "$speaker_quality"},
                "avg_venue_quality": {"$avg": "$venue_quality"},
                "avg_organization_quality": {"$avg": "$organization_quality"},
                "recommendation_rate": {"$avg": {"$cond": ["$would_recommend", 1, 0]}},
                "rating_1": {"$sum": {"$cond": [{"$eq": ["$rating", 1]}, 1, 0]}},
                "rating_2": {"$sum": {"$cond": [{"$eq": ["$rating", 2]}, 1, 0]}},
                "rating_3": {"$sum": {"$cond": [{"$eq": ["$rating", 3]}, 1, 0]}},
                "rating_4": {"$sum": {"$cond": [{"$eq": ["$rating", 4]}, 1, 0]}},
                "rating_5": {"$sum": {"$cond": [{"$eq": ["$rating", 5]}, 1, 0]}}
            }}
        ]
        
        results = await cls.aggregate(pipeline)
        
        if not results or len(results) == 0:
            # Return empty summary if no feedback
            return {
                "avg_rating": 0,
                "count": 0,
                "avg_content_quality": 0,
                "avg_speaker_quality": 0,
                "avg_venue_quality": 0,
                "avg_organization_quality": 0,
                "recommendation_rate": 0,
                "rating_distribution": {
                    "1": 0,
                    "2": 0,
                    "3": 0,
                    "4": 0,
                    "5": 0
                }
            }
            
        summary = results[0]
        
        # Format rating distribution
        rating_distribution = {
            "1": summary.pop("rating_1", 0),
            "2": summary.pop("rating_2", 0),
            "3": summary.pop("rating_3", 0),
            "4": summary.pop("rating_4", 0),
            "5": summary.pop("rating_5", 0)
        }
        summary["rating_distribution"] = rating_distribution
        
        # Remove the MongoDB group _id
        if "_id" in summary:
            del summary["_id"]
            
        # Round averages to 2 decimal places
        for key in summary:
            if isinstance(summary[key], float):
                summary[key] = round(summary[key], 2)
                
        return summary
    
    @classmethod
    async def get_session_feedback_summary(cls, session_id: str) -> Dict:
        """
        Get a summary of feedback for a session.
        
        Args:
            session_id: Session ID
            
        Returns:
            Dict: Feedback summary statistics
        """
        pipeline = [
            {"$match": {"session_id": session_id}},
            {"$group": {
                "_id": None,
                "avg_rating": {"$avg": "$rating"},
                "count": {"$sum": 1},
                "avg_content_quality": {"$avg": "$content_quality"},
                "avg_speaker_quality": {"$avg": "$speaker_quality"},
                "rating_1": {"$sum": {"$cond": [{"$eq": ["$rating", 1]}, 1, 0]}},
                "rating_2": {"$sum": {"$cond": [{"$eq": ["$rating", 2]}, 1, 0]}},
                "rating_3": {"$sum": {"$cond": [{"$eq": ["$rating", 3]}, 1, 0]}},
                "rating_4": {"$sum": {"$cond": [{"$eq": ["$rating", 4]}, 1, 0]}},
                "rating_5": {"$sum": {"$cond": [{"$eq": ["$rating", 5]}, 1, 0]}}
            }}
        ]
        
        results = await cls.aggregate(pipeline)
        
        if not results or len(results) == 0:
            # Return empty summary if no feedback
            return {
                "avg_rating": 0,
                "count": 0,
                "avg_content_quality": 0,
                "avg_speaker_quality": 0,
                "rating_distribution": {
                    "1": 0,
                    "2": 0,
                    "3": 0,
                    "4": 0,
                    "5": 0
                }
            }
            
        summary = results[0]
        
        # Format rating distribution
        rating_distribution = {
            "1": summary.pop("rating_1", 0),
            "2": summary.pop("rating_2", 0),
            "3": summary.pop("rating_3", 0),
            "4": summary.pop("rating_4", 0),
            "5": summary.pop("rating_5", 0)
        }
        summary["rating_distribution"] = rating_distribution
        
        # Remove the MongoDB group _id
        if "_id" in summary:
            del summary["_id"]
            
        # Round averages to 2 decimal places
        for key in summary:
            if isinstance(summary[key], float):
                summary[key] = round(summary[key], 2)
                
        return summary