"use client";

const dummyMatches = [
  { name: "Sophia", interests: "AI & Robotics" },
  { name: "Daniel", interests: "Startup Growth" },
  { name: "Emily", interests: "Neuroscience Research" },
];

export default function Matchmaking({ onBack }: { onBack: () => void }) {
  return (
    <div className="border p-6 rounded-xl shadow bg-white">
      <button onClick={onBack} className="text-blue-600 mb-4">← Back</button>
      <h2 className="text-2xl font-bold mb-4">Suggested Connections</h2>
      <div className="grid grid-cols-1 gap-4">
        {dummyMatches.map((person, index) => (
          <div key={index} className="border p-4 rounded shadow flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{person.name}</h3>
              <p className="text-gray-500">{person.interests}</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Connect</button>
          </div>
        ))}
      </div>
    </div>
  );
}
