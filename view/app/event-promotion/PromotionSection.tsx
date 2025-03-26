"use client";

import { useState } from 'react';

interface Event {
  name: string;
  date: string;
  time: string;
  location: string;
}

export default function PromotionSection({ event, onBack }: { event: Event; onBack: () => void }) {
  const [emailContent, setEmailContent] = useState('');

  return (
    <div className="border p-4 rounded-xl shadow-md">
      <button onClick={onBack} className="text-blue-600 underline mb-4">← Back to Event List</button>
      <h2 className="text-2xl font-bold mb-2">{event.name}</h2>
      <p className="text-gray-600 mb-2">Date: {event.date} | Time: {event.time} | Location: {event.location} </p>

      <textarea
        placeholder="Write email content..."
        value={emailContent}
        onChange={(e) => setEmailContent(e.target.value)}
        className="w-full p-2 border rounded-xl mb-4 h-32"
      />

      <div className="flex gap-4 mb-4">
        <button className="px-4 py-2 bg-orange-400 text-white rounded-xl hover:bg-orange-600 w-full">Send to Attendees</button>
        <button className="px-4 py-2 bg-orange-400 text-white rounded-xl hover:bg-orange-600 w-full">Send to All Emails</button>
      </div>

      <h3 className="text-xl font-semibold mb-2">Share on Social Media</h3>
      <div className="flex gap-3">
        <button className="bg-pink-500 px-3 py-2 text-white rounded-xl hover:bg-pink-600">Instagram</button>
        <button className="bg-blue-700 px-3 py-2 text-white rounded-xl hover:bg-blue-800">LinkedIn</button>
        <button className="bg-blue-500 px-3 py-2 text-white rounded-xl hover:bg-blue-600">Facebook</button>
        <button className="bg-black px-3 py-2 text-white rounded-xl hover:bg-gray-800">X</button>
      </div>
    </div>
  );
}
