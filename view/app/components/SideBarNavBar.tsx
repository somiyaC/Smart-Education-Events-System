"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

const SideBarNavBar: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  return (
    <div className="w-60 h-screen bg-white p-2">
      <ul className="space-y-1.5">
        <li>
          <Link href="/" className="p-2 block">Home</Link>
        </li>
        {role === "attendee" && (
          <li>
            <Link href="/events" className="p-2 block">Your Events</Link>
          </li>
        )}
        {role === "organizer" && (
          <li>
            <Link href="/create-event" className="p-2 block">Create/Edit Events</Link>
          </li>
        )}
        {role === "admin" && (
          <li>
            <Link href="/manage-users" className="p-2 block">Manage Users</Link>
          </li>
        )}
      </ul>
    </div>
  );
};

export default SideBarNavBar;
