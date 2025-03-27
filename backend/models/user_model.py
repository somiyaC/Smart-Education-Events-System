"""
User model module for handling user data.
Based on the UserSchema.
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from bson import ObjectId

from .base_model import BaseModel


class UserModel(BaseModel):
    """
    Model for user data operations.
    Handles all database interactions for users.
    """
    collection_name = "users"
    
    @classmethod
    async def create_user(cls, auth0_id: str, email: str, first_name: str, last_name: str,
                       role: str = "attendee", bio: Optional[str] = None,
                       company: Optional[str] = None, job_title: Optional[str] = None,
                       phone: Optional[str] = None, linkedin: Optional[str] = None,
                       twitter: Optional[str] = None, facebook: Optional[str] = None,
                       interests: List[str] = None, receive_notifications: bool = True) -> str:
        """
        Create a new user.
        
        Args:
            auth0_id: Auth0 user ID
            email: User's email address
            first_name: User's first name
            last_name: User's last name
            role: User role (attendee, stakeholder, organizer, admin)
            bio: Optional user bio
            company: Optional user company
            job_title: Optional user job title
            phone: Optional user phone number
            linkedin: Optional LinkedIn profile URL
            twitter: Optional Twitter profile URL
            facebook: Optional Facebook profile URL
            interests: Optional list of user interests
            receive_notifications: Whether the user wants to receive notifications
            
        Returns:
            str: ID of the created user
        """
        if interests is None:
            interests = []
            
        now = datetime.now(timezone.utc)
        
        user_data = {
            "auth0_id": auth0_id,
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "role": role,
            "interests": interests,
            "receive_notifications": receive_notifications,
            "created_at": now,
            "updated_at": now
        }
        
        # Add optional fields if provided
        if bio:
            user_data["bio"] = bio
            
        if company:
            user_data["company"] = company
            
        if job_title:
            user_data["job_title"] = job_title
            
        if phone:
            user_data["phone"] = phone
            
        if linkedin:
            user_data["linkedin"] = linkedin
            
        if twitter:
            user_data["twitter"] = twitter
            
        if facebook:
            user_data["facebook"] = facebook
        
        user_id = await cls.insert_one(user_data)
        return str(user_id)
    
    @classmethod
    async def get_user_by_id(cls, user_id: str) -> Dict:
        """
        Get user details by ID.
        
        Args:
            user_id: User ID
            
        Returns:
            Dict: User document or None if not found
        """
        return await cls.find_one({"_id": ObjectId(user_id)})
    
    @classmethod
    async def get_user_by_auth0_id(cls, auth0_id: str) -> Dict:
        """
        Get user by Auth0 ID.
        
        Args:
            auth0_id: Auth0 user ID
            
        Returns:
            Dict: User document or None if not found
        """
        return await cls.find_one({"auth0_id": auth0_id})
    
    @classmethod
    async def get_user_by_email(cls, email: str) -> Dict:
        """
        Get user by email address.
        
        Args:
            email: User's email address
            
        Returns:
            Dict: User document or None if not found
        """
        return await cls.find_one({"email": email})
    
    @classmethod
    async def update_user(cls, user_id: str, update_data: Dict) -> Optional[Dict]:
        """
        Update user information.
        
        Args:
            user_id: User ID
            update_data: Dictionary containing fields to update
            
        Returns:
            Dict: Updated user document or None if not found
        """
        # Ensure we only update allowed fields
        allowed_fields = [
            "email","password","first_name", "last_name", "bio", "company", "job_title",
            "phone", "linkedin", "twitter", "facebook", "interests",
            "receive_notifications", "role"
        ]
        filtered_update = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        # Always update the updated_at timestamp
        filtered_update["updated_at"] = datetime.now(timezone.utc)
        
        return await cls.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": filtered_update}
        )
    
    @classmethod
    async def delete_user(cls, user_id: str) -> bool:
        """
        Delete a user.
        
        Args:
            user_id: User ID
            
        Returns:
            bool: True if deleted, False otherwise
        """
        deleted_count = await cls.delete_one({"_id": ObjectId(user_id)})
        return deleted_count > 0
    
    @classmethod
    async def update_interests(cls, user_id: str, interests: List[str]) -> Optional[Dict]:
        """
        Update a user's interests.
        
        Args:
            user_id: User ID
            interests: List of interests
            
        Returns:
            Dict: Updated user document or None if not found
        """
        return await cls.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "interests": interests,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
    
    @classmethod
    async def find_users_by_role(cls, role: str) -> List[Dict]:
        """
        Find users by role.
        
        Args:
            role: User role to search for
            
        Returns:
            List[Dict]: List of user documents with the specified role
        """
        return await cls.find_many({"role": role})
    
    @classmethod
    async def find_users_by_interest(cls, interest: str) -> List[Dict]:
        """
        Find users with a specific interest.
        
        Args:
            interest: Interest to search for
            
        Returns:
            List[Dict]: List of user documents with the specified interest
        """
        return await cls.find_many({"interests": interest})
    
    @classmethod
    async def find_matching_users(cls, user_id: str, min_matching_interests: int = 1, 
                              max_results: int = 10) -> List[Dict]:
        """
        Find users with matching interests for networking.
        
        Args:
            user_id: User ID to find matches for
            min_matching_interests: Minimum number of matching interests required
            max_results: Maximum number of results to return
            
        Returns:
            List[Dict]: List of matching user documents with match scores
        """
        # Get the user's interests
        user = await cls.get_user_by_id(user_id)
        if not user or not user.get("interests"):
            return []
            
        user_interests = user.get("interests", [])
        
        # Find users with matching interests
        pipeline = [
            # Exclude the user themselves
            {"$match": {"_id": {"$ne": ObjectId(user_id)}}},
            # Only include users with interests
            {"$match": {"interests": {"$exists": True, "$ne": []}}},
            # Calculate matching interests
            {"$project": {
                "first_name": 1,
                "last_name": 1,
                "company": 1,
                "job_title": 1,
                "interests": 1,
                "matching_interests": {
                    "$setIntersection": ["$interests", user_interests]
                }
            }},
            # Only include users with minimum matching interests
            {"$match": {
                "$expr": {
                    "$gte": [{"$size": "$matching_interests"}, min_matching_interests]
                }
            }},
            # Add match score
            {"$addFields": {
                "match_score": {
                    "$divide": [
                        {"$size": "$matching_interests"},
                        {"$max": [{"$size": "$interests"}, {"$size": user_interests}]}
                    ]
                },
                "matching_count": {"$size": "$matching_interests"}
            }},
            # Sort by match score (descending)
            {"$sort": {"match_score": -1}},
            # Limit results
            {"$limit": max_results}
        ]
        
        matches = await cls.aggregate(pipeline)
        
        # Round match scores to 2 decimal places
        for match in matches:
            match["match_score"] = round(match["match_score"], 2)
            
        return matches
    
    @classmethod
    async def search_users(cls, query: str, limit: int = 10) -> List[Dict]:
        """
        Search for users by name, email, or company.
        
        Args:
            query: Search query
            limit: Maximum number of results to return
            
        Returns:
            List[Dict]: List of matching user documents
        """
        return await cls.find_many(
            {
                "$or": [
                    {"first_name": {"$regex": query, "$options": "i"}},
                    {"last_name": {"$regex": query, "$options": "i"}},
                    {"email": {"$regex": query, "$options": "i"}},
                    {"company": {"$regex": query, "$options": "i"}}
                ]
            },
            limit=limit
        )
    
    @classmethod
    async def check_permission(cls, user_id: str, required_role: str) -> bool:
        """
        Check if a user has a specific role or higher.
        
        Args:
            user_id: User ID
            required_role: Required role (attendee, stakeholder, organizer, admin)
            
        Returns:
            bool: True if user has required role or higher, False otherwise
        """
        user = await cls.get_user_by_id(user_id)
        if not user:
            return False
        
        # Define role hierarchy
        role_hierarchy = {
            "attendee": 0,
            "stakeholder": 1,
            "organizer": 2,
            "admin": 3
        }
        
        user_role_level = role_hierarchy.get(user.get("role", "attendee"), 0)
        required_role_level = role_hierarchy.get(required_role, 0)
        
        return user_role_level >= required_role_level
    
    @classmethod
    async def suggest_networking_opportunities(cls, user_id: str, event_id: str) -> Dict:
        """
        Suggest networking opportunities for a user at an event.
        
        Args:
            user_id: User ID
            event_id: Event ID
            
        Returns:
            Dict: Dictionary with various networking suggestions
        """
        # Get the user's interests and industry
        user = await cls.get_user_by_id(user_id)
        if not user:
            return {"error": "User not found"}
        
        user_interests = user.get("interests", [])
        user_company = user.get("company")
        
        from .event_model import EventModel
        
        # Get all participants at the event
        participants = await EventModel.get_event_participants(event_id)
        if not participants:
            return {"error": "No participants found"}
        
        # Filter out the user themselves
        participants = [p for p in participants if p != user_id]
        
        # Get user info for all participants
        participant_details = []
        for participant_id in participants:
            participant = await cls.get_user_by_id(participant_id)
            if participant:
                participant_details.append(participant)
        
        # Calculate interest matches
        interest_matches = []
        for participant in participant_details:
            participant_interests = participant.get("interests", [])
            matching_interests = list(set(user_interests) & set(participant_interests))
            
            if matching_interests:
                match_score = len(matching_interests) / max(len(user_interests), len(participant_interests))
                interest_matches.append({
                    "user_id": participant.get("id"),
                    "name": f"{participant.get('first_name')} {participant.get('last_name')}",
                    "company": participant.get("company"),
                    "job_title": participant.get("job_title"),
                    "matching_interests": matching_interests,
                    "match_score": round(match_score * 100, 2),
                    "contact": {
                        "email": participant.get("email"),
                        "linkedin": participant.get("linkedin"),
                        "twitter": participant.get("twitter")
                    }
                })
        
        # Sort by match score
        interest_matches.sort(key=lambda x: x["match_score"], reverse=True)
        
        # Find people from same company/industry
        company_matches = []
        for participant in participant_details:
            if participant.get("company") == user_company and participant.get("company"):
                company_matches.append({
                    "user_id": participant.get("id"),
                    "name": f"{participant.get('first_name')} {participant.get('last_name')}",
                    "job_title": participant.get("job_title"),
                    "contact": {
                        "email": participant.get("email"),
                        "linkedin": participant.get("linkedin"),
                        "twitter": participant.get("twitter")
                    }
                })
        
        return {
            "interest_matches": interest_matches[:10],  # Top 10 interest matches
            "company_matches": company_matches,
            "total_potential_connections": len(participant_details)
        }