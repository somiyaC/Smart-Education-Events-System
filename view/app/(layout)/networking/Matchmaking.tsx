"use client";

import { useEffect, useState } from "react";

interface Match {
  user_id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  job_title?: string;
  company?: string;
  interests?: string[];
}

export default function Matchmaking({ onBack }: { onBack: () => void }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("user_id");
    if (!id) return;

    setUserId(id);

    const fetchMatches = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/networking_engagement/matchmaking?user_id=${id}`
        );
        const data = await res.json();

        const filtered = (data.matches || []).filter(
          (match: Match) => match.user_id !== id
        );
        setMatches(filtered);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="flex justify-center items-start min-h-[70vh] px-4">
      <div className="bg-white border border-gray-300 rounded-2xl shadow-xl p-8 w-full max-w-3xl">
        <div className="mb-6 self-start">
          <button
            onClick={onBack}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            ← Back
          </button>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          🔗 Suggested Connections
        </h2>

        <div className="space-y-4">
          {matches.length === 0 ? (
            <p className="text-gray-500">No matches found.</p>
          ) : (
            matches.map((person, index) => (
              <div
                key={index}
                className="border border-gray-200 bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition flex justify-between items-start"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {person.first_name || person.last_name
                      ? `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim()
                      : person.email}
                  </h3>

                  {person.job_title && person.company && (
                    <p className="text-sm text-gray-600 italic mb-1">
                      {person.job_title} at {person.company}
                    </p>
                  )}

                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-medium">Interests:</span>{" "}
                    {Array.isArray(person.interests) && person.interests.length > 0
                      ? person.interests.join(", ")
                      : "N/A"}
                  </p>
                </div>
                <button
  onClick={async () => {
    try {
      const res = await fetch("http://localhost:8000/networking_engagement/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: localStorage.getItem("user_id"),
          target_user_id: person.user_id,
        }),
      });
      const data = await res.json();
      if (data.status) {
        alert("Connection sent!");
      }
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  }}
  className="bg-gradient-to-r from-green-500 to-emerald-400 text-white font-semibold px-5 py-2 rounded-lg shadow hover:scale-105 transition"
>
  Connect
</button>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
