"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Navbar: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>("");

  useEffect(() => {
    if (localStorage.getItem("user_id") !== undefined) {
      setEmail(localStorage.getItem("email"));
      setIsLoggedIn(true);
    }

  }, []);

  useEffect(() => {

  }, [isLoggedIn, email])

  const handleLogout = async () => {
    try {
      setIsLoggedIn(false);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoggedIn == null) {
    return null; // Prevent flashing when checking authentication
  }

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
              <p className="mr-2">
                Welcome Back {email}!
              </p>
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
