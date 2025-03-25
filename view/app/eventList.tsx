// app/events/AllEvents.tsx
"use client";
import { useState, useEffect } from "react";

interface Session {
  title: string;
  description: string;
  speaker: string;
  startTime: string;
  endTime: string;
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

const AllEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([
    //for testing with fake data
    // {
    //   name: "Tech Conference 2025",
    //   description:
    //     "A conference exploring AI, cloud computing, and software trends.",
    //   event_type: "Technology",
    //   start_date: "2025-05-10",
    //   end_date: "2025-05-12",
    //   organizer: "TechWorld Inc.",
    //   venue: "Toronto Convention Center",
    //   sessions: [
    //     {
    //       title: "AI and the Future",
    //       description: "Discussing AI advancements and impacts.",
    //       speaker: "Dr. Jane Smith",
    //       startTime: "10:00 AM",
    //       endTime: "11:30 AM",
    //     },
    //     {
    //       title: "Quantum Computing",
    //       description: "How quantum computing is shaping the future.",
    //       speaker: "Dr. John Doe",
    //       startTime: "2:00 PM",
    //       endTime: "3:30 PM",
    //     },
    //   ],
    // },
    // {
    //   name: "Music Fest 2025",
    //   description: "A weekend of amazing live performances.",
    //   event_type: "Music Festival",
    //   start_date: "2025-07-20",
    //   end_date: "2025-07-22",
    //   organizer: "Live Music Co.",
    //   venue: "Central Park, NYC",
    //   sessions: [
    //     {
    //       title: "Rock Band Performance",
    //       description: "Live rock music performance.",
    //       speaker: "The Rockers",
    //       startTime: "5:00 PM",
    //       endTime: "6:30 PM",
    //     },
    //     {
    //       title: "Jazz Night",
    //       description: "Smooth jazz performances by famous artists.",
    //       speaker: "Jazz Masters",
    //       startTime: "8:00 PM",
    //       endTime: "10:00 PM",
    //     },
    //   ],
    // },
  ]);

  // Fetch all events from the backend
  useEffect(() => {
    fetch("https://your-backend-api.com/events") // Replace with your actual backend API
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  //for testing with fake data

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

export default AllEvents;
