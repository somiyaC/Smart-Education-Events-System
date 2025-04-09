from fastapi import APIRouter
from controller.database import tickets_collection, feedback_collection
from models.event_model import EventModel
from models.session_model import SessionModel
from models.user_model import UserModel
from bson import ObjectId

router = APIRouter()

TICKET_PRICE = 25

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

@router.get("/event_data/{eventId}")
async def get_event_data(eventId: str):
    event = await EventModel.get_event_by_id(eventId)
    if event is None: return {"event":None}
    description = event['description']
    name = event['name']
    location = event['venue_id']
    is_virtual = event['is_virtual']
    total_check_in = len(event['participants'])
    created_at = event['created_at']
    capacity = event['capacity']
    event_type = event['event_type']
    attendees = []
    for participant in event['participants']:
        user = await UserModel.get_user_by_id(participant)
        if user is None: continue
        attendees.append({"email":user['email'],"type":user['role'],"is_registered":True})
    print(total_check_in)
    print(is_virtual)
    return {"attendees":attendees,"description":description, "name": name, "event_type": event_type,
            "location":location, "is_virtual":is_virtual, "capacity": capacity,
            "total_check_in":total_check_in, "created_at": created_at}




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
        return {"events":[], "analytics":{}}
    total_participants = 0
    total_money = 0
    participants_dict = []
    participants_chart = []
    participants_chart_names = []
    sales_dict = []
    total_events = len(events)
    idx = 0
    for event in events:
            total_participants += len(event['participants'])
            total_money += TICKET_PRICE * len(event['participants'])
            sales_dict.append({"name":event['name'], "sales": TICKET_PRICE * len(event['participants'])})
            #participants_dict.append({"name":event["name"],"participants":len(event['participants'])})
            participants_dict.append({"id":idx, "value": len(event['participants']), "label": event['name']})
            participants_chart.append({"data":[len(event['participants'])]})
            participants_chart_names.append(event['name'])
            idx += 1
            continue


    print({"analytics":{"participants_chart_names":participants_chart_names,"participant_chart":participants_chart,"sales_dict": sales_dict, "participants_dict": participants_dict, "total_participants": total_participants, "total_money": total_money, "total_events": total_events}})
    return {"events":events,"analytics":{"participants_chart_names":participants_chart_names,"participants_chart":participants_chart,"sales_dict": sales_dict, "participants_dict": participants_dict, "total_participants": total_participants, "total_money": total_money, "total_events": total_events}}


