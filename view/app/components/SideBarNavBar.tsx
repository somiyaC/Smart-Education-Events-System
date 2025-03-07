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
            className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-500 transition"
          >
            Home
          </Link>
        </li>
        <li>
          {/* this is only displayed for Attendees */}
          <Link
            href="/events"
            className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-500 transition"
          >
            Your Events
          </Link>
        </li>
        <li>
          {/* this is only displayed for event organizers, planners, sponsors, and exhibitors */}
          <Link
            href="/events"
            className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-500 transition"
          >
            Create/Edit Events
          </Link>
        </li>
        <li>
          {/* this is only displayed for Technical administrator */}
          <Link
            href="/events"
            className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-500 transition"
          >
            Edit/Create User
          </Link>
        </li>
        <li>
          {/* this is only displayed for Executive administrator */}
          <Link
            href="/events"
            className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-500 transition"
          >
            Event Information and Managmenet
          </Link>
        </li>
        <li>
          {/* this is only displayed for Technical administrator */}
          <Link
            href="/events"
            className="bg-orange-400 rounded-2xl p-2 block hover:bg-orange-500 transition"
          >
            System Maintenance
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default SideBarNavBar;
