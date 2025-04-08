"use client";

import { useState } from "react";

export default function LivePoll({ onBack }: { onBack: () => void }) {
  const [question, setQuestion] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [status, setStatus] = useState("");

  const createPoll = async () => {
    const event_id = localStorage.getItem("event_id");
    const created_by = localStorage.getItem("user_id");

    const res = await fetch("/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id,
        created_by,
        question,
        options: [{ text: option1 }, { text: option2 }],
        is_multiple_choice: false,
        duration: 60,
        status: "active",
        ends_at: new Date(Date.now() + 60000).toISOString(),
      }),
    });

    if (res.ok) {
      setStatus("✅ Poll created!");
    } else {
      setStatus("❌ Failed to create poll.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <div className="bg-white border border-gray-300 rounded-2xl shadow-xl p-8 w-full max-w-xl">
        <button
          onClick={onBack}
          className="text-blue-500 hover:text-blue-700 text-sm mb-6 flex items-center gap-1"
        >
          ← Back
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          📊 Create a Live Poll
        </h2>

        <input
          type="text"
          placeholder="Poll Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-3 mb-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="text"
          placeholder="Option 1"
          value={option1}
          onChange={(e) => setOption1(e.target.value)}
          className="w-full p-3 mb-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="text"
          placeholder="Option 2"
          value={option2}
          onChange={(e) => setOption2(e.target.value)}
          className="w-full p-3 mb-6 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        <button
          onClick={createPoll}
          className="w-full bg-gradient-to-r from-orange-400 to-yellow-300 text-white font-semibold py-3 rounded-xl shadow-md hover:scale-105 transform transition"
        >
          Create Poll
        </button>

        {status && (
          <p className="mt-4 text-sm text-gray-700 font-medium">{status}</p>
        )}
      </div>
    </div>
  );
}
