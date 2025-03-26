"use client";

//only events that the user logged in should be displayed
import { useState, useEffect } from "react";
interface Material {
  link: string;
}

interface Session {
  title: string;
  description: string;
  speaker: string;
  startTime: string;
  endTime: string;
  materials: Material[];
}

interface Event {
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
  const [events, setEvents] = useState<Event[]>([]);
  useEffect(() => {
    fetch("https://your-backend-api.com/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {events.length === 0 ? (
        <p className="text-center text-gray-600">No events available.</p>
      ) : (
        <div className="space-y-6">
          {events.map((event, index) => (
            <div
              key={index}
              className="border border-gray-300 p-6 rounded-lg shadow-lg bg-white"
            >
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

              {/* Sessions */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Sessions:
                </h3>
                <ul className="mt-2 space-y-4">
                  {event.sessions.map((session, idx) => (
                    <li key={idx} className="p-4 border rounded-lg">
                      <h4 className="text-md font-bold text-orange-300">
                        {session.title}
                      </h4>
                      <p className="text-gray-600">{session.description}</p>
                      <p className="text-gray-700">
                        <strong>Speaker:</strong> {session.speaker}
                      </p>
                      <p className="text-gray-700">
                        <strong>Time:</strong> {session.startTime} -{" "}
                        {session.endTime}
                      </p>
                      {/* Materials Section */}
                      {session.materials.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-semibold text-gray-800">
                            Materials:
                          </h5>
                          <ul className="mt-2 space-y-2">
                            {session.materials.map((material, mIdx) => (
                              <li key={mIdx} className="text-blue-500">
                                <a
                                  href={material.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline"
                                >
                                  {material.link}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="submit"
                className="bg-orange-400 text-white text-sm rounded-3xl px-3 py-1.5 my-2 ml-auto block hover:bg-orange-500 transition"
              >
                Sign Up
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YourEvents;
