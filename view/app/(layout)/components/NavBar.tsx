"use client";
import Link from "next/link";
import { AppBar, Toolbar, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Navbar: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");

  // Function to check login status
  const checkLoginStatus = () => {
    const userId = localStorage.getItem("user_id");
    const storedEmail = localStorage.getItem("email");
    if (userId) {
      setIsLoggedIn(true);
      setEmail(storedEmail || "");
    } else {
      setIsLoggedIn(false);
      setEmail("");
    }
  };

  useEffect(() => {
    // Check login status when component mounts
    checkLoginStatus();
    // Set up an event listener for storage changes
    window.addEventListener("storage", checkLoginStatus);
    // Custom event listener for login/logout actions
    const handleAuthEvent = () => checkLoginStatus();
    window.addEventListener("authStateChanged", handleAuthEvent);
    return () => {
      // Clean up event listeners
      window.removeEventListener("storage", checkLoginStatus);
      window.removeEventListener("authStateChanged", handleAuthEvent);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("email");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setEmail("");
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("authStateChanged"));
    router.push("/login");
  };

  return (
    <AppBar
      position="sticky"
      className="bg-gradient-to-r from-orange-500 to-orange-400 shadow-md py-3"
    >
      <Toolbar className="flex justify-between items-center py-2">
        <Container className="flex items-center">
          {/* Logo Section */}
          <Link href="/">
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-full p-2 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-orange-500"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-white">SEES</div>{" "}
              {/* Increased text size */}
            </div>
          </Link>

          {/* Title with reduced size and spacing */}
          <div className="hidden md:block ml-8 text-3xl font-medium text-white">
            Smart Education Events System
          </div>
        </Container>

        {/* Conditional Rendering for Logged-in User */}
        <div className="flex items-center">
          {isLoggedIn ? (
            <div className="flex items-center">
              <p className="mr-4 text-white">
                Welcome Back <span className="font-semibold">{email}</span>!
              </p>
              <button
                onClick={handleLogout}
                className="bg-white text-orange-500 rounded-full px-4 py-2 text-sm font-medium hover:bg-orange-100 transition shadow-md min-w-[100px]"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex space-x-4">
              <Link href="/login" passHref>
                <button className="bg-white text-orange-500 rounded-full px-4 py-2 text-sm font-medium hover:bg-orange-100 transition shadow-md min-w-[100px]">
                  Log in
                </button>
              </Link>
              <Link href="/signup" passHref>
                <button className="bg-orange-600 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-orange-700 transition shadow-md min-w-[100px]">
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
