"use client";

import Link from "next/link";
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
    <div className="max-w-screen-xl w-full my-0 mx-auto">
      <nav className="flex justify-between items-center py-3 bg-white">
        {/* Logo */}
        <Link href="/">
          <div className="text-5xl font-semibold text-gray-800 p-5">
            Smart Education Events System
          </div>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex flex-row justify-around items-center">
              <p className="mr-2">Welcome Back {email}!</p>
              <button
                onClick={handleLogout}
                className="border rounded-3xl px-4 py-1 text-sm font-medium text-gray-800 hover:bg-gray-100 transition"
              >
                Log Out
              </button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <button className="border rounded-3xl px-4 py-1 text-sm font-medium text-gray-800 hover:bg-gray-100 transition">
                  Log in
                </button>
              </Link>
              <Link href="/signup">
                <button className="border rounded-3xl px-4 py-1 text-sm font-medium text-white bg-orange-400 hover:bg-orange-300 transition">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
