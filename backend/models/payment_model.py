"""
Payment model module for handling payment and financial management.
Based on the payment schemas.
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from bson import ObjectId
import uuid

from .base_model import BaseModel


class PaymentModel(BaseModel):
    """
    Model for payment data operations.
    Handles all database interactions for payments.
    """
    collection_name = "payments"
    
    @classmethod
    async def create_payment(cls, user_id: str, event_id: str, amount: float, 
                          currency: str, payment_method: str, payment_provider: str,
                          ticket_id: Optional[str] = None, 
                          payment_reference: Optional[str] = None,
                          billing_name: Optional[str] = None,
                          billing_email: Optional[str] = None,
                          billing_address: Optional[Dict] = None,
                          last_four: Optional[str] = None) -> str:
        """
        Create a new payment record.
        
        Args:
            user_id: ID of the user making the payment
            event_id: ID of the event
            amount: Payment amount
            currency: Currency code (USD, EUR, etc.)
            payment_method: Payment method (credit_card, paypal, etc.)
            payment_provider: Payment provider (stripe, paypal, etc.)
            ticket_id: Optional ticket ID associated with this payment
            payment_reference: Optional reference ID from payment provider
            billing_name: Optional name on the billing account
            billing_email: Optional email for the billing account
            billing_address: Optional billing address
            last_four: Optional last four digits of payment card
            
        Returns:
            str: ID of the created payment record
        """
        now = datetime.now(timezone.utc)
        
        payment_data = {
            "user_id": user_id,
            "event_id": event_id,
            "amount": amount,
            "currency": currency,
            "status": "pending",
            "payment_method": payment_method,
            "payment_provider": payment_provider,
            "created_at": now,
            "updated_at": now
        }
        
        # Add optional fields if provided
        if ticket_id:
            payment_data["ticket_id"] = ticket_id
            
        if payment_reference:
            payment_data["payment_reference"] = payment_reference
            
        if billing_name:
            payment_data["billing_name"] = billing_name
            
        if billing_email:
            payment_data["billing_email"] = billing_email
            
        if billing_address:
            payment_data["billing_address"] = billing_address
            
        if last_four:
            payment_data["last_four"] = last_four
        
        payment_id = await cls.insert_one(payment_data)
        return str(payment_id)
    
    @classmethod
    async def get_payment_by_id(cls, payment_id: str) -> Dict:
        """
        Get payment details by ID.
        
        Args:
            payment_id: Payment ID
            
        Returns:
            Dict: Payment document or None if not found
        """
        return await cls.find_one({"_id": ObjectId(payment_id)})
    
    @classmethod
    async def get_user_payments(cls, user_id: str) -> List[Dict]:
        """
        Get all payments for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            List[Dict]: List of payment documents
        """
        return await cls.find_many({"user_id": user_id})
    
    @classmethod
    async def get_event_payments(cls, event_id: str) -> List[Dict]:
        """
        Get all payments for an event.
        
        Args:
            event_id: Event ID
            
        Returns:
            List[Dict]: List of payment documents
        """
        return await cls.find_many({"event_id": event_id})
    
    @classmethod
    async def update_payment_status(cls, payment_id: str, status: str, 
                                 payment_reference: Optional[str] = None) -> Optional[Dict]:
        """
        Update a payment's status.
        
        Args:
            payment_id: Payment ID
            status: New status (pending, processing, completed, failed, etc.)
            payment_reference: Optional reference ID from payment provider
            
        Returns:
            Dict: Updated payment document or None if not found
        """
        now = datetime.now(timezone.utc)
        
        update_data = {
            "status": status,
            "updated_at": now
        }
        
        if status == "completed":
            update_data["processed_at"] = now
            
        if payment_reference:
            update_data["payment_reference"] = payment_reference
            
        return await cls.update_one(
            {"_id": ObjectId(payment_id)},
            {"$set": update_data}
        )
    
    @classmethod
    async def process_payment(cls, payment_id: str) -> Dict:
        """
        Process a payment (in a real system, this would integrate with payment providers).
        
        Args:
            payment_id: Payment ID
            
        Returns:
            Dict: Processing result
        """
        payment = await cls.get_payment_by_id(payment_id)
        
        if not payment:
            return {"success": False, "error": "Payment not found"}
            
        if payment["status"] != "pending":
            return {"success": False, "error": f"Payment is already in {payment['status']} state"}
            
        # In a real system, this would call the payment provider's API
        # For now, we'll simulate a successful payment
        
        # Generate a mock payment reference
        payment_reference = f"PAY-{uuid.uuid4().hex[:12].upper()}"
        
        # Update the payment status
        updated_payment = await cls.update_payment_status(
            payment_id,
            "completed",
            payment_reference
        )
        
        if updated_payment:
            # If this was for a ticket, update the ticket status
            if "ticket_id" in payment and payment["ticket_id"]:
                # In a real system, this would update the ticket
                # For now, we just note this in the response
                pass
                
            return {
                "success": True,
                "payment_id": payment_id,
                "status": "completed",
                "payment_reference": payment_reference,
                "processed_at": updated_payment.get("processed_at")
            }
        else:
            return {"success": False, "error": "Failed to update payment status"}
    
    @classmethod
    async def calculate_event_revenue(cls, event_id: str) -> Dict:
        """
        Calculate total revenue for an event.
        
        Args:
            event_id: Event ID
            
        Returns:
            Dict: Revenue statistics
        """
        # Get all completed payments for the event
        payments = await cls.find_many({
            "event_id": event_id,
            "status": "completed"
        })
        
        # Calculate totals by currency
        revenue_by_currency = {}
        for payment in payments:
            currency = payment.get("currency", "USD")
            amount = payment.get("amount", 0)
            
            if currency not in revenue_by_currency:
                revenue_by_currency[currency] = 0
                
            revenue_by_currency[currency] += amount
            
        # Calculate the total number of payments
        total_payments = len(payments)
        
        # Calculate average payment amount (if there are payments)
        average_amount = None
        if total_payments > 0 and "USD" in revenue_by_currency:  # Assuming USD for simplicity
            average_amount = revenue_by_currency["USD"] / total_payments
            
        return {
            "event_id": event_id,
            "total_payments": total_payments,
            "revenue_by_currency": revenue_by_currency,
            "average_payment_amount": average_amount
        }
    

class RefundModel(BaseModel):
    """
    Model for refund data operations.
    Handles all database interactions for refunds.
    """
    collection_name = "refunds"
    
    @classmethod
    async def create_refund(cls, payment_id: str, amount: float, reason: str, 
                         processed_by: Optional[str] = None) -> str:
        """
        Create a new refund record.
        
        Args:
            payment_id: ID of the original payment
            amount: Refund amount
            reason: Reason for the refund
            processed_by: Optional ID of the user processing the refund
            
        Returns:
            str: ID of the created refund record
        """
        now = datetime.now(timezone.utc)
        
        # Get the original payment details
        payment = await PaymentModel.get_payment_by_id(payment_id)
        if not payment:
            raise ValueError("Original payment not found")
            
        refund_data = {
            "payment_id": payment_id,
            "amount": amount,
            "reason": reason,
            "status": "processing",
            "requested_at": now
        }
        
        if processed_by:
            refund_data["processed_by"] = processed_by
            
        refund_id = await cls.insert_one(refund_data)
        return str(refund_id)
    
    @classmethod
    async def get_refund_by_id(cls, refund_id: str) -> Dict:
        """
        Get refund details by ID.
        
        Args:
            refund_id: Refund ID
            
        Returns:
            Dict: Refund document or None if not found
        """
        return await cls.find_one({"_id": ObjectId(refund_id)})
    
    @classmethod
    async def get_payment_refunds(cls, payment_id: str) -> List[Dict]:
        """
        Get all refunds for a payment.
        
        Args:
            payment_id: Payment ID
            
        Returns:
            List[Dict]: List of refund documents
        """
        return await cls.find_many({"payment_id": payment_id})
    
    @classmethod
    async def update_refund_status(cls, refund_id: str, status: str, 
                               payment_provider_reference: Optional[str] = None) -> Optional[Dict]:
        """
        Update a refund's status.
        
        Args:
            refund_id: Refund ID
            status: New status (processing, completed, failed)
            payment_provider_reference: Optional reference from payment provider
            
        Returns:
            Dict: Updated refund document or None if not found
        """
        now = datetime.now(timezone.utc)
        
        update_data = {"status": status}
        
        if status in ["completed", "failed"]:
            update_data["processed_at"] = now
            
        if payment_provider_reference:
            update_data["payment_provider_reference"] = payment_provider_reference
            
        return await cls.update_one(
            {"_id": ObjectId(refund_id)},
            {"$set": update_data}
        )
    
    @classmethod
    async def process_refund(cls, refund_id: str) -> Dict:
        """
        Process a refund (in a real system, this would integrate with payment providers).
        
        Args:
            refund_id: Refund ID
            
        Returns:
            Dict: Processing result
        """
        refund = await cls.get_refund_by_id(refund_id)
        
        if not refund:
            return {"success": False, "error": "Refund not found"}
            
        if refund["status"] != "processing":
            return {"success": False, "error": f"Refund is already in {refund['status']} state"}
            
        # In a real system, this would call the payment provider's API
        # For now, we'll simulate a successful refund
        
        # Generate a mock refund reference
        refund_reference = f"REF-{uuid.uuid4().hex[:12].upper()}"
        
        # Update the refund status
        updated_refund = await cls.update_refund_status(
            refund_id,
            "completed",
            refund_reference
        )
        
        if updated_refund:
            # Update the original payment status
            payment_id = refund["payment_id"]
            await PaymentModel.update_payment_status(payment_id, "refunded")
            
            return {
                "success": True,
                "refund_id": refund_id,
                "status": "completed",
                "payment_provider_reference": refund_reference,
                "processed_at": updated_refund.get("processed_at")
            }
        else:
            return {"success": False, "error": "Failed to update refund status"}


class DiscountCodeModel(BaseModel):
    """
    Model for discount code data operations.
    Handles all database interactions for discount codes.
    """
    collection_name = "discount_codes"
    
    @classmethod
    async def create_discount_code(cls, event_id: str, code: str, discount_type: str,
                                discount_value: float, valid_from: datetime,
                                valid_until: datetime, created_by: str,
                                description: Optional[str] = None,
                                usage_limit: Optional[int] = None) -> str:
        """
        Create a new discount code.
        
        Args:
            event_id: ID of the event
            code: Discount code string
            discount_type: Type of discount (percentage or fixed_amount)
            discount_value: Value of the discount
            valid_from: Start date of validity
            valid_until: End date of validity
            created_by: ID of the user creating the discount
            description: Optional description
            usage_limit: Optional limit on number of uses
            
        Returns:
            str: ID of the created discount code
        """
        now = datetime.now(timezone.utc)
        
        discount_data = {
            "event_id": event_id,
            "code": code,
            "discount_type": discount_type,
            "discount_value": discount_value,
            "valid_from": valid_from,
            "valid_until": valid_until,
            "is_active": True,
            "usage_count": 0,
            "created_at": now,
            "created_by": created_by
        }
        
        if description:
            discount_data["description"] = description
            
        if usage_limit is not None:
            discount_data["usage_limit"] = usage_limit
            
        discount_id = await cls.insert_one(discount_data)
        return str(discount_id)
    
    @classmethod
    async def get_discount_by_id(cls, discount_id: str) -> Dict:
        """
        Get discount code details by ID.
        
        Args:
            discount_id: Discount code ID
            
        Returns:
            Dict: Discount code document or None if not found
        """
        return await cls.find_one({"_id": ObjectId(discount_id)})
    
    @classmethod
    async def get_discount_by_code(cls, event_id: str, code: str) -> Dict:
        """
        Get discount code details by code.
        
        Args:
            event_id: Event ID
            code: Discount code string
            
        Returns:
            Dict: Discount code document or None if not found
        """
        return await cls.find_one({
            "event_id": event_id,
            "code": code
        })
    
    @classmethod
    async def get_event_discount_codes(cls, event_id: str, active_only: bool = False) -> List[Dict]:
        """
        Get all discount codes for an event.
        
        Args:
            event_id: Event ID
            active_only: Whether to return only active discount codes
            
        Returns:
            List[Dict]: List of discount code documents
        """
        query = {"event_id": event_id}
        
        if active_only:
            now = datetime.now(timezone.utc)
            query.update({
                "is_active": True,
                "valid_from": {"$lte": now},
                "valid_until": {"$gte": now}
            })
            
        return await cls.find_many(query)
    
    @classmethod
    async def update_discount_code(cls, discount_id: str, update_data: Dict) -> Optional[Dict]:
        """
        Update a discount code.
        
        Args:
            discount_id: Discount code ID
            update_data: Dictionary containing fields to update
            
        Returns:
            Dict: Updated discount code document or None if not found
        """
        allowed_fields = [
            "code", "description", "discount_type", "discount_value",
            "valid_from", "valid_until", "is_active", "usage_limit"
        ]
        filtered_update = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        return await cls.update_one(
            {"_id": ObjectId(discount_id)},
            {"$set": filtered_update}
        )
    
    @classmethod
    async def increment_usage_count(cls, discount_id: str) -> Optional[Dict]:
        """
        Increment the usage count for a discount code.
        
        Args:
            discount_id: Discount code ID
            
        Returns:
            Dict: Updated discount code document or None if not found
        """
        return await cls.update_one(
            {"_id": ObjectId(discount_id)},
            {"$inc": {"usage_count": 1}}
        )
    
    @classmethod
    async def validate_discount_code(cls, event_id: str, code: str) -> Dict:
        """
        Validate a discount code.
        
        Args:
            event_id: Event ID
            code: Discount code string
            
        Returns:
            Dict: Validation result
        """
        discount = await cls.get_discount_by_code(event_id, code)
        
        if not discount:
            return {
                "valid": False,
                "reason": "Discount code not found"
            }
            
        now = datetime.now(timezone.utc)
        
        # Check if the code is active
        if not discount.get("is_active", True):
            return {
                "valid": False,
                "reason": "Discount code is not active"
            }
            
        # Check if the code is within its validity period
        valid_from = discount.get("valid_from")
        valid_until = discount.get("valid_until")
        
        if valid_from and valid_from > now:
            return {
                "valid": False,
                "reason": "Discount code is not yet valid"
            }
            
        if valid_until and valid_until < now:
            return {
                "valid": False,
                "reason": "Discount code has expired"
            }
            
        # Check if the code has reached its usage limit
        usage_limit = discount.get("usage_limit")
        usage_count = discount.get("usage_count", 0)
        
        if usage_limit is not None and usage_count >= usage_limit:
            return {
                "valid": False,
                "reason": "Discount code has reached its usage limit"
            }
            
        # Calculate the discount amount
        discount_type = discount.get("discount_type")
        discount_value = discount.get("discount_value", 0)
        
        return {
            "valid": True,
            "discount_id": str(discount["_id"]),
            "discount_type": discount_type,
            "discount_value": discount_value
        }
    
    @classmethod
    async def apply_discount(cls, event_id: str, code: str, original_amount: float) -> Dict:
        """
        Apply a discount code and calculate the discounted amount.
        
        Args:
            event_id: Event ID
            code: Discount code string
            original_amount: Original amount before discount
            
        Returns:
            Dict: Discount application result
        """
        validation = await cls.validate_discount_code(event_id, code)
        
        if not validation["valid"]:
            return {
                "success": False,
                "reason": validation["reason"],
                "original_amount": original_amount,
                "discounted_amount": original_amount
            }
            
        discount_type = validation["discount_type"]
        discount_value = validation["discount_value"]
        discount_id = validation["discount_id"]
        
        if discount_type == "percentage":
            # Percentage discount
            discount_amount = original_amount * (discount_value / 100)
            discounted_amount = original_amount - discount_amount
        else:
            # Fixed amount discount
            discount_amount = min(discount_value, original_amount)  # Don't allow negative totals
            discounted_amount = original_amount - discount_amount
            
        # Increment the usage count
        await cls.increment_usage_count(discount_id)
        
        return {
            "success": True,
            "discount_id": discount_id,
            "original_amount": original_amount,
            "discount_amount": round(discount_amount, 2),
            "discounted_amount": round(discounted_amount, 2),
            "discount_type": discount_type,
            "discount_value": discount_value
        }


class SponsorshipModel(BaseModel):
    """
    Model for sponsorship data operations.
    Handles all database interactions for sponsorships.
    """
    collection_name = "sponsorships"
    
    @classmethod
    async def create_sponsorship(cls, event_id: str, organization_name: str,
                              contact_name: str, contact_email: str,
                              package_name: str, sponsorship_level: str,
                              amount: float, currency: str = "USD",
                              package_description: Optional[str] = None,
                              benefits: List[str] = None,
                              logo_url: Optional[str] = None) -> str:
        """
        Create a new sponsorship record.
        
        Args:
            event_id: ID of the event
            organization_name: Name of the sponsoring organization
            contact_name: Name of the contact person
            contact_email: Email of the contact person
            package_name: Name of the sponsorship package
            sponsorship_level: Level of sponsorship (e.g., "Gold", "Silver")
            amount: Sponsorship amount
            currency: Currency code (default: USD)
            package_description: Optional description of the package
            benefits: Optional list of benefits
            logo_url: Optional URL to the sponsor's logo
            
        Returns:
            str: ID of the created sponsorship record
        """
        now = datetime.now(timezone.utc)
        
        if benefits is None:
            benefits = []
            
        sponsorship_data = {
            "event_id": event_id,
            "organization_name": organization_name,
            "contact_name": contact_name,
            "contact_email": contact_email,
            "package_name": package_name,
            "sponsorship_level": sponsorship_level,
            "amount": amount,
            "currency": currency,
            "payment_status": "pending",
            "benefits": benefits,
            "created_at": now,
            "updated_at": now
        }
        
        if package_description:
            sponsorship_data["package_description"] = package_description
            
        if logo_url:
            sponsorship_data["logo_url"] = logo_url
            
        sponsorship_id = await cls.insert_one(sponsorship_data)
        return str(sponsorship_id)
    
    @classmethod
    async def get_sponsorship_by_id(cls, sponsorship_id: str) -> Dict:
        """
        Get sponsorship details by ID.
        
        Args:
            sponsorship_id: Sponsorship ID
            
        Returns:
            Dict: Sponsorship document or None if not found
        """
        return await cls.find_one({"_id": ObjectId(sponsorship_id)})
    
    @classmethod
    async def get_event_sponsorships(cls, event_id: str) -> List[Dict]:
        """
        Get all sponsorships for an event.
        
        Args:
            event_id: Event ID
            
        Returns:
            List[Dict]: List of sponsorship documents
        """
        return await cls.find_many({"event_id": event_id})
    
    @classmethod
    async def update_sponsorship(cls, sponsorship_id: str, update_data: Dict) -> Optional[Dict]:
        """
        Update a sponsorship record.
        
        Args:
            sponsorship_id: Sponsorship ID
            update_data: Dictionary containing fields to update
            
        Returns:
            Dict: Updated sponsorship document or None if not found
        """
        now = datetime.now(timezone.utc)
        
        allowed_fields = [
            "organization_name", "contact_name", "contact_email", 
            "package_name", "package_description", "sponsorship_level",
            "amount", "currency", "payment_status", "benefits", "logo_url"
        ]
        filtered_update = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        # Always update the updated_at timestamp
        filtered_update["updated_at"] = now
        
        return await cls.update_one(
            {"_id": ObjectId(sponsorship_id)},
            {"$set": filtered_update}
        )
    
    @classmethod
    async def update_payment_status(cls, sponsorship_id: str, status: str) -> Optional[Dict]:
        """
        Update a sponsorship's payment status.
        
        Args:
            sponsorship_id: Sponsorship ID
            status: New payment status
            
        Returns:
            Dict: Updated sponsorship document or None if not found
        """
        return await cls.update_one(
            {"_id": ObjectId(sponsorship_id)},
            {
                "$set": {
                    "payment_status": status,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
    
    @classmethod
    async def get_sponsorship_stats(cls, event_id: str) -> Dict:
        """
        Get sponsorship statistics for an event.
        
        Args:
            event_id: Event ID
            
        Returns:
            Dict: Sponsorship statistics
        """
        sponsorships = await cls.get_event_sponsorships(event_id)
        
        # Count by level
        counts_by_level = {}
        amounts_by_level = {}
        
        # Count by payment status
        counts_by_status = {
            "pending": 0,
            "completed": 0,
            "cancelled": 0
        }
        
        # Calculate totals
        total_count = len(sponsorships)
        total_amount = 0
        
        for sponsorship in sponsorships:
            level = sponsorship.get("sponsorship_level")
            status = sponsorship.get("payment_status")
            amount = sponsorship.get("amount", 0)
            
            # Count by level
            if level not in counts_by_level:
                counts_by_level[level] = 0
                amounts_by_level[level] = 0
                
            counts_by_level[level] += 1
            amounts_by_level[level] += amount
            
            # Count by status
            if status in counts_by_status:
                counts_by_status[status] += 1
                
            # Total amount (only count completed payments)
            if status == "completed":
                total_amount += amount
        
        return {
            "event_id": event_id,
            "total_sponsors": total_count,
            "total_amount": total_amount,
            "by_level": {
                level: {
                    "count": counts_by_level[level],
                    "amount": amounts_by_level[level]
                }
                for level in counts_by_level
            },
            "by_status": counts_by_status
        }