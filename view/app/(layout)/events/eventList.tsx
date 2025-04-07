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
  const { userId, setUserId } = useAppContext();
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
    console.log(event.participants);
    let userId = localStorage.getItem("user_id");
    console.log(userId);
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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {events.length === 0 ? (
        <p className="text-center text-gray-600">No events available.</p>
      ) : (
        <div className="space-y-6">
          {events.map((event, index) => (
            <div key={index} className="p-6 rounded-lg shadow-lg bg-[#FFFAF0]">
              {/* Event Header */}
              <h2 className="text-2xl font-bold text-orange-400">
                {event.name}
              </h2>
              <p className="text-gray-700 mt-2">{event.description}</p>

              {/* Event Details */}
              <div className="mt-4 text-gray-700 space-y-2">
                <p>
                  <strong>Type:</strong> {event.event_type}
                </p>
                <p>
                  <strong>Dates:</strong> {event.start_date} - {event.end_date}
                </p>
                <p>
                  <strong>Organizer:</strong> {event.organizer}
                </p>
                <p>
                  <strong>Venue:</strong> {event.venue}
                </p>
              </div>

              {/* Sessions section commented out in original code */}

              {!isRegistered(event) ? (
                <button
                  type="submit"
                  onClick={() => handleSignUp(event)}
                  className="bg-orange-400 text-white text-sm rounded-3xl px-3 py-1.5 my-2 ml-auto block cursor-pointer active:bg-orange-500"
                >
                  Sign Up
                </button>
              ) : (
                <div className="flex justify-end text-orange-400 text-sm mt-10 font-bold block">
                  You're Registered!
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllEvents;
