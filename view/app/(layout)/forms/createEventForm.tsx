"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Speaker {
  id: string;
  email: string;
  name?: string;
}

interface Session {
  title: string;
  description: string;
  speaker: string;
  speaker_id: string;
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
  organizer: string; // Added to match EventFormPage interface
  venue: string;
  sessions: Session[];
  participants?: string[]; // Added to match EventFormPage interface
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
    organizer: localStorage.getItem("user_id") || "", // Initialize with user_id
    venue: "",
    sessions: [],
    participants: [], // Initialize empty array
  });

  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [speakerId, setSpeakerId] = useState("");
  const [sessionStartTime, setSessionStartTime] = useState("");
  const [sessionEndTime, setSessionEndTime] = useState("");
  const [sessionMaterials, setSessionMaterials] = useState<string[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loadingSpeakers, setLoadingSpeakers] = useState(true);

  const router = useRouter();

  // Fetch speakers for the dropdown
  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/users/speakers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSpeakers(data.speakers || []);
        } else {
          console.error("Failed to fetch speakers");
        }
      } catch (error) {
        console.error("Error fetching speakers:", error);
      } finally {
        setLoadingSpeakers(false);
      }
    };

    fetchSpeakers();
  }, []);

  // Check authorization
  useEffect(() => {
    let role = localStorage.getItem("role");
    if (role !== "organizer" && role !== "admin") {
      alert("Unauthorized");
      router.push("/");
      return;
    }
  }, [router]);

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

  // Handle speaker selection
  const handleSpeakerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedSpeaker = speakers.find((s) => s.id === selectedId);

    if (selectedSpeaker) {
      setSpeakerId(selectedId);
      // Use name if available, otherwise use email
      setSpeaker(selectedSpeaker.name || selectedSpeaker.email);
    } else {
      setSpeakerId("");
      setSpeaker("");
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
        speaker_id: speakerId, // Include speaker_id
        startTime: sessionStartTime,
        endTime: sessionEndTime,
        materials: sessionMaterials,
      };
      setEvent({ ...event, sessions: [...event.sessions, newSession] });
      // Clear session form fields after adding
      setSessionTitle("");
      setSessionDescription("");
      setSpeaker("");
      setSpeakerId("");
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

    // Call the onSubmit prop function provided by the parent component
    onSubmit(finalEvent);
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
            {session.title} - Speaker: {session.speaker}
          </p>
          <p className="text-sm text-gray-600">
            {session.startTime} to {session.endTime}
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

      {/* Speaker dropdown */}
      <div>
        <label htmlFor="speaker" className="block text-sm font-semibold">
          Speaker
        </label>
        <select
          id="speaker"
          className="border border-orange-400 rounded p-2 w-full mt-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300"
          value={speakerId}
          onChange={handleSpeakerChange}
        >
          <option value="">Select a Speaker</option>
          {loadingSpeakers ? (
            <option disabled>Loading speakers...</option>
          ) : (
            speakers.map((speaker) => (
              <option key={speaker.id} value={speaker.id}>
                {speaker.name || speaker.email}
              </option>
            ))
          )}
        </select>
      </div>

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
          className="bg-blue-500 text-white text-sm rounded-full px-3 py-1 cursor-pointer active:bg-blue-400"
          onClick={() =>
            addMaterial(
              (
                document.querySelector(
                  "input[placeholder='Material']"
                ) as HTMLInputElement
              ).value
            )
          }
        >
          + Add Material
        </button>

        <button
          type="button"
          className="bg-blue-500 text-white text-sm rounded-full px-3 py-1 cursor-pointer active:bg-blue-400"
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
