from pydantic import BaseModel, Field, EmailStr
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from enum import Enum

class CurrencyEnum(str, Enum):
    """Supported currencies"""
    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"
    CAD = "CAD"
    AUD = "AUD"
    JPY = "JPY"

class PaymentStatusEnum(str, Enum):
    """Payment statuses"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"

class PaymentMethodEnum(str, Enum):
    """Payment methods"""
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    PAYPAL = "paypal"
    BANK_TRANSFER = "bank_transfer"

class DiscountTypeEnum(str, Enum):
    """Discount types"""
    PERCENTAGE = "percentage"
    FIXED_AMOUNT = "fixed_amount"

class PaymentSchema(BaseModel):
    """Schema for payment transactions"""
    id: Optional[str] = None
    
    # Core payment details
    amount: float
    currency: CurrencyEnum = CurrencyEnum.USD
    status: PaymentStatusEnum = PaymentStatusEnum.PENDING
    
    # Relations
    user_id: str  # Reference to User making the payment
    event_id: str  # Reference to Event
    ticket_id: Optional[str] = None  # Reference to Ticket
    
    # Payment method
    payment_method: PaymentMethodEnum
    payment_provider: str  # Name of payment processor
    payment_reference: Optional[str] = None  # Reference ID from payment provider
    
    # Billing information
    billing_name: Optional[str] = None
    billing_email: Optional[EmailStr] = None
    billing_address: Optional[Dict[str, Any]] = None
    last_four: Optional[str] = None  # Last four digits of card
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    processed_at: Optional[datetime] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        orm_mode = True

class RefundSchema(BaseModel):
    """Schema for refund transactions"""
    id: Optional[str] = None
    payment_id: str  # Reference to original Payment
    
    # Refund details
    amount: float
    reason: str
    status: PaymentStatusEnum = PaymentStatusEnum.PROCESSING
    
    # Who processed it
    processed_by: Optional[str] = None  # Reference to User who processed the refund
    
    # Timestamps
    requested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    processed_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True

class DiscountCodeSchema(BaseModel):
    """Schema for discount codes"""
    id: Optional[str] = None
    event_id: str  # Reference to Event
    code: str
    description: Optional[str] = None
    
    # Discount value
    discount_type: DiscountTypeEnum
    discount_value: float  # Percentage or fixed amount
    
    # Usage limits
    usage_limit: Optional[int] = None  # Total number of uses allowed
    usage_count: int = 0
    
    # Time constraints
    valid_from: datetime
    valid_until: datetime
    
    # Status
    is_active: bool = True
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str  # Reference to User who created the code
    
    class Config:
        orm_mode = True

class SponsorshipSchema(BaseModel):
    """Schema for sponsorship packages and sponsors"""
    id: Optional[str] = None
    event_id: str  # Reference to Event
    
    # Sponsor information
    organization_name: str
    contact_name: str
    contact_email: EmailStr
    
    # Package details
    package_name: str
    package_description: Optional[str] = None
    sponsorship_level: str  # e.g., "Gold", "Silver", "Bronze"
    
    # Financial details
    amount: float
    currency: CurrencyEnum = CurrencyEnum.USD
    payment_status: PaymentStatusEnum = PaymentStatusEnum.PENDING
    
    # Benefits
    benefits: List[str] = Field(default_factory=list)
    logo_url: Optional[str] = None
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        orm_mode = True