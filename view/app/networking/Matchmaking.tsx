"use client";

import { useEffect, useState } from "react";

interface Match {
  user_id: string;
  name: string;
  company: string;
  job_title: string;
  match_score: number;
  matching_interests: string[];
}

export default function Matchmaking({ onBack }: { onBack: () => void }) {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    const fetchMatches = async () => {
      const res = await fetch(`/networking/match/${userId}`);
      const data = await res.json();
      setMatches(data);
    };

    fetchMatches();
  }, []);

  return (
    <div className="border p-6 rounded-xl shadow bg-white">
      <button onClick={onBack} className="text-blue-600 mb-4">← Back</button>
      <h2 className="text-2xl font-bold mb-4">Suggested Connections</h2>
      <div className="grid grid-cols-1 gap-4">
        {matches.map((person, index) => (
          <div key={index} className="border p-4 rounded shadow flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{person.name}</h3>
              <p className="text-gray-500">Interests: {person.matching_interests.join(", ")}</p>
              <p className="text-sm text-gray-400">Match Score: {person.match_score * 100}%</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Connect</button>
          </div>
        ))}
      </div>
    </div>
  );
}
