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

def init_db():
    """Ensure required indexes and collections exist."""
    users_collection.create_index("email", unique=True)
    events_collection.create_index("event_id", unique=True)
