// app/events/AllEvents.tsx
"use client";
import { useState, useEffect } from "react";
import { useAppContext } from "./StateContext";
import { useRouter } from "next/navigation";
import { useSearchParams } from 'next/navigation';


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
  const search = searchParams.get('q');
  console.log("param",search)


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
      body: JSON.stringify({query: search_query})
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data.events);
        setEvents(data.events);
      })
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  const isRegistered = (event: Event) => {
    console.log(event.participants);
    let userId = localStorage.getItem("user_id");
    console.log(userId);
    if (userId && event.participants.includes(userId)) {
      return true;
    }
    return false;
  };

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
              {/* <div className="mt-6">
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
               </div> */}
              {!isRegistered(event) && (
                <button
                  type="submit"
                  onClick={async () => {
                    const res = await fetch(
                      "http://localhost:8000/events/event_signup",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json", // Set content-type to JSON
                        },
                        body: JSON.stringify({
                          user_id: localStorage.getItem("user_id"),
                          event_id: event.id,
                        }), // Convert the data to JSON string
                      }
                    )
                      .then((res) => res.json())
                      .then(async (data) => {
                        if (data.status == false) {
                          console.log("signup failed");
                        } else {
                          await fetch("http://localhost:8000/tickets/", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              event_id: event.id,
                              price: 20.5,
                              status: "unpaind",
                              attendee_id: localStorage.getItem("user_id"),
                            }),
                          }).then((res) => alert("Successfully signed up."));
                        }
                      });
                  }}
                  className="bg-orange-400 text-white text-sm rounded-3xl px-3 py-1.5 my-2 ml-auto block hover:bg-orange-500 transition"
                >
                  Sign Up
                </button>
              )}
              {isRegistered(event) && (
                <button className="bg-orange-400 text-white text-sm rounded-3xl px-3 py-1.5 my-2 ml-auto block hover:bg-orange-500 transition">
                  Already Registered
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllEvents;
