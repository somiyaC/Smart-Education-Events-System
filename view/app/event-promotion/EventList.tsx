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
}

interface EventListProps {
  onSelectEvent: (event: Event) => void;
}

export default function EventList({ onSelectEvent }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await fetch("http://localhost:8000/events");
      const data = await res.json();
      setEvents(data);
    };
    fetchEvents();
  }, []);

  return (
    <div className="flex gap-4 flex-wrap">
      {events.map((event) => (
        <div key={event.id} className="border p-4 rounded-xl shadow-md w-1/3">
          <h2 className="text-xl font-semibold mb-2">{event.name}</h2>
          <p className="text-gray-600 mb-1">{event.description}</p>
          <p className="text-gray-600 mb-1">
            {new Date(event.start_date).toLocaleDateString()}
          </p>
          <button
            onClick={() => onSelectEvent(event)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 w-full"
          >
            Promote
          </button>
        </div>
      ))}
    </div>
  );
}
