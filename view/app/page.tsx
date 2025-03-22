"use client";
import AllEvents from "./eventList";

const EventsPage: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Events</h1>
      <AllEvents />
    </div>
  );
};

export default EventsPage;
