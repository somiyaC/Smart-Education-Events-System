from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
from pymongo import MongoClient
from pymongo.collection import Collection
from datetime import datetime
from pydantic import BaseModel
from bson import ObjectId
from typing import Optional, List, Literal
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter()

client = MongoClient(os.getenv("MONGO_URI")) 
db = client["SEES"]  
questions_collection: Collection = db["questions"]


class QuestionData(BaseModel):
    event_id: str
    user_id: str
    question: str
    answer: str


@router.post("/")
def create_question(question: QuestionData):
    question = question.dict()
    qid = questions_collection.insert_one({
        "event_id": question['event_id'],
        "user_id": question['user_id'],
        "question": question['question'],
        "answer": question['answer']
    })
    return {"question":str(qid.inserted_id)}

@router.get("/")
def get_questions():
    questions = questions_collection.find()
    questions = []
    for question in questions_collection.find():
        question["id"] = str(question["_id"])  # Convert ObjectId to string
        del question['_id']
        questions.append(question)
    return {"questions": questions}