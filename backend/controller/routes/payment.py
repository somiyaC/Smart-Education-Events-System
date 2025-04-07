from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from controller.database import db_instance as db
from models.payment_model import PaymentModel  # Correct import

import uuid

router = APIRouter()

class PaymentRequest(BaseModel):
    amount: float
    currency: str
    status: str
    user_id: str
    event_id: str
    payment_method: str
    payment_provider: str
    billing_name: str
    billing_email: str
    billing_address: dict
    last_four: str
    discount_code: Optional[str] = None

class Sponsor(BaseModel):
    id: str
    event_id: str
    name: str
    amount: float
    contribution_date: datetime


@router.post("/payments/process")
async def process_payment(payment: PaymentRequest):
    payment_id = str(uuid.uuid4())
    data = payment.dict()

    # Call the class method instead of direct function
    await PaymentModel.create_payment(
        user_id=data["user_id"],
        event_id=data["event_id"],
        amount=data["amount"],
        currency=data["currency"],
        payment_method=data["payment_method"],
        payment_provider=data["payment_provider"],
        billing_name=data["billing_name"],
        billing_email=data["billing_email"],
        billing_address=data["billing_address"],
        last_four=data["last_four"]
    )

    return {"status": True, "msg": "Payment recorded", "payment_id": payment_id}


@router.get("/revenue/{event_id}")
async def get_event_revenue(event_id: str):
    revenue = await PaymentModel.calculate_event_revenue(event_id)
    return {"event_id": event_id, **revenue}


# The following sponsor-related routes require actual Sponsor model methods
# Placeholder methods used below — you'll need to implement SponsorModel in payment_model.py

@router.post("/add_sponsor")
async def add_sponsor(sponsor: Sponsor):
    sponsor.id = str(uuid.uuid4())
    sponsor.contribution_date = datetime.now()
    # Assuming you have a SponsorModel similar to PaymentModel
    from models.payment_model import SponsorshipModel
    await SponsorshipModel.create_sponsorship(
        event_id=sponsor.event_id,
        organization_name=sponsor.name,
        contact_name="",
        contact_email="",
        package_name="",
        sponsorship_level="",
        amount=sponsor.amount
    )
    return {"status": True, "msg": "Sponsor recorded", "sponsor_id": sponsor.id}


@router.get("/sponsors/{event_id}")
async def get_event_sponsors(event_id: str):
    from models.payment_model import SponsorshipModel
    sponsors = await SponsorshipModel.get_event_sponsorships(event_id)
    return sponsors


@router.get("/payments/user/{user_id}")
async def fetch_payments_by_user(user_id: str):
    payments = await PaymentModel.get_user_payments(user_id)
    return {"user_id": user_id, "payments": payments}


@router.get("/payments/event/{event_id}")
async def fetch_payments_by_event(event_id: str):
    payments = await PaymentModel.get_event_payments(event_id)
    return {"event_id": event_id, "payments": payments}
