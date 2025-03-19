import React from "react";
import { Event } from "@/app/services/api";

interface BodyProps {
  events: Event[];
}

const Body: React.FC<BodyProps> = ({ events }) => {
  return (
    <div className="max-w-screen-lg mx-auto py-12 px-6">
      <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">Upcoming Events</h2>
      
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="p-6 bg-white shadow-lg rounded-lg border hover:shadow-2xl transition">
              <h3 className="text-xl font-semibold text-blue-600">{event.title}</h3>
              <p className="text-gray-700 mt-2">{event.description}</p>
              <p className="text-sm text-gray-500 mt-2">📅 {event.date}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center mt-10">
          <img src="/empty.svg" alt="No Events" className="w-32 h-32 opacity-50" />
          <p className="text-gray-500 text-lg mt-4">No events available. Check back later!</p>
        </div>
      )}
    </div>
  );
};

export default Body;
