"""
Base model module providing common database operations for all models.
"""
from typing import Dict, List
from datetime import datetime, timezone
from bson import ObjectId
from pymongo import ReturnDocument
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from controller.database import MONGO_URI, DB_NAME


def convert_objectids(obj):
    """
    Recursively convert ObjectId values in a dict or list to strings.
    """
    if isinstance(obj, dict):
        return {k: convert_objectids(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectids(item) for item in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj


class Database:
    """
    Asynchronous Singleton Database connection manager.
    Handles connection to MongoDB using Motor async driver.
    """
    _instance = None
    _client: AsyncIOMotorClient = None
    _db: AsyncIOMotorDatabase = None

    def __new__(cls):
        """Singleton pattern to ensure only one database connection."""
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
        return cls._instance

    @classmethod
    async def connect_db(cls):
        """Initialize the database connection."""
        if cls._client is None:
            cls._client = AsyncIOMotorClient(MONGO_URI)
            cls._db = cls._client[DB_NAME]
            print(f"Connected to MongoDB: {DB_NAME}")

    @classmethod
    async def get_db(cls):
        """Return the async database instance."""
        if cls._db is None:
            raise ConnectionError("Database connection not established.")
        return cls._db

    @classmethod
    async def close_db(cls):
        """Close the database connection."""
        if cls._client:
            cls._client.close()
            print("MongoDB connection closed")


class BaseModel:
    """
    Base model class that all models inherit from.
    Provides common database operations.
    """
    collection_name: str = None
    
    @classmethod
    async def get_collection(cls):
        """Get the MongoDB collection for this model."""
        if Database._db is None:
            raise ConnectionError("Database connection not established")
        if cls.collection_name is None or cls.collection_name == "":
            raise ValueError(f"collection_name not set for {cls.__name__}")
        return Database._db[cls.collection_name]
    
    @classmethod
    async def find_one(cls, query: Dict):
        """Find a single document by query."""
        collection = await cls.get_collection()
        result = await collection.find_one(query)
        if result and '_id' in result:
            result['id'] = str(result['_id'])
            # Optionally remove the original _id field:
            del result['_id']
        return convert_objectids(result)
    
    @classmethod
    async def find_many(cls, query: Dict, limit: int = 0, skip: int = 0, sort=None):
        """Find multiple documents by query with pagination and sorting."""
        collection = await cls.get_collection()
        cursor = collection.find(query)
        
        if skip:
            cursor = cursor.skip(skip)
        if limit:
            cursor = cursor.limit(limit)
        if sort:
            cursor = cursor.sort(sort)
            
        results = await cursor.to_list(length=None)
        new_results = []
        for result in results:
            if '_id' in result:
                result['id'] = str(result['_id'])
                del result['_id']
            new_results.append(convert_objectids(result))
        return new_results
    
    @classmethod
    async def insert_one(cls, document: Dict):
        """Insert a single document."""
        # Convert 'id' to '_id' if it exists
        if 'id' in document and document['id'] is not None:
            document['_id'] = ObjectId(document['id'])
            del document['id']
        
        collection = await cls.get_collection()
        result = await collection.insert_one(document)
        return result.inserted_id
    
    @classmethod
    async def update_one(cls, query: Dict, update: Dict, upsert: bool = False):
        """Update a single document."""
        collection = await cls.get_collection()
        result = await collection.find_one_and_update(
            query, 
            update, 
            upsert=upsert,
            return_document=ReturnDocument.AFTER
        )
        if result and '_id' in result:
            result['id'] = str(result['_id'])
            del result['_id']
        return convert_objectids(result)
    
    @classmethod
    async def delete_one(cls, query: Dict):
        """Delete a single document."""
        collection = await cls.get_collection()
        result = await collection.delete_one(query)
        return result.deleted_count
    
    @classmethod
    async def count(cls, query: Dict = None):
        """Count documents matching a query."""
        if query is None:
            query = {}
        collection = await cls.get_collection()
        return await collection.count_documents(query)
    
    @classmethod
    async def aggregate(cls, pipeline: List[Dict]):
        """Perform an aggregation pipeline query."""
        collection = await cls.get_collection()
        cursor = collection.aggregate(pipeline)
        results = await cursor.to_list(length=None)
        return convert_objectids(results)
    
    @staticmethod
    def prepare_document(document: Dict) -> Dict:
        """Prepare a document for MongoDB storage."""
        # Handle ObjectId conversion
        if 'id' in document and document['id'] is not None:
            document['_id'] = ObjectId(document['id'])
            del document['id']
        
        # Set timestamps if needed
        now = datetime.now(timezone.utc)
        if 'created_at' not in document:
            document['created_at'] = now
            
        return document
