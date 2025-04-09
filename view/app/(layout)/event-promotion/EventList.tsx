"use client";

import { useEffect, useState } from "react";

export interface Event {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  venue_id: string;
  organizer_id: string;
  participants: [string];
}

interface EventListProps {
  onSelectEvent: (event: Event) => void;
}

export default function EventList({ onSelectEvent }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await fetch("http://localhost:8000/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "" }),
      });
      const data = await res.json();
      setEvents(data.events);
    };
    fetchEvents();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {events.map((event) => (
        <div
          key={event.id}
          className="p-6 rounded-lg shadow-xl bg-orange-50 hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col justify-between"
        >
          <h2 className="text-xl font-semibold mb-2 text-orange-500">
            {event.name}
          </h2>
          <p className="text-gray-600 mb-1">{event.description}</p>
          <p className="text-gray-600 mb-1">
            {new Date(event.start_date).toLocaleDateString()}
          </p>
          <button
            onClick={() => onSelectEvent(event)}
            className="px-4 py-1 mt-5 bg-blue-500 text-white rounded-full w-full cursor-pointer active:bg-blue-400"
          >
            Promote
          </button>
        </div>
      ))}
    </div>
  );
}
