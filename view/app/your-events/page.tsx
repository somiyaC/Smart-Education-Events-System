"use client";

import { useState, useEffect } from "react";

interface Material {
  title: string;
  type: string; // e.g., "PDF", "Video", "Slides"
  url: string;
}

interface Session {
  title: string;
  description: string;
  speaker: string;
  start_time: string;
  end_time: string;
  materials: string;
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
}

const YourEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]); // Default to an empty array
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userId = localStorage.getItem("user_id");
    if (!userId) return;

    fetch("http://localhost:8000/events/user_events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("User's events:", data.events);
        setEvents(data.events || []); // Ensure that it's always an array
      })
      .catch((error) => console.error("Error fetching user events:", error))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsignUp = async (eventId: string) => {
    try {
      const response = await fetch("http://localhost:8000/events/event_cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: localStorage.getItem("user_id"), event_id: eventId }),
      });

      const data = await response.json();
      if (data.status === false) {
        alert("Unable to cancel registration")
        console.log("Unsignup failed");
      } else {
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== eventId)
        );
        alert("Successfully canceled registration");
      }
    } catch (error) {
      console.error("Error unsubscribing:", error);
    }
  };

  if (loading)
    return <p className="text-center text-gray-600">Loading your events...</p>;

  // Ensure events is an array before checking length
  if (!Array.isArray(events) || events.length === 0)
    return (
      <p className="text-center text-gray-600">
        You are not signed up for any events.
      </p>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-orange-500 mb-6">
        Your Events
      </h2>
      <div className="space-y-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="border border-gray-300 p-6 rounded-lg shadow-lg bg-white"
          >
            {/* Event Header */}
            <h2 className="text-2xl font-bold text-orange-400">{event.name}</h2>
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

            {/* Sessions */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800">Sessions:</h3>
              <ul className="mt-2 space-y-4">
                {event.sessions.map((session, idx) => (
                  <li key={idx} className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="text-md font-bold text-orange-300">
                      {session.title}
                    </h4>
                    <p className="text-gray-600">{session.description}</p>
                    <p className="text-gray-700">
                      <strong>Speaker:</strong> {session.speaker}
                    </p>
                    <p className="text-gray-700">
                      <strong>Time:</strong> {session.start_time} -{" "}
                      {session.end_time}
                    </p>

                    {/* Materials */}
                    {session.materials && (
                      <div className="mt-4">
                        <h5 className="text-sm font-semibold text-gray-800">
                          Materials:
                        </h5>
                        <ul className="mt-2 space-y-2">
                            <li className="text-sm">
                              <p
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                {session.materials}
                              </p>
                            </li>
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Unsign Up Button */}
            <button
              onClick={() => handleUnsignUp(event.id)}
              className="bg-red-500 text-white text-sm rounded-3xl px-3 py-1.5 my-2 ml-auto block hover:bg-red-600 transition"
            >
              Cancel Registration
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YourEvents;
