"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "../StateContext";

interface Material {
  title: string;
  type: string; // e.g., "PDF", "Video", "Slides"
  url: string;
}

interface Session {
  title: string;
  description: string;
  speaker: string;
  speaker_id: string;
  start_time: string;
  end_time: string;
  materials: string;
  event_id: string;
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
  const { userRole } = useAppContext();
  const isSpeaker = userRole === "speaker";

  useEffect(() => {
    let userId = localStorage.getItem("user_id");
    if (!userId) return;

    const fetchEvents = async () => {
      try {
        if (isSpeaker) {
          // For speakers, fetch sessions they're speaking at
          const sessionsResponse = await fetch(
            `http://localhost:8000/sessions/speaker/${userId}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!sessionsResponse.ok) {
            throw new Error("Failed to fetch speaker sessions");
          }

          const sessionsData = await sessionsResponse.json();
          const speakerSessions = sessionsData.sessions || [];

          // Extract unique event IDs
          const eventIds = [
            ...new Set(
              speakerSessions.map((session: Session) => session.event_id)
            ),
          ];

          if (eventIds.length === 0) {
            setEvents([]);
            setLoading(false);
            return;
          }

          // Fetch details for each event
          const speakerEventsPromises = eventIds.map((eventId) =>
            fetch(`http://localhost:8000/events/${eventId}`, {
              headers: {
                "Content-Type": "application/json",
              },
            }).then((res) => res.json())
          );

          const speakerEvents = await Promise.all(speakerEventsPromises);

          // Add session info to each event
          const eventsWithSessions = speakerEvents.map((event) => {
            // Filter sessions to only include ones where this user is speaking
            const eventSessions = speakerSessions.filter(
              (session: Session) =>
                session.event_id === event.id && session.speaker_id === userId
            );
            return {
              ...event,
              sessions: eventSessions,
            };
          });

          setEvents(eventsWithSessions);
        } else {
          // For regular attendees, fetch events they're registered for
          const response = await fetch(
            "http://localhost:8000/events/user_events",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ user_id: userId }),
            }
          );

          const data = await response.json();
          console.log("User's events:", data.events);
          setEvents(data.events || []);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isSpeaker]);

  const handleUnsignUp = async (eventId: string) => {
    try {
      const response = await fetch(
        "http://localhost:8000/events/event_cancel",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: localStorage.getItem("user_id"),
            event_id: eventId,
          }),
        }
      );

      const data = await response.json();
      if (data.status === false) {
        alert("Unable to cancel registration");
        console.log("Unsignup failed");
      } else {
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== eventId)
        );
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
        {isSpeaker
          ? "You are not scheduled to speak at any events."
          : "You are not signed up for any events."}
      </p>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-black mb-6">
        {isSpeaker ? "Events Where You're Speaking" : "Your Events"}
      </h2>
      <div className="space-y-6">
        {events.map((event) => (
          <div key={event.id} className="p-6 rounded-lg shadow-lg bg-[#FFFAF0]">
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
              <h3 className="text-lg font-semibold text-gray-800">
                {isSpeaker ? "Your Sessions:" : "Sessions:"}
              </h3>
              <ul className="mt-2 space-y-4">
                {event.sessions.map((session: Session, idx) => (
                  <li
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      isSpeaker &&
                      session.speaker_id === localStorage.getItem("user_id")
                        ? "border-orange-400 bg-orange-50"
                        : "border-orange-200"
                    }`}
                  >
                    <h4 className="text-md font-bold text-orange-300">
                      {session.title}
                    </h4>
                    <p className="text-gray-600">{session.description}</p>
                    <p className="text-gray-700">
                      <strong>Speaker:</strong> {session.speaker}
                      {isSpeaker &&
                        session.speaker_id ===
                          localStorage.getItem("user_id") && (
                          <span className="ml-2 text-sm text-orange-500 font-medium">
                            (You)
                          </span>
                        )}
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
                              className="text-yellow-800 hover:underline"
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

            {/* Unsign Up Button - only for regular attendees */}
            {!isSpeaker && (
              <button
                onClick={() => handleUnsignUp(event.id)}
                className="bg-red-100 border border-red-400 text-red-700 text-sm rounded-3xl px-3 py-1.5 my-2 ml-auto mt-5 block cursor-pointer active:bg-red-600"
              >
                Cancel Registration
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default YourEvents;
