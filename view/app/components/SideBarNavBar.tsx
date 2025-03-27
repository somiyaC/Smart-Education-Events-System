"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

const SideBarNavBar: React.FC = () => {
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    // This will run only on the client (browser)
    const role = localStorage.getItem("role");
    setIsOrganizer(role === "organizer");
  }, []);

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
          <Link
            href="/your-events"
            className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-300 transition"
          >
            Your Events
          </Link>
        </li>
        {isOrganizer && (
          <li>
            {/* Only for event organizers, planners, sponsors, and exhibitors */}
            <Link
              href="/create-edit-events"
              className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-300 transition"
            >
              Create/Edit Events
            </Link>
          </li>
        )}
        {isOrganizer && (
          <li>
            {/* Only for Executive administrator */}
            <Link
              href="/event-management"
              className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-300 transition"
            >
              Event Information and Management
            </Link>
          </li>
        )}
        {isOrganizer && (
          <li>
            {/* Only for Executive administrator */}
            <Link
              href="/event-promotion"
              className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-300 transition"
            >
              Event Promotion
            </Link>
          </li>
        )}
        <li>
          <Link
            href="/networking"
            className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-300 transition"
          >
            Networking & Engagement
          </Link>
        </li>
        {isOrganizer && (
          <li>
            {/* Only for Technical administrator */}
            <Link
              href="/system-maintenance"
              className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-300 transition"
            >
              System Maintenance
            </Link>
          </li>
        )}
        <li>
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
