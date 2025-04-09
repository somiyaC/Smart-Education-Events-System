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
      // Dummy Data for Testing purposes - remove this when using real backend
      const data: Match[] = [
        {
          user_id: "1",
          name: "Youssef Francis",
          company: "openAI",
          job_title: "AI Researcher",
          match_score: 0.91,
          matching_interests: ["AI", "Hackathons"],
        },
        {
          user_id: "2",
          name: "Sonia Marroco",
          company: "Meta",
          job_title: "Full-Stack Developer",
          match_score: 0.83,
          matching_interests: ["Web Dev", "Startups", "Design"],
        },
        {
          user_id: "3",
          name: "Minecraft Steve",
          company: "Mojang",
          job_title: "Chicken Jockey",
          match_score: 0.78,
          matching_interests: ["Mine", "Flint", "Steel"],
        },
      ];

      setMatches(data);

      // UNCOMMENT for real backend connection
      // const res = await fetch(`/engagement/matchmaking?user_id=${userId}`);
      // const data = await res.json();
      // setMatches(data.matches);
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
          {matches.map((person, index) => (
            <div
              key={index}
              className="border border-gray-200 bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition flex justify-between items-start"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {person.name}
                </h3>
                <p className="text-sm text-gray-600 italic mb-1">
                  {person.job_title} at {person.company}
                </p>
                <p className="text-gray-700 mb-1">
                  🎯 <span className="font-medium">Interests:</span>{" "}
                  {person.matching_interests.join(", ")}
                </p>
                <p className="text-sm text-gray-500">
                  🔢 Match Score: {(person.match_score * 100).toFixed(1)}%
                </p>
              </div>
              <button className="bg-gradient-to-r from-green-500 to-emerald-400 text-white font-semibold px-5 py-2 rounded-lg shadow hover:scale-105 transition">
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
