from fastapi import APIRouter
from controller.database import tickets_collection, feedback_collection
from bson import ObjectId

router = APIRouter()

@router.get("/registrations/{event_id}")
def get_registration_count(event_id: str):
    count = tickets_collection.count_documents({"event_id": event_id})
    return {"event_id": event_id, "registration_count": count}


@router.get("/feedback/{event_id}")
def get_average_feedback(event_id: str):
    feedbacks = list(feedback_collection.find({"event_id": event_id}))

    if not feedbacks:
        return {"event_id": event_id, "average_rating": None}

    avg_rating = sum(f["rating"] for f in feedbacks if "rating" in f) / len(feedbacks)
    return {"event_id": event_id, "average_rating": round(avg_rating, 2)}
