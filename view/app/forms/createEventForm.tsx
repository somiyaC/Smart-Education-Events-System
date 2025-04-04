"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  // Convert 12-hour time to 24-hour format
  const convertTo24HourFormat = (time12: string) => {
    const [time, modifier] = time12.split(" ");
    let [hours, minutes] = time.split(":");

    if (hours === "12") {
      hours = "00";
    }

    if (modifier === "PM") {
      hours = String(parseInt(hours, 10) + 12);
    }

    return `${hours.padStart(2, "0")}:${minutes}`;
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
      alert("Please fill out all session details.");
    }
  };

  // Handle form submission (create new event)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split("T")[0];

    // Use current date if start_date or end_date are empty
    const finalEvent = {
      ...event,
      start_date: event.start_date || currentDate,
      end_date: event.end_date || currentDate,
    };

    try {
      // First, create the event
      const eventRes = await fetch(
        "http://localhost:8000/events/create_event",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...finalEvent,
            organizer: localStorage.getItem("user_id") || "",
            participants: [],
            is_virtual: false,
            capacity: 100,
            virtual_meeting_url: "",
          }),
        }
      );

      const eventData = await eventRes.json();

      if (eventData.event_id !== undefined) {
        // If event creation is successful, create sessions
        const sessionPromises = finalEvent.sessions.map((session) =>
          fetch("http://localhost:8000/sessions/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              event_id: eventData.event_id,
              title: session.title,
              speaker: session.speaker,
              startTime: convertTo24HourFormat(session.startTime),
              endTime: convertTo24HourFormat(session.endTime),
            }),
          })
        );

        // Wait for all session creation requests to complete
        const sessionResponses = await Promise.all(sessionPromises);
        const sessionData = await Promise.all(
          sessionResponses.map((res) => res.json())
        );

        alert("Successfully created an event and its sessions.");

        // Reset form
        setEvent({
          name: "",
          description: "",
          event_type: "",
          start_date: "",
          end_date: "",
          venue: "",
          sessions: [],
        });
      } else {
        alert("Failed to create event. Please contact an administrator.");
      }
    } catch (error) {
      console.error("Event creation error:", error);
      alert("An error occurred while creating the event");
    }
  };
  const router = useRouter();

  useEffect(() => {
    let role = localStorage.getItem("role");
    if (role !== "organizer" && role !== "admin") {
      alert("Unauthorized");
      router.push("/");
      return;
    }
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-md"
    >
      <h1 className="text-2xl font-bold mb-4">Create Event</h1>

      <input
        type="text"
        placeholder="Event Title"
        className="border border-orange-400 rounded p-2 w-full mt-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
        value={event.name}
        onChange={(e) => setEvent({ ...event, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Event Description"
        className="border border-orange-400 rounded p-2 w-full mt-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
        value={event.description}
        onChange={(e) => setEvent({ ...event, description: e.target.value })}
      />
      <input
        type="text"
        placeholder="Event Type"
        className="border border-orange-400 rounded p-2 w-full mt-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
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
          className="border border-orange-400 rounded p-2 w-full mt-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
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
          className="border border-orange-400 rounded p-2 w-full mt-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
          value={event.end_date}
          onChange={(e) => setEvent({ ...event, end_date: e.target.value })}
        />
      </div>
      <input
        type="text"
        placeholder="Venue"
        className="border border-orange-400 rounded p-2 w-full mt-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
        value={event.venue}
        onChange={(e) => setEvent({ ...event, venue: e.target.value })}
      />

      <h3 className="mt-4 font-semibold">Sessions</h3>
      {event.sessions.map((session, index) => (
        <div
          key={index}
          className="p-2 border rounded mt-2 focus:ring-1 focus:ring-orange-500"
        >
          <p>
            {session.title} from {session.startTime} to {session.endTime}
          </p>
        </div>
      ))}

      {/* Session input */}
      <input
        type="text"
        placeholder="Session Title"
        className="border border-orange-400 rounded p-2 w-full mt-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
        value={sessionTitle}
        onChange={(e) => setSessionTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Session Description"
        className="border border-orange-400 rounded p-2 w-full mt-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
        value={sessionDescription}
        onChange={(e) => setSessionDescription(e.target.value)}
      />
      <input
        type="text"
        placeholder="Speaker"
        className="border border-orange-400 rounded p-2 w-full mt-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
        value={speaker}
        onChange={(e) => setSpeaker(e.target.value)}
      />
      <div>
        <label htmlFor="start-time" className="block text-sm font-semibold">
          Start Time
        </label>
        <select
          className="border border-orange-400 rounded p-2 w-full mt-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
          value={sessionStartTime}
          onChange={(e) => setSessionStartTime(e.target.value)}
        >
          <option value="">Select Start Time</option>
          {[...Array(24)]
            .map((_, hour) =>
              [...Array(2)].map((_, half) => {
                const minutes = half === 0 ? "00" : "30";
                const time12 = `${hour % 12 || 12}:${minutes} ${
                  hour < 12 ? "AM" : "PM"
                }`;
                const time24 = convertTo24HourFormat(time12);
                return (
                  <option key={`${hour}-${half}`} value={time12}>
                    {time12}
                  </option>
                );
              })
            )
            .flat()}
        </select>
      </div>
      <div>
        <label htmlFor="end-time" className="block text-sm font-semibold">
          End Time
        </label>
        <select
          className="border border-orange-400 rounded p-2 w-full mt-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
          value={sessionEndTime}
          onChange={(e) => setSessionEndTime(e.target.value)}
        >
          <option value="">Select End Time</option>
          {[...Array(24)]
            .map((_, hour) =>
              [...Array(2)].map((_, half) => {
                const minutes = half === 0 ? "00" : "30";
                const time12 = `${hour % 12 || 12}:${minutes} ${
                  hour < 12 ? "AM" : "PM"
                }`;
                return (
                  <option key={`${hour}-${half}`} value={time12}>
                    {time12}
                  </option>
                );
              })
            )
            .flat()}
        </select>
      </div>

      <input
        type="text"
        placeholder="Material"
        className="border border-orange-400 rounded p-2 w-full mt-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            addMaterial((e.target as HTMLInputElement).value);
            (e.target as HTMLInputElement).value = "";
          }
        }}
      />

      <div className="flex space-x-2 mt-3">
        <button
          type="button"
          className="bg-orange-300 text-xs text-white p-2 rounded-3xl cursor-pointer active:bg-orange-100"
          onClick={() =>
            addMaterial(
              (document.querySelector("input[type='text']") as HTMLInputElement)
                .value
            )
          }
        >
          + Add Material
        </button>

        <button
          type="button"
          className="bg-orange-300 text-xs text-white p-2 rounded-3xl cursor-pointer active:bg-orange-100"
          onClick={addSession}
        >
          + Add Session
        </button>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-orange-400 text-white px-4 py-2 mt-5 mx-1 my-3 rounded-3xl cursor-pointer active:bg-orange-300"
        >
          Create Event
        </button>
      </div>
    </form>
  );
};

export default CreateEventForm;
