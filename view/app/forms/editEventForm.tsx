"use client";
import { useState, useEffect } from "react";

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

interface EditEventFormProps {
  event: Event | null; // Accept event as a prop
  onUpdate: (updatedEvent: Event) => void; // Handler to update the event
}

const EditEventForm: React.FC<EditEventFormProps> = ({ event, onUpdate }) => {
  const [editedEvent, setEditedEvent] = useState<Event | null>(event);

  useEffect(() => {
    setEditedEvent(event); // Update form state when event prop changes
  }, [event]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Event
  ) => {
    if (editedEvent) {
      const updatedEvent = { ...editedEvent, [field]: e.target.value };
      setEditedEvent(updatedEvent);
      onUpdate(updatedEvent);
    }
  };

  const handleSessionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    field: keyof Session
  ) => {
    if (editedEvent) {
      const updatedSessions = [...editedEvent.sessions];
      updatedSessions[index] = {
        ...updatedSessions[index],
        [field]: e.target.value,
      };
      setEditedEvent({ ...editedEvent, sessions: updatedSessions });
    }
  };

  const handleRemoveSession = (index: number) => {
    if (editedEvent) {
      const updatedSessions = editedEvent.sessions.filter(
        (_, i) => i !== index
      );
      setEditedEvent({ ...editedEvent, sessions: updatedSessions });
    }
  };

  const handleAddMaterial = (index: number, material: string) => {
    if (editedEvent && material) {
      const updatedSessions = [...editedEvent.sessions];
      updatedSessions[index].materials = [
        ...updatedSessions[index].materials,
        material,
      ];
      setEditedEvent({ ...editedEvent, sessions: updatedSessions });
    }
  };

  const handleRemoveMaterial = (
    sessionIndex: number,
    materialIndex: number
  ) => {
    if (editedEvent) {
      const updatedSessions = [...editedEvent.sessions];
      updatedSessions[sessionIndex].materials = updatedSessions[
        sessionIndex
      ].materials.filter((_, i) => i !== materialIndex);
      setEditedEvent({ ...editedEvent, sessions: updatedSessions });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedEvent) {
      onUpdate(editedEvent);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Event</h1>
      {editedEvent && (
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-white shadow-lg rounded-md"
        >
          {/* Event Fields */}
          {/* ... other event fields ... */}

          {/* Sessions Section */}
          <div>
            <h3 className="text-lg font-bold mb-2">Sessions</h3>
            {editedEvent.sessions.length > 0 ? (
              editedEvent.sessions.map((session, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 border border-orange-400 rounded-md"
                >
                  <div className="flex justify-between">
                    <h4 className="text-md font-semibold">{session.title}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveSession(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove Session
                    </button>
                  </div>

                  <div className="mb-2">
                    <label className="block text-sm font-medium">Title</label>
                    <input
                      type="text"
                      className="border border-orange-400 rounded p-2 w-full"
                      value={session.title}
                      onChange={(e) => handleSessionChange(e, index, "title")}
                    />
                  </div>

                  {/* ... other session fields ... */}

                  {/* Materials Section */}
                  <div>
                    <label className="block text-sm font-medium">
                      Materials
                    </label>
                    <input
                      type="text"
                      className="border border-orange-400 rounded p-2 w-full"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddMaterial(
                            index,
                            (e.target as HTMLInputElement).value
                          );
                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                    />
                    <ul className="mt-2">
                      {session.materials.map((material, materialIndex) => (
                        <li
                          key={materialIndex}
                          className="flex justify-between"
                        >
                          <span>{material}</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveMaterial(index, materialIndex)
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No sessions added.</p>
            )}
          </div>

          <button
            type="submit"
            className="bg-orange-400 text-white p-2 mt-4 rounded-3xl"
          >
            Update Event
          </button>
        </form>
      )}
    </div>
  );
};

export default EditEventForm;
