"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../StateContext";

const SideBarNavBar: React.FC = () => {
  const { isAdmin, isOrganizer, userRole } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [permissionsVerified, setPermissionsVerified] = useState(false);

  useEffect(() => {
    // Check if role exists in localStorage
    const storedRole = localStorage.getItem("role");
    // Only set loading to false if we have a role or confirmed no role
    if (storedRole) {
      setIsLoading(false);
      setPermissionsVerified(true);
      console.log("Current userRole in sidebar:", userRole);
      console.log("isAdmin:", isAdmin);
      console.log("isOrganizer:", isOrganizer);
    } else {
      setIsLoading(false);
    }
  }, [userRole]);

  return (
    <div className="w-50 h-screen bg-white text-white p-2 h-full">
      <ul className="space-y-0.5">
        {/* Links for all users */}
        <li>
          <Link
            href="/"
            className="bg-orange-400 text-sm rounded-2xl p-2 block hover:bg-orange-300 transition"
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            href="/your-events"
            className="bg-orange-400 text-sm rounded-2xl p-2 block hover:bg-orange-300 transition"
          >
            Your Events
          </Link>
        </li>
        <li>
          <Link
            href="/calendar"
            className="bg-orange-400 text-sm rounded-2xl p-2 block hover:bg-orange-300 transition"
          >
            Calendar
          </Link>
        </li>
        <li>
          <Link
            href="/networking"
            className="bg-orange-400 text-sm rounded-2xl p-2 block hover:bg-orange-300 transition"
          >
            Networking & Engagement
          </Link>
        </li>

        {/* Links for organizers and admins */}
        {(isOrganizer || isAdmin) && (
          <>
            <li>
              <Link
                href="/create-edit-events"
                className="bg-orange-400 text-sm rounded-2xl p-2 block hover:bg-orange-300 transition"
              >
                Create/Edit Events
              </Link>
            </li>
            <li>
              <Link
                href="/event-management"
                className="bg-orange-400 text-sm rounded-2xl p-2 block hover:bg-orange-300 transition"
              >
                Event Information and Management
              </Link>
            </li>
            <li>
              <Link
                href="/event-promotion"
                className="bg-orange-400 text-sm rounded-2xl p-2 block hover:bg-orange-300 transition"
              >
                Event Promotion
              </Link>
            </li>
          </>
        )}

        {/* Links for admins only */}
        {isAdmin && (
          <>
            <li>
              <Link
                href="/system-maintenance"
                className="bg-orange-400 text-sm rounded-2xl p-2 block hover:bg-orange-300 transition"
              >
                System Maintenance
              </Link>
            </li>
            <li>
              <Link
                href="/create-user"
                className="bg-orange-400 text-sm rounded-2xl p-2 block hover:bg-orange-300 transition"
              >
                Create User
              </Link>
            </li>
          </>
        )}

        {/* Profile link for all users */}
        <li>
          <Link
            href="/profile"
            className="bg-orange-400 text-sm rounded-2xl p-2 block hover:bg-orange-300 transition"
          >
            Profile
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default SideBarNavBar;
