"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../StateContext";

const SideBarNavBar: React.FC = () => {
  const { isAdmin, isOrganizer, userRole } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [permissionsVerified, setPermissionsVerified] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setIsLoading(false);
      setPermissionsVerified(true);
      setIsSpeaker(storedRole === "speaker");
      console.log("Current userRole in sidebar:", userRole);
      console.log("isAdmin:", isAdmin);
      console.log("isOrganizer:", isOrganizer);
      console.log("isSpeaker:", storedRole === "speaker");
    } else {
      setIsLoading(false);
    }
  }, [userRole]);

  return (
    <div
      className="h-full w-64"
      style={{
        backgroundColor: "#ffffff",
        backgroundImage: "none",
        boxShadow: "none",
        maxHeight: "calc(100vh - 60px)", // Adjust the 60px value based on your footer height
      }}
    >
      <div
        className="flex flex-col h-full p-3 space-y-1.5"
        style={{
          backgroundColor: "#ffffff",
          backgroundImage: "none",
        }}
      >
        {/* Base Nav Items */}
        <NavItem
          href="/"
          label="Home"
          iconPath="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
          subPath="9 22 9 12 15 12 15 22"
        />

        <NavItem
          href="/your-events"
          label="Your Events"
          iconPath="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z M8 10h8 M8 14h8 M8 6h8"
        />

        <NavItem
          href="/calendar"
          label="Calendar"
          iconPath="M3 4h18v18H3z M16 2v4 M8 2v4 M3 10h18"
        />

        <NavItem
          href="/networking"
          label="Networking & Engagement"
          iconPath="M16 22h2a2 2 0 0 0 2-2v-4a7 7 0 0 0-14 0v4a2 2 0 0 0 2 2h2"
          subPath="M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
        />

        {/* Speaker & Organizer */}
        {(isSpeaker || isOrganizer) && (
          <NavItem
            href="/messages"
            label="Messages"
            iconPath="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          />
        )}

        {/* Organizer & Admin */}
        {(isOrganizer || isAdmin) && (
          <>
            <NavItem
              href="/create-events"
              label="Create/Edit Events"
              iconPath="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />

            <NavItem
              href="/event-management"
              label="Event Information & Management"
              iconPath="M5 4h14v2H5z M5 10h14v2H5z M5 16h14v2H5z"
            />
            <NavItem
              href="/event-promotion"
              label="Event Promotion"
              iconPath="M12 3v13m0 3v1"
            />
          </>
        )}

        {/* Admin Only */}
        {isAdmin && (
          <>
            <NavItem
              href="/system-maintenance"
              label="System Maintenance"
              iconPath="M12 1v2 M12 21v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M1 12h2 M21 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42 M12 7a5 5 0 1 1 0 10a5 5 0 0 1 0-10z"
            />
            <NavItem
              href="/create-user"
              label="Create User"
              iconPath="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4s-4 1.79-4 4 1.79 4 4 4z M6 20v-2c0-2.21 3.58-4 6-4s6 1.79 6 4v2"
            />
          </>
        )}

        {/* Profile */}
        <NavItem
          href="/profile"
          label="Profile"
          iconPath="M12 12c2.67 0 8 1.34 8 4v4H4v-4c0-2.66 5.33-4 8-4z M12 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        />
      </div>
    </div>
  );
};

interface NavItemProps {
  href: string;
  label: string;
  iconPath: string;
  subPath?: string;
}

const NavItem: React.FC<NavItemProps> = ({
  href,
  label,
  iconPath,
  subPath,
}) => {
  return (
    <Link
      href={href}
      className="text-white bg-orange-500/90 hover:bg-orange-800/90 shadow-md hover:shadow-lg shadow-orange-400/30 hover:shadow-orange-800/40 rounded-2xl p-3 flex items-center space-x-3 font-medium transition-all duration-200 ease-in-out"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={iconPath} />
        {subPath && <path d={subPath} />}
      </svg>
      <span>{label}</span>
    </Link>
  );
};

export default SideBarNavBar;
