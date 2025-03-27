"use client";
import { useState } from "react";
import CreateEventForm from "../forms/createEventForm";
import EditEventForm from "../forms/editEventForm";

interface Session {
  title: string;
  description: string;
  speaker: string;
  startTime: string;
  endTime: string;
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
  participants?: [];
}

const EventFormPage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [event, setEvent] = useState<Event | null>(null);

  const handleCreateEvent = async () => {
    setIsEditing(false);
    console.log(event);
    const res = await fetch("http://localhost:8000/events/create_event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Set content-type to JSON
      },
      body: JSON.stringify({
        ...event,
        ...{ participants: [], is_virtual: false, capacity: 100 },
      }), // Convert the data to JSON string
    });
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
      const res = await fetch("http://localhost:8000/events/event_search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await res.json();

      // Check if events array exists and is not empty
      if (data.events && data.events.length > 0) {
        // Take the first event from the search results
        const foundEvent = data.events[0];

        // Ensure that the event data contains all necessary fields
        if (
          foundEvent &&
          foundEvent.event_type &&
          foundEvent.start_date &&
          foundEvent.end_date &&
          foundEvent.organizer_id &&
          foundEvent.venue_id
        ) {
          setEvent({
            name: foundEvent.name,
            description: foundEvent.description,
            event_type: foundEvent.event_type,
            start_date: foundEvent.start_date,
            end_date: foundEvent.end_date,
            organizer: foundEvent.organizer_id,
            venue: foundEvent.venue_id,
            sessions: [], // You might want to populate this if needed
            participants: foundEvent.participants || [],
          });
        } else {
          setError("Event found but data is incomplete.");
        }
      } else {
        setError("No events found matching the search query.");
      }
    } catch (err) {
      setError("Error fetching event data.");
      console.error(err);
    }
    setLoading(false);
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
            onSubmit={async (newEvent) => {
              console.log(newEvent);
            }}
          />
        )
      )}
    </div>
  );
};

export default EventFormPage;

//for testing with fake data
// "use client";
// import { useState } from "react";
// import CreateEventForm from "../forms/createEventForm";
// import EditEventForm from "../forms/editEventForm";

// interface Session {
//   title: string;
//   description: string;
//   speaker: string;
//   startTime: string;
//   endTime: string;
// }

// interface Event {
//   name: string;
//   description: string;
//   event_type: string;
//   start_date: string;
//   end_date: string;
//   organizer: string;
//   venue: string;
//   sessions: Session[];
// }

// const EventFormPage: React.FC = () => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [event, setEvent] = useState<Event | null>(null);

//   // Handle creating a new event
//   const handleCreateEvent = () => {
//     setIsEditing(false); // Ensure the form to create is shown
//     setEvent(null); // Clear event data when creating a new event
//   };

//   // Handle editing an event
//   const handleEditEvent = () => {
//     setIsEditing(true); // Switch to edit form
//     // Use mock data directly for editing, no fetch needed
//     const mockEvent: Event = {
//       name: "Tech Conference 2025",
//       description: "A conference on the latest trends in technology.",
//       event_type: "Conference",
//       start_date: "2025-05-10",
//       end_date: "2025-05-12",
//       organizer: "Tech Org",
//       venue: "Tech Convention Center",
//       sessions: [
//         {
//           title: "AI in 2025",
//           description: "Exploring the future of AI.",
//           speaker: "John Doe",
//           startTime: "2025-05-10T09:00:00",
//           endTime: "2025-05-10T10:00:00",
//         },
//         {
//           title: "Blockchain Innovations",
//           description: "Discussing new developments in blockchain.",
//           speaker: "Jane Smith",
//           startTime: "2025-05-10T11:00:00",
//           endTime: "2025-05-10T12:00:00",
//         },
//       ],
//     };
//     setEvent(mockEvent); // Set the mock event data
//   };

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       {/* Buttons to toggle between Create and Edit */}
//       <div className="mb-4">
//         <button
//           onClick={handleCreateEvent}
//           className={`${
//             !isEditing ? "bg-orange-400" : "bg-orange-300"
//           } text-white p-2 rounded-3xl mr-4 transition-colors duration-300`}
//         >
//           Create Event
//         </button>
//         <button
//           onClick={handleEditEvent}
//           className={`${
//             isEditing ? "bg-orange-400" : "bg-orange-300"
//           } text-white p-2 rounded-3xl transition-colors duration-300`}
//         >
//           Edit Event
//         </button>
//       </div>

//       {/* Show the Edit Form with mock data when editing */}
//       {isEditing && event ? (
//         <EditEventForm
//           event={event}
//           onUpdate={(updatedEvent) => setEvent(updatedEvent)}
//         />
//       ) : (
//         // Only show the Create Event form if we're not editing
//         !isEditing && (
//           <CreateEventForm
//             onSubmit={(newEvent) => console.log("Created Event:", newEvent)}
//           />
//         )
//       )}
//     </div>
//   );
// };

// export default EventFormPage;
