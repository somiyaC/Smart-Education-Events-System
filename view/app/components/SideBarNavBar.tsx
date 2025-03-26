"use client";

import Link from "next/link";
import React from "react";

const SideBarNavBar: React.FC = () => {
  return (
    <div className="w-60 h-screen bg-white text-white p-2 h-full">
      <ul className="space-y-1.5">
        <li>
          <Link
            href="/"
            className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-300 transition"
          >
            Home
          </Link>
        </li>
        <li>
          {/* Only displayed for Attendees */}
          <Link
            href="/your-events"
            className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-300 transition"
          >
            Your Events
          </Link>
        </li>
        <li>
          {/* Only for event organizers, planners, sponsors, and exhibitors */}
          <Link
            href="/create-edit-events"
            className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-300 transition"
          >
            Create/Edit Events
          </Link>
        </li>
        <li>
          {/* Only for Technical administrator */}
          <Link
            href="/edit-create-user"
            className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-300 transition"
          >
            Edit/Create User
          </Link>
        </li>
        <li>
          {/* Only for Executive administrator */}
          <Link
            href="/event-management"
            className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-300 transition"
          >
            Event Information and Management
          </Link>
        </li>
        <li>
          {/* Only for Executive administrator */}
          <Link
            href="/event-promotion"
            className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-300 transition"
          >
            Event Promotion
          </Link>
        </li>
        <li>
          {/* Only for Executive administrator */}
          <Link
            href="/networking"
            className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-300 transition"
          >
            Networking & Engagement
          </Link>
        </li>
        <li>
          {/* Only for Technical administrator */}
          <Link
            href="/system-maintenance"
            className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-300 transition"
          >
            System Maintenance
          </Link>
        </li>
        <li>
          {/* Only for Technical administrator */}
          <Link
            href="/profile"
            className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-300 transition"
          >
            Profile
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default SideBarNavBar;
