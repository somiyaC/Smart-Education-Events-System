"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#FF6363"];

const mockEvents = ["Tech Summit", "Design Expo", "AI Bootcamp"];

const dataMap = {
  "Tech Summit": {
    registration: [
      { date: "Mar 1", count: 10 },
      { date: "Mar 2", count: 20 },
      { date: "Mar 3", count: 35 },
      { date: "Mar 4", count: 50 },
    ],
    engagement: [
      { session: "Keynote", attendees: 50 },
      { session: "Networking", attendees: 30 },
    ],
    feedback: [
      { name: "Excellent", value: 70 },
      { name: "Good", value: 20 },
      { name: "Fair", value: 7 },
      { name: "Poor", value: 3 },
    ],
  },
  "Design Expo": {
    registration: [
      { date: "Mar 1", count: 5 },
      { date: "Mar 2", count: 10 },
      { date: "Mar 3", count: 15 },
    ],
    engagement: [
      { session: "UX Panel", attendees: 20 },
      { session: "Design Showcase", attendees: 25 },
    ],
    feedback: [
      { name: "Excellent", value: 50 },
      { name: "Good", value: 30 },
      { name: "Fair", value: 15 },
      { name: "Poor", value: 5 },
    ],
  },
  "AI Bootcamp": {
    registration: [
      { date: "Mar 1", count: 8 },
      { date: "Mar 2", count: 16 },
      { date: "Mar 3", count: 24 },
      { date: "Mar 4", count: 32 },
    ],
    engagement: [
      { session: "Intro to ML", attendees: 18 },
      { session: "Deep Learning", attendees: 22 },
    ],
    feedback: [
      { name: "Excellent", value: 65 },
      { name: "Good", value: 25 },
      { name: "Fair", value: 8 },
      { name: "Poor", value: 2 },
    ],
  },
};

export default function AnalyticsDashboard() {
  const [selectedEvent, setSelectedEvent] = useState<keyof typeof dataMap>("Tech Summit");

  const registrationData = dataMap[selectedEvent].registration;
  const sessionEngagement = dataMap[selectedEvent].engagement;
  const feedbackData = dataMap[selectedEvent].feedback;

  return (
    <div className="p-6 space-y-10">
<div className="flex justify-between items-center mb-4">
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-3xl font-bold">Event Analytics Dashboard</h1>
    <button
        className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
        onClick={() => alert("CSV Export coming soon!")}
    >
    Export CSV
    </button>
    </div>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value as keyof typeof dataMap)}
          className="p-2 rounded-xl border text-black"
        >
          {mockEvents.map((event) => (
            <option key={event} value={event}>
              {event}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Registration Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={registrationData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Session Engagement</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sessionEngagement}>
            <XAxis dataKey="session" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="attendees" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Attendee Feedback</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={feedbackData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {feedbackData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
