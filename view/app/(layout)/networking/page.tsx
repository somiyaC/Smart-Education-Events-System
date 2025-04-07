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
        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => setActiveSection("poll")}
            className="border p-6 rounded-xl shadow hover:shadow-xl hover:bg-orange-400 text-xl bg-white"
          >
            Start Live Poll
          </button>
          <button
            onClick={() => setActiveSection("qna")}
            className="border p-6 rounded-xl shadow hover:shadow-xl hover:bg-orange-400 text-xl bg-white"
          >
            Q&A Section
          </button>
          <button
            onClick={() => setActiveSection("matchmaking")}
            className="border p-6 rounded-xl shadow hover:shadow-xl hover:bg-orange-400 text-xl bg-white"
          >
            Find Matches
          </button>
          <button
            onClick={() => setActiveSection("chat")}
            className="border p-6 rounded-xl shadow hover:shadow-xl hover:bg-orange-400 text-xl bg-white"
          >
            Chatroom
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
