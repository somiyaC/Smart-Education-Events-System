from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controller.database import init_db
from controller.routes import events, auth, venue, ticket, session, poll, feedback, chat, stakeholder_attendee, networking_engagement, promotion, resource_management, analytics, payment
from models.base_model import Database


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# Initialize database connection
@app.on_event("startup")
async def startup_event():
    """Establish the database connection when the app starts."""
    await Database.connect_db()

@app.on_event("shutdown")
async def shutdown_event():
    """Close the database connection when the app shuts down."""
    await Database.close_db()

# Initialize indexes for the collections (this is part of your init_db function)
#init_db()

# Register routes
app.include_router(events.router, prefix="/events", tags=["Events"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(venue.router, prefix="/venues", tags=["Venues"])
app.include_router(ticket.router)
app.include_router(session.router, prefix="/sessions", tags=["Sessions"])
app.include_router(poll.router, prefix="/polls", tags=["Polls"])
app.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(stakeholder_attendee.router)
app.include_router(networking_engagement.router)
app.include_router(promotion.router)
app.include_router(resource_management.router)
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(payment.router, prefix="/payment", tags=["Payment"])

