"use client";
import { useState } from "react";

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

interface CreateEventFormProps {
  onSubmit: (event: Event) => void;
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({ onSubmit }) => {
  const [event, setEvent] = useState<Event>({
    name: "",
    description: "",
    event_type: "",
    start_date: "",
    end_date: "",
    organizer: "",
    venue: "",
    sessions: [],
  });

  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [sessionStartTime, setSessionStartTime] = useState("");
  const [sessionEndTime, setSessionEndTime] = useState("");
  const [sessionMaterials, setSessionMaterials] = useState<Material[]>([]);
  const [sessionMaterialInput, setSessionMaterialInput] = useState<string>("");

  // add materials
  const addMaterial = () => {
    if (sessionMaterialInput) {
      const newMaterial: Material = { link: sessionMaterialInput };
      setSessionMaterials((prevMaterials) => [...prevMaterials, newMaterial]); // Use a function to avoid stale state
      setSessionMaterialInput(""); // Clear input after adding
    }
  };

  // Add a new session to the event
  const addSession = () => {
    if (
      sessionTitle &&
      sessionDescription &&
      speaker &&
      sessionStartTime &&
      sessionEndTime
    ) {
      const newSession: Session = {
        title: sessionTitle,
        description: sessionDescription,
        speaker: speaker,
        startTime: sessionStartTime,
        endTime: sessionEndTime,
        materials: sessionMaterials,
      };
      setEvent((prevEvent) => ({
        ...prevEvent,
        sessions: [...prevEvent.sessions, newSession],
      }));
      // Clear session form fields after adding
      setSessionTitle("");
      setSessionDescription("");
      setSpeaker("");
      setSessionStartTime("");
      setSessionEndTime("");
      setSessionMaterials([]);
    } else {
      alert("Please fill out both session title and time.");
    }
  };

  // Handle form submission (create new event)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(event); // Call the parent handler when submitted
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-md"
    >
      <h1 className="text-2xl font-bold mb-4">Create Event</h1>

      <input
        type="text"
        placeholder="Event Title"
        className="border border-orange-400 rounded p-2 w-full"
        value={event.name}
        onChange={(e) => setEvent({ ...event, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Event Description"
        className="border border-orange-400 rounded p-2 w-full mt-2"
        value={event.description}
        onChange={(e) => setEvent({ ...event, description: e.target.value })}
      />
      <input
        type="text"
        placeholder="Event Type"
        className="border border-orange-400 rounded p-2 w-full mt-2"
        value={event.event_type}
        onChange={(e) => setEvent({ ...event, event_type: e.target.value })}
      />
      <div>
        <label htmlFor="start_date" className="block text-sm font-semibold">
          Start Date
        </label>
        <input
          id="start_date"
          type="date"
          className="border border-orange-400 rounded p-2 w-full mt-2"
          value={event.start_date}
          onChange={(e) => setEvent({ ...event, start_date: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="end-date" className="block text-sm font-semibold">
          End Date
        </label>
        <input
          id="end-date"
          type="date"
          className="border border-orange-400 rounded p-2 w-full mt-2"
          value={event.end_date}
          onChange={(e) => setEvent({ ...event, end_date: e.target.value })}
        />
      </div>
      <input
        type="text"
        placeholder="Organizer"
        className="border border-orange-400 rounded p-2 w-full mt-2"
        value={event.organizer}
        onChange={(e) => setEvent({ ...event, organizer: e.target.value })}
      />
      <input
        type="text"
        placeholder="Venue"
        className="border border-orange-400 rounded p-2 w-full mt-2"
        value={event.venue}
        onChange={(e) => setEvent({ ...event, venue: e.target.value })}
      />

      <h3 className="mt-4 font-semibold">Sessions</h3>
      {event.sessions.map((session, index) => (
        <div key={index} className="p-2 border rounded mt-2">
          <p>
            {session.title} from {session.startTime} to {session.endTime}
          </p>
        </div>
      ))}

      {/* Session input */}
      <input
        type="text"
        placeholder="Session Title"
        className="border border-orange-400 rounded p-2 w-full mt-2"
        value={sessionTitle}
        onChange={(e) => setSessionTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Session Description"
        className="border border-orange-400 rounded p-2 w-full mt-2"
        value={sessionDescription}
        onChange={(e) => setSessionDescription(e.target.value)}
      />
      <input
        type="text"
        placeholder="Speaker"
        className="border border-orange-400 rounded p-2 w-full mt-2"
        value={speaker}
        onChange={(e) => setSpeaker(e.target.value)}
      />
      <div>
        <label htmlFor="start-time" className="block text-sm font-semibold">
          Start Time
        </label>
        <input
          type="time"
          className="border border-orange-400 rounded p-2 w-full mt-2"
          value={sessionStartTime}
          onChange={(e) => setSessionStartTime(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="end-time" className="block text-sm font-semibold">
          End Time
        </label>
        <input
          type="time"
          className="border border-orange-400 rounded p-2 w-full mt-2"
          value={sessionEndTime}
          onChange={(e) => setSessionEndTime(e.target.value)}
        />
        <input
          type="text"
          placeholder="Material Link"
          className="border border-orange-400 rounded p-2 w-full mt-2"
          value={sessionMaterialInput}
          onChange={(e) => setSessionMaterialInput(e.target.value)} // Track input value
        />
        <button
          type="button"
          className="bg-orange-300 text-xs text-white p-2 my-2 rounded-3xl hover:bg-orange-200"
          onClick={addMaterial} // Add material when clicked
        >
          + Add Material
        </button>
        {sessionMaterials.length > 0 && (
          <ul className="mt-2">
            {sessionMaterials.map((material, index) => (
              <li key={index} className="text-sm text-gray-600">
                {material.link}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="button"
        className="bg-orange-300 text-white p-2 my-3 mx-1 rounded-3xl hover:bg-orange-200 transition"
        onClick={addSession}
      >
        + Add Session
      </button>

      <button
        type="submit"
        className="bg-orange-400 text-white p-2 my-3 mx-1 rounded-3xl hover:bg-orange-300 transition"
      >
        Create Event
      </button>
    </form>
  );
};

export default CreateEventForm;
