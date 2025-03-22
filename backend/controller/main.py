from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routes import events, auth, venue, ticket, session, poll, feedback, chat

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

init_db()

# Registering all routes
app.include_router(events.router, prefix="/events", tags=["Events"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(venue.router, prefix="/venues", tags=["Venues"])
app.include_router(ticket.router, prefix="/tickets", tags=["Tickets"])
app.include_router(session.router, prefix="/sessions", tags=["Sessions"])
app.include_router(poll.router, prefix="/polls", tags=["Polls"])
app.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
