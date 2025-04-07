"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../StateContext";
import { List, ListItemText, ListItemButton } from "@mui/material";

const SideBarNavBar: React.FC = () => {
  const { isAdmin, isOrganizer, userRole } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [permissionsVerified, setPermissionsVerified] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  useEffect(() => {
    // Check if role exists in localStorage
    const storedRole = localStorage.getItem("role");
    // Only set loading to false if we have a role or confirmed no role
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
    <div className="h-full bg-orange-500 text-white fixed left-0 top-0 pt-32 w-64">
      {/* Removed Drawer component and keeping just the content */}
      <div className="flex flex-col h-full">
        <List>
          {/* Links for all users */}
          <ListItemButton>
            <Link
              href="/"
              className="bg-orange-400 text-white text-sm rounded-2xl p-2 block hover:bg-orange-300 transition w-full"
            >
              <ListItemText primary="Home" />
            </Link>
          </ListItemButton>
          <ListItemButton>
            <Link
              href="/your-events"
              className="bg-orange-400 text-white text-sm rounded-2xl p-2 block hover:bg-orange-300 transition w-full"
            >
              <ListItemText primary="Your Events" />
            </Link>
          </ListItemButton>
          <ListItemButton>
            <Link
              href="/calendar"
              className="bg-orange-400 text-white text-sm rounded-2xl p-2 block hover:bg-orange-300 transition w-full"
            >
              <ListItemText primary="Calendar" />
            </Link>
          </ListItemButton>
          <ListItemButton>
            <Link
              href="/networking"
              className="bg-orange-400 text-white text-sm rounded-2xl p-2 block hover:bg-orange-300 transition w-full"
            >
              <ListItemText primary="Networking & Engagement" />
            </Link>
          </ListItemButton>
        </List>
      </div>
    </div>
  );
};

export default SideBarNavBar;
