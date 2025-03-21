"""
Base model module providing common database operations for all models.
"""
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from bson import ObjectId
from pymongo import ReturnDocument
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase


class Database:
    """
    Database connection manager.
    Handles connection to MongoDB using Motor async driver.
    """
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None
    
    @classmethod
    async def connect_db(cls, mongo_uri: str, db_name: str):
        """Initialize the database connection."""
        cls.client = AsyncIOMotorClient(mongo_uri)
        cls.db = cls.client[db_name]
        print(f"Connected to MongoDB: {db_name}")
    
    @classmethod
    async def close_db(cls):
        """Close the database connection."""
        if cls.client:
            cls.client.close()
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
        if not Database.db:
            raise ConnectionError("Database connection not established")
        if not cls.collection_name:
            raise ValueError(f"collection_name not set for {cls.__name__}")
        return Database.db[cls.collection_name]
    
    @classmethod
    async def find_one(cls, query: Dict):
        """Find a single document by query."""
        collection = await cls.get_collection()
        result = await collection.find_one(query)
        if result and '_id' in result:
            result['id'] = str(result['_id'])
        return result
    
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
        for result in results:
            if '_id' in result:
                result['id'] = str(result['_id'])
        return results
    
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
        return result
    
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
        return await cursor.to_list(length=None)
    
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