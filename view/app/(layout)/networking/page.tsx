"use client";

import { useState } from "react";
import LivePoll from "../networking/LivePoll";
import QnASection from "../networking/QnASection";
import Matchmaking from "../networking/Matchmaking";
import ChatRoom from "../networking/ChatRoom";

export default function NetworkingDashboard() {
  const [activeSection, setActiveSection] = useState("");

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

      {activeSection === "poll" && <LivePoll onBack={() => setActiveSection("")} />}
      {activeSection === "qna" && <QnASection onBack={() => setActiveSection("")} />}
      {activeSection === "matchmaking" && <Matchmaking onBack={() => setActiveSection("")} />}
      {activeSection === "chat" && <ChatRoom onBack={() => setActiveSection("")} />}
    </div>
  );
}
