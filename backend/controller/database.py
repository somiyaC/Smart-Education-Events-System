from pymongo import MongoClient
from pymongo.collection import Collection
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["SEES"]

# Collections
users_collection: Collection = db["users"]
events_collection: Collection = db["events"]
venues_collection: Collection = db["venues"]
tickets_collection: Collection = db["tickets"]
sessions_collection: Collection = db["sessions"]
polls_collection: Collection = db["polls"]
feedback_collection: Collection = db["feedback"]
chat_collection: Collection = db["chat"]

def init_db():
    """Ensure required indexes and collections exist."""
    users_collection.create_index("email", unique=True)
    events_collection.create_index("event_id", unique=True)
    venues_collection.create_index("venue_id", unique=True)
    tickets_collection.create_index("ticket_id", unique=True)
    sessions_collection.create_index("session_id", unique=True)
    polls_collection.create_index("poll_id", unique=True)
    feedback_collection.create_index("feedback_id", unique=True)
    chat_collection.create_index("chat_id", unique=True)
