"use client";

import { useEffect, useState } from "react";

export default function ChatRoom({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatRoomId = "CHAT_ROOM_ID"; // You gotta replace with a real ID from the MongoDB
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  const fetchMessages = async () => {
    const res = await fetch(`/chat/${chatRoomId}/messages`);
    const data = await res.json();
    setMessages(data);
  };

  const sendMessage = async () => {
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

  return (
    <div className="border p-6 rounded-xl shadow bg-white">
      <button onClick={onBack} className="text-blue-600 mb-4">← Back</button>
      <h2 className="text-2xl font-bold mb-4">Chatroom</h2>
      <div className="h-64 border p-2 rounded mb-4 overflow-y-auto">
        {messages.map((msg, idx) => (
          <p key={idx}><strong>{msg.sender_name || "User"}:</strong> {msg.text}</p>
        ))}
      </div>
      <input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
        className="w-full border p-2 rounded mb-2"
      />
      <button onClick={sendMessage} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Send</button>
    </div>
  );
}
