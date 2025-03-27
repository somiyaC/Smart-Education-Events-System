"use client";

import { useState } from "react";

const events = ["Tech Summit", "Design Expo", "AI Bootcamp"];

const paymentDataMap = {
  "Tech Summit": {
    ticketRevenue: 18750,
    sponsors: [
      { name: "TechCorp", amount: 5000 },
      { name: "CloudNet", amount: 4000 },
    ],
    budget: {
      total: 25000,
      expenses: 17000,
    },
    transactions: [
      { id: 1, item: "Venue", amount: 7000 },
      { id: 2, item: "Catering", amount: 5000 },
      { id: 3, item: "Logistics", amount: 5000 },
    ],
  },
  "Design Expo": {
    ticketRevenue: 10200,
    sponsors: [
      { name: "Designify", amount: 3000 },
      { name: "ColorSpace", amount: 2500 },
    ],
    budget: {
      total: 15000,
      expenses: 9800,
    },
    transactions: [
      { id: 1, item: "Booth Setup", amount: 4000 },
      { id: 2, item: "Snacks", amount: 2800 },
      { id: 3, item: "Marketing", amount: 3000 },
    ],
  },
  "AI Bootcamp": {
    ticketRevenue: 14100,
    sponsors: [
      { name: "AI World", amount: 4500 },
    ],
    budget: {
      total: 18000,
      expenses: 12300,
    },
    transactions: [
      { id: 1, item: "Instructor Fees", amount: 6000 },
      { id: 2, item: "Platform Licensing", amount: 3300 },
      { id: 3, item: "Lunch Boxes", amount: 3000 },
    ],
  },
};

export default function PaymentDashboard() {
  const [selectedEvent, setSelectedEvent] = useState<keyof typeof paymentDataMap>("Tech Summit");
  const { ticketRevenue, sponsors, budget, transactions } =
    paymentDataMap[selectedEvent];

  const totalSponsorship = sponsors.reduce((acc, s) => acc + s.amount, 0);
  const remainingBudget = budget.total - budget.expenses;

  return (
    <div className="p-6 space-y-10">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Payment & Financial Management</h1>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value as keyof typeof paymentDataMap)}
            className="p-2 rounded-xl border text-black"
          >
            {events.map((event) => (
              <option key={event} value={event}>
                {event}
              </option>
            ))}
          </select>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition">
          Export Financials
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-2">Total Ticket Revenue</h2>
          <p className="text-3xl font-bold text-green-600">
            ${ticketRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-2">Sponsorships</h2>
          <p className="text-3xl font-bold text-blue-600">
            ${totalSponsorship.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-2">Remaining Budget</h2>
          <p
            className={`text-3xl font-bold ${
              remainingBudget >= 0 ? "text-green-700" : "text-red-600"
            }`}
          >
            ${remainingBudget.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <ul className="space-y-2">
          {transactions.map((txn) => (
            <li
              key={txn.id}
              className="flex justify-between border-b pb-2 text-gray-700"
            >
              <span>{txn.item}</span>
              <span>${txn.amount.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
