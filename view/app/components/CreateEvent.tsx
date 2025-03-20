"use client";

import { useState } from "react";

const CreateEvent = () => {
  const [event, setEvent] = useState({ name: "", date: "", location: "", description: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/events/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });

    if (response.ok) {
      alert("Event created successfully!");
      setEvent({ name: "", date: "", location: "", description: "" });
    } else {
      alert("Error creating event");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Event Name" onChange={(e) => setEvent({ ...event, name: e.target.value })} />
      <input type="date" onChange={(e) => setEvent({ ...event, date: e.target.value })} />
      <input type="text" placeholder="Location" onChange={(e) => setEvent({ ...event, location: e.target.value })} />
      <textarea placeholder="Description" onChange={(e) => setEvent({ ...event, description: e.target.value })} />
      <button type="submit">Create Event</button>
    </form>
  );
};

export default CreateEvent;
