"use client";

import { useState, useEffect } from "react";

interface Event {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  organizer_id: string;
  participants: [string]
}

interface User {
  first_name: string;
  last_name: string;
  email: string;
}

export default function PromotionSection({
  event,
  onBack,
}: {
  event: Event;
  onBack: () => void;
}) {
  const [emailContent, setEmailContent] = useState("");
  const [status, setStatus] = useState("");
  const [organizer, setOrganizer] = useState<User | null>(null);

  // Fetch organizer details on load
  useEffect(() => {
    console.log(event.participants)
    const fetchOrganizer = async () => {
      try {
        const res = await fetch(`http://localhost:8000/auth/user`,
          {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({user_id:localStorage.getItem("user_id")})
          }
        );
        if (!res.ok) throw new Error("Failed to fetch organizer info");
        const data = await res.json();
        setOrganizer(data);
      } catch (err) {
        console.error("Error fetching organizer:", err);
        setStatus("❌ Failed to load organizer info.");
      }
    };

    fetchOrganizer();
  }, [event.organizer_id]);

  const handleSend = async (audienceType: "attendees" | "all") => {
    if (!organizer) {
      setStatus("❌ Organizer info not loaded yet.");
      return;
    }

    setStatus("Sending...");
    try {
      const res = await fetch("http://localhost:8000/promotion/email-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.id,
          subject: `Join us for ${event.name}`,
          body: emailContent,
          recipients: event.participants
        }),
      })
      .then((res) => res.json())
      .then(data => {
        if (data.status === true) {
        } else {
        }
      })


      setStatus("✅ Email campaign sent successfully!");
    } catch (error) {
      console.error(error);
      setStatus("❌ Failed to send campaign.");
    }
  };

  return (
    <div className="border p-4 rounded-xl shadow-md">
      <button onClick={onBack} className="text-blue-600 underline mb-4">
        ← Back to Event List
      </button>
      <h2 className="text-2xl font-bold mb-2">{event.name}</h2>
      <p className="text-gray-600 mb-2">
        Date: {new Date(event.start_date).toLocaleDateString()}
      </p>

      <textarea
        placeholder="Write email content..."
        value={emailContent}
        onChange={(e) => setEmailContent(e.target.value)}
        className="w-full p-2 border rounded-xl mb-4 h-32"
      />

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => handleSend("attendees")}
          className="px-4 py-2 bg-orange-400 text-white rounded-xl hover:bg-orange-600 w-full"
        >
          Send to Attendees
        </button>
        <button
          onClick={() => handleSend("all")}
          className="px-4 py-2 bg-orange-400 text-white rounded-xl hover:bg-orange-600 w-full"
        >
          Send to All Emails
        </button>
      </div>

      <h3 className="text-xl font-semibold mb-2">Share on Social Media</h3>
      <div className="flex gap-3">
        <button className="bg-pink-500 px-3 py-2 text-white rounded-xl hover:bg-pink-600">
          Instagram
        </button>
        <button className="bg-blue-700 px-3 py-2 text-white rounded-xl hover:bg-blue-800">
          LinkedIn
        </button>
        <button className="bg-blue-500 px-3 py-2 text-white rounded-xl hover:bg-blue-600">
          Facebook
        </button>
        <button className="bg-black px-3 py-2 text-white rounded-xl hover:bg-gray-800">
          X
        </button>
      </div>

      {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
    </div>
  );
}
