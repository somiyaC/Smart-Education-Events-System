from pymongo import MongoClient
from pymongo.collection import Collection
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "SEES" 

class DatabaseSingleton:
    """Singleton for managing MongoDB connection."""
    _instance = None
    _client = None
    _db = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseSingleton, cls).__new__(cls)
            cls._client = MongoClient(MONGO_URI)
            cls._db = cls._client[DB_NAME]
        return cls._instance
    
    @classmethod
    def get_db(cls):
        """Return the MongoDB database instance."""
        if cls._db is None:
            raise ConnectionError("Database connection not established.")
        return cls._db


# Initialize the DB instance
db_instance = DatabaseSingleton().get_db()

# Collections
users_collection: Collection = db_instance["users"]
events_collection: Collection = db_instance["events"]
venues_collection: Collection = db_instance["venues"]
tickets_collection: Collection = db_instance["tickets"]
sessions_collection: Collection = db_instance["sessions"]
polls_collection: Collection = db_instance["polls"]
feedback_collection: Collection = db_instance["feedback"]
chat_collection: Collection = db_instance["chat"]

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
