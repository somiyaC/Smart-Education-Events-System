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
    <div className="border p-6 rounded-xl shadow bg-white">
      <button onClick={onBack} className="text-blue-600 mb-4">← Back</button>
      <h2 className="text-2xl font-bold mb-4">Create a Live Poll</h2>
      <input placeholder="Poll Question" value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full border p-2 rounded mb-2" />
      <input placeholder="Option 1" value={option1} onChange={(e) => setOption1(e.target.value)} className="w-full border p-2 rounded mb-2" />
      <input placeholder="Option 2" value={option2} onChange={(e) => setOption2(e.target.value)} className="w-full border p-2 rounded mb-4" />
      <button onClick={createPoll} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Create Poll</button>
      {status && <p className="mt-2 text-sm text-gray-700">{status}</p>}
    </div>
  );
}
