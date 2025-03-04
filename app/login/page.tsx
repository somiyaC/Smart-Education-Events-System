"use client";

import React, { useState } from "react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import Link from "next/link";

const Signup = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
      {/* Left Section - Form */}
      <div className="flex flex-col justify-center px-8 lg:px-24 bg-white">
        <div className="mb-6">
          <Link href={"/"}>
            <div className="text-5xl font-semibold text-gray-800">
              Smart Education Events System
            </div>
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Sign In</h1>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            className="block w-full p-3 border border-gray-300 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            className="block w-full p-3 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="w-full p-3 bg-orange-600 text-white rounded font-medium hover:bg-orange-700"
          >
            <Link href="/">Sign In</Link>
          </button>
        </form>
        <div className="my-4 text-center text-gray-500">or</div>
        <button
          type="button"
          className="w-full p-3 mb-4 bg-white border border-gray-300 text-gray-800 rounded font-medium flex items-center justify-center gap-2 hover:bg-gray-50"
        >
          <FaGoogle className="text-lg" />
          <Link href="/">Sign In with Google</Link>
        </button>

        <button
          type="button"
          className="w-full p-3 bg-blue-600 text-white rounded font-medium flex items-center justify-center gap-2 hover:bg-blue-700"
        >
          <FaFacebook className="text-lg" />
          <Link href="/">Sign In with Facebook</Link>
        </button>
        <p className="text-center mt-6 text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>

      {/* Right Section - Image */}
      <div className="hidden lg:block">
        <img
          src="/login.jpg"
          alt="Signup Illustration"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Signup;
