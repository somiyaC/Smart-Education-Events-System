"""
Ticket model module for handling event tickets.
Based on the TicketSchema.
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from bson import ObjectId
import uuid
import qrcode
import io
import base64

from .base_model import BaseModel


class TicketModel(BaseModel):
    """
    Model for ticket data operations.
    Handles all database interactions for event tickets.
    """
    collection_name = "tickets"
    
    @classmethod
    async def create_ticket(cls, user_id: str, event_id: str, 
                            payment_reference: Optional[str] = None) -> str:
        """
        Create a new ticket for an event.
        
        Args:
            user_id: ID of the ticket holder
            event_id: ID of the event
            payment_reference: Optional payment reference
            
        Returns:
            str: ID of the created ticket
        """
        now = datetime.now(timezone.utc)
        
        # Generate a unique ticket number
        ticket_number = cls._generate_ticket_number(event_id, user_id)
        
        # Include ticket_number as ticket_id to satisfy the unique index constraint
        ticket_data = {
            "user_id": user_id,
            "event_id": event_id,
            "purchase_date": now,
            "ticket_number": ticket_number,
            "ticket_id": ticket_number,  # Set a unique value here
            "status": "active",
            "checked_in": False,
            "check_in_time": None
        }
        
        if payment_reference:
            ticket_data["payment_reference"] = payment_reference
            
        # Generate QR code
        qr_data = {
            "ticket_number": ticket_number,
            "event_id": event_id,
            "user_id": user_id
        }
        ticket_data["qr_code"] = cls._generate_qr_code(qr_data)
        
        ticket_id = await cls.insert_one(ticket_data)
        return str(ticket_id)
    
    @classmethod
    async def get_ticket_by_id(cls, ticket_id: str) -> Dict:
        """
        Get ticket details by ID.
        
        Args:
            ticket_id: Ticket ID
            
        Returns:
            Dict: Ticket document or None if not found
        """
        return await cls.find_one({"_id": ObjectId(ticket_id)})
    
    @classmethod
    async def get_ticket_by_number(cls, ticket_number: str) -> Dict:
        """
        Get ticket by ticket number.
        
        Args:
            ticket_number: Ticket number
            
        Returns:
            Dict: Ticket document or None if not found
        """
        return await cls.find_one({"ticket_number": ticket_number})
    
    @classmethod
    async def get_user_tickets(cls, user_id: str, event_id: Optional[str] = None) -> List[Dict]:
        """
        Get all tickets for a user.
        
        Args:
            user_id: User ID
            event_id: Optional event ID filter
            
        Returns:
            List[Dict]: List of ticket documents
        """
        query = {"user_id": user_id}
        
        if event_id:
            query["event_id"] = event_id
            
        return await cls.find_many(query)
    
    @classmethod
    async def get_event_tickets(cls, event_id: str, status: Optional[str] = None) -> List[Dict]:
        """
        Get all tickets for an event.
        
        Args:
            event_id: Event ID
            status: Optional ticket status filter
            
        Returns:
            List[Dict]: List of ticket documents
        """
        query = {"event_id": event_id}
        
        if status:
            query["status"] = status
            
        return await cls.find_many(query)
    
    @classmethod
    async def update_ticket_status(cls, ticket_id: str, status: str) -> Optional[Dict]:
        """
        Update a ticket's status.
        
        Args:
            ticket_id: Ticket ID
            status: New status (active, used, cancelled, refunded)
            
        Returns:
            Dict: Updated ticket document or None if not found
        """
        valid_statuses = ["active", "used", "cancelled", "refunded"]
        if status not in valid_statuses:
            return None
            
        return await cls.update_one(
            {"_id": ObjectId(ticket_id)},
            {"$set": {"status": status}}
        )
    
    @classmethod
    async def check_in_ticket(cls, ticket_id: str) -> Optional[Dict]:
        """
        Check in a ticket.
        
        Args:
            ticket_id: Ticket ID
            
        Returns:
            Dict: Updated ticket document or None if not found or already checked in
        """
        ticket = await cls.get_ticket_by_id(ticket_id)
        
        if not ticket or ticket["status"] != "active":
            return None
            
        if ticket["checked_in"]:
            return None  # Already checked in
            
        now = datetime.now(timezone.utc)
        
        return await cls.update_one(
            {"_id": ObjectId(ticket_id)},
            {
                "$set": {
                    "checked_in": True,
                    "check_in_time": now,
                    "status": "used"
                }
            }
        )
    
    @classmethod
    async def verify_ticket(cls, ticket_number: str, event_id: str) -> Dict:
        """
        Verify a ticket for an event.
        
        Args:
            ticket_number: Ticket number
            event_id: Event ID
            
        Returns:
            Dict: Verification result with status and message
        """
        ticket = await cls.get_ticket_by_number(ticket_number)
        
        if not ticket:
            return {"valid": False, "message": "Ticket not found"}
            
        if ticket["event_id"] != event_id:
            return {"valid": False, "message": "Ticket is for a different event"}
            
        if ticket["status"] != "active":
            return {"valid": False, "message": f"Ticket status is {ticket['status']}"}
            
        if ticket["checked_in"]:
            return {"valid": False, "message": "Ticket already checked in"}
            
        return {
            "valid": True,
            "message": "Ticket is valid",
            "ticket_id": str(ticket["_id"]),
            "user_id": ticket["user_id"]
        }
    
    @classmethod
    async def get_check_in_stats(cls, event_id: str) -> Dict:
        """
        Get check-in statistics for an event.
        
        Args:
            event_id: Event ID
            
        Returns:
            Dict: Check-in statistics
        """
        pipeline = [
            {"$match": {"event_id": event_id}},
            {"$group": {
                "_id": None,
                "total_tickets": {"$sum": 1},
                "checked_in": {"$sum": {"$cond": ["$checked_in", 1, 0]}},
                "active": {"$sum": {"$cond": [{"$eq": ["$status", "active"]}, 1, 0]}},
                "used": {"$sum": {"$cond": [{"$eq": ["$status", "used"]}, 1, 0]}},
                "cancelled": {"$sum": {"$cond": [{"$eq": ["$status", "cancelled"]}, 1, 0]}},
                "refunded": {"$sum": {"$cond": [{"$eq": ["$status", "refunded"]}, 1, 0]}}
            }}
        ]
        
        results = await cls.aggregate(pipeline)
        
        if not results or len(results) == 0:
            # Return empty stats if no tickets
            return {
                "total_tickets": 0,
                "checked_in": 0,
                "check_in_rate": 0,
                "status_breakdown": {
                    "active": 0,
                    "used": 0,
                    "cancelled": 0,
                    "refunded": 0
                }
            }
            
        stats = results[0]
        
        # Calculate check-in rate
        if stats["total_tickets"] > 0:
            stats["check_in_rate"] = round(stats["checked_in"] / stats["total_tickets"] * 100, 2)
        else:
            stats["check_in_rate"] = 0
            
        # Format status breakdown
        stats["status_breakdown"] = {
            "active": stats.pop("active", 0),
            "used": stats.pop("used", 0),
            "cancelled": stats.pop("cancelled", 0),
            "refunded": stats.pop("refunded", 0)
        }
        
        # Remove the MongoDB group _id
        if "_id" in stats:
            del stats["_id"]
            
        return stats
        
    @staticmethod
    def _generate_ticket_number(event_id: str, user_id: str) -> str:
        """
        Generate a unique ticket number.
        
        Args:
            event_id: Event ID
            user_id: User ID
            
        Returns:
            str: Unique ticket number
        """
        event_prefix = event_id[:4] if len(event_id) >= 4 else event_id
        user_prefix = user_id[:4] if len(user_id) >= 4 else user_id
        random_suffix = uuid.uuid4().hex[:8].upper()
        
        return f"TCK-{event_prefix}-{user_prefix}-{random_suffix}"
    
    @staticmethod
    def _generate_qr_code(data: Dict) -> str:
        """
        Generate a QR code for a ticket.
        
        Args:
            data: Data to encode in the QR code
            
        Returns:
            str: Base64-encoded QR code image
        """
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        
        # Add data to QR code
        qr.add_data(str(data))
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        
        return f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode('utf-8')}"
    
    @classmethod
    async def create_ticket_with_discount(cls, user_id: str, event_id: str, 
                                    discount_code: Optional[str] = None,
                                    payment_reference: Optional[str] = None) -> Dict:
        """
        Create a new ticket with optional discount.
        
        Args:
            user_id: ID of the ticket holder
            event_id: ID of the event
            discount_code: Optional discount code
            payment_reference: Optional payment reference
            
        Returns:
            Dict: Dictionary with ticket ID and applied discount info
        """
        discount_info = {
            "applied": False,
            "code": None,
            "percentage": 0,
            "amount": 0
        }
        
        # Check if discount code is valid (implementation would need to be added)
        if discount_code:
            # This would validate the discount code against a discount_codes collection
            # For now, just simulate a successful discount
            discount_info = {
                "applied": True,
                "code": discount_code,
                "percentage": 15,  # Example: 15% discount
                "amount": 0        # This would be calculated based on ticket price
            }
        
        # Create the ticket
        ticket_id = await cls.create_ticket(user_id, event_id, payment_reference)
        
        return {
            "ticket_id": ticket_id,
            "discount": discount_info
        }
    
    @classmethod
    async def bulk_create_tickets(cls, event_id: str, user_ids: List[str]) -> Dict:
        """
        Create tickets for multiple users at once.
        
        Args:
            event_id: Event ID
            user_ids: List of User IDs
            
        Returns:
            Dict: Summary of ticket creation results
        """
        results = {
            "success": 0,
            "failed": 0,
            "ticket_ids": []
        }
        
        for user_id in user_ids:
            try:
                ticket_id = await cls.create_ticket(user_id, event_id)
                results["ticket_ids"].append(ticket_id)
                results["success"] += 1
            except Exception:
                results["failed"] += 1
        
        return results

    @classmethod
    async def get_check_in_timeline(cls, event_id: str) -> List[Dict]:
        """
        Get a timeline of check-ins for an event.
        
        Args:
            event_id: Event ID
            
        Returns:
            List[Dict]: List of check-in data points with timestamps
        """
        tickets = await cls.find_many(
            {"event_id": event_id, "checked_in": True},
            sort=[("check_in_time", 1)]
        )
        
        timeline = []
        for ticket in tickets:
            timeline.append({
                "ticket_id": str(ticket["_id"]),
                "user_id": ticket["user_id"],
                "check_in_time": ticket["check_in_time"]
            })
        
        return timeline
        
    @classmethod
    async def update_ticket(cls, db, ticket_id: str, update_data: Dict) -> Optional[Dict]:
        """
        Update ticket fields for a given ticket.
        
        Args:
            db: The database connection.
            ticket_id: Ticket ID.
            update_data: Dictionary of fields to update.
        
        Returns:
            Dict: The updated ticket document, or None if not found.
        """
        return await cls.update_one({"_id": ObjectId(ticket_id)}, {"$set": update_data})

    @classmethod
    async def delete_ticket(cls, db, ticket_id: str) -> int:
        """
        Delete a ticket by ID.
        
        Args:
            db: The database connection.
            ticket_id: Ticket ID.
            
        Returns:
            int: The number of documents deleted (should be 1 if successful).
        """
        from bson import ObjectId  # Ensure ObjectId is imported
        return await cls.delete_one({"_id": ObjectId(ticket_id)})