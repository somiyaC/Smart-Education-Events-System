"use client";
import React, { useEffect, useState } from "react";

const AnalyticsPage = () => {
  const [eventId, setEventId] = useState("e1");
  const [registrationCount, setRegistrationCount] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const fetchAnalytics = async () => {
      try {
        const regRes = await fetch(`http://127.0.0.1:8000/analytics/registrations/${eventId}`);
        const regData = await regRes.json();
        setRegistrationCount(regData.registration_count);

        const fbRes = await fetch(`http://127.0.0.1:8000/analytics/feedback/${eventId}`);
        const fbData = await fbRes.json();
        setAverageRating(fbData.average_rating);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      }
    };

    fetchAnalytics();
  }, [eventId]);

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-6">📊 Event Analytics Dashboard</h1>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Event ID:</label>
        <input
          className="w-full p-2 border rounded"
          placeholder="Enter Event ID"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        />
      </div>

      <div className="space-y-4 mt-6">
        <div className="p-4 bg-gray-100 rounded">
          <p className="font-medium">🧾 Registration Count:</p>
          <p className="text-xl">{registrationCount !== null ? registrationCount : "Loading..."}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <p className="font-medium">⭐ Average Feedback Rating:</p>
          <p className="text-xl">
            {averageRating !== null ? `${averageRating} / 5` : "Loading..."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
