"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../StateContext";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemButton,
} from "@mui/material";

const SideBarNavBar: React.FC = () => {
  const { isAdmin, isOrganizer, userRole } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [permissionsVerified, setPermissionsVerified] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  const [open, setOpen] = useState(true); // Set initial value as true (open by default)

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
    <div className="w-50 h-screen bg-white text-white p-2 h-full">
      {/* Sidebar below the header */}
      <Drawer
        sx={{
          width: 250,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 250,
            boxSizing: "border-box",
            backgroundColor: "#f17126", // Dark background color for the sidebar
            color: "white", // White text color
          },
        }}
        variant="permanent"
        anchor="left"
        open={open}
      >
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
      </Drawer>
    </div>
  );
};

export default SideBarNavBar;
