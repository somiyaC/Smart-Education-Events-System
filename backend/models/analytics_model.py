"""
Analytics model module for handling analytics and reporting functionality.
Based on the analytics schemas.
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from bson import ObjectId

from .base_model import BaseModel


class EventAnalyticsModel(BaseModel):
    """
    Model for event analytics data operations.
    Handles all database interactions for event analytics.
    """
    collection_name = "event_analytics"
    
    @classmethod
    async def create_analytics(cls, event_id: str) -> str:
        """
        Create a new analytics record for an event.
        
        Args:
            event_id: ID of the event
            
        Returns:
            str: ID of the created analytics record
        """
        now = datetime.now(timezone.utc)
        
        analytics_data = {
            "event_id": event_id,
            "date": now,
            "total_registrations": 0,
            "total_check_ins": 0,
            "check_in_rate": 0.0,
            "average_session_attendance": 0.0,
            "session_attendance": {},
            "most_popular_sessions": [],
            "poll_participation_rate": 0.0,
            "questions_asked_count": 0,
            "chat_messages_count": 0,
            "feedback_submission_rate": 0.0,
            "average_event_rating": 0.0,
            "average_session_rating": 0.0,
            "session_ratings": {},
            "attendance_timeline": []
        }
        
        analytics_id = await cls.insert_one(analytics_data)
        return str(analytics_id)
    
    @classmethod
    async def get_analytics_by_event_id(cls, event_id: str) -> Dict:
        """
        Get analytics for a specific event.
        
        Args:
            event_id: Event ID
            
        Returns:
            Dict: Analytics document or None if not found
        """
        return await cls.find_one({"event_id": event_id})
    
    @classmethod
    async def update_registration_count(cls, event_id: str, increment: int = 1) -> Optional[Dict]:
        """
        Update the registration count for an event.
        
        Args:
            event_id: Event ID
            increment: Amount to increment by (default: 1)
            
        Returns:
            Dict: Updated analytics document or None if not found
        """
        analytics = await cls.get_analytics_by_event_id(event_id)
        
        if not analytics:
            # Create analytics record if it doesn't exist
            await cls.create_analytics(event_id)
            analytics = await cls.get_analytics_by_event_id(event_id)
            
        total_registrations = analytics.get("total_registrations", 0) + increment
        
        # Calculate check-in rate
        total_check_ins = analytics.get("total_check_ins", 0)
        check_in_rate = (total_check_ins / total_registrations * 100) if total_registrations > 0 else 0
        
        # Add timestamp to timeline
        now = datetime.now(timezone.utc)
        attendance_timeline = analytics.get("attendance_timeline", [])
        attendance_timeline.append({
            "timestamp": now,
            "action": "registration",
            "total_registrations": total_registrations,
            "total_check_ins": total_check_ins
        })
        
        return await cls.update_one(
            {"event_id": event_id},
            {"$set": {
                "total_registrations": total_registrations,
                "check_in_rate": round(check_in_rate, 2),
                "attendance_timeline": attendance_timeline
            }}
        )
    
    @classmethod
    async def update_check_in_count(cls, event_id: str, increment: int = 1) -> Optional[Dict]:
        """
        Update the check-in count for an event.
        
        Args:
            event_id: Event ID
            increment: Amount to increment by (default: 1)
            
        Returns:
            Dict: Updated analytics document or None if not found
        """
        analytics = await cls.get_analytics_by_event_id(event_id)
        
        if not analytics:
            # Create analytics record if it doesn't exist
            await cls.create_analytics(event_id)
            analytics = await cls.get_analytics_by_event_id(event_id)
            
        total_check_ins = analytics.get("total_check_ins", 0) + increment
        
        # Calculate check-in rate
        total_registrations = analytics.get("total_registrations", 0)
        check_in_rate = (total_check_ins / total_registrations * 100) if total_registrations > 0 else 0
        
        # Add timestamp to timeline
        now = datetime.now(timezone.utc)
        attendance_timeline = analytics.get("attendance_timeline", [])
        attendance_timeline.append({
            "timestamp": now,
            "action": "check_in",
            "total_registrations": total_registrations,
            "total_check_ins": total_check_ins
        })
        
        return await cls.update_one(
            {"event_id": event_id},
            {"$set": {
                "total_check_ins": total_check_ins,
                "check_in_rate": round(check_in_rate, 2),
                "attendance_timeline": attendance_timeline
            }}
        )
    
    @classmethod
    async def update_session_attendance(cls, event_id: str, session_id: str, 
                                     attendance_count: int) -> Optional[Dict]:
        """
        Update the attendance count for a session.
        
        Args:
            event_id: Event ID
            session_id: Session ID
            attendance_count: Number of attendees for this session
            
        Returns:
            Dict: Updated analytics document or None if not found
        """
        analytics = await cls.get_analytics_by_event_id(event_id)
        
        if not analytics:
            # Create analytics record if it doesn't exist
            await cls.create_analytics(event_id)
            analytics = await cls.get_analytics_by_event_id(event_id)
            
        # Update session attendance
        session_attendance = analytics.get("session_attendance", {})
        session_attendance[session_id] = attendance_count
        
        # Calculate average session attendance
        total_attendance = sum(session_attendance.values())
        num_sessions = len(session_attendance)
        average_session_attendance = total_attendance / num_sessions if num_sessions > 0 else 0
        
        # Update most popular sessions
        sessions = [{"session_id": s_id, "attendance": count} 
                   for s_id, count in session_attendance.items()]
        most_popular_sessions = sorted(sessions, key=lambda x: x["attendance"], reverse=True)[:5]
        
        return await cls.update_one(
            {"event_id": event_id},
            {"$set": {
                "session_attendance": session_attendance,
                "average_session_attendance": round(average_session_attendance, 2),
                "most_popular_sessions": most_popular_sessions
            }}
        )
    
    @classmethod
    async def update_engagement_metrics(cls, event_id: str, poll_participants: int = None,
                                     questions_asked: int = None, chat_messages: int = None,
                                     total_participants: int = None) -> Optional[Dict]:
        """
        Update engagement metrics for an event.
        
        Args:
            event_id: Event ID
            poll_participants: Number of poll participants
            questions_asked: Number of questions asked
            chat_messages: Number of chat messages
            total_participants: Total number of participants (for calculating rates)
            
        Returns:
            Dict: Updated analytics document or None if not found
        """
        analytics = await cls.get_analytics_by_event_id(event_id)
        
        if not analytics:
            # Create analytics record if it doesn't exist
            await cls.create_analytics(event_id)
            analytics = await cls.get_analytics_by_event_id(event_id)
            
        update_data = {}
        
        if poll_participants is not None and total_participants is not None and total_participants > 0:
            poll_participation_rate = (poll_participants / total_participants * 100)
            update_data["poll_participation_rate"] = round(poll_participation_rate, 2)
            
        if questions_asked is not None:
            update_data["questions_asked_count"] = questions_asked
            
        if chat_messages is not None:
            update_data["chat_messages_count"] = chat_messages
            
        if not update_data:
            return analytics
            
        return await cls.update_one(
            {"event_id": event_id},
            {"$set": update_data}
        )
    
    @classmethod
    async def update_feedback_metrics(cls, event_id: str, feedbacks_submitted: int = None,
                                   total_participants: int = None, event_rating: float = None,
                                   session_ratings: Dict[str, float] = None) -> Optional[Dict]:
        """
        Update feedback metrics for an event.
        
        Args:
            event_id: Event ID
            feedbacks_submitted: Number of feedback submissions
            total_participants: Total number of participants (for calculating rates)
            event_rating: Average event rating
            session_ratings: Dict mapping session IDs to average ratings
            
        Returns:
            Dict: Updated analytics document or None if not found
        """
        analytics = await cls.get_analytics_by_event_id(event_id)
        
        if not analytics:
            # Create analytics record if it doesn't exist
            await cls.create_analytics(event_id)
            analytics = await cls.get_analytics_by_event_id(event_id)
            
        update_data = {}
        
        if feedbacks_submitted is not None and total_participants is not None and total_participants > 0:
            feedback_submission_rate = (feedbacks_submitted / total_participants * 100)
            update_data["feedback_submission_rate"] = round(feedback_submission_rate, 2)
            
        if event_rating is not None:
            update_data["average_event_rating"] = round(event_rating, 2)
            
        if session_ratings is not None:
            # Merge with existing session ratings
            existing_ratings = analytics.get("session_ratings", {})
            existing_ratings.update(session_ratings)
            update_data["session_ratings"] = existing_ratings
            
            # Calculate average session rating
            if existing_ratings:
                avg_session_rating = sum(existing_ratings.values()) / len(existing_ratings)
                update_data["average_session_rating"] = round(avg_session_rating, 2)
            
        if not update_data:
            return analytics
            
        return await cls.update_one(
            {"event_id": event_id},
            {"$set": update_data}
        )
    
    @classmethod
    async def generate_analytics_summary(cls, event_id: str) -> Dict:
        """
        Generate a comprehensive analytics summary for an event.
        
        Args:
            event_id: Event ID
            
        Returns:
            Dict: Summary of analytics data
        """
        analytics = await cls.get_analytics_by_event_id(event_id)
        
        if not analytics:
            return {"error": "No analytics data found for this event"}
            
        return {
            "attendance": {
                "total_registrations": analytics.get("total_registrations", 0),
                "total_check_ins": analytics.get("total_check_ins", 0),
                "check_in_rate": analytics.get("check_in_rate", 0)
            },
            "sessions": {
                "average_attendance": analytics.get("average_session_attendance", 0),
                "most_popular": analytics.get("most_popular_sessions", [])
            },
            "engagement": {
                "poll_participation_rate": analytics.get("poll_participation_rate", 0),
                "questions_asked": analytics.get("questions_asked_count", 0),
                "chat_messages": analytics.get("chat_messages_count", 0)
            },
            "feedback": {
                "submission_rate": analytics.get("feedback_submission_rate", 0),
                "average_event_rating": analytics.get("average_event_rating", 0),
                "average_session_rating": analytics.get("average_session_rating", 0)
            }
        }


class FeedbackAnalyticsModel(BaseModel):
    """
    Model for feedback analytics data operations.
    Handles all database interactions for feedback analytics.
    """
    collection_name = "feedback_analytics"
    
    @classmethod
    async def create_feedback_analytics(cls, event_id: str) -> str:
        """
        Create a new feedback analytics record for an event.
        
        Args:
            event_id: ID of the event
            
        Returns:
            str: ID of the created feedback analytics record
        """
        now = datetime.now(timezone.utc)
        
        analytics_data = {
            "event_id": event_id,
            "date": now,
            "total_feedback_count": 0,
            "average_rating": 0.0,
            "rating_distribution": {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0},
            "content_quality_rating": 0.0,
            "speaker_quality_rating": 0.0,
            "venue_quality_rating": 0.0,
            "organization_quality_rating": 0.0,
            "recommendation_rate": 0.0,
            "session_feedback": {},
            "speaker_feedback": {},
            "improvement_categories": {}
        }
        
        analytics_id = await cls.insert_one(analytics_data)
        return str(analytics_id)
    
    @classmethod
    async def get_feedback_analytics_by_event_id(cls, event_id: str) -> Dict:
        """
        Get feedback analytics for a specific event.
        
        Args:
            event_id: Event ID
            
        Returns:
            Dict: Feedback analytics document or None if not found
        """
        return await cls.find_one({"event_id": event_id})
    
    @classmethod
    async def process_new_feedback(cls, event_id: str, feedback_data: Dict) -> Optional[Dict]:
        """
        Process a new feedback submission and update analytics.
        
        Args:
            event_id: Event ID
            feedback_data: Feedback data from submission
            
        Returns:
            Dict: Updated feedback analytics document or None if not found
        """
        analytics = await cls.get_feedback_analytics_by_event_id(event_id)
        
        if not analytics:
            # Create analytics record if it doesn't exist
            await cls.create_feedback_analytics(event_id)
            analytics = await cls.get_feedback_analytics_by_event_id(event_id)
            
        # Extract feedback fields
        rating = feedback_data.get("rating")
        content_quality = feedback_data.get("content_quality")
        speaker_quality = feedback_data.get("speaker_quality")
        venue_quality = feedback_data.get("venue_quality")
        organization_quality = feedback_data.get("organization_quality")
        would_recommend = feedback_data.get("would_recommend", False)
        session_id = feedback_data.get("session_id")
        speaker_id = feedback_data.get("speaker_id")  # This might come from session data
        improvement_suggestions = feedback_data.get("improvement_suggestions")
        
        # Update total count
        total_feedback_count = analytics.get("total_feedback_count", 0) + 1
        
        # Update rating distribution
        rating_distribution = analytics.get("rating_distribution", {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0})
        if rating and str(rating) in rating_distribution:
            rating_distribution[str(rating)] += 1
        
        # Calculate new average rating
        total_ratings = sum(int(k) * v for k, v in rating_distribution.items())
        total_responses = sum(rating_distribution.values())
        average_rating = total_ratings / total_responses if total_responses > 0 else 0
        
        # Update quality ratings
        quality_ratings = {
            "content_quality_rating": content_quality,
            "speaker_quality_rating": speaker_quality,
            "venue_quality_rating": venue_quality,
            "organization_quality_rating": organization_quality
        }
        
        updated_quality_ratings = {}
        for field, new_value in quality_ratings.items():
            if new_value is not None:
                # Get current values
                current_total = analytics.get(field, 0) * (total_feedback_count - 1)
                # Add new value and calculate new average
                new_average = (current_total + new_value) / total_feedback_count if total_feedback_count > 0 else 0
                updated_quality_ratings[field] = round(new_average, 2)
        
        # Update recommendation rate
        if would_recommend is not None:
            current_recommends = analytics.get("recommendation_rate", 0) * (total_feedback_count - 1) / 100
            new_recommends = current_recommends + (1 if would_recommend else 0)
            recommendation_rate = (new_recommends / total_feedback_count * 100) if total_feedback_count > 0 else 0
            updated_quality_ratings["recommendation_rate"] = round(recommendation_rate, 2)
        
        # Update session feedback
        if session_id:
            session_feedback = analytics.get("session_feedback", {})
            if session_id not in session_feedback:
                session_feedback[session_id] = {
                    "count": 0,
                    "total_rating": 0,
                    "average_rating": 0,
                    "content_quality": 0,
                    "speaker_quality": 0
                }
            
            session_data = session_feedback[session_id]
            session_data["count"] += 1
            
            if rating:
                session_data["total_rating"] += rating
                session_data["average_rating"] = round(session_data["total_rating"] / session_data["count"], 2)
            
            if content_quality:
                current_content = session_data["content_quality"] * (session_data["count"] - 1)
                session_data["content_quality"] = round((current_content + content_quality) / session_data["count"], 2)
                
            if speaker_quality:
                current_speaker = session_data["speaker_quality"] * (session_data["count"] - 1)
                session_data["speaker_quality"] = round((current_speaker + speaker_quality) / session_data["count"], 2)
                
            updated_quality_ratings["session_feedback"] = session_feedback
        
        # Update speaker feedback
        if speaker_id:
            speaker_feedback = analytics.get("speaker_feedback", {})
            if speaker_id not in speaker_feedback:
                speaker_feedback[speaker_id] = {
                    "count": 0,
                    "total_rating": 0,
                    "average_rating": 0
                }
            
            speaker_data = speaker_feedback[speaker_id]
            speaker_data["count"] += 1
            
            if speaker_quality:
                speaker_data["total_rating"] += speaker_quality
                speaker_data["average_rating"] = round(speaker_data["total_rating"] / speaker_data["count"], 2)
                
            updated_quality_ratings["speaker_feedback"] = speaker_feedback
        
        # Process improvement suggestions
        if improvement_suggestions:
            # This would be more sophisticated in a real system with NLP categorization
            categories = ["content", "speakers", "venue", "organization", "technical", "other"]
            assigned_category = "other"  # Default category
            
            # Simple keyword matching for categorization
            keywords = {
                "content": ["content", "material", "topics", "information", "slides"],
                "speakers": ["speaker", "presenter", "talk", "presentation"],
                "venue": ["venue", "location", "room", "building", "facility"],
                "organization": ["organization", "schedule", "timing", "registration"],
                "technical": ["technical", "audio", "video", "wifi", "sound"]
            }
            
            suggestion_lower = improvement_suggestions.lower()
            for category, words in keywords.items():
                if any(word in suggestion_lower for word in words):
                    assigned_category = category
                    break
            
            improvement_categories = analytics.get("improvement_categories", {})
            improvement_categories[assigned_category] = improvement_categories.get(assigned_category, 0) + 1
            updated_quality_ratings["improvement_categories"] = improvement_categories
        
        # Update the analytics record
        update_data = {
            "total_feedback_count": total_feedback_count,
            "average_rating": round(average_rating, 2),
            "rating_distribution": rating_distribution,
            **updated_quality_ratings
        }
        
        return await cls.update_one(
            {"event_id": event_id},
            {"$set": update_data}
        )
    
    @classmethod
    async def get_session_feedback_summary(cls, event_id: str, session_id: str) -> Dict:
        """
        Get a summary of feedback for a specific session.
        
        Args:
            event_id: Event ID
            session_id: Session ID
            
        Returns:
            Dict: Session feedback summary or empty dict if not found
        """
        analytics = await cls.get_feedback_analytics_by_event_id(event_id)
        
        if not analytics or "session_feedback" not in analytics:
            return {}
            
        session_feedback = analytics["session_feedback"].get(session_id, {})
        
        return session_feedback
    
    @classmethod
    async def get_speaker_feedback_summary(cls, event_id: str, speaker_id: str) -> Dict:
        """
        Get a summary of feedback for a specific speaker.
        
        Args:
            event_id: Event ID
            speaker_id: Speaker ID
            
        Returns:
            Dict: Speaker feedback summary or empty dict if not found
        """
        analytics = await cls.get_feedback_analytics_by_event_id(event_id)
        
        if not analytics or "speaker_feedback" not in analytics:
            return {}
            
        speaker_feedback = analytics["speaker_feedback"].get(speaker_id, {})
        
        return speaker_feedback
    
    @classmethod
    async def generate_feedback_report(cls, event_id: str) -> Dict:
        """
        Generate a comprehensive feedback report for an event.
        
        Args:
            event_id: Event ID
            
        Returns:
            Dict: Comprehensive feedback report
        """
        analytics = await cls.get_feedback_analytics_by_event_id(event_id)
        
        if not analytics:
            return {"error": "No feedback analytics data found for this event"}
            
        # For top sessions, sort by average rating
        sessions = []
        for session_id, data in analytics.get("session_feedback", {}).items():
            if data.get("count", 0) > 0:  # Only include sessions with feedback
                sessions.append({
                    "session_id": session_id,
                    "average_rating": data.get("average_rating", 0),
                    "count": data.get("count", 0),
                    "content_quality": data.get("content_quality", 0),
                    "speaker_quality": data.get("speaker_quality", 0)
                })
        
        top_sessions = sorted(sessions, key=lambda x: x["average_rating"], reverse=True)[:5]
        
        # For top speakers, sort by average rating
        speakers = []
        for speaker_id, data in analytics.get("speaker_feedback", {}).items():
            if data.get("count", 0) > 0:  # Only include speakers with feedback
                speakers.append({
                    "speaker_id": speaker_id,
                    "average_rating": data.get("average_rating", 0),
                    "count": data.get("count", 0)
                })
        
        top_speakers = sorted(speakers, key=lambda x: x["average_rating"], reverse=True)[:5]
        
        # Prepare report
        report = {
            "overview": {
                "total_feedback": analytics.get("total_feedback_count", 0),
                "average_rating": analytics.get("average_rating", 0),
                "rating_distribution": analytics.get("rating_distribution", {}),
                "recommendation_rate": analytics.get("recommendation_rate", 0)
            },
            "quality_metrics": {
                "content": analytics.get("content_quality_rating", 0),
                "speakers": analytics.get("speaker_quality_rating", 0),
                "venue": analytics.get("venue_quality_rating", 0),
                "organization": analytics.get("organization_quality_rating", 0)
            },
            "top_sessions": top_sessions,
            "top_speakers": top_speakers,
            "improvement_areas": analytics.get("improvement_categories", {})
        }
        
        return report


class ReportConfigModel(BaseModel):
    """
    Model for report configuration data operations.
    Handles all database interactions for report configuration.
    """
    collection_name = "report_configs"
    
    @classmethod
    async def create_report_config(cls, event_id: str, name: str, report_type: str,
                                created_by: str, description: str = None,
                                included_metrics: List[str] = None, 
                                time_range: Dict = None, format: str = "pdf",
                                include_visualizations: bool = True,
                                is_scheduled: bool = False, schedule_frequency: str = None,
                                recipients: List[str] = None) -> str:
        """
        Create a new report configuration.
        
        Args:
            event_id: ID of the event
            name: Report name
            report_type: Type of report (event_summary, attendance, feedback, etc.)
            created_by: ID of the user creating the report config
            description: Optional description
            included_metrics: List of metrics to include
            time_range: Dict with time range filters
            format: Output format (pdf, excel, csv, json)
            include_visualizations: Whether to include visualizations
            is_scheduled: Whether this is a scheduled report
            schedule_frequency: Frequency for scheduled reports
            recipients: List of user IDs or emails to receive the report
            
        Returns:
            str: ID of the created report config
        """
        now = datetime.now(timezone.utc)
        
        if included_metrics is None:
            included_metrics = []
            
        if time_range is None:
            time_range = {}
            
        if recipients is None:
            recipients = []
            
        config_data = {
            "event_id": event_id,
            "name": name,
            "report_type": report_type,
            "created_by": created_by,
            "created_at": now,
            "included_metrics": included_metrics,
            "time_range": time_range,
            "format": format,
            "include_visualizations": include_visualizations,
            "is_scheduled": is_scheduled,
            "recipients": recipients
        }
        
        if description:
            config_data["description"] = description
            
        if is_scheduled and schedule_frequency:
            config_data["schedule_frequency"] = schedule_frequency
            
        config_id = await cls.insert_one(config_data)
        return str(config_id)
    
    @classmethod
    async def get_report_config(cls, config_id: str) -> Dict:
        """
        Get a report configuration by ID.
        
        Args:
            config_id: Report config ID
            
        Returns:
            Dict: Report config document or None if not found
        """
        return await cls.find_one({"_id": ObjectId(config_id)})
    
    @classmethod
    async def get_event_report_configs(cls, event_id: str) -> List[Dict]:
        """
        Get all report configurations for an event.
        
        Args:
            event_id: Event ID
            
        Returns:
            List[Dict]: List of report config documents
        """
        return await cls.find_many({"event_id": event_id})
    
    @classmethod
    async def update_report_config(cls, config_id: str, update_data: Dict) -> Optional[Dict]:
        """
        Update a report configuration.
        
        Args:
            config_id: Report config ID
            update_data: Dictionary containing fields to update
            
        Returns:
            Dict: Updated report config document or None if not found
        """
        allowed_fields = [
            "name", "description", "included_metrics", "time_range", "format",
            "include_visualizations", "is_scheduled", "schedule_frequency", "recipients"
        ]
        filtered_update = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        return await cls.update_one(
            {"_id": ObjectId(config_id)},
            {"$set": filtered_update}
        )
    
    @classmethod
    async def delete_report_config(cls, config_id: str) -> bool:
        """
        Delete a report configuration.
        
        Args:
            config_id: Report config ID
            
        Returns:
            bool: True if deleted, False otherwise
        """
        deleted_count = await cls.delete_one({"_id": ObjectId(config_id)})
        return deleted_count > 0
    
    @classmethod
    async def generate_report(cls, config_id: str) -> Dict:
        """
        Generate a report based on a configuration.
        
        Args:
            config_id: Report config ID
            
        Returns:
            Dict: Generated report data
        """
        config = await cls.get_report_config(config_id)
        
        if not config:
            return {"error": "Report configuration not found"}
            
        event_id = config.get("event_id")
        report_type = config.get("report_type")
        
        # Based on report type, gather appropriate data
        report_data = {"report_type": report_type, "event_id": event_id}
        
        if report_type == "event_summary" or report_type == "comprehensive":
            # Get event analytics summary
            event_analytics = await EventAnalyticsModel.generate_analytics_summary(event_id)
            report_data["analytics"] = event_analytics
            
        if report_type == "feedback" or report_type == "comprehensive":
            # Get feedback report
            feedback_report = await FeedbackAnalyticsModel.generate_feedback_report(event_id)
            report_data["feedback"] = feedback_report
            
        if report_type == "attendance" or report_type == "comprehensive":
            # Get detailed attendance data
            analytics = await EventAnalyticsModel.get_analytics_by_event_id(event_id)
            if analytics:
                report_data["attendance"] = {
                    "registrations": analytics.get("total_registrations", 0),
                    "check_ins": analytics.get("total_check_ins", 0),
                    "check_in_rate": analytics.get("check_in_rate", 0),
                    "timeline": analytics.get("attendance_timeline", [])
                }
                
        if report_type == "engagement" or report_type == "comprehensive":
            # Get detailed engagement data
            analytics = await EventAnalyticsModel.get_analytics_by_event_id(event_id)
            if analytics:
                report_data["engagement"] = {
                    "poll_participation_rate": analytics.get("poll_participation_rate", 0),
                    "questions_asked": analytics.get("questions_asked_count", 0),
                    "chat_messages": analytics.get("chat_messages_count", 0),
                    "session_attendance": analytics.get("session_attendance", {})
                }
        
        # Include any specifically requested metrics
        included_metrics = config.get("included_metrics", [])
        if included_metrics:
            # This would be a more sophisticated filtering in a real system
            # For now, we just note that metrics were filtered
            report_data["filtered_metrics"] = True
        
        # Apply time range filter if specified
        time_range = config.get("time_range", {})
        if time_range:
            report_data["time_filtered"] = True
            report_data["time_range"] = time_range
        
        # Generate report metadata
        report_data["metadata"] = {
            "report_name": config.get("name"),
            "description": config.get("description"),
            "generated_at": datetime.now(timezone.utc),
            "format": config.get("format", "pdf"),
            "include_visualizations": config.get("include_visualizations", True)
        }
        
        return report_data
    
    @classmethod
    async def get_scheduled_reports(cls) -> List[Dict]:
        """
        Get all scheduled reports that need to be generated.
        
        Returns:
            List[Dict]: List of report config documents for scheduled reports
        """
        return await cls.find_many({"is_scheduled": True})
    
    @classmethod
    async def distribute_report(cls, config_id: str, report_data: Dict) -> Dict:
        """
        Distribute a generated report to recipients.
        
        Args:
            config_id: Report config ID
            report_data: Generated report data
            
        Returns:
            Dict: Distribution result
        """
        config = await cls.get_report_config(config_id)
        
        if not config:
            return {"error": "Report configuration not found"}
            
        recipients = config.get("recipients", [])
        format = config.get("format", "pdf")
        
        # In a real system, this would handle email sending, file generation, etc.
        # For now, we just return status information
        
        return {
            "status": "distributed",
            "recipients_count": len(recipients),
            "format": format,
            "distribution_time": datetime.now(timezone.utc)
        }