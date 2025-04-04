from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone

class EventAnalyticsSchema(BaseModel):
    """Analytics for tracking event metrics and success indicators"""
    id: Optional[str] = None
    event_id: str  # Reference to Event
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Attendance metrics
    total_registrations: int = 0
    total_check_ins: int = 0
    check_in_rate: float = 0.0  # Percentage of registered attendees who checked in
    
    # Engagement metrics
    average_session_attendance: float = 0.0  # Average attendance per session
    session_attendance: Dict[str, int] = Field(default_factory=dict)  # Session ID to attendee count
    most_popular_sessions: List[Dict[str, Any]] = Field(default_factory=list)  # Top sessions by attendance
    
    # Participation metrics
    poll_participation_rate: float = 0.0
    questions_asked_count: int = 0
    chat_messages_count: int = 0
    
    # Feedback metrics
    feedback_submission_rate: float = 0.0
    average_event_rating: float = 0.0
    average_session_rating: float = 0.0
    session_ratings: Dict[str, float] = Field(default_factory=dict)  # Session ID to rating
    
    # Tracking data
    attendance_timeline: List[Dict[str, Any]] = Field(default_factory=list)
    
    class Config:
        orm_mode = True

class FeedbackAnalyticsSchema(BaseModel):
    """Analytics specifically focused on feedback data"""
    id: Optional[str] = None
    event_id: str  # Reference to Event
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Overall feedback metrics
    total_feedback_count: int = 0
    average_rating: float = 0.0
    rating_distribution: Dict[str, int] = Field(default_factory=dict)  # Rating value to count
    
    # Specific feedback categories
    content_quality_rating: float = 0.0
    speaker_quality_rating: float = 0.0
    venue_quality_rating: float = 0.0
    organization_quality_rating: float = 0.0
    recommendation_rate: float = 0.0  # Percentage who would recommend
    
    # Session-specific feedback
    session_feedback: Dict[str, Dict[str, Any]] = Field(default_factory=dict)  # Session ID to feedback metrics
    
    # Speaker-specific feedback
    speaker_feedback: Dict[str, Dict[str, Any]] = Field(default_factory=dict)  # Speaker ID to feedback metrics
    
    # Improvement suggestions (categorized)
    improvement_categories: Dict[str, int] = Field(default_factory=dict)  # Category to count
    
    class Config:
        orm_mode = True

class ReportConfigSchema(BaseModel):
    """Configuration for report generation"""
    id: Optional[str] = None
    event_id: str  # Reference to Event
    name: str
    description: Optional[str] = None
    
    # Report content configuration
    report_type: str = Field(..., regex="^(event_summary|attendance|feedback|engagement|comprehensive)$")
    included_metrics: List[str] = Field(default_factory=list)
    time_range: Dict[str, Any] = Field(default_factory=dict)
    
    # Output configuration
    format: str = Field(default="pdf", regex="^(pdf|excel|csv|json)$")
    include_visualizations: bool = True
    
    # Scheduling (optional)
    is_scheduled: bool = False
    schedule_frequency: Optional[str] = None
    recipients: List[str] = Field(default_factory=list)  # List of user IDs or emails
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str  # Reference to User
    
    class Config:
        orm_mode = True