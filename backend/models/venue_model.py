"""
Venue model module for handling venue data.
Based on the VenueSchema.
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from bson import ObjectId

from .base_model import BaseModel


class VenueModel(BaseModel):
    """
    Model for venue data operations.
    Handles all database interactions for venues.
    """
    collection_name = "venues"
    
    @classmethod
    async def create_venue(cls, name: str, address: str, city: str, country: str, 
                        capacity: int, state: Optional[str] = None, 
                        postal_code: Optional[str] = None, website: Optional[str] = None,
                        description: Optional[str] = None, contact_name: Optional[str] = None,
                        contact_phone: Optional[str] = None, has_wifi: bool = False,
                        has_parking: bool = False, has_catering: bool = False,
                        images: List[str] = None) -> str:
        """
        Create a new venue.
        
        Args:
            name: Venue name
            address: Venue address
            city: Venue city
            country: Venue country
            capacity: Venue capacity
            state: Optional venue state
            postal_code: Optional venue postal code
            website: Optional venue website
            description: Optional venue description
            contact_name: Optional venue contact name
            contact_phone: Optional venue contact phone
            has_wifi: Whether the venue has WiFi
            has_parking: Whether the venue has parking
            has_catering: Whether the venue has catering
            images: Optional list of venue images
            
        Returns:
            str: ID of the created venue
        """
        if images is None:
            images = []
            
        now = datetime.now(timezone.utc)
        
        venue_data = {
            "name": name,
            "address": address,
            "city": city,
            "country": country,
            "capacity": capacity,
            "has_wifi": has_wifi,
            "has_parking": has_parking,
            "has_catering": has_catering,
            "images": images,
            "created_at": now,
            "updated_at": now
        }
        
        # Add optional fields if provided
        if state:
            venue_data["state"] = state
            
        if postal_code:
            venue_data["postal_code"] = postal_code
            
        if website:
            venue_data["website"] = website
            
        if description:
            venue_data["description"] = description
            
        if contact_name:
            venue_data["contact_name"] = contact_name
            
        if contact_phone:
            venue_data["contact_phone"] = contact_phone
        
        venue_id = await cls.insert_one(venue_data)
        return str(venue_id)
    
    @classmethod
    async def get_venue_by_id(cls, venue_id: str) -> Dict:
        """
        Get venue details by ID.
        
        Args:
            venue_id: Venue ID
            
        Returns:
            Dict: Venue document or None if not found
        """
        return await cls.find_one({"_id": ObjectId(venue_id)})
    
    @classmethod
    async def update_venue(cls, venue_id: str, update_data: Dict) -> Optional[Dict]:
        """
        Update venue information.
        
        Args:
            venue_id: Venue ID
            update_data: Dictionary containing fields to update
            
        Returns:
            Dict: Updated venue document or None if not found
        """
        # Ensure we only update allowed fields
        allowed_fields = [
            "name", "address", "city", "state", "country", "postal_code",
            "capacity", "website", "description", "contact_name", "contact_phone",
            "has_wifi", "has_parking", "has_catering", "images"
        ]
        filtered_update = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        # Always update the updated_at timestamp
        filtered_update["updated_at"] = datetime.now(timezone.utc)
        
        return await cls.update_one(
            {"_id": ObjectId(venue_id)},
            {"$set": filtered_update}
        )
    
    @classmethod
    async def delete_venue(cls, venue_id: str) -> bool:
        """
        Delete a venue.
        
        Args:
            venue_id: Venue ID
            
        Returns:
            bool: True if deleted, False otherwise
        """
        deleted_count = await cls.delete_one({"_id": ObjectId(venue_id)})
        return deleted_count > 0
    
    @classmethod
    async def search_venues(cls, query: str, city: Optional[str] = None,
                         min_capacity: Optional[int] = None,
                         facilities: List[str] = None) -> List[Dict]:
        """
        Search for venues by name, description, address, or city.
        
        Args:
            query: Search query
            city: Optional city filter
            min_capacity: Optional minimum capacity filter
            facilities: Optional facilities filter (wifi, parking, catering)
            
        Returns:
            List[Dict]: List of matching venue documents
        """
        search_criteria = {
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}},
                {"address": {"$regex": query, "$options": "i"}},
                {"city": {"$regex": query, "$options": "i"}}
            ]
        }
        
        if city:
            search_criteria["city"] = {"$regex": city, "$options": "i"}
            
        if min_capacity is not None:
            search_criteria["capacity"] = {"$gte": min_capacity}
            
        if facilities:
            for facility in facilities:
                if facility == "wifi":
                    search_criteria["has_wifi"] = True
                elif facility == "parking":
                    search_criteria["has_parking"] = True
                elif facility == "catering":
                    search_criteria["has_catering"] = True
                    
        return await cls.find_many(search_criteria)
    
    @classmethod
    async def add_venue_image(cls, venue_id: str, image_url: str) -> Optional[Dict]:
        """
        Add an image to a venue.
        
        Args:
            venue_id: Venue ID
            image_url: URL of the image to add
            
        Returns:
            Dict: Updated venue document or None if not found
        """
        return await cls.update_one(
            {"_id": ObjectId(venue_id)},
            {
                "$push": {"images": image_url},
                "$set": {"updated_at": datetime.now(timezone.utc)}
            }
        )
    
    @classmethod
    async def remove_venue_image(cls, venue_id: str, image_url: str) -> Optional[Dict]:
        """
        Remove an image from a venue.
        
        Args:
            venue_id: Venue ID
            image_url: URL of the image to remove
            
        Returns:
            Dict: Updated venue document or None if not found
        """
        return await cls.update_one(
            {"_id": ObjectId(venue_id)},
            {
                "$pull": {"images": image_url},
                "$set": {"updated_at": datetime.now(timezone.utc)}
            }
        )
    
    @classmethod
    async def get_venues_by_city(cls, city: str) -> List[Dict]:
        """
        Get all venues in a specific city.
        
        Args:
            city: City to search for
            
        Returns:
            List[Dict]: List of venue documents in the specified city
        """
        return await cls.find_many({"city": {"$regex": city, "$options": "i"}})
    
    @classmethod
    async def get_venues_by_capacity(cls, min_capacity: int, max_capacity: Optional[int] = None) -> List[Dict]:
        """
        Get all venues with a specific capacity range.
        
        Args:
            min_capacity: Minimum capacity
            max_capacity: Optional maximum capacity
            
        Returns:
            List[Dict]: List of venue documents within the capacity range
        """
        query = {"capacity": {"$gte": min_capacity}}
        
        if max_capacity is not None:
            query["capacity"]["$lte"] = max_capacity
            
        return await cls.find_many(query)
    