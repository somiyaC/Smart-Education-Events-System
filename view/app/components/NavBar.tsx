"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); //set this to true and cmment out chechAuthStatus to see what it looks like if user is logged in

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/auth/status", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(data.isAuthenticated);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isLoggedIn == null) {
    return null;
  }
  return (
    <div className="max-w-screen-xl w-full my-0 mx-auto">
      <nav className="flex justify-between items-center py-3 bg-white">
        {/* Logo */}
        <Link href={"/"}>
          <div className="text-5xl font-semibold text-gray-800">
            Smart Education Events System
          </div>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Log In Button */}
          {isLoggedIn ? (
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", {
                  method: "POST",
                });
                setIsLoggedIn(false);
              }}
              className="border rounded-3xl px-4 py-1 text-sm font-medium text-gray-800 hover:bg-gray-100 transition"
            >
              Log Out
            </button>
          ) : (
            <>
              {/* Log In Button */}
              <Link href="/login">
                <button className="border rounded-3xl px-4 py-1 text-sm font-medium text-gray-800 hover:bg-gray-100 transition">
                  Log in
                </button>
              </Link>

              {/* Sign Up Button */}
              <Link href="/signup">
                <button className="border rounded-3xl px-4 py-1 text-sm font-medium text-white bg-orange-400 hover:bg-orange-500 transition">
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
