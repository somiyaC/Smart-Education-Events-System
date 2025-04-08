from fastapi import APIRouter
from controller.database import tickets_collection, feedback_collection
from models.event_model import EventModel
from models.session_model import SessionModel
from bson import ObjectId

router = APIRouter()

def document_to_dict(doc):
    if doc and '_id' in doc.keys():
        doc['_id'] = str(doc['_id'])
    return doc

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


@router.get("/org_events/{organiserId}")
async def get_org_events(organiserId: str):
    events = await EventModel.get_events_by_organizer(organiserId)

    org_events = []
    for event in events:
        sessions = await SessionModel.get_event_sessions(event['id'])            
        cleaned_sessions = [document_to_dict(session) for session in sessions]
        event['sessions'] = cleaned_sessions
        org_events.append(event)

    if events is None:
        return {"events":[]}
    return {"events":org_events}


