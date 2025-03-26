"use client";

export default function ChatRoom({ onBack }: { onBack: () => void }) {
  return (
    <div className="border p-6 rounded-xl shadow bg-white">
      <button onClick={onBack} className="text-blue-600 mb-4">← Back</button>
      <h2 className="text-2xl font-bold mb-4">Chatroom</h2>
      <div className="h-64 border p-2 rounded mb-4 overflow-y-auto">
        <p><strong>Alex:</strong> Excited for this event! 👋</p>
        <p><strong>Jane:</strong> Me too! Any tips for first-timers?</p>
      </div>
      <input placeholder="Type your message..." className="w-full border p-2 rounded mb-2" />
      <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Send</button>
    </div>
  );
}
