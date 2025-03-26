"use client";
import { useState } from "react";
import CreateEventForm from "../forms/createEventForm";
import EditEventForm from "../forms/editEventForm";

interface Material {
  link: string;
}

interface Session {
  title: string;
  description: string;
  speaker: string;
  startTime: string;
  endTime: string;
  materials: Material[]; // Use plural 'materials' here for consistency
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

const EventFormPage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [event, setEvent] = useState<Event | null>(null);

  const handleCreateEvent = () => {
    setIsEditing(false);
    setEvent(null);
  };

  // Handle editing an event
  const handleEditEvent = () => {
    setIsEditing(true);
    setEvent(null);
  };

  // Handle search input change for event name
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Fetch event data based on the entered event name
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `https://your-backend-api.com/events?name=${searchQuery}`
      );
      const data = await res.json();

      // Ensure that the event data contains all necessary fields
      if (
        data &&
        data.event_type &&
        data.start_date &&
        data.end_date &&
        data.organizer &&
        data.venue
      ) {
        setEvent(data);
      } else {
        setError("Event not found or incomplete data.");
      }
    } catch (err) {
      setError("Error fetching event data.");
    } finally {
      setLoading(false); // Set loading to false after async call completes
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <button
          onClick={handleCreateEvent}
          className={`${
            !isEditing ? "bg-orange-400" : "bg-orange-300"
          } text-white p-2 rounded-3xl mr-4 transition-colors duration-300`}
        >
          Create Event
        </button>
        <button
          onClick={handleEditEvent}
          className={`${
            isEditing ? "bg-orange-400" : "bg-orange-300"
          } text-white p-2 rounded-3xl transition-colors duration-300`}
        >
          Edit Event
        </button>
      </div>

      {isEditing && (
        <div className="mb-2">
          <form onSubmit={handleSearchSubmit} className="flex space-x-2">
            <input
              type="text"
              placeholder="Find the event you would like to edit"
              className="text-gray-500 text-sm border border-orange-300 rounded-3xl p-1 px-2 w-1/2"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button
              type="submit"
              className="bg-orange-300 text-white p-1 text-sm rounded"
            >
              Search Event
            </button>
          </form>
        </div>
      )}

      {loading && <p>Loading event data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {isEditing && event ? (
        <EditEventForm
          event={event}
          onUpdate={(updatedEvent) => setEvent(updatedEvent)}
        />
      ) : (
        !isEditing && (
          <CreateEventForm
            onSubmit={(newEvent) => {
              // Handle the creation of the event (e.g., API call)
              console.log("Created Event:", newEvent);
              // You might want to reset the form or set event state here
            }}
          />
        )
      )}
    </div>
  );
};

export default EventFormPage;
