"use client";
import { useState, useEffect } from "react";
import { useAppContext } from "../../StateContext";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

interface Session {
  title: string;
  description: string;
  speaker: string;
  startTime: string;
  endTime: string;
}

interface Event {
  id: string;
  name: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string;
  organizer: string;
  venue: string;
  sessions: Session[];
  participants: string[];
}

const AllEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const { userId, setUserId, isAdmin } = useAppContext();
  const searchParams = useSearchParams();
  const search = searchParams.get("q");
  console.log("param", search);

  // Fetch all events from the backend
  useEffect(() => {
    let search_query = "";
    if (search) {
      search_query = search;
    }
    fetch("http://localhost:8000/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: search_query }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data.events);
        setEvents(data.events);
      })
      .catch((error) => console.error("Error fetching events:", error));
  }, [search]);

  const isRegistered = (event: Event) => {
    let userId = localStorage.getItem("user_id");
    if (userId && event.participants.includes(userId)) {
      return true;
    }
    return false;
  };

  const router = useRouter();

  const handleSignUp = async (event: Event) => {
    const userId = localStorage.getItem("user_id");

    router.push(
      `/payment?eventId=${event.id}&price=20.50&eventName=${encodeURIComponent(
        event.name
      )}`
    );
  };

  // New function to handle event editing
  const handleEditEvent = (eventId: string) => {
    router.push(`/edit-event/${eventId}`);
  };

  // Check if the current user can edit events - only admins
  const canEditEvent = () => {
    return isAdmin;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {events.length === 0 ? (
        <p className="text-center text-gray-600">No events available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event, index) => (
            <div
              key={index}
              className="p-6 rounded-lg shadow-xl bg-orange-50 hover:shadow-2xl transition-shadow duration-300 ease-in-out"
            >
              {/* Event Header */}
              <h2 className="text-2xl font-semibold text-orange-500">
                {event.name}
              </h2>
              <p className="text-gray-600 mt-2">{event.description}</p>
              {/* Event Details */}
              <div className="mt-4 text-gray-700 space-y-2">
                <p>
                  <strong className="font-medium">Type:</strong>{" "}
                  {event.event_type}
                </p>
                <p>
                  <strong className="font-medium">Dates:</strong>{" "}
                  {event.start_date} - {event.end_date}
                </p>
                <p>
                  <strong className="font-medium">Organizer:</strong>{" "}
                  {event.organizer}
                </p>
                <p>
                  <strong className="font-medium">Venue:</strong> {event.venue}
                </p>
              </div>
              <div className="flex space-x-2 mt-4">
                {!isRegistered(event) ? (
                  <button
                    type="submit"
                    onClick={() => handleSignUp(event)}
                    className="bg-orange-500 text-white text-sm rounded-3xl px-4 py-2 flex-grow acursor-pointer active:bg-orange-400"
                  >
                    Sign Up
                  </button>
                ) : (
                  <div className="flex justify-center text-orange-500 text-sm flex-grow font-bold py-2">
                    You're Registered!
                  </div>
                )}

                {/* Edit button - only visible to admins */}
                {canEditEvent() && (
                  <button
                    onClick={() => handleEditEvent(event.id)}
                    className="bg-blue-500 text-white text-sm rounded-3xl px-4 py-2 cursor-pointer active:bg-blue-400"
                  >
                    Edit Event
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllEvents;
