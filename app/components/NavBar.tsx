"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

const Navbar: React.FC = () => {
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
          <Link href="/login">
            <button className="border rounded-3xl px-4 py-1 text-sm font-medium text-gray-800 hover:bg-gray-100 transition">
              Log In
            </button>
          </Link>

          {/* Sign Up Button */}
          <Link href="/signup">
            <button className="border rounded-3xl px-4 py-1 text-sm font-medium text-white bg-black hover:bg-gray-800 transition">
              Sign Up
            </button>
          </Link>
        </div>
      </nav>

      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" style={{ display: "none" }}></div>
    </div>
  );
};

export default Navbar;
