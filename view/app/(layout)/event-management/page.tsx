"use client";

import { useEffect, useState } from "react";

interface Event {
  id: string;
  name: string;
  description: string;
  participants_email?: string[];
}

export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:8000/events/organizer_event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ organizer_id: userId }),
        });

        const data = await res.json();
        setEvents(data || []);
      } catch (error) {
        console.error("Failed to fetch organizer events:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchEvents();
    }
  }, [userId]);

  const toggleAttendees = (eventId: string) => {
    setExpandedEventId((prev) => (prev === eventId ? null : eventId));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📅 My Organized Events</h1>

      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold">{event.name}</h2>
              <p className="text-sm text-gray-600 mb-2">{event.description}</p>

              <button
                onClick={() => toggleAttendees(event.id)}
                className="text-blue-500 underline text-sm"
              >
                {expandedEventId === event.id ? "Hide" : "View"} Attendees
              </button>

              {expandedEventId === event.id && (
                <div className="mt-3">
                  <h3 className="font-medium text-gray-800">Attendees:</h3>
                  {event.participants_email && event.participants_email.length > 0 ? (
                    <ul className="list-disc list-inside text-sm mt-1">
                      {event.participants_email.map((email, idx) => (
                        <li key={idx}>{email}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No attendees registered yet.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
