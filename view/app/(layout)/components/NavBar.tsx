"use client";

import Link from "next/link";
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
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
    <AppBar position="sticky" color="primary" className="bg-orange-500">
      <Toolbar className="flex justify-between items-center">
        <Container className="flex items-center space-x-4">
          {/* Logo or Title Section */}
          <Link href="/">
            <div className="text-5xl font-semibold text-white p-5">
              Smart Education Events System
            </div>
          </Link>
        </Container>

        {/* Conditional Rendering for Logged-in User */}
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="flex flex-row justify-around items-center">
              <p className="mr-2 text-white">Welcome Back {email}!</p>
              <button
                onClick={handleLogout}
                className="border rounded-3xl px-4 py-1 text-sm font-medium text-gray-800 hover:bg-gray-100 transition"
              >
                Log Out
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" passHref>
                <button className="border rounded-3xl px-4 py-1 text-sm font-medium text-gray-800 hover:bg-gray-100 transition">
                  Log in
                </button>
              </Link>
              <Link href="/signup" passHref>
                <button className="border rounded-3xl px-4 py-1 text-sm font-medium text-white bg-orange-400 hover:bg-orange-300 transition">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
