"use client";
import { useState } from "react";

interface Session {
  title: string;
  description: string;
  speaker: string;
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
  const [sessionMaterials, setSessionMaterials] = useState<string[]>([]);

  const addMaterial = (material: string) => {
    if (material && !sessionMaterials.includes(material)) {
      setSessionMaterials([...sessionMaterials, material]);
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
      const newSession = {
        title: sessionTitle,
        description: sessionDescription,
        speaker: speaker,
        startTime: sessionStartTime,
        endTime: sessionEndTime,
        materials: sessionMaterials,
      };
      setEvent({ ...event, sessions: [...event.sessions, newSession] });
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
  const handleSubmit = async (e: React.FormEvent) => {
    console.log("here", event);
    e.preventDefault();
    onSubmit(event); // Call the parent handler when submitted

    const res = await fetch("http://localhost:8000/events/create_event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Set content-type to JSON
      },
      body: JSON.stringify({
        ...event,
        ...{
          participants: [],
          is_virtual: false,
          capacity: 100,
          virtual_meeting_url: "",
        },
      }), // Convert the data to JSON string
    });
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
      </div>

      <input
        type="text"
        placeholder="Material"
        className="border border-orange-400 rounded p-2 w-full mt-2"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            addMaterial((e.target as HTMLInputElement).value);
            (e.target as HTMLInputElement).value = "";
          }
        }}
      />
      <button
        type="button"
        className="bg-orange-300 text-xs text-white p-2 my-3 mx-1 rounded-3xl hover:bg-orange-200 transition"
        onClick={() =>
          addMaterial(
            (document.querySelector("input[type='text']") as HTMLInputElement)
              .value
          )
        }
      >
        + Add Material
      </button>
      <ul className="mt-2">
        {sessionMaterials.map((material, index) => (
          <li key={index}>{material}</li>
        ))}
      </ul>
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
