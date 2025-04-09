"use client";

import { useEffect, useRef, useState } from "react";

export default function ChatRoom({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatRoomId = "CHAT_ROOM_ID"; // Replace with real chat room ID
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const res = await fetch(`/chat/${chatRoomId}/messages`);
    const data = await res.json();
    setMessages(data);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await fetch("/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: newMessage,
        sender_id: userId,
        chat_room_id: chatRoomId,
      }),
    });
    setNewMessage("");
    fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col items-center min-h-[75vh] px-4">
      <div className="bg-white border border-gray-300 rounded-2xl shadow-xl p-6 w-full max-w-3xl flex flex-col flex-grow">
        <button
          onClick={onBack}
          className="text-blue-500 hover:text-blue-700 text-sm mb-4 flex items-center gap-1"
        >
          ← Back
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-4">💬 Chatroom</h2>

        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 h-72 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-sm italic text-center">No messages yet</p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-3 p-3 rounded-lg max-w-[75%] ${
                  msg.sender_id === userId
                    ? "bg-orange-100 ml-auto text-right"
                    : "bg-white border border-gray-200"
                }`}
              >
                <p className="text-sm text-gray-600 font-semibold">
                  {msg.sender_name || "User"}
                </p>
                <p className="text-gray-800">{msg.text}</p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 items-center">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            onClick={sendMessage}
            className="bg-gradient-to-r from-purple-500 to-pink-400 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:scale-105 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
