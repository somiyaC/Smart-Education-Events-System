"use client";

const events = [
  { id: 1, name: 'Neuroscience Workshop', date: 'April 12, 2025', time: '2:00 PM', location: 'Montreal' },
  { id: 2, name: 'AI Conference 2025', date: 'May 3, 2025', time: '10:00 AM', location: 'New York' },
  { id: 3, name: 'Student Leadership Seminar', date: 'June 15, 2025', time: '1:00 PM', location: 'Toronto' },
];

export interface Event {
  id: number;
  name: string;
  date: string;
  time: string;
  location: string;
}

interface EventListProps {
  onSelectEvent: (event: Event) => void;
}

export default function EventList({ onSelectEvent }: EventListProps) {
  return (
    <div className="flex gap-4">
      {events.map((event) => (
        <div key={event.id} className="border p-4 rounded-xl shadow-md w-1/3">
          <h2 className="text-xl font-semibold mb-2">{event.name}</h2>
          <p className="text-gray-600 mb-1">{event.location}</p>
          <p className="text-gray-600 mb-1">{event.date}</p>
          <p className="text-gray-500 mb-4">{event.time}</p>
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