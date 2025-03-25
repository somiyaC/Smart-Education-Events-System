"""
Models package for the Event Management System.
This module imports and exposes all model classes.
"""

# Import the base model
from .base_model import BaseModel, Database

# Import all other models
from .user_model import UserModel
from .event_model import EventModel
from .session_model import SessionModel
from .venue_model import VenueModel
from .ticket_model import TicketModel
from .feedback_model import FeedbackModel
from .poll_model import PollModel
from .question_model import QuestionModel
from .chat_model import ChatRoomModel, ChatMessageModel
from .email_model import EmailCampaignModel

# Export all models
__all__ = [
    'Database',
    'BaseModel',
    'UserModel',
    'EventModel',
    'SessionModel',
    'VenueModel',
    'TicketModel',
    'FeedbackModel', 
    'PollModel',
    'QuestionModel',
    'ChatRoomModel',
    'ChatMessageModel',
    'EmailCampaignModel'
]