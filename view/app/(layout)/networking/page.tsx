"use client";

import { useEffect, useState } from "react";
import LivePoll from "../networking/LivePoll";
import QnASection from "../networking/QnASection";
import Matchmaking from "../networking/Matchmaking";
import ChatRoom from "../networking/ChatRoom";

export default function NetworkingDashboard() {
  const [activeSection, setActiveSection] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleBack = () => setActiveSection("");

  useEffect(() => {
    const fetchUserEvents = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/events/user_events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });

        const data = await res.json();
        setEvents(data?.events || []);
      } catch (err) {
        console.error("Failed to fetch user events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-4xl font-bold mb-6">Networking & Engagement</h1>

      {!activeSection && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setActiveSection("poll")}
            className="bg-gradient-to-r from-orange-400 to-yellow-300 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition transform flex flex-col items-center justify-center space-y-2"
          >
            📊
            <span className="text-lg font-semibold">Start Live Poll</span>
          </button>

          <button
            onClick={() => setActiveSection("qna")}
            className="bg-gradient-to-r from-blue-500 to-indigo-400 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition transform flex flex-col items-center justify-center space-y-2"
          >
            ❓
            <span className="text-lg font-semibold">Q&A Section</span>
          </button>

          <button
            onClick={() => setActiveSection("matchmaking")}
            className="bg-gradient-to-r from-green-500 to-emerald-400 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition transform flex flex-col items-center justify-center space-y-2"
          >
            🤝
            <span className="text-lg font-semibold">Find Matches</span>
          </button>

          <button
            onClick={() => setActiveSection("chat")}
            className="bg-gradient-to-r from-purple-500 to-pink-400 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition transform flex flex-col items-center justify-center space-y-2"
          >
            💬
            <span className="text-lg font-semibold">Chatroom</span>
          </button>
        </div>
      )}

      {activeSection === "poll" && <LivePoll onBack={handleBack} />}
      {activeSection === "qna" && !loading && (
        <QnASection onBack={handleBack} />
      )}
      {activeSection === "matchmaking" && <Matchmaking onBack={handleBack} />}
      {activeSection === "chat" && <ChatRoom onBack={handleBack} />}
    </div>
  );
}
