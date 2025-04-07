"use client";

import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  parseISO,
} from "date-fns";

// Interfaces from the previous file
interface Material {
  title: string;
  type: string;
  url: string;
}

interface Session {
  title: string;
  description: string;
  speaker: string;
  start_time: string;
  end_time: string;
  materials: string;
}

interface Event {
  id: string;
  name: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string;
  organizer: string;
  venue: string;
  sessions: Session[];
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's events when component mounts
  useEffect(() => {
    let userId = localStorage.getItem("user_id");
    if (!userId) return;

    fetch("http://localhost:8000/events/user_events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user events:", error);
        setLoading(false);
      });
  }, []);

  // Generate days for the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart),
    end: endOfWeek(monthEnd),
  });

  // Navigate between months
  const handlePreviousMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  // Function to check if a day has events
  const getDayEvents = (day: Date) => {
    return events.filter((event) =>
      isWithinInterval(day, {
        start: parseISO(event.start_date),
        end: parseISO(event.end_date),
      })
    );
  };

  if (loading) {
    return <div className="text-center p-4">Loading events...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePreviousMonth}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Previous
        </button>
        <h2 className="text-2xl font-bold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <button
          onClick={handleNextMonth}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Next
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="font-bold text-gray-600">
            {day}
          </div>
        ))}

        {calendarDays.map((day) => {
          const dayEvents = getDayEvents(day);
          return (
            <div
              key={day.toISOString()}
              className={`
                p-2 border relative
                ${
                  format(day, "M") !== format(currentDate, "M")
                    ? "text-gray-300"
                    : ""
                }
                ${
                  format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                    ? "bg-blue-100 font-bold"
                    : "hover:bg-gray-100"
                }
              `}
            >
              <div className="flex justify-between items-center">
                <span>{format(day, "d")}</span>
                {dayEvents.length > 0 && (
                  <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {dayEvents.length}
                  </span>
                )}
              </div>
              {dayEvents.length > 0 && (
                <div className="absolute z-10 bg-white border rounded shadow-lg p-2 mt-1 left-0 right-0">
                  {dayEvents.map((event) => (
                    <div key={event.id} className="text-xs text-gray-700 mb-1">
                      {event.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
