"use client";

export default function LivePoll({ onBack }: { onBack: () => void }) {
  return (
    <div className="border p-6 rounded-xl shadow bg-white">
      <button onClick={onBack} className="text-blue-600 mb-4">← Back</button>
      <h2 className="text-2xl font-bold mb-4">Create a Live Poll</h2>
      <input placeholder="Poll Question" className="w-full border p-2 rounded mb-2" />
      <input placeholder="Option 1" className="w-full border p-2 rounded mb-2" />
      <input placeholder="Option 2" className="w-full border p-2 rounded mb-4" />
      <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Create Poll</button>
    </div>
  );
}
