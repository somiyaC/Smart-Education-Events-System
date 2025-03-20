"use client";

import Navbar from "@/app/components/NavBar";
import SearchBar from "@/app/components/SearchBar";
import SideBarNavBar from "@/app/components/SideBarNavBar";
import Body from "@/app/components/Body";
import Footer from "@/app/components/Footer";
import CreateEvent from "@/app/components/CreateEvent";
import { useEffect, useState } from "react";

export default function Home() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  return (
    <>
      <Navbar />
      <SearchBar />
      <div className="flex flex-grow">
        <SideBarNavBar />
        <div className="flex-grow p-6">
          {role === "attendee" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
              {/* Placeholder for event list component */}
              <p>List of upcoming events...</p>
            </div>
          )}
          {role === "organizer" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Create a New Event</h2>
              <CreateEvent />
            </div>
          )}
          {role === "admin" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
              {/* Placeholder for user management component */}
              <p>User management interface...</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
