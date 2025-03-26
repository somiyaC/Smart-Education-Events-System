"use client";

export default function QnASection({ onBack }: { onBack: () => void }) {
  return (
    <div className="border p-6 rounded-xl shadow bg-white">
      <button onClick={onBack} className="text-blue-600 mb-4">← Back</button>
      <h2 className="text-2xl font-bold mb-4">Q&A Section</h2>
      <input placeholder="Ask a question..." className="w-full border p-2 rounded mb-2" />
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Submit</button>
      <h3 className="text-xl mt-6 mb-2">Recent Questions</h3>
      <ul>
        <li className="border p-2 rounded mb-2">What time does the event start? 👍 3</li>
        <li className="border p-2 rounded mb-2">Will there be a recording? 👍 2</li>
      </ul>
    </div>
  );
}
