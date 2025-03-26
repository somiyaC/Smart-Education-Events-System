"use client";
import { useState, useEffect } from "react";
import { Calendar as BigCalendar } from "react-big-calendar";
import { momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface Event {
  name: string;
  start_date: string;
  end_date: string;
}

const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events"); // Replace with actual API URL
        if (!response.ok) throw new Error("Failed to fetch events");

        const data = await response.json();
        setEvents(data);
        console.log("Fetched Events:", data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const eventsForCalendar = events.map((event) => ({
    title: event.name,
    start: new Date(event.start_date),
    end: new Date(event.end_date),
  }));

  return (
    <div className="p-6 text-xl">
      <h1 className="text-2xl font-bold mb-4">Event Calendar View</h1>
      <div style={{ height: "500px" }}>
        <BigCalendar
          localizer={localizer}
          events={eventsForCalendar}
          startAccessor="start"
          endAccessor="end"
          views={["month"]}
          style={{ height: "100%", fontSize: "14px" }}
          eventPropGetter={() => ({
            style: {
              color: "white",
              fontSize: "12px",
              borderRadius: "5px",
              padding: "3px",
            },
          })}
        />
      </div>
    </div>
  );
};

export default CalendarView;

//fake data

// "use client";
// import { useState, useEffect } from "react";
// import { Calendar as BigCalendar } from "react-big-calendar";
// import { momentLocalizer } from "react-big-calendar";
// import moment from "moment";
// import "react-big-calendar/lib/css/react-big-calendar.css";

// const localizer = momentLocalizer(moment);

// interface Event {
//   name: string;
//   start_date: string;
//   end_date: string;
// }

// const fakeEvents = [
//   {
//     name: "Tech Conference 2025",
//     start_date: "2025-03-10T09:00:00",
//     end_date: "2025-03-10T17:00:00",
//   },
//   {
//     name: "UX/UI Workshop",
//     start_date: "2025-06-12T10:00:00",
//     end_date: "2025-06-12T15:00:00",
//   },
//   {
//     name: "AI & Machine Learning Seminar",
//     start_date: "2025-07-20T14:00:00",
//     end_date: "2025-07-20T18:00:00",
//   },
//   {
//     name: "Blockchain Networking Event",
//     start_date: "2025-08-15T11:00:00",
//     end_date: "2025-08-15T13:00:00",
//   },
//   {
//     name: "Product Management Meetup",
//     start_date: "2025-09-05T08:00:00",
//     end_date: "2025-09-05T12:00:00",
//   },
//   {
//     name: "Cybersecurity Training",
//     start_date: "2025-10-10T13:00:00",
//     end_date: "2025-10-10T16:00:00",
//   },
// ];

// const CalendarView: React.FC = () => {
//   const [events, setEvents] = useState<Event[]>([]);

//   useEffect(() => {
//     console.log("Fake Events Loaded", fakeEvents);
//     setEvents(fakeEvents);
//   }, []);

//   const eventsForCalendar = events.map((event) => ({
//     title: event.name,
//     start: new Date(event.start_date), // Convert to Date object
//     end: new Date(event.end_date), // Convert to Date object
//   }));

//   return (
//     <div className="p-6 text-xl">
//       <h1 className="text-2xl font-bold mb-4">Your Event Calendar View</h1>
//       <div style={{ height: "500px" }}>
//         <BigCalendar
//           localizer={localizer}
//           events={eventsForCalendar}
//           startAccessor="start"
//           endAccessor="end"
//           views={["month"]}
//           style={{ height: "100%", fontSize: "14px" }} // Reduce overall font size
//           eventPropGetter={(event) => {
//             return {
//               style: {
//                 color: "white", // White text color
//                 fontSize: "12px", // Smaller font for event titles
//                 borderRadius: "5px", // Rounded corners
//                 padding: "3px",
//               },
//             };
//           }}
//         />
//       </div>
//     </div>
//   );
// };

// export default CalendarView;
