"use client";
import { useState } from "react";
import CreateEventForm from "../forms/createEventForm";

interface Session {
  title: string;
  description: string;
  speaker: string;
  speaker_id?: string;
  startTime: string;
  endTime: string;
  materials: string[];
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
  participants?: string[];
}

const EventFormPage: React.FC = () => {
  const [error, setError] = useState("");
  const [event, setEvent] = useState<Event | null>(null); // Optional to keep
  const [successMessage, setSuccessMessage] = useState("");

  const handleCreateEvent = async (eventData: Event) => {
    if (!eventData) {
      setError("No event data to create.");
      return;
    }

    console.log("Submitting event to backend:", eventData);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/events/create_event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...eventData,
          participants: [],
          is_virtual: false,
          capacity: 100,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create event: ${res.status}`);
      }

      const data = await res.json();
      setSuccessMessage("Event created successfully!");
      setEvent(null);
    } catch (error) {
      console.error("Error creating event:", error);
      setError(
        `Event creation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {successMessage && <p className="text-blue-500 mb-4">{successMessage}</p>}
      {error && <p className="text-red-500">{error}</p>}

      <CreateEventForm
        onSubmit={(newEvent: Event) => {
          setEvent(newEvent); // Optional: keep if you use the state elsewhere
          handleCreateEvent(newEvent);
        }}
      />
    </div>
  );
};

export default EventFormPage;
