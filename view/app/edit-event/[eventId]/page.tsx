"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface Session {
  id?: string;
  title: string;
  description: string;
  speaker: string;
  speaker_id?: string;
  startTime: string;
  endTime: string;
  materials: string[];
}

interface Event {
  id?: string;
  name: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string;
  organizer: string;
  venue: string;
  is_virtual: boolean;
  virtual_meeting_url: string;
  capacity: number;
  sessions: Session[];
  participants?: string[];
}

const EditEventPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [venue, setVenue] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);

  // Fetch event data on page load
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:8000/events/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch event: ${response.status}`);
        }

        const eventData = await response.json();

        // Adapt MongoDB _id to id for frontend use
        const adaptedEventData = {
          ...eventData,
          id: eventData._id || eventData.id || eventId,
        };

        setEvent(adaptedEventData);

        // Populate form fields
        setName(adaptedEventData.name || "");
        setDescription(adaptedEventData.description || "");
        setEventType(adaptedEventData.event_type || "");

        // Format dates for form inputs
        if (adaptedEventData.start_date) {
          // Handle ISO date format or string date
          const startDate =
            typeof adaptedEventData.start_date === "string"
              ? adaptedEventData.start_date.split("T")[0]
              : new Date(adaptedEventData.start_date)
                  .toISOString()
                  .split("T")[0];
          setStartDate(startDate);
        }

        if (adaptedEventData.end_date) {
          // Handle ISO date format or string date
          const endDate =
            typeof adaptedEventData.end_date === "string"
              ? adaptedEventData.end_date.split("T")[0]
              : new Date(adaptedEventData.end_date).toISOString().split("T")[0];
          setEndDate(endDate);
        }

        setOrganizer(adaptedEventData.organizer || "");
        setVenue(adaptedEventData.venue || "");

        // Fetch sessions
        try {
          const sessionsRes = await fetch(
            `http://localhost:8000/events/sessions/event/${eventId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (sessionsRes.ok) {
            const sessionsData = await sessionsRes.json();
            const formattedSessions = sessionsData.sessions.map(
              (session: any) => ({
                id: session.id,
                title: session.title || "",
                description: session.description || "",
                speaker: session.speaker || "",
                speaker_id: session.speaker_id || "",
                startTime: session.startTime || "",
                endTime: session.endTime || "",
                materials: Array.isArray(session.materials)
                  ? session.materials
                  : typeof session.materials === "string" && session.materials
                  ? session.materials.split(", ")
                  : [],
              })
            );
            setSessions(formattedSessions);
          } else {
            console.warn(
              `Sessions endpoint returned ${sessionsRes.status}. Using empty sessions.`
            );
            setSessions([]);
          }
        } catch (sessionErr) {
          console.error("Error fetching sessions:", sessionErr);
          setSessions([]);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(
          `Failed to load event data: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  // Handle adding a new session
  const addSession = () => {
    setSessions([
      ...sessions,
      {
        title: "",
        description: "",
        speaker: "",
        startTime: "",
        endTime: "",
        materials: [],
      },
    ]);
  };

  // Handle removing a session
  const removeSession = (index: number) => {
    const updatedSessions = [...sessions];
    updatedSessions.splice(index, 1);
    setSessions(updatedSessions);
  };

  // Handle updating a session field
  const updateSessionField = (
    index: number,
    field: keyof Session,
    value: any
  ) => {
    const updatedSessions = [...sessions];
    updatedSessions[index] = {
      ...updatedSessions[index],
      [field]: value,
    };
    setSessions(updatedSessions);
  };

  // Handle adding a material to a session
  const addMaterial = (sessionIndex: number) => {
    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex].materials.push("");
    setSessions(updatedSessions);
  };

  // Handle removing a material from a session
  const removeMaterial = (sessionIndex: number, materialIndex: number) => {
    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex].materials.splice(materialIndex, 1);
    setSessions(updatedSessions);
  };

  // Handle updating a material
  const updateMaterial = (
    sessionIndex: number,
    materialIndex: number,
    value: string
  ) => {
    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex].materials[materialIndex] = value;
    setSessions(updatedSessions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      // Create payload without ID field since it will be in the URL
      const updatedEvent = {
        name,
        description,
        event_type: eventType,
        start_date: startDate,
        end_date: endDate,
        organizer,
        venue,
        is_virtual: event?.is_virtual ?? false,
        virtual_meeting_url: event?.virtual_meeting_url ?? "",
        capacity: event?.capacity ?? 0,
        participants: event?.participants ?? [],
        sessions: [], // Include empty sessions array to satisfy Pydantic validation
      };

      console.log("Submitting updated event:", updatedEvent);

      // Update the event - Include eventId in the URL path as expected by the backend
      const eventResponse = await fetch(
        `http://localhost:8000/events/update_event/${eventId}`, // Now correctly includes the event ID
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedEvent), // No need to include ID in body
        }
      );

      // Check status and get response text for debugging
      if (!eventResponse.ok) {
        const errorText = await eventResponse.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to update event: ${eventResponse.status} - ${errorText}`
        );
      }

      // Now update sessions separately
      const sessionsResponse = await fetch(
        `http://localhost:8000/events/sessions/update_sessions/${eventId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessions }),
        }
      );

      if (!sessionsResponse.ok) {
        const errorText = await sessionsResponse.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to update sessions: ${sessionsResponse.status} - ${errorText}`
        );
      }

      alert("Event and sessions updated successfully!");
      router.push("/events"); // Redirect back to events page
    } catch (err) {
      console.error("Error updating event:", err);
      setError(
        `Failed to update event: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  if (loading)
    return <div className="p-6 max-w-4xl mx-auto">Loading event data...</div>;
  if (error)
    return <div className="p-6 max-w-4xl mx-auto text-red-500">{error}</div>;
  if (!event)
    return <div className="p-6 max-w-4xl mx-auto">Event not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-orange-600 mb-6">
        Edit Event
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-medium text-gray-800 mb-4">
            Event Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Event Type
              </label>
              <input
                type="text"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Organizer
              </label>
              <input
                type="text"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Venue
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Sessions Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-gray-800">Sessions</h2>
            <button
              type="button"
              onClick={addSession}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-full px-3 py-1"
            >
              + Add Session
            </button>
          </div>

          {sessions.length === 0 ? (
            <p className="text-gray-500 italic">No sessions added yet.</p>
          ) : (
            <div className="space-y-6">
              {sessions.map((session, sessionIndex) => (
                <div
                  key={sessionIndex}
                  className="border border-gray-200 rounded-lg p-4 relative"
                >
                  <button
                    type="button"
                    onClick={() => removeSession(sessionIndex)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <input
                        type="text"
                        value={session.title}
                        onChange={(e) =>
                          updateSessionField(
                            sessionIndex,
                            "title",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Speaker
                      </label>
                      <input
                        type="text"
                        value={session.speaker}
                        onChange={(e) =>
                          updateSessionField(
                            sessionIndex,
                            "speaker",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={session.description}
                      onChange={(e) =>
                        updateSessionField(
                          sessionIndex,
                          "description",
                          e.target.value
                        )
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Start Time
                      </label>
                      <input
                        type="datetime-local"
                        value={session.startTime}
                        onChange={(e) =>
                          updateSessionField(
                            sessionIndex,
                            "startTime",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        End Time
                      </label>
                      <input
                        type="datetime-local"
                        value={session.endTime}
                        onChange={(e) =>
                          updateSessionField(
                            sessionIndex,
                            "endTime",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Materials Section */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Materials
                      </label>
                      <button
                        type="button"
                        onClick={() => addMaterial(sessionIndex)}
                        className="text-xs text-blue-500 hover:text-blue-700"
                      >
                        + Add Material
                      </button>
                    </div>

                    {session.materials.length === 0 ? (
                      <p className="text-gray-400 text-sm italic">
                        No materials added
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {session.materials.map((material, materialIndex) => (
                          <div
                            key={materialIndex}
                            className="flex items-center"
                          >
                            <input
                              type="text"
                              value={material}
                              onChange={(e) =>
                                updateMaterial(
                                  sessionIndex,
                                  materialIndex,
                                  e.target.value
                                )
                              }
                              className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm"
                              placeholder="Material link or resource"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                removeMaterial(sessionIndex, materialIndex)
                              }
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => router.push("/events")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm rounded-3xl px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-3xl px-4 py-2"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEventPage;
